import { Module } from '@nestjs/common';
import { BeforeMeetingController } from './before-meeting.controller';
import { BeforeMeetingService } from './before-meeting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeforeMeetingEntity } from './before-meeting.entities';
import { AfterMeetingEntity } from 'src/after-meeting/after-meeting.entities';
@Module({
  imports: [
    TypeOrmModule.forFeature([BeforeMeetingEntity, AfterMeetingEntity]),
  ],
  controllers: [BeforeMeetingController],
  providers: [BeforeMeetingService],
})
export class BeforeMeetingModule {}
