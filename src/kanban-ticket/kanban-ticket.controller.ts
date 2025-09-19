import { Controller, Get } from '@nestjs/common';
import { KanbanTicketService } from './kanban-ticket.service';

@Controller('kanban')
export class KanbanTicketController {
  constructor(private readonly kanbanTicketService: KanbanTicketService) {}
  @Get()
  getKanbanTicketsData() {
    return this.kanbanTicketService.getKanbanTicketData();
  }
}
