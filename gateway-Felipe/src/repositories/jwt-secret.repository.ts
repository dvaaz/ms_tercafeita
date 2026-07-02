import { Injectable } from '@nestjs/common';
import { randomBytes, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { IJwtSecretRepository } from '../interfaces/repositories/jwt-secret-repository.interface';
import { CreateJwtSecretDto } from 'src/dtos/jwt-secret/create-jwt-secret.dto';
import { UpdateJwtSecretDto } from 'src/dtos/jwt-secret/update.jwt.secret.dto';
import { JwtSecret } from 'src/models/jwt-secret.model';

@Injectable()
export class JwtSecretsRepository implements IJwtSecretRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CreateJwtSecretDto): Promise<JwtSecret> {
    await this.prisma.jwt_secrets.updateMany({
      where: {
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });    

    return this.prisma.jwt_secrets.create({
      data: {
        id: randomUUID(),
        name: data.name ?? `Secret ${new Date().toISOString()}`,
        secret: randomBytes(64).toString('hex'),
        isActive: true,        
      },
    });
  }

  async findAll() {
    return this.prisma.jwt_secrets.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.jwt_secrets.findUnique({
      where: { id },
    });
  }

  async findActive() {
    return this.prisma.jwt_secrets.findFirst({
      where: {
        isActive: true        
      },
    });
  }

  async update(id: string, data: UpdateJwtSecretDto) {
    return this.prisma.jwt_secrets.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.prisma.jwt_secrets.delete({
      where: { id },
    });
  }
}