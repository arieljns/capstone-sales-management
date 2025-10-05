import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

const customExtractor = (req: any) => {
  const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  console.log('Extracted Token:', token);
  return token;
};

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: customExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }
  validate(payload: any) {
    console.log('JWT Payload:', payload);
    if (!payload) {
      throw new UnauthorizedException('there are no payloads');
    }
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
