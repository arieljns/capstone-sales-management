import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalAuthStrategy } from './strategy/local-auth.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthStrategy } from './strategy/jwt-auth.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1h' },
      }),
    }),
    forwardRef(() => UsersModule),
  ],
  controllers: [],
  providers: [AuthService, LocalAuthStrategy, JwtAuthStrategy],
  exports: [AuthService],
})
export class AuthModule {
  constructor() {
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
  }
}
