import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

import { UsersRepository } from './repositories/user.repository';
import { RouteConfigsRepository } from './repositories/route-config.repository';
import { RequestLogsRepository } from './repositories/request-logs.repository';
import { AccessAuditsRepository } from './repositories/access-audit.repository';
import { RefreshTokensRepository } from './repositories/refresh-token.repository';
import { JwtSecretsRepository } from './repositories/jwt-secret.repository';

import { UsersService } from './services/user.service';
import { RouteConfigsService } from './services/route-config.service';
import { RequestLogsService } from './services/request-logs.service';
import { AccessAuditsService } from './services/access-audit.service';
import { AuthService } from './services/auth.service';
import { GatewayService } from './services/gateway.service';
import { JwtSecretsService } from './services/jwt-secret.service';

import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/user.controller';
import { RouteConfigsController } from './controllers/route-config.controller';
import { JwtSecretsController } from './controllers/jwt-secret.controller';
import { RequestLogsController } from './controllers/request-log.controller';
import { AccessAuditsController } from './controllers/access-audit.controller';
import { GatewayController } from './controllers/gateway.controller';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PassportJwt } from './guard/passport-jwt';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { ExternalJwtGuard } from './guard/external-jwt.guard';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({    
      secret: process.env.JWT_SECRET_GATEWAY,  
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  controllers: [    
    AuthController,
    UsersController,
    RouteConfigsController,
    JwtSecretsController,
    RequestLogsController,
    AccessAuditsController,
    GatewayController,
  ],
  providers: [
    AppService,
    UsersRepository,
    RouteConfigsRepository,
    RequestLogsRepository,
    AccessAuditsRepository,
    RefreshTokensRepository,
    JwtSecretsRepository,
    UsersService,
    RouteConfigsService,
    RequestLogsService,
    AccessAuditsService,
    JwtSecretsService,
    PassportJwt,
    JwtAuthGuard,
    ExternalJwtGuard,
    AuthService,
    GatewayService
  ],
})
export class AppModule { }
