import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanTicketController } from './kanban-ticket.controller';
import { KanbanTicketService } from './kanban-ticket.service';
import { KanbanTicketEntity } from './kanban-ticket.entities';
import { AfterMeetingEntity } from 'src/after-meeting/after-meeting.entities';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KanbanTicketEntity,
      AfterMeetingEntity,
      BeforeMeetingEntity,
    ]),
  ],
  controllers: [KanbanTicketController],
  providers: [KanbanTicketService],
  exports: [TypeOrmModule, KanbanTicketService],
})
export class KanbanTicketModule {}
