import { Module } from '@nestjs/common';
import { BeforeMeetingController } from './before-meeting.controller';
import { BeforeMeetingService } from './before-meeting.service';

@Module({
  imports: [],
  controllers: [BeforeMeetingController],
  providers: [BeforeMeetingService],
})
export class BeforeMeetingModule {}
