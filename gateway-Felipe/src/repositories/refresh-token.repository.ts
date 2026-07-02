import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { IRefreshTokenRepository } from '../interfaces/repositories/refresh-token-repository.interface';

@Injectable()
export class RefreshTokensRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, token: string, expiresAt: Date) {
    return this.prisma.refresh_tokens.create({
      data: {
        id: randomUUID(),
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findByToken(token: string) {
    return this.prisma.refresh_tokens.findUnique({
      where: { token },
    });
  }

  async delete(id: string) {
    await this.prisma.refresh_tokens.delete({
      where: { id },
    });
  }

  async deleteByUserId(userId: string) {
    await this.prisma.refresh_tokens.deleteMany({
      where: { userId },
    });
  }
}