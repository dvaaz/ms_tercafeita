import { Controller, Get, Post, Put, Delete, Param, Body, Query, Headers, ForbiddenException, HttpCode, HttpStatus, } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';

function requireAdmin(role?: string) {
  if (role !== 'admin') {
    throw new ForbiddenException('Acesso restrito a administradores');
  }
}

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ListProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto, @Headers('x-user-role') role: string) {
    requireAdmin(role);
    return this.productsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Headers('x-user-role') role: string) {
    requireAdmin(role);
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Headers('x-user-role') role: string) {
    requireAdmin(role);
    return this.productsService.remove(id);
  }
}
