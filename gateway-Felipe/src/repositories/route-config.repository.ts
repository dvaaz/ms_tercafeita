import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { IRouteConfigRepository } from '../interfaces/repositories/route-config-repository.interface';
import { CreateRouteDto } from 'src/dtos/route/create-route.dto';
import { UpdateRouteDto } from 'src/dtos/route/update-route.dto';

@Injectable()
export class RouteConfigsRepository implements IRouteConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRouteDto) {
    return this.prisma.route_configs.create({
      data: {
        id: randomUUID(),
        name: data.name,
        path: data.path,
        targetUrl: data.targetUrl,
        method: data.method,
        requiresAuth: data.requiresAuth,
      },
    });
  }

  async findAll() {
    return this.prisma.route_configs.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.route_configs.findUnique({
      where: { id },
    });
  }

  async findByPathAndMethod(path: string, method: string) {
    return this.prisma.route_configs.findFirst({
      where: {
        path,
        method,
        isActive: 1,
      },
    });
  }

  async update(id: string, data: UpdateRouteDto) {
    return this.prisma.route_configs.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.prisma.route_configs.delete({
      where: { id },
    });
  }
}