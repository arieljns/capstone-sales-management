import { DataSource, DataSourceOptions } from 'typeorm';
import { BeforeMeetingEntity } from '../src/before-meeting/before-meeting.entities';
import { AfterMeetingEntity } from '../src/after-meeting/after-meeting.entities';
import { KanbanTicketEntity } from '../src/kanban-ticket/kanban-ticket.entities';
import { UserEntity } from '../src/users/users.entities';

// Allow environment-driven configuration (supports a separate test DB)
const isTest = process.env.NODE_ENV === 'test';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || (isTest ? 'capstone_sales_test' : 'capstone_sales'),
  entities: [
    BeforeMeetingEntity,
    AfterMeetingEntity,
    KanbanTicketEntity,
    UserEntity,
  ],
  synchronize: process.env.TYPEORM_SYNC
    ? process.env.TYPEORM_SYNC === 'true'
    : true,
  migrations: ['dist/db/migrations/*.js'],
  logging: isTest ? false : true,
  // For test environment, optionally drop schema for clean runs
  dropSchema: process.env.TYPEORM_DROP_SCHEMA === 'true' || false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
