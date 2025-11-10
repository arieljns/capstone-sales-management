import { Client } from 'pg';
import { UsersService } from 'src/users/users.service';

type TestDbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  dbName: string;
};

const getConfig = (): TestDbConfig => ({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  dbName: process.env.DB_NAME || 'capstone_sales_test',
});

export async function ensureTestDb() {
  const { host, port, user, password, dbName } = getConfig();
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

export async function resetTestDatabase() {
  const { host, port, user, password, dbName } = getConfig();
  const client = new Client({ host, port, user, password, database: dbName });
  try {
    await client.connect();
    await client.query(`
      DO $$
      DECLARE
        tbl text;
      BEGIN
        FOREACH tbl IN ARRAY ARRAY[
          'public.tickets',
          'public.validation',
          'public.before_meeting',
          'public.user_entity'
        ]
        LOOP
          IF to_regclass(tbl) IS NOT NULL THEN
            EXECUTE format('TRUNCATE TABLE %s RESTART IDENTITY CASCADE;', tbl);
          END IF;
        END LOOP;
      END$$;
    `);
  } finally {
    await client.end().catch(() => {});
  }
}

export async function createTestUser(usersService: UsersService) {
  const email = `user_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
  const password = 'P@ssw0rd!';
  const user = await usersService.createUser(email, password, 'user');
  return { user, email, password };
}


