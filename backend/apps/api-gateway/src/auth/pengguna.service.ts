import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Role } from '@app/common';
import { Pengguna } from './pengguna.entity';

const BCRYPT_ROUNDS = 12;

export interface BuatPenggunaInput {
  username: string;
  nama: string;
  password: string;
  roles: string[];
  email?: string | null;
  nis?: string | null;
}

@Injectable()
export class PenggunaService implements OnModuleInit {
  private readonly logger = new Logger(PenggunaService.name);

  constructor(
    @InjectRepository(Pengguna)
    private readonly repo: Repository<Pengguna>,
  ) {}

  /** Tanpa ini sistem tidak bisa dimasuki siapa pun setelah deploy baru. */
  async onModuleInit(): Promise<void> {
    const username = (process.env.MASTER_ADMIN_USERNAME || '').trim().toLowerCase();
    const password = process.env.MASTER_ADMIN_PASSWORD || '';
    if (!username || !password) {
      this.logger.warn('MASTER_ADMIN_USERNAME/MASTER_ADMIN_PASSWORD belum diisi, seed dilewati');
      return;
    }

    const sudahAda = await this.repo.findOne({ where: { username } });
    if (sudahAda) return;

    await this.buat({
      username,
      nama: process.env.MASTER_ADMIN_NAMA || 'Master Admin',
      password,
      roles: [Role.MASTER_ADMIN, Role.ADMIN],
    });
    this.logger.log(`Akun master admin "${username}" dibuat otomatis`);
  }

  hash(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  cocokkan(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  cariId(id: string): Promise<Pengguna | null> {
    return this.repo.findOne({ where: { id } });
  }

  cariUsername(username: string): Promise<Pengguna | null> {
    return this.repo.findOne({ where: { username: username.toLowerCase() } });
  }

  daftar(): Promise<Pengguna[]> {
    return this.repo.find({ order: { dibuatPada: 'DESC' } });
  }

  async buat(input: BuatPenggunaInput): Promise<Pengguna> {
    const pengguna = this.repo.create({
      username: input.username.toLowerCase(),
      nama: input.nama,
      email: input.email ?? null,
      nis: input.nis ?? null,
      roles: input.roles,
      passwordHash: await this.hash(input.password),
      aktif: true,
      passwordDiubahSendiri: false,
      passwordDiresetPada: new Date(),
      passwordDiubahPada: null,
    });
    return this.repo.save(pengguna);
  }

  async gantiPassword(id: string, password: string, olehPemilik: boolean): Promise<void> {
    const sekarang = new Date();
    await this.repo.update(id, {
      passwordHash: await this.hash(password),
      passwordDiubahSendiri: olehPemilik,
      ...(olehPemilik ? { passwordDiubahPada: sekarang } : { passwordDiresetPada: sekarang }),
    });
  }

  async ubahStatus(id: string, aktif: boolean): Promise<void> {
    await this.repo.update(id, { aktif });
  }

  async hapus(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
