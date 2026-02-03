import { Injectable } from '@nestjs/common';
import { beforeMeetingDto } from './before-meeting.dto';
import { BeforeMeetingEntity } from './before-meeting.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { csvHandlerDto } from './csv-upload.dto';
import { ErrorFactory } from 'src/common/errors/error-factory';

@Injectable()
export class BeforeMeetingService {
  constructor(
    @InjectRepository(BeforeMeetingEntity)
    private beforeMeetingRepo: Repository<BeforeMeetingEntity>,
  ) {}

  async getMeetings(userId): Promise<BeforeMeetingEntity[]> {
    const res = await this.beforeMeetingRepo.find({
      where: { user: { id: userId } },
    });
    if (!res) {
      throw ErrorFactory.resourceNotFound('meetings', { userId });
    }
    return res;
  }

  async getMeetingById(id: string): Promise<BeforeMeetingEntity> {
    const getMeetingById = await this.beforeMeetingRepo.findOne({
      where: { id },
    });
    if (!getMeetingById) {
      throw ErrorFactory.resourceNotFound('meeting', { id });
    }
    return getMeetingById;
  }

  async moveMeetingStage(id: string): Promise<BeforeMeetingEntity> {
    const meeting = await this.beforeMeetingRepo.findOne({ where: { id } });
    if (!meeting) {
      throw ErrorFactory.resourceNotFound('move meeting stage', { id });
    }
    meeting.isMeetingStage = true;
    await this.beforeMeetingRepo.save(meeting);
    return meeting;
  }

  async createMeeting(
    beforeMeetingForms: csvHandlerDto[] | beforeMeetingDto,
    userId,
  ): Promise<Record<string, any>> {
    console.log('Creating meeting(s):', beforeMeetingForms, userId);
    const formsArray = Array.isArray(beforeMeetingForms)
      ? beforeMeetingForms
      : [beforeMeetingForms];
    const newMeetings = this.beforeMeetingRepo.create(
      formsArray.map((form) => ({
        ...form,
        user: { id: userId },
      })),
    );
    const savedMeetings = await this.beforeMeetingRepo.insert(newMeetings);

    return {
      success: true,
      data: savedMeetings,
    };
  }

  async updateMeeting(
    id: string,
    updateData: Partial<BeforeMeetingEntity>,
  ): Promise<BeforeMeetingEntity> {
    const meeting = await this.beforeMeetingRepo.findOne({ where: { id } });

    if (!meeting) {
      throw ErrorFactory.resourceNotFound('meeting to update', { id });
    }

    await this.beforeMeetingRepo.update(id, updateData);

    const updatedMeeting = await this.beforeMeetingRepo.findOne({
      where: { id },
    });

    if (!updatedMeeting) {
      throw new Error('Failed to retrieve updated meeting');
    }

    return updatedMeeting;
  }

  async deleteMeeting(id: number) {
    const deleteMeetingData = await this.beforeMeetingRepo.delete(id);

    if (!deleteMeetingData) {
      throw ErrorFactory.resourceNotFound('meeting to delete', { id });
    }
    return {
      message: 'deleted successfully',
      deletedId: id,
    };
  }
}
