import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ActiveSecretService } from './active-secret.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(activeSecretService: ActiveSecretService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (
        _request: unknown,
        _rawJwtToken: unknown,
        done: (err: unknown, secret?: string) => void,
      ) => {
        activeSecretService
          .getActiveSecret()
          .then((secret) => done(null, secret))
          .catch((err: unknown) => done(err));
      },
    });
  }

  validate(payload: JwtPayload) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Token inválido');
    }
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
