import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UsersService } from '../services/user.service';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { UpdateUserDto } from '../dtos/users/update-user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { Public } from 'src/decorators/public.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('criar-usuario')
  @Public()
  async create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @Get('buscar-todos')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('buscar/:id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put('atualizar-usuario/:id')
  async update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.usersService.update(id, data);
  }

  @Delete('deleter-usuario/:id')
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);

    return {
      message: 'Usuário removido com sucesso.',
    };
  }
}