import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { KanbanTicketEntity } from 'src/kanban-ticket/kanban-ticket.entities';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';

@Entity('validation')
export class AfterMeetingEntity {
  @PrimaryGeneratedColumn()
  id: number;

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

  // Store array of products as JSON
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

  @OneToOne(() => KanbanTicketEntity, (kanban) => kanban.afterMeeting)
  kanbanTicket: KanbanTicketEntity;

  @OneToOne(() => BeforeMeetingEntity)
  @JoinColumn()
  beforeMeeting: BeforeMeetingEntity;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
