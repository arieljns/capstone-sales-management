import { Module } from '@nestjs/common';
import { BusinessLogController } from './business-log.controller';
import { BusinessLogService } from './business-log.service';
import { BeforeMeetingHandler } from './handlers/before-meeting.handler';
import { AuditLogEntity } from './business-log.entities';

@Module({
  imports: [],
  controllers: [BusinessLogController],
  providers: [BusinessLogService, BeforeMeetingHandler, AuditLogEntity],
  exports: [],
})
export class BusinessLogModule {}
