import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guards';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guards';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private Auth: AuthService,
  ) {}

  @Post('sign-up')
  async register(
    @Body() dto: { email: string; password: string; role?: 'user' | 'admin' },
  ) {
    return this.usersService.createUser(dto.email, dto.password, dto.role);
  }

  @Post('sign-in')
  @UseGuards(LocalAuthGuard)
  Login(@Request() req) {
    return this.Auth.logUserIn(req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('sign-up/member')
  async registerMember(
    @Body() dto: { email: string; password: string; role: 'user' },
  ) {
    return this.usersService.createMember(dto.email, dto.password, dto.role);
  }

  @Get('profile')
  async getProfileData() {
    const getUserProfile = await this.usersService.getUserProfile();
    return getUserProfile;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('whoami')
  whoAmI(@Request() req) {
    return req.user;
  }
}
