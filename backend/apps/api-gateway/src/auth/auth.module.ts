import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { Pengguna } from './pengguna.entity';
import { PenggunaService } from './pengguna.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pengguna]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        algorithm: 'HS256',
        expiresIn: Number(process.env.JWT_EXPIRES_SECONDS) || 8 * 60 * 60,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [PenggunaService, JwtStrategy],
  exports: [PenggunaService],
})
export class AuthModule {}
