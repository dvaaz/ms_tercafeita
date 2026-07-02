import { Injectable, NotFoundException } from '@nestjs/common';
import { IAccessAuditService } from '../interfaces/services/access-audit-service.interface';
import { AccessAuditsRepository } from '../repositories/access-audit.repository';
import { CreateAccessAuditDto } from '../dtos/audit/create-access-audit.dto';

@Injectable()
export class AccessAuditsService implements IAccessAuditService {
  constructor(private readonly accessAuditsRepository: AccessAuditsRepository) {}

  async create(data: CreateAccessAuditDto) {
    return this.accessAuditsRepository.create(data);
  }

  async findAll() {
    return this.accessAuditsRepository.findAll();
  }

  async findById(id: string) {
    const audit = await this.accessAuditsRepository.findById(id);

    if (!audit) {
      throw new NotFoundException('Auditoria não encontrada.');
    }

    return audit;
  }

  async findByUserId(userId: string) {
    return this.accessAuditsRepository.findByUserId(userId);
  }
}