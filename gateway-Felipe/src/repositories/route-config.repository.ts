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
    const candidates = await this.prisma.route_configs.findMany({
      where: { method, isActive: 1 },
    });

    const requestSegments = path.split('/').filter(Boolean);

    return (
      candidates.find((route) => {
        const routeSegments = route.path.split('/').filter(Boolean);
        if (routeSegments.length !== requestSegments.length) return false;

        return routeSegments.every(
          (segment, i) => segment.startsWith(':') || segment === requestSegments[i],
        );
      }) ?? null
    );
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