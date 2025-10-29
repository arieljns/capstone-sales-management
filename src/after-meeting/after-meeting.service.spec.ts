import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AfterMeetingService } from './after-meeting.service';
import { AfterMeetingEntity } from './after-meeting.entities';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';
import { KanbanTicketService } from 'src/kanban-ticket/kanban-ticket.service';
import { UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

describe('AfterMeetingService', () => {
  let service: AfterMeetingService;
  let afterRepo: jest.Mocked<Repository<AfterMeetingEntity>>;
  let beforeRepo: jest.Mocked<Repository<BeforeMeetingEntity>>;
  let kanban: { createKanbanTicket: jest.Mock };

  beforeEach(async () => {
    const afterMock: Partial<jest.Mocked<Repository<AfterMeetingEntity>>> = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn() as any,
    };
    const beforeMock: Partial<jest.Mocked<Repository<BeforeMeetingEntity>>> = {
      findOne: jest.fn(),
    };


    kanban = { createKanbanTicket: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AfterMeetingService,
        { provide: KanbanTicketService, useValue: kanban },
        { provide: getRepositoryToken(AfterMeetingEntity), useValue: afterMock },
        { provide: getRepositoryToken(BeforeMeetingEntity), useValue: beforeMock },
      ],
    }).compile();

    service = module.get(AfterMeetingService);
    afterRepo = module.get(getRepositoryToken(AfterMeetingEntity));
    beforeRepo = module.get(getRepositoryToken(BeforeMeetingEntity));
  });

  it('creates debrief, saves, and creates kanban ticket', async () => {
    const before = { id: 'bm1' } as any;
    (beforeRepo.findOne as jest.Mock).mockResolvedValue(before);
    const created = { id: undefined } as any;
    afterRepo.create.mockReturnValue(created);
    const saved = { id: 10 } as any;
    afterRepo.save.mockResolvedValue(saved);

    const dto: any = { beforeMeeting: 'bm1', totalAmount: 123 };
    const result = await service.createMeetingDebriefRecord(dto, 'user-1');

    expect(beforeRepo.findOne).toHaveBeenCalledWith({ where: { id: 'bm1' } });
    expect(afterRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ beforeMeeting: before, user: { id: 'user-1' } }),
    );
    expect(afterRepo.save).toHaveBeenCalledWith(created);
    expect(kanban.createKanbanTicket).toHaveBeenCalledWith({ afterMeeting: 10, beforeMeeting: 'bm1' });
    expect(result).toBe(saved);
  });

  it('throws UnauthorizedException when not found by id (wrapped)', async () => {
    afterRepo.findOne.mockResolvedValue(null as any);
    await expect(service.findAfterMeetingDataById(999)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('getMeetingDataWithJoin returns results via query builder', async () => {
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 1 }]),
    };
    (afterRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    const res = await service.getMeetingDataWithJoin('user-1');
    expect(qb.where).toHaveBeenCalledWith('user.id = :userId', { userId: 'user-1' });
    expect(res).toEqual([{ id: 1 }]);
  });

  it('getMeetingDataWithJoin throws UnauthorizedException on query error', async () => {
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockRejectedValue(new Error('db')),
    };
    (afterRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    await expect(service.getMeetingDataWithJoin('user-1')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('getAllAfterMeetingDataByUser returns list', async () => {
    const rows = [{ id: 1 } as any];
    afterRepo.find.mockResolvedValue(rows as any);
    const res = await service.getAllAfterMeetingDataByUser('u');
    expect(afterRepo.find).toHaveBeenCalledWith({ where: { user: { id: 'u' } }, order: { createdAt: 'DESC' } });
    expect(res).toBe(rows);
  });

  it('getAllAfterMeetingDataByUser throws UnauthorizedException on error', async () => {
    afterRepo.find.mockRejectedValue(new Error('x'));
    await expect(service.getAllAfterMeetingDataByUser('u')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('findAfterMeetingDataById returns entity when found', async () => {
    const entity = { id: 7 } as any;
    afterRepo.findOne.mockResolvedValue(entity);
    const res = await service.findAfterMeetingDataById(7);
    expect(res).toBe(entity);
  });

  it('deleteAfterMeetingData returns delete result', async () => {
    const del = { affected: 1 } as any;
    afterRepo.delete.mockResolvedValue(del);
    const res = await service.deleteAfterMeetingData(1);
    expect(res).toBe(del);
  });

  it('deleteAfterMeetingData wraps errors', async () => {
    afterRepo.delete.mockResolvedValue(undefined as any);
    await expect(service.deleteAfterMeetingData(1)).rejects.toBeInstanceOf(Error);
  });

  it('createMeetingData updates existing entity', async () => {
    const existing = { id: 2, status: 'OLD' } as any;
    afterRepo.findOne.mockResolvedValue(existing);
    const saved = { id: 2, status: 'NEW' } as any;
    afterRepo.save.mockResolvedValue(saved);
    const res = await service.createMeetingData(2, { status: 'NEW' } as any);
    expect(afterRepo.save).toHaveBeenCalled();
    expect(res).toBe(saved);
  });

  it('createMeetingData throws generic Error when not found', async () => {
    afterRepo.findOne.mockResolvedValue(null as any);
    await expect(service.createMeetingData(1, {} as any)).rejects.toBeInstanceOf(Error);
  });

  it('createMeetingDebriefRecord throws InternalServerError when beforeMeeting missing', async () => {
    (beforeRepo.findOne as jest.Mock).mockResolvedValue(null);
    await expect(
      service.createMeetingDebriefRecord({ beforeMeeting: 'X' } as any, 'u'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('getMeetingDataJoin returns rows', async () => {
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 1 }]),
    };
    (afterRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    const res = await service.getMeetingDataJoin();
    expect(res).toEqual([{ id: 1 }]);
  });
});
