import { HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { IGatewayService } from '../interfaces/services/gateway-service.interface';
import { RouteConfigsRepository } from '../repositories/route-config.repository';
import { RequestLogsService } from './request-logs.service';
import { JwtSecretsService } from './jwt-secret.service';

@Injectable()
export class GatewayService implements IGatewayService {
  constructor(
    private readonly routeConfigsRepository: RouteConfigsRepository,
    private readonly requestLogsService: RequestLogsService,
    private readonly jwtSecretService: JwtSecretsService,
  ) { }

  async processRequest(
    method: string,
    path: string,
    headers: Record<string, any>,
    body?: any,
    query?: any,
    ip?: string,
  ) {
    const startedAt = Date.now();

    const route = await this.routeConfigsRepository.findByPathAndMethod(
      path,
      method,
    );

    if (!route) {
      throw new NotFoundException('Rota não encontrada.');
    }

    let externalUser: any = null;

    if (route.requiresAuth) {
      externalUser = await this.validationExternalToken(headers.authorization);
    }

    const proxyHeaders: Record<string, any> = {
      'content-type': headers['content-type'] ?? 'application/json',
      accept: headers.accept ?? 'application/json',
    };

    if (headers.authorization) {
      proxyHeaders.authorization = headers.authorization;
    }

    if (headers['x-session-id']) {
      proxyHeaders['x-session-id'] = headers['x-session-id'];
    }

    if (externalUser) {
      proxyHeaders['x-user-id'] = externalUser.sub;
      proxyHeaders['x-user-email'] = externalUser.email;
      proxyHeaders['x-user-role'] = externalUser.role;
    }

    try {

      console.log('REQ GATEWAY:', {
        method,
        path,
        targetUrl: route.targetUrl,
        body,
        query,
        headers,
      });

      const response = await axios({
        method,
        url: route.targetUrl,
        headers: proxyHeaders,
        data: body,
        params: query,
        validateStatus: () => true,
      });

      console.log('RES GATEWAY:', {
        status: response.status,
        data: response.data,
      });

      await this.requestLogsService.create({
        method,
        originalUrl: path,
        routeType: 'PROXY',
        targetUrl: route.targetUrl,
        ip: ip ?? null,
        userAgent: headers['user-agent'] ?? null,
        statusCode: response.status,
        durationMs: Date.now() - startedAt,
        requestBody: body ? JSON.stringify(body) : null,
        responseBody: JSON.stringify(response.data),
        errorMessage: response.status >= 400 ? JSON.stringify(response.data) : null,
      });

      if (response.status >= 400) {
        throw new HttpException(response.data, response.status);
      }

      return response.data;
    } catch (error: any) {
      const statusCode = error.response?.status ?? error.status ?? 500;
      const responseBody = error.response?.data ?? error.response ?? null;

      await this.requestLogsService.create({
        method,
        originalUrl: path,
        routeType: 'PROXY',
        targetUrl: route.targetUrl,
        ip: ip ?? null,
        userAgent: headers['user-agent'] ?? null,
        statusCode,
        durationMs: Date.now() - startedAt,
        requestBody: body ? JSON.stringify(body) : null,
        responseBody: responseBody ? JSON.stringify(responseBody) : null,
        errorMessage: error.message,
      });

      throw new HttpException(
        responseBody ?? { message: error.message },
        statusCode,
      );
    }
  }

  private async validationExternalToken(authorization?: string) {
    if (!authorization) {
      throw new UnauthorizedException('Token não informado.');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token inválido.');
    }

    const activeSecret = await this.jwtSecretService.findActive();

    try {
      return jwt.verify(token, activeSecret.secret) as any;
    } catch {
      throw new UnauthorizedException('Token externo inválido.');
    }
  }
}