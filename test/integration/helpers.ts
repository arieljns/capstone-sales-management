import { Client } from 'pg';
import { UsersService } from 'src/users/users.service';

export async function ensureTestDb() {
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
  } finally {
    await admin.end().catch(() => {});
  }
}

export async function createTestUser(usersService: UsersService) {
  const email = `user_${Date.now()}@example.com`;
  const password = 'P@ssw0rd!';
  const user = await usersService.createUser(email, password, 'user');
  return { user, email, password };
}

