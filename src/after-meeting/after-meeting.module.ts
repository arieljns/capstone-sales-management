import { Module } from '@nestjs/common';
import { AfterMeetingController } from './after-meeting.controller';
import { AfterMeetingService } from './after-meeting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { AfterMeetingEntity } from './after-meeting.entities';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([AfterMeetingEntity]),
  ],
  controllers: [AfterMeetingController],
  providers: [AfterMeetingService, AfterMeetingEntity],
  exports: [AfterMeetingEntity],
})
export class AfterMeetingModule {}
