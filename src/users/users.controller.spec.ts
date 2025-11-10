import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';

describe('UsersController (HTTP)', () => {
  let app: INestApplication;
  let usersService: {
    createUser: jest.Mock;
    createMember: jest.Mock;
    validateUser: jest.Mock;
    getUserProfile: jest.Mock;
    deleteUserSafely: jest.Mock;
  };
  let authService: { logUserIn: jest.Mock };
  const jwtGuard = { canActivate: jest.fn() };
  const localGuard = { canActivate: jest.fn() };
  const rolesGuard = { canActivate: jest.fn() };

  beforeEach(async () => {
    usersService = {
      createUser: jest.fn().mockResolvedValue({ id: 'u1' }),
      createMember: jest.fn().mockResolvedValue({ id: 'm1' }),
      validateUser: jest.fn(),
      getUserProfile: jest.fn().mockResolvedValue([{ id: 'u1' }]),
      deleteUserSafely: jest.fn().mockResolvedValue(undefined),
    };
    authService = {
      logUserIn: jest.fn().mockResolvedValue({ token: 'jwt' }),
    };
    jwtGuard.canActivate.mockImplementation((context) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'admin', role: 'admin', email: 'admin@example.com' };
      return true;
    });
    localGuard.canActivate.mockImplementation((context) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 'user-1' };
      return true;
    });
    rolesGuard.canActivate.mockReturnValue(true);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: AuthService, useValue: authService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(jwtGuard)
      .overrideGuard(LocalAuthGuard)
      .useValue(localGuard)
      .overrideGuard(RolesGuard)
      .useValue(rolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('POST /users/sign-up creates a new user (201)', async () => {
    const dto = { email: 'user@example.com', password: 'secret' };

    await request(app.getHttpServer()).post('/users/sign-up').send(dto).expect(201).expect({ id: 'u1' });
    expect(usersService.createUser).toHaveBeenCalledWith(dto.email, dto.password, undefined);
  });

  it('POST /users/sign-in returns auth payload with 201', async () => {
    await request(app.getHttpServer()).post('/users/sign-in').send({}).expect(201).expect({ token: 'jwt' });
    expect(authService.logUserIn).toHaveBeenCalledWith({ id: 'user-1' });
  });

  it('POST /users/sign-up/member enforces roles guard and returns 201', async () => {
    const dto = { email: 'member@example.com', password: 'pass', role: 'user' as const };

    await request(app.getHttpServer()).post('/users/sign-up/member').send(dto).expect(201).expect({ id: 'm1' });
    expect(usersService.createMember).toHaveBeenCalledWith(dto.email, dto.password, dto.role);
  });

  it('returns 403 when RolesGuard denies access to register member', async () => {
    rolesGuard.canActivate.mockReturnValueOnce(false);
    await request(app.getHttpServer()).post('/users/sign-up/member').send({}).expect(403);
  });

  it('GET /users/profile returns profile data', async () => {
    await request(app.getHttpServer()).get('/users/profile').expect(200).expect([{ id: 'u1' }]);
    expect(usersService.getUserProfile).toHaveBeenCalledTimes(1);
  });

  it('GET /users/whoami returns current user payload', async () => {
    await request(app.getHttpServer())
      .get('/users/whoami')
      .expect(200)
      .expect({ userId: 'admin', role: 'admin', email: 'admin@example.com' });
  });

  it('GET /users/whoami responds 401 when JwtAuthGuard throws', async () => {
    jwtGuard.canActivate.mockImplementationOnce(() => {
      throw new UnauthorizedException();
    });

    await request(app.getHttpServer()).get('/users/whoami').expect(401);
  });

  it('GET /users/lists proxies to getUserProfile', async () => {
    await request(app.getHttpServer()).get('/users/lists').expect(200).expect([{ id: 'u1' }]);
    expect(usersService.getUserProfile).toHaveBeenCalledTimes(1);
  });

  it('DELETE /users/delete/:id delegates to service and returns message', async () => {
    await request(app.getHttpServer())
      .delete('/users/delete/u1')
      .expect(200)
      .expect({ message: 'User deleted successfully' });
    expect(usersService.deleteUserSafely).toHaveBeenCalledWith('u1');
  });
});
