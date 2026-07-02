import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CartModule } from './cart/cart.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, HttpModule, CartModule],
})
export class AppModule {}
