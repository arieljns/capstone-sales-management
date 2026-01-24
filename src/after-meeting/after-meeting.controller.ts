import {
  Controller,
  Delete,
  Get,
  Body,
  Patch,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AfterMeetingService } from './after-meeting.service';
import { afterMeetingDto } from './after-meeting.dto';
import { Param } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { use } from 'passport';

@Controller('/after')
export class AfterMeetingController {
  constructor(private readonly afterMeetingService: AfterMeetingService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Get()
  handleRequest(@Req() req) {
    if (!req.user.userId)
      throw new UnauthorizedException('User ID is missing in the request');
    return this.afterMeetingService.getMeetingDataWithJoin(req.user.userId);
  }

  @Get(':id')
  postAfterMeetingData(@Param('id') id: number) {
    return this.afterMeetingService.findAfterMeetingDataById(id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Delete(':id')
  deleteAfterMeetingData(@Param('id') id: number) {
    return this.afterMeetingService.deleteAfterMeetingData(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Post()
  createValidation(@Body() body: afterMeetingDto, @Req() req) {
    return this.afterMeetingService.createMeetingDebriefRecord(
      body,
      req.user.userId,
    );
  }

  @Patch(':id')
  createAfterMeetingData(
    @Param('id') id: number,
    @Body() data: afterMeetingDto,
  ) {
    return this.afterMeetingService.createMeetingData(id, data);
  }

  @Get('test/data')
  getMeetingDataJoin() {
    return this.afterMeetingService.getMeetingDataJoin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Get('user/data')
  async getAllAfterMeetingDataByUser(@Req() req) {
    const userId = req.user.userId;
    if (!userId) {
      throw new Error('there are no user id');
    }
    return await this.afterMeetingService.getAllAfterMeetingDataByUser(userId);
  }
}
