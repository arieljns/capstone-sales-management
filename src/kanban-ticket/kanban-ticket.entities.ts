import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';
import { AfterMeetingEntity } from 'src/after-meeting/after-meeting.entities';
@Entity('tickets')
export class KanbanTicketEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  stage: string;
  @Column({ nullable: true })
  dealValue: number;

  @OneToOne(
    () => BeforeMeetingEntity,
    (beforeMeeting) => beforeMeeting.kanbanTicket,
    { eager: false },
  )
  @JoinColumn({ name: 'before_meeting_id' })
  beforeMeeting: BeforeMeetingEntity;

  @OneToOne(
    () => AfterMeetingEntity,
    (afterMeeting) => afterMeeting.kanbanTicket,
    { eager: false },
  )
  @JoinColumn({ name: 'after_meeting_id' })
  afterMeeting: AfterMeetingEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
