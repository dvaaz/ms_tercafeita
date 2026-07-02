import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { ActiveSecretService } from './active-secret.service';

@Module({
  imports: [
    HttpModule,
    PassportModule,
    // Secret e expiresIn são sempre passados explicitamente em cada
    // sign()/verify() (ver AuthService e JwtStrategy) — o access token
    // usa a secret ativa buscada do gateway, o refresh token usa
    // JWT_REFRESH_SECRET fixo. Este register() só existe pra habilitar o DI.
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ActiveSecretService],
  exports: [AuthService],
})
export class AuthModule { }
