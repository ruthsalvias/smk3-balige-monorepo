import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('skl_folders')
export class SklFolder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  nama!: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  parentId!: string | null;

  @Column({ type: 'varchar', length: 50, default: 'blue' })
  warna!: string;

  @Column({ type: 'varchar', length: 255, default: 'admin' })
  dibuatOleh!: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
