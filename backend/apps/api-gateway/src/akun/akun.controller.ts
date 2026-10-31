import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { Role } from '@app/common';
import { Roles } from '../auth/roles.decorator';
import { AuthUser } from '../auth/auth.types';
import { Pengguna } from '../auth/pengguna.entity';
import { PenggunaService } from '../auth/pengguna.service';

const ROLE_BOLEH_DIBUAT: string[] = [Role.ADMIN, Role.GURU, Role.SISWA];
const PANJANG_PASSWORD_MIN = 8;

interface BuatAkunDto {
  username?: unknown;
  nama?: unknown;
  role?: unknown;
  password?: unknown;
  email?: unknown;
  nis?: unknown;
}

interface AkunSiswaMassalDto {
  password?: unknown;
  siswa?: unknown;
}

function teks(nilai: unknown, label: string, wajib = true): string {
  if (nilai === undefined || nilai === null || nilai === '') {
    if (wajib) throw new BadRequestException(`${label} wajib diisi`);
    return '';
  }
  if (typeof nilai !== 'string') throw new BadRequestException(`${label} harus berupa teks`);
  return nilai.trim();
}

function validasiPassword(nilai: unknown): string {
  const password = teks(nilai, 'Password');
  if (password.length < PANJANG_PASSWORD_MIN) {
    throw new BadRequestException(`Password minimal ${PANJANG_PASSWORD_MIN} karakter`);
  }
  return password;
}

function validasiUsername(nilai: unknown): string {
  const username = teks(nilai, 'Username').toLowerCase();
  if (!/^[a-z0-9._-]{3,50}$/.test(username)) {
    throw new BadRequestException(
      'Username hanya boleh huruf, angka, titik, garis bawah, dan strip (3-50 karakter)',
    );
  }
  return username;
}

function statusAkun(akun: Pengguna) {
  return {
    id: akun.id,
    username: akun.username,
    nama: akun.nama,
    email: akun.email,
    aktif: akun.aktif,
    nis: akun.nis,
    roles: akun.roles ?? [],
    dibuatPada: akun.dibuatPada ? akun.dibuatPada.toISOString() : null,
    passwordDiubahSendiri: akun.passwordDiubahSendiri,
    passwordDiresetPada: akun.passwordDiresetPada
      ? akun.passwordDiresetPada.toISOString()
      : null,
    passwordDiubahPada: akun.passwordDiubahPada ? akun.passwordDiubahPada.toISOString() : null,
  };
}

@Controller('api/akun')
export class AkunController {
  constructor(private readonly pengguna: PenggunaService) {}

  private aktor(req: Request): AuthUser {
    const user = req.user as AuthUser | undefined;
    if (!user) throw new ForbiddenException('Sesi tidak valid');
    return user;
  }

  private tangani(err: unknown, pesanDefault: string): never {
    if (
      err instanceof BadRequestException ||
      err instanceof ForbiddenException ||
      err instanceof NotFoundException
    ) {
      throw err;
    }
    throw new InternalServerErrorException(pesanDefault);
  }

  private async ambilYangBolehDiubah(id: string): Promise<Pengguna> {
    const akun = await this.pengguna.cariId(id);
    if (!akun) throw new NotFoundException('Akun tidak ditemukan');
    if ((akun.roles ?? []).includes(Role.MASTER_ADMIN)) {
      throw new ForbiddenException('Akun master admin tidak boleh diubah lewat halaman ini');
    }
    return akun;
  }

  @Get()
  @Roles(Role.MASTER_ADMIN)
  async daftar() {
    try {
      const semua = await this.pengguna.daftar();
      return { statusCode: 200, data: semua.map(statusAkun) };
    } catch (err) {
      this.tangani(err, 'Gagal mengambil daftar akun');
    }
  }

  @Post()
  @Roles(Role.MASTER_ADMIN)
  async buat(@Body() body: BuatAkunDto) {
    const username = validasiUsername(body.username);
    const nama = teks(body.nama, 'Nama');
    const role = teks(body.role, 'Role');
    const password = validasiPassword(body.password);
    const email = teks(body.email, 'Email', false);
    const nis = teks(body.nis, 'NIS', false);

    if (!ROLE_BOLEH_DIBUAT.includes(role)) {
      throw new BadRequestException('Role tidak valid');
    }

    try {
      if (await this.pengguna.cariUsername(username)) {
        throw new BadRequestException('Username sudah dipakai akun lain');
      }

      const akun = await this.pengguna.buat({
        username,
        nama,
        password,
        roles: [role],
        email: email || null,
        nis: nis || null,
      });
      return {
        statusCode: 201,
        message: 'Akun berhasil dibuat',
        data: { id: akun.id, username, role },
      };
    } catch (err) {
      this.tangani(err, 'Gagal membuat akun');
    }
  }

  @Post('siswa-massal')
  @Roles(Role.MASTER_ADMIN)
  async buatMassal(@Body() body: AkunSiswaMassalDto) {
    const password = validasiPassword(body.password);
    if (!Array.isArray(body.siswa) || body.siswa.length === 0) {
      throw new BadRequestException('Daftar siswa kosong');
    }
    if (body.siswa.length > 500) {
      throw new BadRequestException('Maksimal 500 siswa sekali proses');
    }

    const dibuat: string[] = [];
    const dilewati: { username: string; alasan: string }[] = [];

    for (const item of body.siswa as Array<Record<string, unknown>>) {
      let username = '';
      try {
        username = validasiUsername(item.nis);
        const nama = teks(item.nama, 'Nama');

        if (await this.pengguna.cariUsername(username)) {
          dilewati.push({ username, alasan: 'Akun sudah ada' });
          continue;
        }

        await this.pengguna.buat({
          username,
          nama,
          password,
          roles: [Role.SISWA],
          nis: username,
        });
        dibuat.push(username);
      } catch (err) {
        dilewati.push({
          username: username || '-',
          alasan: err instanceof BadRequestException ? err.message : 'Gagal dibuat',
        });
      }
    }

    return {
      statusCode: 201,
      message: `${dibuat.length} akun dibuat, ${dilewati.length} dilewati`,
      data: { dibuat, dilewati },
    };
  }

  @Post(':id/reset-password')
  @Roles(Role.MASTER_ADMIN)
  @HttpCode(200)
  async resetPassword(@Param('id') id: string, @Body() body: { password?: unknown }) {
    const password = validasiPassword(body.password);
    try {
      await this.ambilYangBolehDiubah(id);
      await this.pengguna.gantiPassword(id, password, false);
      return { statusCode: 200, message: 'Password berhasil direset' };
    } catch (err) {
      this.tangani(err, 'Gagal mereset password');
    }
  }

  @Patch(':id/status')
  @Roles(Role.MASTER_ADMIN)
  async ubahStatus(@Param('id') id: string, @Body() body: { aktif?: unknown }, @Req() req: Request) {
    if (typeof body.aktif !== 'boolean') throw new BadRequestException('Status tidak valid');
    if (id === this.aktor(req).sub) {
      throw new ForbiddenException('Tidak bisa menonaktifkan akun sendiri');
    }
    try {
      await this.ambilYangBolehDiubah(id);
      await this.pengguna.ubahStatus(id, body.aktif);
      return { statusCode: 200, message: body.aktif ? 'Akun diaktifkan' : 'Akun dinonaktifkan' };
    } catch (err) {
      this.tangani(err, 'Gagal mengubah status akun');
    }
  }

  @Delete(':id')
  @Roles(Role.MASTER_ADMIN)
  async hapus(@Param('id') id: string, @Req() req: Request) {
    if (id === this.aktor(req).sub) {
      throw new ForbiddenException('Tidak bisa menghapus akun sendiri');
    }
    try {
      await this.ambilYangBolehDiubah(id);
      await this.pengguna.hapus(id);
      return { statusCode: 200, message: 'Akun dihapus' };
    } catch (err) {
      this.tangani(err, 'Gagal menghapus akun');
    }
  }

  /** Dipakai pemilik akun sendiri (siswa/guru/admin) untuk mengganti passwordnya. */
  @Post('saya/ubah-password')
  @HttpCode(200)
  async ubahPasswordSendiri(@Body() body: { passwordBaru?: unknown }, @Req() req: Request) {
    const user = this.aktor(req);
    const passwordBaru = validasiPassword(body.passwordBaru);

    try {
      await this.pengguna.gantiPassword(user.sub, passwordBaru, true);
      return { statusCode: 200, message: 'Password berhasil diubah' };
    } catch (err) {
      this.tangani(err, 'Gagal mengubah password');
    }
  }
}
