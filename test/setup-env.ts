import { config } from 'dotenv';
process.env.NODE_ENV = 'test';
config({ path: '.env.test' });

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_secret';
}

console.log(' Integration test environment loaded');
