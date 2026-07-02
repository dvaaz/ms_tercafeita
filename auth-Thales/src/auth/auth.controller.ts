import { Controller, Post, Get, Param, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CadastroDto } from './dto/cadastro.dto';
import { RefreshDto } from './dto/refresh.dto';

interface JwtUser { sub: string; email: string; role: string }

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('cadastro')
  @HttpCode(HttpStatus.CREATED)
  cadastro(@Body() dto: CadastroDto) {
    return this.authService.cadastro(dto);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    const token = dto.refreshToken ?? (dto as unknown as Record<string, string>)['refresh_token'];
    return this.authService.refresh(token);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Request() req: { user: JwtUser }) {
    return this.authService.findById(req.user.sub);
  }
  
  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.authService.findById(id).then((u) => ({
      id: u.id,
      name: u.nome,
      nome: u.nome,
      email: u.email,
      role: u.role,
    }));
  }
}
