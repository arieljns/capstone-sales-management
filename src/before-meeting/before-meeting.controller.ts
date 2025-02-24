import { Controller, Get } from '@nestjs/common';
import { BeforeMeetingService } from './before-meeting.service';

@Controller('before')
export class BeforeMeetingController {
  constructor(private readonly beforeMeetingService: BeforeMeetingService) {}

  @Get()
  greetings(): string {
    return this.beforeMeetingService.getGreetings();
  }
}
