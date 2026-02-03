import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';
import { Repository } from 'typeorm';
import { ErrorFactory } from 'src/common/errors/error-factory';
@Injectable()
export class FormBuilderService {
  constructor(
    @InjectRepository(BeforeMeetingEntity)
    private readonly beforeMeetingRepo: Repository<BeforeMeetingEntity>,
  ) {}

  async getFormData(id: string): Promise<any> {
    const quotationData = await this.beforeMeetingRepo
      .createQueryBuilder('beforeMeeting')
      .leftJoinAndSelect('beforeMeeting.afterMeeting', 'afterMeeting')
      .where('beforeMeeting.id = :id', { id })
      .getOne();
    if (!quotationData) {
      throw ErrorFactory.resourceNotFound('form data', { id });
    }
    return quotationData;
  }
}
