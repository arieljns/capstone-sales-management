import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';
import { Repository } from 'typeorm';
@Injectable()
export class FormBuilderService {
  constructor(
    @InjectRepository(BeforeMeetingEntity)
    private readonly beforeMeetingRepo: Repository<BeforeMeetingEntity>,
  ) {}

  async getFormData(id: string): Promise<any> {
    try {
      const quotationData = await this.beforeMeetingRepo
        .createQueryBuilder('beforeMeeting')
        .leftJoinAndSelect('beforeMeeting.afterMeeting', 'afterMeeting')
        .where('beforeMeeting.id = :id', { id })
        .getOne();
      return quotationData;
    } catch {
      throw new Error('Failed to join the quotation data');
    }
  }
}
