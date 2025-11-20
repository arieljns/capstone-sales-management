import { KanbanTicketEntity } from 'src/kanban-ticket/kanban-ticket.entities';
import { UserEntity } from 'src/users/users.entities';
import { AfterMeetingEntity } from 'src/after-meeting/after-meeting.entities';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('before_meeting')
export class BeforeMeetingEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.beforeMeetings)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  name: string;

  @Column()
  desc: string;

  @Column('int')
  totalTask: number;

  @Column('int')
  completedTask: number;

  @Column()
  companySize: string;

  @Column()
  picName: string;

  @Column('simple-array')
  picRole: string[];

  @Column({ nullable: true })
  notes: string;

  @Column('simple-array')
  currentSystem: string[];

  @Column('simple-array')
  systemRequirement: string[];

  @Column({ nullable: true })
  picWhatsapp: string;

  @Column({ nullable: true })
  picEmail: string;

  @Column({ type: 'integer', nullable: true })
  budget: number;

  @Column('simple-array', { default: '' })
  category: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  meetingDate: Date;

  @OneToOne(
    () => KanbanTicketEntity,
    (kanbanTicket) => kanbanTicket.beforeMeeting,
  )
  kanbanTicket: KanbanTicketEntity;

  @OneToOne(
    () => AfterMeetingEntity,
    (afterMeeting) => afterMeeting.beforeMeeting,
  )
  afterMeeting: AfterMeetingEntity;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: false })
  isMeetingStage: boolean;
}
