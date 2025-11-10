import { Test } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';
import { ensureTestDb, resetTestDatabase } from './helpers';

jest.setTimeout(30000);

describe('Integration: Auth + Users (services)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let authService: AuthService;

  beforeAll(async () => {
    await ensureTestDb();
    await resetTestDatabase();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    usersService = app.get(UsersService);
    authService = app.get(AuthService);
  });

  afterAll(async () => {
    await app.close();
    await resetTestDatabase();
  });

  it('creates a user and logs in to issue JWT', async () => {
    const email = `user_${Date.now()}@example.com`;
    const password = 'P@ssw0rd!';

    const created = await usersService.createUser(email, password, 'user');
    expect(created).toBeDefined();
    expect(created.email).toBe(email);

    const validated = await usersService.validateUser(email, password);
    expect(validated.id).toBe(created.id);

    const login = authService.logUserIn(validated);
    expect(login.token).toBeDefined();
    expect(login.user.email).toBe(email);
  });

  it('rejects login when password does not match', async () => {
    const email = `user_${Date.now()}@example.com`;
    const password = 'P@ssw0rd!';
    await usersService.createUser(email, password, 'user');

    await expect(usersService.validateUser(email, 'wrong-pass')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
