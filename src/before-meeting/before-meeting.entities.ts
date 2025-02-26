import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class BeforeMeetingEntity {
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
}
