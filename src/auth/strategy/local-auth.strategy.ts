import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from 'src/users/users.service';
import { UnauthorizedException, Injectable } from '@nestjs/common';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private usersService: UsersService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string) {
    console.log('function triggered');
    const user = await this.usersService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('you dont have access');
    return user;
  }
}
