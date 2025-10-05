import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/users/users.entities';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  logUserIn(user: UserEntity) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        userId: user.id,
        avatar: null,
        userName: user.email,
        email: user.email,
        authority: [user.role],
      },
    };
  }
}
