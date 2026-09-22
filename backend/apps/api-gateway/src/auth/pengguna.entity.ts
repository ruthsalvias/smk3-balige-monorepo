import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('pengguna')
export class Pengguna {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 50 })
  username: string;

  @Column({ length: 150 })
  nama: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ name: 'password_hash', length: 100 })
  passwordHash: string;

  /** Disimpan sebagai teks dipisah koma oleh TypeORM. */
  @Column({ type: 'simple-array' })
  roles: string[];

  @Column({ default: true })
  aktif: boolean;

  @Column({ type: 'varchar', length: 30, nullable: true })
  nis: string | null;

  @Column({ name: 'password_diubah_sendiri', default: false })
  passwordDiubahSendiri: boolean;

  @Column({ name: 'password_direset_pada', type: 'timestamptz', nullable: true })
  passwordDiresetPada: Date | null;

  @Column({ name: 'password_diubah_pada', type: 'timestamptz', nullable: true })
  passwordDiubahPada: Date | null;

  @CreateDateColumn({ name: 'dibuat_pada', type: 'timestamptz' })
  dibuatPada: Date;
}
