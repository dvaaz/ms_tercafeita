import { Injectable, UnauthorizedException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IAuthService } from '../interfaces/services/auth-service.interface';
import { UsersRepository } from '../repositories/user.repository';
import { RefreshTokensRepository } from 'src/repositories/refresh-token.repository';
import { LoginDto } from '../dtos/auth/login.dto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user || user.isActive !== 1) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return user;
  }

  async login(data: LoginDto) {
    const user = await this.validateUser(data.email, data.password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokensRepository.create(
      user.id,
      refreshToken,
      expiresAt,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    const storedToken = await this.refreshTokensRepository.findByToken(token);

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    const payload = this.jwtService.verify(token);

    const newAccessToken = this.jwtService.sign(
      {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      },
      {
        expiresIn: '1h',
      },
    );

    const newRefreshToken = this.jwtService.sign(
      {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      },
      {
        expiresIn: '7d',
      },
    );

    await this.refreshTokensRepository.delete(storedToken.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokensRepository.create(
      payload.sub,
      newRefreshToken,
      expiresAt,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    await this.refreshTokensRepository.deleteByUserId(userId);
  }
}