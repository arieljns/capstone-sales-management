import { Module, Global } from '@nestjs/common';
import { winstonConfig } from './winston.config';
import { WinstonModule } from 'nest-winston';

@Global()
@Module({
  imports: [WinstonModule.forRoot(winstonConfig)],
})
export class LoggingModule {}
