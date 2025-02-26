import { Controller, Get } from '@nestjs/common';
import { AfterMeetingService } from './after-meeting.service';

@Controller('/after')
export class AfterMeetingController {
  constructor(private readonly afterMeetingService: AfterMeetingService) {}

  @Get()
  handleRequest(): string {
    return this.afterMeetingService.getAfterMeetingData();
  }
}
