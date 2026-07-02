import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Body() dto: CreateOrderDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-email') userEmail: string,
  ) {
    if (!userId) throw new BadRequestException('Usuário não autenticado');
    return this.ordersService.create(dto, userId, userEmail ?? '');
  }

  @Get()
  findAll(@Headers('x-user-id') userId: string) {
    if (!userId) throw new BadRequestException('Usuário não autenticado');
    return this.ordersService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) throw new BadRequestException('Usuário não autenticado');
    return this.ordersService.findOne(id, userId);
  }
}
