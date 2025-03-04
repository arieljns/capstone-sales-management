import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AfterMeetingEntity } from './after-meeting.entities';
import { DeleteResult, Repository } from 'typeorm';
import { afterMeetingDto } from './after-meeting.dto';

@Injectable()
export class AfterMeetingService {
  constructor(
    @InjectRepository(AfterMeetingEntity)
    private AfterMeetingRepo: Repository<AfterMeetingEntity>,
  ) {}

  async getAfterMeetingData(): Promise<AfterMeetingEntity[]> {
    try {
      const getMeetingData = await this.AfterMeetingRepo.find();
      return getMeetingData;
    } catch (error) {
      console.error(
        'there are an error when trying to get meeting Data:',
        error,
      );
      throw new Error('couldnt get meeting Data');
    }
  }

  async findAfterMeetingDataById(id: number): Promise<AfterMeetingEntity> {
    try {
      const afterMeetingData = await this.AfterMeetingRepo.findOne({
        where: { id },
      });
      if (!afterMeetingData) {
        throw new Error('there are no data with coressponding id');
      }
      return afterMeetingData;
    } catch (error) {
      console.error('there are issue when creating after meeting data:', error);
      throw new Error('there are some issue when creating data ');
    }
  }

  async deleteAfterMeetingData(id: number): Promise<DeleteResult> {
    try {
      const deleteData = await this.AfterMeetingRepo.delete(id);
      if (!deleteData) {
        throw new Error('there are no meeting with this id');
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
        throw new Error('there are no data with related id');
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
}
