import { Module } from '@nestjs/common';
import { AfterMeetingController } from './after-meeting.controller';
import { AfterMeetingService } from './after-meeting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AfterMeetingEntity } from './after-meeting.entities';
import { KanbanTicketEntity } from 'src/kanban-ticket/kanban-ticket.entities';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';
import { KanbanTicketService } from 'src/kanban-ticket/kanban-ticket.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AfterMeetingEntity,
      KanbanTicketEntity,
      BeforeMeetingEntity,
    ]),
  ],
  controllers: [AfterMeetingController],
  providers: [AfterMeetingService, KanbanTicketService],
  exports: [TypeOrmModule],
})
export class AfterMeetingModule {}
