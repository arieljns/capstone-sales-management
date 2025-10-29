import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BeforeMeetingService } from './before-meeting.service';
import { BeforeMeetingEntity } from './before-meeting.entities';

describe('BeforeMeetingService', () => {
  let service: BeforeMeetingService;
  let repo: jest.Mocked<Repository<BeforeMeetingEntity>>;

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<Repository<BeforeMeetingEntity>>> = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      insert: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeforeMeetingService,
        {
          provide: getRepositoryToken(BeforeMeetingEntity),
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get(BeforeMeetingService);
    repo = module.get(getRepositoryToken(BeforeMeetingEntity));
  });

  it('returns meetings filtered by userId', async () => {
    const meetings = [{ id: '1' }] as any;
    repo.find.mockResolvedValue(meetings);
    const result = await service.getMeetings('user-1');
    expect(repo.find).toHaveBeenCalledWith({
      where: { user: { id: 'user-1' } },
    });
    expect(result).toBe(meetings);
  });

  it('creates one meeting from DTO and returns insert result', async () => {
    const dto: any = { name: 'Acme', desc: 'Test' };
    const insertResult = { identifiers: [], generatedMaps: [], raw: [] } as any;
    // Return input argument (either entity or array) as-is for simplicity
    repo.create.mockImplementation(((arg: any) => arg as any) as any);
    repo.insert.mockResolvedValue(insertResult);

    const result = await service.createMeeting(dto, 'user-1');

    expect(repo.create).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Acme', user: { id: 'user-1' } }),
    ]);
    expect(repo.insert).toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: insertResult });
  });

  it('moves meeting stage to true and saves', async () => {
    const meeting = { id: 'm1', isMeetingStage: false } as any;
    repo.findOne.mockResolvedValue(meeting);
    repo.save.mockImplementation(async (m: any) => m);

    const updated = await service.moveMeetingStage('m1');
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'm1' } });
    expect(updated.isMeetingStage).toBe(true);
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'm1', isMeetingStage: true }),
    );
  });
});
