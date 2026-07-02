import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { RouteConfigsService } from '../services/route-config.service';
import { CreateRouteDto } from 'src/dtos/route/create-route.dto';
import { UpdateRouteDto } from 'src/dtos/route/update-route.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Route')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('route-configs')
export class RouteConfigsController {
  constructor(private readonly routeConfigsService: RouteConfigsService) {}

  @Post()
  async create(@Body() data: CreateRouteDto) {
    return this.routeConfigsService.create(data);
  }

  @Get()
  async findAll() {
    return this.routeConfigsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.routeConfigsService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateRouteDto) {
    return this.routeConfigsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.routeConfigsService.delete(id);

    return {
      message: 'Rota removida com sucesso.',
    };
  }
}