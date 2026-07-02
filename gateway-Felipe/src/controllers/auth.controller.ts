import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/auth/login.dto';
import { RefreshTokenDto } from '../dtos/auth/refresh-token.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  async login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('refresh')
  async refresh(@Body() data: RefreshTokenDto) {
    return this.authService.refreshToken(data.refreshToken);
  }

  @Post('logout')
  async logout(@Body('userId') userId: string) {
    await this.authService.logout(userId);

    return {
      message: 'Logout realizado com sucesso.',
    };
  }
}