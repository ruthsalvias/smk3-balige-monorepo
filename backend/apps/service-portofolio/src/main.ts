import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { dbPortofolio } from './config/database';
import './models/PortofolioModel';

async function bootstrap() {
  console.log('⏳ 1. Memulai NestJS...');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  console.log('⏳ 2. Mengecek Koneksi Database...');
  try {
    await dbPortofolio.authenticate();
    await dbPortofolio.sync({ alter: true });
    console.log('✅ Database Terhubung!');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('❌ Gagal Konek Database:', errorMessage);
    process.exit(1);
  }

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: true,
    }),
  );

  // CORS terbuka; proteksi lewat INTERNAL_GATEWAY_SECRET (X-Gateway-Secret).
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  const port = process.env.PORT ?? 3004;
  console.log('⏳ 3. Menyalakan Server...');
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Service Portofolio running on: http://localhost:${port}/api`);
  console.log(`📁 Static files  : http://localhost:${port}/uploads`);
}
bootstrap();
