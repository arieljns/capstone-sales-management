import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KanbanTicketEntity } from './kanban-ticket.entities';
import { Repository } from 'typeorm';

@Injectable()
export class KanbanTicketService {
  constructor(
    @InjectRepository(KanbanTicketEntity)
    private kanbanTicketRepo: Repository<KanbanTicketEntity>,
  ) {}

  getKanbanTicketData() {
    return this.kanbanTicketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.beforeMeeting', 'beforeMeeting')
      .leftJoinAndSelect('ticket.afterMeeting', 'afterMeeting')
      .getMany();
  }
}
