import { DataSource, DataSourceOptions } from 'typeorm';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';
import { AfterMeetingEntity } from 'src/after-meeting/after-meeting.entities';
import { KanbanTicketEntity } from 'src/kanban-ticket/kanban-ticket.entities';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'capstone_sales',
  entities: [BeforeMeetingEntity, AfterMeetingEntity, KanbanTicketEntity],
  synchronize: true,
  migrations: ['dist/db/migrations/*.js'],
  dropSchema: true,
  logging: true,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
