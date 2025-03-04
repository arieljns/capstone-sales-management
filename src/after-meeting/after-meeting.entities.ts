import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class AfterMeetingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  namaPerusahaan: string;

  @Column()
  namaPic: string;

  @Column()
  jabatanPic: string;

  @Column()
  jumlahKaryawan: number;

  @Column()
  sistem: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  movedAt: Date;

  @Column({ nullable: true })
  monthlyRecurringRevenue: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  paket: string;
}
