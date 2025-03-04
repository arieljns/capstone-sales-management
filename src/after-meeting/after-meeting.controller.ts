import { Controller, Delete, Get, Body, Patch } from '@nestjs/common';
import { AfterMeetingService } from './after-meeting.service';
import { afterMeetingDto } from './after-meeting.dto';
import { Param } from '@nestjs/common';
@Controller('/after')
export class AfterMeetingController {
  constructor(private readonly afterMeetingService: AfterMeetingService) {}

  @Get()
  handleRequest() {
    return this.afterMeetingService.getAfterMeetingData();
  }

  @Get(':id')
  postAfterMeetingData(@Param('id') id: number) {
    return this.afterMeetingService.findAfterMeetingDataById(id);
  }

  @Delete(':id')
  deleteAfterMeetingData(@Param('id') id: number) {
    return this.afterMeetingService.deleteAfterMeetingData(id);
  }

  @Patch(':id')
  createAfterMeetingData(
    @Param('id') id: number,
    @Body() data: afterMeetingDto,
  ) {
    return this.afterMeetingService.createMeetingData(id, data);
  }
}
