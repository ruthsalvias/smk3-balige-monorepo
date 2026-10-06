import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { dbPelanggaran } from './config/database';
import './models/GuruModel';
import './models/SiswaModel';
import './models/SuratPanggilanModel';

async function bootstrap() {
    console.log("⏳ 1. Memulai NestJS...");
    const app = await NestFactory.create(AppModule);

    console.log("⏳ 2. Mengecek Koneksi Database...");
    try {
        await dbPelanggaran.authenticate();
        await dbPelanggaran.sync({ alter: true });
        console.log("✅ Database Terhubung!");
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("❌ Gagal Konek Database:", errorMessage);
        process.exit(1); // CRITICAL: Exit immediately on DB connection failure
    }

    app.setGlobalPrefix('api');

    // CORS terbuka; proteksi lewat INTERNAL_GATEWAY_SECRET (X-Gateway-Secret).
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
            stopAtFirstError: true,
        }),
    );

    const port = process.env.PORT || 3001;
    console.log("⏳ 3. Menyalakan Server...");
    await app.listen(port);

    console.log(`🚀 Service Pelanggaran menyala di: http://localhost:${port}/api`);
}
bootstrap();
