import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AfterMeetingEntity } from './after-meeting.entities';
import { DeleteResult, Repository } from 'typeorm';
import { afterMeetingDto } from './after-meeting.dto';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';
import { KanbanTicketService } from 'src/kanban-ticket/kanban-ticket.service';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ErrorFactory } from 'src/common/errors/error-factory';

@Injectable()
export class AfterMeetingService {
  private readonly logger = new Logger(AfterMeetingService.name);
  constructor(
    @InjectRepository(AfterMeetingEntity)
    private AfterMeetingRepo: Repository<AfterMeetingEntity>,

    @InjectRepository(BeforeMeetingEntity)
    private beforeMeetingRepo: Repository<BeforeMeetingEntity>,

    private kanbanTicketService: KanbanTicketService,
  ) {}

  async getMeetingDataWithJoin(userId: string): Promise<any[]> {
    const qb = this.AfterMeetingRepo.createQueryBuilder('afterMeeting')
      .leftJoinAndSelect('afterMeeting.user', 'user')
      .leftJoin('afterMeeting.beforeMeeting', 'beforeMeeting')
      .addSelect([
        'beforeMeeting.id',
        'beforeMeeting.name',
        'beforeMeeting.picName',
        'beforeMeeting.picRole',
        'beforeMeeting.picEmail',
        'beforeMeeting.picWhatsapp',
      ])
      .where('user.id = :userId', { userId });
    if (!qb) {
      throw ErrorFactory.resourceNotFound(qb, { userId });
    }
    const results = await qb.getMany();
    return results;
  }

  async getAllAfterMeetingDataByUser(
    userId: string,
  ): Promise<AfterMeetingEntity[]> {
    const results = await this.AfterMeetingRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    if (results.length === 0) {
      throw ErrorFactory.resourceNotFound('after meeting data', { userId });
    }
    return results;
  }

  async findAfterMeetingDataById(id: number): Promise<AfterMeetingEntity> {
    const afterMeetingData = await this.AfterMeetingRepo.findOne({
      where: { id },
    });
    if (!afterMeetingData) {
      throw ErrorFactory.resourceNotFound('after meeting data by id', {
        id,
      });
    }
    return afterMeetingData;
  }

  async deleteAfterMeetingData(id: number): Promise<DeleteResult> {
    const deleteData = await this.AfterMeetingRepo.delete(id);
    if (!deleteData) {
      throw ErrorFactory.resourceNotFound(
        'resource to delete after meeting data',
        { id },
      );
    }
    return deleteData;
  }

  async createMeetingData(
    id: number,
    data: afterMeetingDto,
  ): Promise<AfterMeetingEntity> {
    const meetingData = await this.AfterMeetingRepo.findOne({
      where: { id },
    });
    if (!meetingData) {
      throw ErrorFactory.resourceNotFound('after meeting data to update', {
        id,
      });
    }
    Object.assign(meetingData, data);
    return this.AfterMeetingRepo.save(meetingData);
  }

  async createMeetingDebriefRecord(
    data: afterMeetingDto,
    userId: string,
  ): Promise<AfterMeetingEntity> {
    const beforeMeeting = await this.beforeMeetingRepo.findOne({
      where: { id: data.beforeMeeting },
    });

    if (!beforeMeeting) {
      throw ErrorFactory.resourceNotFound('before meeting data', {
        beforeMeetingId: data.beforeMeeting,
      });
    }

    const newMeeting = this.AfterMeetingRepo.create({
      ...data,
      beforeMeeting,
      user: { id: userId },
    });
    const savedMeeting = await this.AfterMeetingRepo.save(newMeeting);
    await this.kanbanTicketService.createKanbanTicket({
      afterMeeting: savedMeeting.id,
      beforeMeeting: beforeMeeting.id,
      userId,
    });

    return savedMeeting;
  }

  async getMeetingDataJoin() {
    const result = await this.AfterMeetingRepo.createQueryBuilder(
      'afterMeeting',
    )
      .leftJoinAndSelect('afterMeeting.beforeMeeting', 'beforeMeeting')
      .getMany();
    return result;
  }
}
