import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';
import { Client } from 'pg';

jest.setTimeout(30000);

describe('Integration: Auth + Users (services)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let authService: AuthService;

  beforeAll(async () => {
    // Ensure test database exists before Nest connects
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
    const user = process.env.DB_USERNAME || 'postgres';
    const password = process.env.DB_PASSWORD || 'admin';
    const dbName = process.env.DB_NAME || 'capstone_sales_test';
    const admin = new Client({ host, port, user, password, database: 'postgres' });
    try {
      await admin.connect();
      const { rows } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
      if (rows.length === 0) {
        await admin.query(`CREATE DATABASE "${dbName}"`);
      }
    } catch (e) {
      // If this fails, the app init will surface the error.
    } finally {
      await admin.end().catch(() => {});
    }

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
});
