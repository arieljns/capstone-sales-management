import { Injectable } from '@nestjs/common';
import { beforeMeetingDto } from './before-meeting.dto';
import { BeforeMeetingEntity } from './before-meeting.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { csvHandlerDto } from './csv-upload.dto';

@Injectable()
export class BeforeMeetingService {
  constructor(
    @InjectRepository(BeforeMeetingEntity)
    private beforeMeetingRepo: Repository<BeforeMeetingEntity>,
  ) {}
  async getMeetings(): Promise<BeforeMeetingEntity[]> {
    return await this.beforeMeetingRepo.find();
  }

  async getMeetingById(id: string): Promise<BeforeMeetingEntity> {
    try {
      const getMeetingById = await this.beforeMeetingRepo.findOne({
        where: { id },
      });
      if (!getMeetingById) {
        throw new Error(`Meeting with id ${id} not found`);
      }
      return getMeetingById;
    } catch (error) {
      console.error('Error fetching meeting by ID:', error);
      throw new Error('An error occurred while fetching the meeting');
    }
  }

  async moveMeetingStage(id: string): Promise<BeforeMeetingEntity> {
    try {
      const meeting = await this.beforeMeetingRepo.findOne({ where: { id } });
      if (!meeting) {
        throw new Error('no meeting found');
      }
      meeting.isMeetingStage = true;
      await this.beforeMeetingRepo.save(meeting);
      return meeting;
    } catch (error) {
      console.error('Error moving meeting stage:', error);
      throw new Error('An error occurred while moving the meeting stage');
    }
  }

  async createMeeting(
    beforeMeetingForms: csvHandlerDto[] | beforeMeetingDto,
  ): Promise<Record<string, any>> {
    try {
      console.log('Creating meeting(s):', beforeMeetingForms);
      const formsArray = Array.isArray(beforeMeetingForms)
        ? beforeMeetingForms
        : [beforeMeetingForms];
      const newMeetings = this.beforeMeetingRepo.create(formsArray);
      const savedMeetings = await this.beforeMeetingRepo.save(newMeetings);

      return {
        success: true,
        data: savedMeetings,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'Failed to create meeting(s)',
        error: error.message,
      };
    }
  }

  async updateMeeting(
    id: string,
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
