import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, HttpModule, OrdersModule],
})
export class AppModule {}
