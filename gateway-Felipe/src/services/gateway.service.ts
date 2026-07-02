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

    const targetUrl = this.resolveTargetUrl(route.path, route.targetUrl, path);

    let externalUser: any = null;

    if (route.requiresAuth) {
      externalUser = await this.validationExternalToken(headers.authorization);
    } else if (headers.authorization) {
      // Rota não exige login (ex.: carrinho de convidado), mas se o
      // cliente mandou um token válido mesmo assim, aproveitamos pra
      // identificar o usuário. Token ausente/inválido não bloqueia a
      // requisição aqui — só deixa de identificar o usuário.
      externalUser = await this.tryValidateExternalToken(headers.authorization);
    }

    try {
      const response = await axios({
        method,
        url: targetUrl,
        headers: {
          ...headers,
          host: undefined,

          ...(externalUser && {
            'x-user-id': externalUser.sub,
            'x-user-email': externalUser.email,
            'x-user-role': externalUser.role,
          }),
        },
        data: body,
        params: query,
      });

      await this.requestLogsService.create({
        method,
        originalUrl: path,
        routeType: 'PROXY',
        targetUrl,
        ip: ip ?? null,
        userAgent: headers['user-agent'] ?? null,
        statusCode: response.status,
        durationMs: Date.now() - startedAt,
        requestBody: body ? JSON.stringify(body) : null,
        responseBody: JSON.stringify(response.data),
        errorMessage: null,
      });

      return response.data;
    } catch (error: any) {
      await this.requestLogsService.create({
        method,
        originalUrl: path,
        routeType: 'PROXY',
        targetUrl,
        ip: ip ?? null,
        userAgent: headers['user-agent'] ?? null,
        statusCode: error.response?.status ?? 500,
        durationMs: Date.now() - startedAt,
        requestBody: body ? JSON.stringify(body) : null,
        responseBody: null,
        errorMessage: error.message,
      });

      if (error.response) {
        // Erro devolvido pelo serviço interno (ex.: 400, 403, 404) — repassa
        // status e corpo originais em vez de mascarar tudo como 500.
        throw new HttpException(error.response.data, error.response.status);
      }

      throw error;
    }
  }

  // route.targetUrl vem com os mesmos placeholders (:id, :reviewId...) do
  // route.path, ex.: "http://cart:3030/cart/items/:id". Aqui trocamos cada
  // placeholder pelo valor real correspondente no path da requisição.
  private resolveTargetUrl(routePath: string, targetUrlTemplate: string, actualPath: string): string {
    const routeSegments = routePath.split('/').filter(Boolean);
    const actualSegments = actualPath.split('/').filter(Boolean);

    let resolved = targetUrlTemplate;
    routeSegments.forEach((segment, i) => {
      if (segment.startsWith(':')) {
        resolved = resolved.replace(segment, actualSegments[i]);
      }
    });
    return resolved;
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

  private async tryValidateExternalToken(authorization: string) {
    try {
      return await this.validationExternalToken(authorization);
    } catch {
      return null;
    }
  }
}