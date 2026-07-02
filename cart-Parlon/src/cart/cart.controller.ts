import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UseGuards, Request, HttpCode, HttpStatus, UnauthorizedException} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';

interface JwtUser {
  sub: string;
  email: string;
  role: string;
}

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(
    @Headers('x-user-id') userId: string,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.cartService.getOrCreateCart(userId || undefined, sessionId || undefined);
  }

  @Post('items')
  addItem(
    @Body() dto: AddItemDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.cartService.addItem(dto, userId || undefined, sessionId || undefined);
  }

  @Put('items/:id')
  updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.cartService.updateItem(id, dto, userId || undefined, sessionId || undefined);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeItem(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.cartService.removeItem(id, userId || undefined, sessionId || undefined);
  }
  
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  clearCart(
    @Headers('x-internal-key') internalKey: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (internalKey !== process.env.INTERNAL_KEY) {
      throw new UnauthorizedException('Chave interna inválida');
    }
    return this.cartService.clearCart(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('merge')
  mergeCart(@Body() dto: MergeCartDto, @Request() req: { user: JwtUser }) {
    return this.cartService.mergeCart(dto, req.user.sub);
  }
}
