import { Controller, Get, Param, Post } from '@nestjs/common';
import { AirtableService } from './airtable.service';

@Controller('airtable')
export class AirtableController {
  constructor(private readonly airtableService: AirtableService) {}

  @Get('test')
  async testConnection() {
    await this.airtableService.testConnection();
    return { status: 'connected' };
  }

  @Post('meetings/:meetingId')
  async syncSingleMeeting(@Param('meetingId') meetingId: string) {
    return this.airtableService.upsertMeetingFromBeforeMeetingRepo(meetingId);
  }
}
