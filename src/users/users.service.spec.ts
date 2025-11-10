import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './users.entities';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail & getUserProfile', () => {
    it('retrieves user by email', async () => {
      const entity = { id: 'u1', email: 'user@example.com' } as UserEntity;
      repo.findOne.mockResolvedValue(entity);
      await expect(service.findByEmail('user@example.com')).resolves.toBe(entity);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
    });

    it('lists profiles via repository', async () => {
      const list = [{ id: 'u1' } as UserEntity];
      repo.find.mockResolvedValue(list);
      await expect(service.getUserProfile()).resolves.toBe(list);
      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe('createUser & validateUser', () => {
    it('hashes password then saves user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      repo.create.mockReturnValue({ email: 'user@example.com', password: 'hashed', role: 'user' } as any);
      const saved = { id: 'u1' } as UserEntity;
      repo.save.mockResolvedValue(saved);

      const result = await service.createUser('user@example.com', 'plain', 'admin');

      expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
      expect(repo.create).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'hashed',
        role: 'admin',
      });
      expect(result).toBe(saved);
    });

    it('validates user credentials successfully', async () => {
      const entity = { id: 'u1', email: 'user@example.com', password: 'hashed' } as UserEntity;
      repo.findOne.mockResolvedValue(entity);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('user@example.com', 'plain');
      expect(result).toBe(entity);
      expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashed');
    });

    it('throws UnauthorizedException when email is unknown', async () => {
      repo.findOne.mockResolvedValue(null as any);
      await expect(service.validateUser('missing@example.com', 'p')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when password mismatch', async () => {
      const entity = { id: 'u1', email: 'user@example.com', password: 'hashed' } as UserEntity;
      repo.findOne.mockResolvedValue(entity);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser('user@example.com', 'wrong')).rejects.toThrow('Invalid Password');
    });
  });

  describe('createMember', () => {
    it('throws when mandatory fields missing', async () => {
      await expect(service.createMember(undefined, undefined, undefined)).rejects.toThrow(
        'Email, password, and role are required to create a member',
      );
    });

    it('hashes password and persists member', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
      repo.create.mockReturnValue({} as any);
      repo.save.mockResolvedValue({ id: 'member' } as any);

      const result = await service.createMember('member@example.com', 'pass', 'user');

      expect(bcrypt.hash).toHaveBeenCalledWith('pass', 10);
      expect(repo.create).toHaveBeenCalledWith({
        email: 'member@example.com',
        password: 'hash',
        role: 'user',
      });
      expect(result).toEqual({ id: 'member' });
    });
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
