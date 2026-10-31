import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Gateway');

  /**
   * Tanpa ini Express membaca alamat IP container Nginx untuk SETIAP permintaan,
   * sehingga pembatas laju memperlakukan seluruh pengunjung sebagai satu orang
   * dan situs ikut tertolak ketika ramai.
   *
   * Nilainya adalah jumlah proxy di depan aplikasi: 1 bila hanya Nginx bawaan
   * repo ini, 2 bila masih ada reverse proxy/tunnel lain di depannya.
   */
  const proxyHops = Number(process.env.TRUST_PROXY_HOPS || 1);
  app.set('trust proxy', Number.isFinite(proxyHops) && proxyHops > 0 ? proxyHops : 1);

  // CORS — configurable via .env (mendukung multi-origin, trycloudflare, dan localhost)
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const allowedList = corsOrigin.split(',').map((o) => o.trim()).filter(Boolean);
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || corsOrigin === '*' || allowedList.includes(origin) || origin.includes('trycloudflare.com') || origin.includes('localhost')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-User-Id',
      'X-User-Name',
      'X-User-Roles',
    ],
  });

  const port = process.env.GATEWAY_PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Gateway running on http://localhost:${port}`);
  logger.log(`📡 CORS origin: ${corsOrigin}`);
}
bootstrap();
