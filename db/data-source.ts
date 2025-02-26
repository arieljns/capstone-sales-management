import { DataSource, DataSourceOptions } from 'typeorm';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'capstone_sales',
  entities: [BeforeMeetingEntity],
  synchronize: true,
  logging: true,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
