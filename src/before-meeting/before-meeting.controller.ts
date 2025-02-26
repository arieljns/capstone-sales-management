import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BeforeMeetingService } from './before-meeting.service';
import { beforeMeetingDto } from './before-meeting.dto';
import { BeforeMeetingEntity } from './before-meeting.entities';

@Controller('before')
export class BeforeMeetingController {
  constructor(private readonly beforeMeetingService: BeforeMeetingService) {}

  @Get()
  getMeetings(): Promise<BeforeMeetingEntity[]> {
    return this.beforeMeetingService.getMeetings();
  }

  @Post()
  inputHandler(@Body() beforeMeeting: beforeMeetingDto) {
    return this.beforeMeetingService.createMeeting(beforeMeeting);
  }

  @Put(':id')
  updateHandler(@Param('id') id: number, @Body() updateData: beforeMeetingDto) {
    console.log(typeof id);
    return this.beforeMeetingService.updateMeeting(id, updateData);
  }

  @Delete(':id')
  deleteHandler(@Param('id') id: number) {
    return this.beforeMeetingService.deleteMeeting(id);
  }
}
