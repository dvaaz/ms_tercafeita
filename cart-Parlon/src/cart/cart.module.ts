import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { JwtStrategy } from './jwt.strategy';
import { OptionalJwtStrategy } from './optional-jwt.strategy';

@Module({
  imports: [
    HttpModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [CartController],
  providers: [CartService, JwtStrategy, OptionalJwtStrategy],
  exports: [CartService],
})
export class CartModule {}
