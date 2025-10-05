import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { OneToMany } from 'typeorm';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';
import { AfterMeetingEntity } from 'src/after-meeting/after-meeting.entities';
import { KanbanTicketEntity } from 'src/kanban-ticket/kanban-ticket.entities';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: 'user' | 'admin';

  @OneToMany(() => BeforeMeetingEntity, (before) => before.user)
  beforeMeetings: BeforeMeetingEntity[];

  @OneToMany(() => AfterMeetingEntity, (after) => after.user)
  afterMeetings: AfterMeetingEntity[];

  @OneToMany(() => KanbanTicketEntity, (kanban) => kanban.user)
  kanbans: KanbanTicketEntity[];
}
