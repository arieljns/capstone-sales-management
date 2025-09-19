import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { BeforeMeetingService } from './before-meeting.service';
import { beforeMeetingDto } from './before-meeting.dto';
import { BeforeMeetingEntity } from './before-meeting.entities';
import { csvHandlerDto } from './csv-upload.dto';

@Controller('before')
export class BeforeMeetingController {
  constructor(private readonly beforeMeetingService: BeforeMeetingService) {}

  @Get()
  getMeetings(): Promise<BeforeMeetingEntity[]> {
    return this.beforeMeetingService.getMeetings();
  }

  @Get(':id')
  getMeetingById(@Param('id') id: string): Promise<BeforeMeetingEntity> {
    return this.beforeMeetingService.getMeetingById(id);
  }

  @Patch('/:id/move-stage')
  moveMeetingStage(@Param('id') id: string) {
    console.log('Moving meeting stage for ID:', id);
    return this.beforeMeetingService.moveMeetingStage(id);
  }

  @Post()
  inputHandler(@Body() beforeMeeting: beforeMeetingDto) {
    console.log(beforeMeeting);
    return this.beforeMeetingService.createMeeting(beforeMeeting);
  }

  @Post('/csv')
  csvHandler(@Body() csvData: csvHandlerDto[]) {
    console.log(csvData);
    return this.beforeMeetingService.createMeeting(csvData);
  }

  @Put(':id')
  updateHandler(@Param('id') id: string, @Body() updateData: beforeMeetingDto) {
    return this.beforeMeetingService.updateMeeting(id, updateData);
  }

  @Delete(':id')
  deleteHandler(@Param('id') id: number) {
    return this.beforeMeetingService.deleteMeeting(id);
  }
}
