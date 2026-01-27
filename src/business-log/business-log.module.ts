import { Module } from '@nestjs/common';
import { BusinessLogController } from './business-log.controller';
import { BusinessLogService } from './business-log.service';

@Module({
  imports: [],
  controllers: [BusinessLogController],
  providers: [BusinessLogService],
  exports: [],
})
export class BusinessLogModule {}
