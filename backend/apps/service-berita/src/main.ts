import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS terbuka; proteksi lewat INTERNAL_GATEWAY_SECRET (X-Gateway-Secret).
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // Serve folder uploads secara publik → http://localhost:3000/uploads/namafile.jpg
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // Global validation pipe with improved security
  // forbidNonWhitelisted: false untuk multipart/form-data compatibility
  // tapi tetap aman karena whitelist: true akan filter fields yang tidak di-define di DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // false agar form-data multipart tidak ditolak
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: true,
    }),
  );

  // Standardize all service endpoints under /api
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? process.env.SERVICE_BERITA_PORT ?? 3003;
  await app.listen(port, '0.0.0.0');
  console.log(`✅ Server berjalan di http://localhost:${port}/api`);
  console.log(`📁 Uploads tersedia di http://localhost:${port}/uploads/`);
}
bootstrap();