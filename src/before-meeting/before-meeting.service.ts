import { Injectable } from '@nestjs/common';
import { beforeMeetingDto } from './before-meeting.dto';
import { BeforeMeetingEntity } from './before-meeting.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BeforeMeetingService {
  constructor(
    @InjectRepository(BeforeMeetingEntity)
    private beforeMeetingRepo: Repository<BeforeMeetingEntity>,
  ) {}
  async getMeetings(): Promise<BeforeMeetingEntity[]> {
    return await this.beforeMeetingRepo.find();
  }

  async createMeeting(
    beforeMeetingForm: beforeMeetingDto,
  ): Promise<Record<string, any>> {
    try {
      const newMeeting = this.beforeMeetingRepo.create(beforeMeetingForm);
      return await this.beforeMeetingRepo.save(newMeeting);
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'Failed to create meeting',
      };
    }
  }

  async updateMeeting(
    id: number,
    updateData: Partial<BeforeMeetingEntity>,
  ): Promise<BeforeMeetingEntity> {
    try {
      const meeting = await this.beforeMeetingRepo.findOne({ where: { id } });

      if (!meeting) {
        throw new Error('Meeting not found');
      }

      await this.beforeMeetingRepo.update(id, updateData);

      const updatedMeeting = await this.beforeMeetingRepo.findOne({
        where: { id },
      });

      if (!updatedMeeting) {
        throw new Error('Failed to retrieve updated meeting');
      }

      return updatedMeeting;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw new Error('An error occurred while updating the meeting');
    }
  }

  async deleteMeeting(id: number) {
    try {
      const deleteMeetingData = await this.beforeMeetingRepo.delete(id);

      if (!deleteMeetingData) {
        throw new Error('there are no data to be delete');
      }
      return {
        message: 'deleted successfully',
        deletedId: id,
      };
    } catch (error) {
      if (error) {
        throw new Error('there are some issue when deleting the meeting');
      }
    }
  }
}
