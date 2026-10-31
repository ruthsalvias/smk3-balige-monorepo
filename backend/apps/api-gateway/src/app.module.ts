import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { AuthModule } from './auth/auth.module';
import { Pengguna } from './auth/pengguna.entity';
import { ProxyModule } from './proxy/proxy.module';
import { AkunModule } from './akun/akun.module';
import { GatewayController } from './gateway.controller';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Database akun pengguna
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Pengguna],
      synchronize: true,
    }),

    // Passport with default 'jwt' strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Rate limiting — max 60 requests per 60 seconds per IP
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),

    // Login, verifikasi token, dan penyimpanan akun
    AuthModule,

    // Manajemen akun khusus master admin
    AkunModule,

    // Proxy module
    ProxyModule,
  ],
  controllers: [GatewayController],
  providers: [
    // Global guards — order matters: throttle → auth → roles
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}