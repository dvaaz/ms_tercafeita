import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class OptionalJwtStrategy extends PassportStrategy(Strategy, 'jwt-optional') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'fallback',
    });
  }

  validate(payload: JwtPayload) {
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
