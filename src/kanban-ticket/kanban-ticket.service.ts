import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KanbanTicketEntity, StageStatus } from './kanban-ticket.entities';
import { Repository } from 'typeorm';
import { AfterMeetingEntity } from 'src/after-meeting/after-meeting.entities';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';
import { Ticket, Columns } from 'src/common/type/kanban.type';
import { UpdateKanbanDto } from './dto/update-kanban.dto';

@Injectable()
export class KanbanTicketService {
  constructor(
    @InjectRepository(KanbanTicketEntity)
    private kanbanTicketRepo: Repository<KanbanTicketEntity>,

    @InjectRepository(AfterMeetingEntity)
    private afterMeetingRepo: Repository<AfterMeetingEntity>,

    @InjectRepository(BeforeMeetingEntity)
    private beforeMeetingRepo: Repository<BeforeMeetingEntity>,
  ) {}

  async getKanbanTicketData(userId): Promise<Columns> {
    const ticketData = await this.kanbanTicketRepo
      .createQueryBuilder('ticket')
      .leftJoin('ticket.beforeMeeting', 'bm')
      .leftJoin('ticket.afterMeeting', 'am')
      .select([
        'ticket.id',
        'ticket.labels',
        'ticket.attachments',
        'ticket.comments',
        'ticket.dealValue',
        'ticket.stage',
        'bm.id',
        'bm.companySize',
        'bm.name',
        'am.id',
        'am.sentiment',
        'am.decisionMaker',
        'am.expiredDate',
        'am.activationAgreement',
        'am.products',
      ])
      .where('bm.userId = :userId', { userId })
      .getRawMany<Ticket>();

    const stages: Ticket['ticket_stage'][] = [
      'QuotationSent',
      'FollowUp',
      'Negotiation',
      'DecisionPending',
      'ClosedWon',
      'ClosedLost',
    ];

    const initialColumns: Columns = stages.reduce((acc, stage) => {
      acc[stage] = [];
      return acc;
    }, {} as Columns);

    const grouped = ticketData.reduce<Columns>((acc, ticket) => {
      acc[ticket.ticket_stage].push(ticket);
      return acc;
    }, initialColumns);

    return grouped;
  }

  async createKanbanTicket({
    afterMeeting,
    beforeMeeting,
  }: {
    afterMeeting: number;
    beforeMeeting: string;
  }): Promise<KanbanTicketEntity> {
    const afterMeetingData = await this.afterMeetingRepo.findOne({
      where: { id: afterMeeting },
    });
    const beforeMeetingData = await this.beforeMeetingRepo.findOne({
      where: { id: beforeMeeting },
    });

    if (!afterMeetingData || !beforeMeetingData) {
      throw new Error('Invalid afterMeeting or beforeMeeting ID');
    }

    const ticket = this.kanbanTicketRepo.create({
      stage: StageStatus.QUOTATION_SENT,
      dealValue: afterMeetingData.totalAmount,
      afterMeeting: afterMeetingData,
      beforeMeeting: beforeMeetingData,
    });
    const kanbanTicketData = await this.kanbanTicketRepo.save(ticket);
    return kanbanTicketData;
  }

  async updateFunnelPosition(
    body: UpdateKanbanDto,
    userId,
  ): Promise<KanbanTicketEntity> {
    const { destinationStage, newIndex, sourceStage, ticketId } = body;
    console.log('this is the user that make the request:', userId);
    const ticket = await this.kanbanTicketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.beforeMeeting', 'bm')
      .where('ticket.id = :ticketId', { ticketId })
      .andWhere('bm.userId = :userId', { userId })
      .getOne();

    if (!ticket) {
      throw new NotFoundException(
        `there are no ticket with this id: ${userId}`,
      );
    }

    ticket.stage = destinationStage;

    await this.kanbanTicketRepo.save(ticket);

    return ticket;
  }
}
