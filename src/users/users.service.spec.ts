import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './users.entities';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<UserEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity)) as jest.Mocked<Repository<UserEntity>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteUserSafely', () => {
    it('throws NotFoundException when user does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.deleteUserSafely('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repo.remove).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when user has associated records', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        password: 'hash',
        role: 'user',
        beforeMeetings: [{} as any],
        afterMeetings: [],
        kanbans: [],
      } as unknown as UserEntity;
      repo.findOne.mockResolvedValue(user);

      await expect(service.deleteUserSafely('user-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(repo.remove).not.toHaveBeenCalled();
    });

    it('removes the user when no associations exist', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        password: 'hash',
        role: 'user',
        beforeMeetings: [],
        afterMeetings: [],
        kanbans: [],
      } as unknown as UserEntity;
      repo.findOne.mockResolvedValue(user);
      repo.remove.mockResolvedValue({} as UserEntity);

      await service.deleteUserSafely('user-1');

      expect(repo.remove).toHaveBeenCalledWith(user);
    });
  });
});
