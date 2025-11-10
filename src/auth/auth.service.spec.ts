import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let signSpy: jest.Mock;

  beforeEach(async () => {
    signSpy = jest.fn().mockReturnValue('signed-token');
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: { sign: signSpy } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logUserIn', () => {
    it('signs the JWT payload with user identifiers', () => {
      const mockUser: any = { id: 'user-1', email: 'user@example.com', role: 'admin' };

      const result = service.logUserIn(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'user@example.com',
        role: 'admin',
      });
      expect(result.token).toBe('signed-token');
    });

    it('maps user metadata into the response body', () => {
      const mockUser: any = { id: 'user-42', email: 'ops@example.com', role: 'user' };

      const result = service.logUserIn(mockUser);

      expect(result.user).toEqual({
        userId: 'user-42',
        avatar: null,
        userName: 'ops@example.com',
        email: 'ops@example.com',
        authority: ['user'],
      });
    });
  });
});
