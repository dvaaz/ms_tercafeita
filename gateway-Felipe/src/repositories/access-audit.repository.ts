import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { IAccessAuditRepository } from '../interfaces/repositories/access-audit-repository.interface';
import { CreateAccessAuditDto } from 'src/dtos/audit/create-access-audit.dto';

@Injectable()
export class AccessAuditsRepository implements IAccessAuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAccessAuditDto) {
    return this.prisma.access_audits.create({
      data: {
        id: randomUUID(),
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        details: data.details,
        ip: data.ip,
      },
    });
  }

  async findAll() {
    return this.prisma.access_audits.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.access_audits.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.access_audits.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}