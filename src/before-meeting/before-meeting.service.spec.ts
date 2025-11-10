import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BeforeMeetingService } from './before-meeting.service';
import { BeforeMeetingEntity } from './before-meeting.entities';

describe('BeforeMeetingService', () => {
  let service: BeforeMeetingService;
  let repo: jest.Mocked<Repository<BeforeMeetingEntity>>;
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
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

  describe('getMeetingById', () => {
    it('returns meeting when found', async () => {
      const meeting = { id: 'm1' } as any;
      repo.findOne.mockResolvedValue(meeting);
      await expect(service.getMeetingById('m1')).resolves.toBe(meeting);
    });

    it('wraps errors when meeting is missing', async () => {
      repo.findOne.mockResolvedValue(null as any);
      await expect(service.getMeetingById('missing')).rejects.toThrow(
        'An error occurred while fetching the meeting',
      );
    });
  });

  describe('moveMeetingStage', () => {
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

    it('throws wrapped error when repository fails', async () => {
      repo.findOne.mockResolvedValue(null as any);
      await expect(service.moveMeetingStage('missing')).rejects.toThrow(
        'An error occurred while moving the meeting stage',
      );
    });
  });

  describe('createMeeting', () => {
    it('creates one meeting from DTO and returns insert result', async () => {
      const dto: any = { name: 'Acme', desc: 'Test' };
      const insertResult = { identifiers: [], generatedMaps: [], raw: [] } as any;
      repo.create.mockImplementation(((arg: any) => arg as any) as any);
      repo.insert.mockResolvedValue(insertResult);

      const result = await service.createMeeting(dto, 'user-1');

      expect(repo.create).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'Acme', user: { id: 'user-1' } }),
      ]);
      expect(repo.insert).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: insertResult });
    });

    it('flattens array payloads and returns failed response on exception', async () => {
      const forms = [{ name: 'Deal' }, { name: 'Deal 2' }];
      repo.create.mockImplementation(((arg: any) => arg as any) as any);
      repo.insert.mockRejectedValue(new Error('db down'));

      const result = await service.createMeeting(forms, 'user-1');
      expect(repo.create).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Deal', user: { id: 'user-1' } }),
        ]),
      );
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create meeting(s)');
      expect(result.error).toBe('db down');
    });
  });

  describe('updateMeeting', () => {
    it('updates meeting and returns refreshed entity', async () => {
      const meeting = { id: 'm1', name: 'Old' } as any;
      const updated = { id: 'm1', name: 'New' } as any;
      repo.findOne.mockResolvedValueOnce(meeting);
      repo.findOne.mockResolvedValueOnce(updated);

      const result = await service.updateMeeting('m1', { name: 'New' });

      expect(repo.update).toHaveBeenCalledWith('m1', { name: 'New' });
      expect(result).toBe(updated);
    });

    it('throws wrapped error when entity not found', async () => {
      repo.findOne.mockResolvedValue(null as any);
      await expect(service.updateMeeting('missing', {})).rejects.toThrow(
        'An error occurred while updating the meeting',
      );
    });
  });

  describe('deleteMeeting', () => {
    it('returns success payload when deletion succeeds', async () => {
      repo.delete.mockResolvedValue({ affected: 1 } as any);
      await expect(service.deleteMeeting(1)).resolves.toEqual({
        message: 'deleted successfully',
        deletedId: 1,
      });
    });

    it('throws wrapped error when repository rejects', async () => {
      repo.delete.mockResolvedValue(null as any);
      await expect(service.deleteMeeting(2)).rejects.toThrow(
        'there are some issue when deleting the meeting',
      );
    });
  });
});
