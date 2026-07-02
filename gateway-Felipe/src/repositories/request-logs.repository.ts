import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { IRequestLogRepository } from '../interfaces/repositories/request-log-repository.interface';
import { CreateRequestLogDto } from 'src/dtos/audit/create-log.dto';

@Injectable()
export class RequestLogsRepository implements IRequestLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRequestLogDto) {
    return this.prisma.request_logs.create({
      data: {
        id: randomUUID(),
        method: data.method,
        originalUrl: data.originalUrl,
        routeType: data.routeType,
        targetUrl: data.targetUrl,
        ip: data.ip,
        userAgent: data.userAgent,
        statusCode: data.statusCode,
        durationMs: data.durationMs,
        requestBody: data.requestBody,
        responseBody: data.responseBody,
        errorMessage: data.errorMessage,
      },
    });
  }

  async findAll() {
    return this.prisma.request_logs.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.request_logs.findUnique({
      where: { id },
    });
  }
}