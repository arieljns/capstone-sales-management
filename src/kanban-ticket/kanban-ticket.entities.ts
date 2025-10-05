import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';
import { AfterMeetingEntity } from 'src/after-meeting/after-meeting.entities';
import { UserEntity } from 'src/users/users.entities';

export enum StageStatus {
  QUOTATION_SENT = 'QuotationSent',
  FOLLOW_UP = 'FollowUp',
  NEGOTIATION = 'Negotiation',
  DECISION_PENDING = 'DecisionPending',
  CLOSED_WON = 'ClosedWon',
  CLOSED_LOST = 'ClosedLost',
}

@Entity('tickets')
export class KanbanTicketEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.kanbans)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  cover: string;

  @Column('jsonb', { default: () => "'[]'" })
  members: { id: string; name: string; email: string; img: string }[];

  @Column('text', { array: true, default: () => "'{}'" })
  labels: string[];

  @Column('jsonb', { default: () => "'[]'" })
  attachments: { id: string; name: string; src: string; size: string }[];

  @Column('jsonb', { default: () => "'[]'" })
  comments: {
    id: string;
    name: string;
    src: string;
    message: string;
    date: number;
  }[];

  @OneToOne(() => BeforeMeetingEntity)
  @JoinColumn({ name: 'beforeMeetingId' })
  beforeMeeting: BeforeMeetingEntity;

  @OneToOne(() => AfterMeetingEntity)
  @JoinColumn({ name: 'afterMeetingId' })
  afterMeeting: AfterMeetingEntity;

  @Column({
    type: 'enum',
    enum: StageStatus,
    default: StageStatus.QUOTATION_SENT,
  })
  stage: StageStatus;

  @Column({ default: 0 })
  dealValue: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
