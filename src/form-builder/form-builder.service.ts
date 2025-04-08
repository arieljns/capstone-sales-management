import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AfterMeetingEntity } from 'src/after-meeting/after-meeting.entities';
import { Repository } from 'typeorm';
@Injectable()
export class FormBuilderService {
  constructor(
    @InjectRepository(AfterMeetingEntity)
    private afterMeetingRepo: Repository<AfterMeetingEntity>,
  ) {}

  async getFormData(id: number): Promise<AfterMeetingEntity> {
    try {
      const meeting = await this.afterMeetingRepo.findOne({
        where: { id },
      });
      if (!meeting) {
        throw new Error('there are no meeting with that id');
      }
      return meeting;
    } catch (error) {
      console.error('there are error', error);
      throw new Error('there are issue when retrieving data');
    }
  }
}
