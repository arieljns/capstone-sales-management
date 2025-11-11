import { DataSource } from 'typeorm';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AfterMeetingEntity } from 'src/after-meeting/after-meeting.entities';
import { KanbanTicketEntity } from 'src/kanban-ticket/kanban-ticket.entities';

@Injectable()
export class AirtableService {
  private readonly logger = new Logger(AirtableService.name);
  private readonly token: string;
  private readonly baseId: string;
  private readonly tableName: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    this.token = this.config.get<string>(
      'AIRTABLE_TOKEN',
      process.env.AIRTABLE_TOKEN ?? '',
    );
    this.baseId = this.config.get<string>(
      'AIRTABLE_BASE_ID',
      process.env.AIRTABLE_BASE_ID ?? '',
    );
    this.tableName = this.config.get<string>(
      'AIRTABLE_TABLE_NAME',
      process.env.AIRTABLE_TABLE_NAME ?? '',
    );
  }

  private get tableUrl() {
    return `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(
      this.tableName,
    )}`;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async upsertMeetingFromBeforeMeetingRepo(meetingId: string) {
    const repo = this.dataSource.getRepository(BeforeMeetingEntity);
    const meeting = await repo.findOne({
      where: { id: meetingId },
    });

    if (!meeting) {
      this.logger.warn(`No before meeting found with ID ${meetingId}`);
      return { message: 'No meeting found', meetingId };
    }

    const fields = this.cleanFields({
      'Name & organization': meeting.name,
      'PIC Name': meeting.picName,
      Description: meeting.desc ? meeting.desc : 'No description provided',
      Email: meeting.picEmail ? meeting.picEmail : '',
      Whatsapp: meeting.picWhatsapp ? meeting.picWhatsapp : '',
      'PIC Role': meeting.picRole[0],
    });

    const createPayload = { fields };
    const created = await firstValueFrom(
      this.http.post(this.tableUrl, createPayload, { headers: this.headers }),
    );
    this.logger.log(`Created new meeting ${meetingId} in Airtable.`);
    await this.removeMeetingGraph(meetingId);
    return created.data;
  }

  private cleanFields(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([, v]) => v !== undefined && v !== null && v !== '',
      ),
    );
  }
  async testConnection(): Promise<void> {
    await firstValueFrom(
      this.http.get(this.tableUrl, {
        headers: this.headers,
        params: { maxRecords: 1 },
      }),
    );
  }

  private async removeMeetingGraph(meetingId: string): Promise<void> {
    try {
      const beforeRepo = this.dataSource.getRepository(BeforeMeetingEntity);
      const afterRepo = this.dataSource.getRepository(AfterMeetingEntity);
      const kanbanRepo = this.dataSource.getRepository(KanbanTicketEntity);

      const afterMeeting = await afterRepo.findOne({
        where: { beforeMeeting: { id: meetingId } },
        select: { id: true },
      });

      const kanbanDelete = kanbanRepo
        .createQueryBuilder()
        .delete()
        .where('beforeMeetingId = :meetingId', { meetingId });

      if (afterMeeting) {
        kanbanDelete.orWhere('afterMeetingId = :afterMeetingId', {
          afterMeetingId: afterMeeting.id,
        });
      }

      await kanbanDelete.execute();

      if (afterMeeting) {
        await afterRepo.delete(afterMeeting.id);
      }

      const beforeResult = await beforeRepo.delete(meetingId);
      if (!beforeResult.affected) {
        this.logger.warn(
          `Cleanup skipped: before meeting ${meetingId} was not found.`,
        );
      }

      this.logger.log(
        `Removed related before/after/kanban records for meeting ${meetingId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to cleanup records for meeting ${meetingId}.`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw error;
    }
  }
}
