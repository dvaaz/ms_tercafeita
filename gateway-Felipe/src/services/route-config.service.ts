import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { IRouteConfigService } from 'src/interfaces/services/route-service.interface';
import { RouteConfigsRepository } from 'src/repositories/route-config.repository';
import { CreateRouteDto } from 'src/dtos/route/create-route.dto';
import { UpdateRouteDto } from 'src/dtos/route/update-route.dto';

@Injectable()
export class RouteConfigsService implements IRouteConfigService {
  constructor(private readonly routeConfigsRepository: RouteConfigsRepository) {}

  async create(data: CreateRouteDto) {
    const routeExists = await this.routeConfigsRepository.findByPathAndMethod(
      data.path,
      data.method,
    );

    if (routeExists) {
      throw new ConflictException('Já existe uma rota cadastrada com este path e método.');
    }

    return this.routeConfigsRepository.create(data);
  }

  async findAll() {
    return this.routeConfigsRepository.findAll();
  }

  async findById(id: string) {
    const route = await this.routeConfigsRepository.findById(id);

    if (!route) {
      throw new NotFoundException('Rota não encontrada.');
    }

    return route;
  }

  async findByPathAndMethod(path: string, method: string) {
    return this.routeConfigsRepository.findByPathAndMethod(path, method);
  }

  async update(id: string, data: UpdateRouteDto) {
    await this.findById(id);

    return this.routeConfigsRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);

    await this.routeConfigsRepository.delete(id);
  }
}