import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanTicketService } from './kanban-ticket.service';
import { KanbanTicketEntity, StageStatus } from './kanban-ticket.entities';
import { AfterMeetingEntity } from 'src/after-meeting/after-meeting.entities';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';

describe('KanbanTicketService', () => {
  let service: KanbanTicketService;
  let ticketRepo: jest.Mocked<Repository<KanbanTicketEntity>>;
  let afterRepo: jest.Mocked<Repository<AfterMeetingEntity>>;
  let beforeRepo: jest.Mocked<Repository<BeforeMeetingEntity>>;

  beforeEach(async () => {
    const ticketMock: Partial<jest.Mocked<Repository<KanbanTicketEntity>>> = {
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn() as any,
    };
    const afterMock: Partial<jest.Mocked<Repository<AfterMeetingEntity>>> = {
      findOne: jest.fn(),
    };
    const beforeMock: Partial<jest.Mocked<Repository<BeforeMeetingEntity>>> = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KanbanTicketService,
        { provide: getRepositoryToken(KanbanTicketEntity), useValue: ticketMock },
        { provide: getRepositoryToken(AfterMeetingEntity), useValue: afterMock },
        { provide: getRepositoryToken(BeforeMeetingEntity), useValue: beforeMock },
      ],
    }).compile();

    service = module.get(KanbanTicketService);
    ticketRepo = module.get(getRepositoryToken(KanbanTicketEntity));
    afterRepo = module.get(getRepositoryToken(AfterMeetingEntity));
    beforeRepo = module.get(getRepositoryToken(BeforeMeetingEntity));
  });

  it('groups tickets per stage when querying kanban data', async () => {
    const qb: any = {
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { ticket_stage: 'QuotationSent', ticket_id: 1 },
        { ticket_stage: 'ClosedWon', ticket_id: 2 },
      ]),
    };
    (ticketRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const grouped = await service.getKanbanTicketData('user-1');

    expect(qb.where).toHaveBeenCalledWith('bm.userId = :userId', { userId: 'user-1' });
    expect(grouped.QuotationSent).toHaveLength(1);
    expect(grouped.ClosedWon).toHaveLength(1);
    expect(grouped.FollowUp).toEqual([]);
  });

  it('creates a Kanban ticket with default stage and deal value', async () => {
    afterRepo.findOne.mockResolvedValue({ id: 3, totalAmount: 500 } as any);
    beforeRepo.findOne.mockResolvedValue({ id: 'bm1' } as any);
    const created = {} as any;
    ticketRepo.create.mockReturnValue(created);
    const saved = { id: 42 } as any;
    ticketRepo.save.mockResolvedValue(saved);

    const res = await service.createKanbanTicket({
      afterMeeting: 3,
      beforeMeeting: 'bm1',
      userId: 'user-1',
    });
    expect(ticketRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        stage: StageStatus.QUOTATION_SENT,
        dealValue: 500,
        afterMeeting: expect.any(Object),
        beforeMeeting: expect.any(Object),
        user: expect.objectContaining({ id: 'user-1' }),
      }),
    );
    expect(res).toBe(saved);
  });

  it('throws when createKanbanTicket cannot find linked records', async () => {
    afterRepo.findOne.mockResolvedValue(null as any);
    beforeRepo.findOne.mockResolvedValue({} as any);

    await expect(
      service.createKanbanTicket({ afterMeeting: 1, beforeMeeting: 'bm', userId: 'user-1' }),
    ).rejects.toThrow('Invalid afterMeeting or beforeMeeting ID');
  });

  it('updates funnel position and saves ticket', async () => {
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ id: 7, stage: StageStatus.FOLLOW_UP }),
    };
    (ticketRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    ticketRepo.save.mockImplementation(async (t: any) => t);

    const updated = await service.updateFunnelPosition(
      {
        ticketId: 7,
        sourceStage: StageStatus.FOLLOW_UP,
        destinationStage: StageStatus.NEGOTIATION,
        newIndex: 0,
      } as any,
      'user-1',
    );

    expect(qb.andWhere).toHaveBeenCalledWith('bm.userId = :userId', { userId: 'user-1' });
    expect(updated.stage).toBe(StageStatus.NEGOTIATION);
    expect(ticketRepo.save).toHaveBeenCalledWith(expect.objectContaining({ id: 7, stage: StageStatus.NEGOTIATION }));
  });

  it('throws NotFoundException when updateFunnelPosition cannot find ticket', async () => {
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    (ticketRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    await expect(
      service.updateFunnelPosition(
        {
          ticketId: 99,
          destinationStage: StageStatus.CLOSED_WON,
          sourceStage: StageStatus.FOLLOW_UP,
          newIndex: 0,
        } as any,
        'user-1',
      ),
    ).rejects.toThrow('there are no ticket with this id: user-1');
  });
});
