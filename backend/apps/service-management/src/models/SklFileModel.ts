import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('skl_files')
export class SklFile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  folderId!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  namaFile!: string;

  @Column({ type: 'varchar', length: 255 })
  storedFileName!: string;

  @Column({ type: 'varchar', length: 500 })
  path!: string;

  @Column({ type: 'bigint', default: 0 })
  ukuran!: number;

  @Column({ type: 'varchar', length: 100, default: 'application/pdf' })
  mimeType!: string;

  @Index()
  @Column({ type: 'varchar', length: 50, nullable: true })
  tahunLulus!: string | null;

  @Column({ type: 'text', nullable: true })
  keterangan!: string | null;

  @Column({ type: 'varchar', length: 255, default: 'admin' })
  diunggahOleh!: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
