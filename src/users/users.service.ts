import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './users.entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepo: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  async getUserProfile() {
    return await this.usersRepo.find();
  }

  async createUser(
    email: string,
    password: string,
    role: 'user' | 'admin' = 'user',
  ) {
    const hash = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({ email, password: hash, role: role });
    return this.usersRepo.save(user);
  }

  async validateUser(email: string, rawPassword: string) {
    const user = await this.findByEmail(email);
    if (!user) throw new UnauthorizedException('You had Invalid credentials');
    const match = await bcrypt.compare(rawPassword, user.password);
    if (!match) throw new UnauthorizedException('Invalid Password');
    return user;
  }

  async createMember(
    email?: string,
    password?: string,
    role?: 'user' | 'admin',
  ) {
    if (!email || !password || !role) {
      throw new Error(
        'Email, password, and role are required to create a member',
      );
    }
    const hashedPass = await bcrypt.hash(password, 10);
    const registMember = this.usersRepo.create({
      email: email,
      password: hashedPass,
      role: role,
    });
    return await this.usersRepo.save(registMember);
  }

  async deleteUserSafely(userId: string): Promise<void> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['beforeMeetings', 'afterMeetings', 'kanbans'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const hasAssociations =
      (user.beforeMeetings?.length ?? 0) > 0 ||
      (user.afterMeetings?.length ?? 0) > 0 ||
      (user.kanbans?.length ?? 0) > 0;

    if (hasAssociations) {
      throw new BadRequestException(
        'User cannot be deleted while associated records exist',
      );
    }

    await this.usersRepo.remove(user);
  }
}


