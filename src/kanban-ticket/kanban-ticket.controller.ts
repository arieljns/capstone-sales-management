import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { KanbanTicketService } from './kanban-ticket.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('kanban')
export class KanbanTicketController {
  constructor(private readonly kanbanTicketService: KanbanTicketService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Get()
  getKanbanTicketsData(@Req() req) {
    if (!req.user.userId)
      throw new UnauthorizedException('User ID is missing in the request');
    return this.kanbanTicketService.getKanbanTicketData(req.user.userId);
  }
}
