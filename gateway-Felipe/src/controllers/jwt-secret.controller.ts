import { Body, Controller, Delete, Get, Param, Headers, Post, Put, UnauthorizedException, } from '@nestjs/common';
import { JwtSecretsService } from '../services/jwt-secret.service';
import { CreateJwtSecretDto } from '../dtos/jwt-secret/create-jwt-secret.dto';
import { UpdateJwtSecretDto } from 'src/dtos/jwt-secret/update.jwt.secret.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';

@ApiTags('Jwt Secret')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jwt-secrets')
export class JwtSecretsController {
  constructor(private readonly jwtSecretsService: JwtSecretsService) { }

  @Post()
  async create(@Body() data: CreateJwtSecretDto) {
    return this.jwtSecretsService.create(data);
  }

  @Get()
  async findAll() {
    return this.jwtSecretsService.findAll();
  }

  @Get('active')
  async findActive() {
    return this.jwtSecretsService.findActive();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.jwtSecretsService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateJwtSecretDto) {
    return this.jwtSecretsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.jwtSecretsService.delete(id);

    return {
      message: 'JWT Secret removido com sucesso.',
    };
  }

  @Public()
  @Get('external/active')
  async findExternalActive(@Headers('x-api-key') apiKey: string) {
    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
      throw new UnauthorizedException('API Key inválida.');
    }

    return this.jwtSecretsService.findExternalActive();
  }
}