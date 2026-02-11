import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_log')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventType: string;

  @Column({ nullable: true })
  actorId?: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column()
  occurredAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
