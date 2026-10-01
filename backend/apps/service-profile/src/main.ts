import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { dbProfile } from './config/database';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  try {
    await dbProfile.authenticate();
    await dbProfile.sync({ alter: true });
    console.log('✅ Database Profile tersinkronisasi');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('❌ Gagal sinkronisasi Database Profile:', errorMessage);
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

  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  console.log(`🚀 Service Profile running on http://localhost:${port}/api`);
  console.log(`📁 Static files  : http://localhost:${port}/uploads`);
}
bootstrap();
