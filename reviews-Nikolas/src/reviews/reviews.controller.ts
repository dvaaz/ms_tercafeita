import { Controller, Get, Post, Delete, Param, Body, Headers, HttpCode, HttpStatus, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateRespostaDto } from './dto/create-resposta.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Post()
  create(
    @Body() dto: CreateReviewDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('Usuário não autenticado');
    return this.reviewsService.create(dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('Usuário não autenticado');
    return this.reviewsService.remove(id, userId);
  }

  @Post(':id/curtida')
  curtir(
    @Param('id', ParseIntPipe) avaliacaoId: number,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('Usuário não autenticado');
    return this.reviewsService.curtir(avaliacaoId, userId);
  }

  @Delete(':id/curtida')
  @HttpCode(HttpStatus.NO_CONTENT)
  descurtir(
    @Param('id', ParseIntPipe) avaliacaoId: number,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('Usuário não autenticado');
    return this.reviewsService.descurtir(avaliacaoId, userId);
  }

  @Post(':id/respostas')
  createResposta(
    @Param('id', ParseIntPipe) avaliacaoId: number,
    @Body() dto: CreateRespostaDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('Usuário não autenticado');
    return this.reviewsService.createResposta(avaliacaoId, dto, userId);
  }

  @Delete(':reviewId/respostas/:respostaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeResposta(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Param('respostaId', ParseIntPipe) respostaId: number,
  ) {
    return this.reviewsService.removeResposta(respostaId, reviewId);
  }
}
