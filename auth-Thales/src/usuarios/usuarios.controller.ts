import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { AlterarSenhaDto } from '../auth/dto/alterar-senha.dto';

interface JwtUser { sub: string; email: string; role: string }

@UseGuards(AuthGuard('jwt'))
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  getMe(@Request() req: { user: JwtUser }) {
    return this.authService.findById(req.user.sub);
  }

  @Patch('me/senha')
  @HttpCode(HttpStatus.OK)
  alterarSenha(@Request() req: { user: JwtUser }, @Body() dto: AlterarSenhaDto) {
    return this.authService.alterarSenha(req.user.sub, dto);
  }
}
