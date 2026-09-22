import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { Public } from './public.decorator';
import { AuthUser } from './auth.types';
import { PenggunaService } from './pengguna.service';

interface LoginDto {
  username?: unknown;
  password?: unknown;
}

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly pengguna: PenggunaService,
    private readonly jwt: JwtService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  // Batas ketat khusus login supaya password tidak bisa ditebak beruntun.
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(@Body() body: LoginDto) {
    if (typeof body.username !== 'string' || typeof body.password !== 'string') {
      throw new BadRequestException('Username dan password wajib diisi');
    }

    const username = body.username.trim().toLowerCase();
    const akun = username ? await this.pengguna.cariUsername(username) : null;

    // Pesan sengaja disamakan agar username yang valid tidak bisa ditebak.
    const gagal = new UnauthorizedException('Username atau password salah');
    if (!akun) throw gagal;
    if (!(await this.pengguna.cocokkan(body.password, akun.passwordHash))) throw gagal;
    if (!akun.aktif) throw new UnauthorizedException('Akun dinonaktifkan. Hubungi admin sekolah.');

    const token = await this.jwt.signAsync({
      sub: akun.id,
      username: akun.username,
      nama: akun.nama,
      roles: akun.roles,
    });

    return {
      statusCode: 200,
      message: 'Berhasil masuk',
      data: {
        token,
        user: {
          id: akun.id,
          username: akun.username,
          nama: akun.nama,
          roles: akun.roles,
          passwordDiubahSendiri: akun.passwordDiubahSendiri,
        },
      },
    };
  }

  @Get('saya')
  saya(@Req() req: Request) {
    const user = req.user as AuthUser;
    return { statusCode: 200, data: user };
  }
}
