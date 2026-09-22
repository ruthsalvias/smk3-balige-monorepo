import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, AuthUser } from './auth.types';
import { PenggunaService } from './pengguna.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly pengguna: PenggunaService) {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET wajib diisi dan minimal 32 karakter');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  /** Role dibaca ulang dari database supaya pencabutan akses langsung berlaku. */
  async validate(payload: JwtPayload): Promise<AuthUser> {
    if (!payload?.sub) throw new UnauthorizedException('Token tidak valid');

    const akun = await this.pengguna.cariId(payload.sub);
    if (!akun) throw new UnauthorizedException('Akun tidak ditemukan');
    if (!akun.aktif) throw new UnauthorizedException('Akun dinonaktifkan');

    return {
      sub: akun.id,
      username: akun.username,
      nama: akun.nama,
      email: akun.email ?? undefined,
      roles: akun.roles ?? [],
    };
  }
}
