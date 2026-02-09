import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanTicketEntity } from 'src/kanban-ticket/kanban-ticket.entities';

@Injectable()
export class OpportunityReader {
  constructor(
    @InjectRepository(KanbanTicketEntity)
    private readonly repo: Repository<KanbanTicketEntity>,
  ) {}

  async findStalledBySalesRep(salesRepId: string): Promise<
    {
      opportunityId: string;
      stage: string;
      enteredStageAt: Date;
      daysInStage: number;
    }[]
  > {
    return this.repo
      .createQueryBuilder('o')
      .innerJoin('o.kanban', 'k')
      .where('o.sales_rep_id = :salesRepId', { salesRepId })
      .andWhere('o.status = :status', { status: 'OPEN' })
      .select([
        'o.id AS "opportunityId"',
        'k.stage AS stage',
        'k.updated_at AS "enteredStageAt"',
        `DATE_PART('day', NOW() - k.updated_at) AS "daysInStage"`,
      ])
      .getRawMany();
  }
}
