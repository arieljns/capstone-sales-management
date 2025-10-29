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
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Req } from '@nestjs/common';
@Controller('before')
export class BeforeMeetingController {
  constructor(private readonly beforeMeetingService: BeforeMeetingService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Get()
  getMeetings(@Req() req): Promise<BeforeMeetingEntity[]> {
    console.log(req.user.userId, 'ini user id dari controller');
    return this.beforeMeetingService.getMeetings(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Get(':id')
  getMeetingById(@Param('id') id: string): Promise<BeforeMeetingEntity> {
    return this.beforeMeetingService.getMeetingById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Patch('/:id/move-stage')
  moveMeetingStage(@Param('id') id: string) {
    console.log('Moving meeting stage for ID:', id);
    return this.beforeMeetingService.moveMeetingStage(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Post()
  inputHandler(@Body() beforeMeeting: beforeMeetingDto, @Req() req) {
    if (!req.user.userId) throw new Error('User ID is missing in the request');
    return this.beforeMeetingService.createMeeting(
      beforeMeeting,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Post('/csv')
  csvHandler(@Body() csvData: csvHandlerDto[], @Req() req) {
    console.log(csvData);
    return this.beforeMeetingService.createMeeting(csvData, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Put(':id')
  updateHandler(@Param('id') id: string, @Body() updateData: beforeMeetingDto) {
    return this.beforeMeetingService.updateMeeting(id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Delete(':id')
  deleteHandler(@Param('id') id: number) {
    return this.beforeMeetingService.deleteMeeting(id);
  }
}
