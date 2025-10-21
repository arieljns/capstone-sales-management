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

@Injectable()
export class AfterMeetingService {
  constructor(
    @InjectRepository(AfterMeetingEntity)
    private AfterMeetingRepo: Repository<AfterMeetingEntity>,

    @InjectRepository(BeforeMeetingEntity)
    private beforeMeetingRepo: Repository<BeforeMeetingEntity>,

    private kanbanTicketService: KanbanTicketService,
  ) {}

  async getMeetingDataWithJoin(userId: string): Promise<any[]> {
    try {
      const qb = this.AfterMeetingRepo.createQueryBuilder('afterMeeting')
        .leftJoinAndSelect('afterMeeting.user', 'user')
        .leftJoin('afterMeeting.beforeMeeting', 'beforeMeeting')
        .addSelect(['beforeMeeting.id', 'beforeMeeting.name'])
        .where('user.id = :userId', { userId });

      const results = await qb.getMany();
      return results;
    } catch (error) {
      console.error('Error joining afterMeeting and beforeMeeting:', error);
      throw new UnauthorizedException('Could not get meeting data');
    }
  }

  async findAfterMeetingDataById(id: number): Promise<AfterMeetingEntity> {
    try {
      const afterMeetingData = await this.AfterMeetingRepo.findOne({
        where: { id },
      });
      if (!afterMeetingData) {
        throw new NotFoundException('there are no data with coressponding id');
      }
      return afterMeetingData;
    } catch (error) {
      console.error('there are issue when creating after meeting data:', error);
      throw new UnauthorizedException(
        'there are some issue when creating data ',
      );
    }
  }

  async deleteAfterMeetingData(id: number): Promise<DeleteResult> {
    try {
      const deleteData = await this.AfterMeetingRepo.delete(id);
      if (!deleteData) {
        throw new NotFoundException('there are no meeting with this id');
      }
      return deleteData;
    } catch (error) {
      console.error('error occured when deleting data', error);
      throw new Error('there are error when deleting data ');
    }
  }

  async createMeetingData(
    id: number,
    data: afterMeetingDto,
  ): Promise<AfterMeetingEntity> {
    try {
      const meetingData = await this.AfterMeetingRepo.findOne({
        where: { id },
      });
      if (!meetingData) {
        throw new NotFoundException('there are no data with related id');
      }
      Object.assign(meetingData, data);
      return this.AfterMeetingRepo.save(meetingData);
    } catch (error) {
      console.error('error occured', error);
      throw new Error(
        'there are error when attempting to create after meeting data',
      );
    }
  }

  async createMeetingDebriefRecord(
    data: afterMeetingDto,
    userId,
  ): Promise<AfterMeetingEntity> {
    try {
      const beforeMeeting = await this.beforeMeetingRepo.findOne({
        where: { id: data.beforeMeeting },
      });

      if (!beforeMeeting) {
        throw new BadRequestException('No before meeting found with this ID');
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
      });

      return savedMeeting;
    } catch (error: unknown) {
      console.error('Error in createMeetingDebriefRecord:', error);
      throw new InternalServerErrorException(
        'Failed to create meeting debrief record',
      );
    }
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
