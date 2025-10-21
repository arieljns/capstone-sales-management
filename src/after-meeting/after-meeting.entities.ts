import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { KanbanTicketEntity } from 'src/kanban-ticket/kanban-ticket.entities';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';
import { UserEntity } from 'src/users/users.entities';
@Entity('validation')
export class AfterMeetingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.afterMeetings)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  sentiment: string;

  @Column()
  status: string;

  @Column()
  excitementLevel: string;

  @Column()
  promo: string;

  @Column()
  decisionMaker: string;

  @Column()
  activationAgreement: string;

  @Column({ type: 'timestamp' })
  expiredDate: Date;

  @Column({ type: 'jsonb' })
  products: {
    id: string;
    name: string;
    price: number;
    img: string;
    productCode: string;
  }[];

  @Column()
  totalEmployee: number;

  @Column()
  discountRate: string;

  @Column()
  termIn: string;

  @Column()
  totalAmount: number;

  @Column()
  mrr: number;

  @Column({ type: 'boolean', default: false })
  isFormSubmitted: boolean;

  @OneToOne(() => KanbanTicketEntity, (kanban) => kanban.afterMeeting)
  kanbanTicket: KanbanTicketEntity;

  @OneToOne(() => BeforeMeetingEntity)
  @JoinColumn()
  beforeMeeting: BeforeMeetingEntity;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
