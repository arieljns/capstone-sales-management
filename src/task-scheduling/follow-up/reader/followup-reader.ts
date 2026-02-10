import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';

@Injectable()
export class FollowupReminderReader {
  constructor(
    @InjectRepository(BeforeMeetingEntity)
    private readonly meetingRepo: Repository<BeforeMeetingEntity>,
  ) {}

  async findMeetingWithFollowupGap(userId: number) {
    return this.meetingRepo
      .createQueryBuilder('bm')
      .innerJoin('bm.kanbanTicket', 'kt')
      .innerJoin('kt.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('kt.stage NOT IN (:...closed)', {
        closed: [StageStatus.CLOSED_WON, StageStatus.CLOSED_LOST],
      })
      .andWhere((qb) => {
        const sub = qb
          .subQuery()
          .select('MAX(bm2.createdAt)')
          .from(BeforeMeetingEntity, 'bm2')
          .where('bm2.kanbanTicket = kt.id')
          .getQuery();

        return 'bm.createdAt = ' + sub;
      })

      .select([
        'bm.id AS "meetingId"',
        'bm.name AS "meetingName"',
        'bm.createdAt AS "meetingCreatedAt"',
        'kt.id AS "ticketId"',
        'kt.stage AS stage',
        'kt.updatedAt AS "stageEnteredAt"',
        `DATE_PART('day', NOW() - kt.updatedAt) AS "daysInStage"`,
      ])
      .getRawMany();
  }
}
