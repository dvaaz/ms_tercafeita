import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IJwtSecretService } from '../interfaces/services/jwt-secret-service.interface';
import { JwtSecretsRepository } from 'src/repositories/jwt-secret.repository';
import { CreateJwtSecretDto } from 'src/dtos/jwt-secret/create-jwt-secret.dto';
import { UpdateJwtSecretDto } from 'src/dtos/jwt-secret/update.jwt.secret.dto';

@Injectable()
export class JwtSecretsService implements IJwtSecretService {
  private readonly logger = new Logger(JwtSecretsService.name);

  constructor(private readonly jwtSecretsRepository: JwtSecretsRepository) { }

  // Rotação automática da secret usada nos tokens de cliente: a cada 7 dias
  // gera uma nova secret ativa e desativa a anterior (create() já faz isso).
  @Cron(CronExpression.EVERY_WEEK)
  async rotateSecret() {
    const secret = await this.create({ name: `auto-rotation-${new Date().toISOString()}` });
    this.logger.log(`JWT secret rotacionada automaticamente (id ${secret.id}).`);
  }

  async create(data: CreateJwtSecretDto) {
    return this.jwtSecretsRepository.create(data);
  }

  async findAll() {
    return this.jwtSecretsRepository.findAll();
  }

  async findById(id: string) {
    const secret = await this.jwtSecretsRepository.findById(id);

    if (!secret) {
      throw new NotFoundException('JWT Secret não encontrado.');
    }

    return secret;
  }

  async findActive() {
    const secret = await this.jwtSecretsRepository.findActive();

    if (!secret) {
      throw new NotFoundException('Nenhum JWT Secret ativo encontrado.');
    }

    return secret;
  }

  async update(id: string, data: UpdateJwtSecretDto) {
    await this.findById(id);

    return this.jwtSecretsRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);

    await this.jwtSecretsRepository.delete(id);
  }

  async findExternalActive() {
    const secret = await this.findActive();

    return {
      secret: secret.secret,      
    };
  }
}