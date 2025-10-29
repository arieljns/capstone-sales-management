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

  it('creates a Kanban ticket with default stage and deal value', async () => {
    afterRepo.findOne.mockResolvedValue({ id: 3, totalAmount: 500 } as any);
    beforeRepo.findOne.mockResolvedValue({ id: 'bm1' } as any);
    const created = {} as any;
    ticketRepo.create.mockReturnValue(created);
    const saved = { id: 42 } as any;
    ticketRepo.save.mockResolvedValue(saved);

    const res = await service.createKanbanTicket({ afterMeeting: 3, beforeMeeting: 'bm1' });
    expect(ticketRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        stage: StageStatus.QUOTATION_SENT,
        dealValue: 500,
        afterMeeting: expect.any(Object),
        beforeMeeting: expect.any(Object),
      }),
    );
    expect(res).toBe(saved);
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

    expect(qb.getOne).toHaveBeenCalled();
    expect(updated.stage).toBe(StageStatus.NEGOTIATION);
    expect(ticketRepo.save).toHaveBeenCalledWith(expect.objectContaining({ id: 7, stage: StageStatus.NEGOTIATION }));
  });
});
