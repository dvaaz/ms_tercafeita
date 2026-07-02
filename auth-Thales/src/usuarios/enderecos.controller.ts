import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EnderecoService } from './endereco.service';
import { CreateEnderecoDto } from './dto/create-endereco.dto';

interface JwtUser { sub: string; email: string; role: string }

@UseGuards(AuthGuard('jwt'))
@Controller('enderecos')
export class EnderecosController {
  constructor(private readonly enderecoService: EnderecoService) {}

  @Get()
  findAll(@Request() req: { user: JwtUser }) {
    return this.enderecoService.findAll(req.user.sub);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: { user: JwtUser }, @Body() dto: CreateEnderecoDto) {
    return this.enderecoService.create(req.user.sub, dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: JwtUser },
    @Body() dto: CreateEnderecoDto,
  ) {
    return this.enderecoService.update(id, req.user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: { user: JwtUser }) {
    return this.enderecoService.remove(id, req.user.sub);
  }
}
