import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

interface JwtUser {
  sub: string;
  email: string;
  role: string;
  name?: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Body() dto: CreateOrderDto,
    @Request() req: { user: JwtUser },
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '') ?? '';
    return this.ordersService.create(dto, req.user.sub, req.user.name ?? req.user.email, token);
  }

  @Get()
  findAll(@Request() req: { user: JwtUser }) {
    return this.ordersService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: JwtUser }) {
    return this.ordersService.findOne(id, req.user.sub);
  }
}
