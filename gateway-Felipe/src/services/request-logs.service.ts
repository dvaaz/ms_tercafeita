import { Injectable, NotFoundException } from '@nestjs/common';
import { IRequestLogService } from '../interfaces/services/request-log-service.interface';
import { RequestLogsRepository } from '../repositories/request-logs.repository';
import { CreateRequestLogDto } from '../dtos/audit/create-log.dto';

@Injectable()
export class RequestLogsService implements IRequestLogService {
  constructor(private readonly requestLogsRepository: RequestLogsRepository) {}

  async create(data: CreateRequestLogDto) {
    return this.requestLogsRepository.create(data);
  }

  async findAll() {
    return this.requestLogsRepository.findAll();
  }

  async findById(id: string) {
    const log = await this.requestLogsRepository.findById(id);

    if (!log) {
      throw new NotFoundException('Log não encontrado.');
    }

    return log;
  }
}