import { FollowupReminderReader } from '../reader/followup-reader';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetStalledMeetingsUseCase {
  constructor(private readonly reader: FollowupReminderReader) {}

  async execute(userId: number) {
    const rows = await this.reader.findMeetingWithFollowupGap(userId);

    return rows
      .filter((row) => {
        const sla = STAGE_SLA_DAYS[row.stage];
        return sla > 0 && row.daysInStage > sla;
      })
      .map((row) => ({
        meetingId: row.meetingId,
        meetingName: row.meetingName,
        ticketId: row.ticketId,
        stage: row.stage,
        daysInStage: row.daysInStage,
        overdueDays: row.daysInStage - STAGE_SLA_DAYS[row.stage],
        meetingCreatedAt: row.meetingCreatedAt,
      }))
      .sort((a, b) => b.overdueDays - a.overdueDays);
  }
}
