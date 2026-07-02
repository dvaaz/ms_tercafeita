import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [HttpModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
