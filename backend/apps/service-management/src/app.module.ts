import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewayInternalGuard } from '@app/common';
import { Guru } from './models/GuruModel';
import { Siswa } from './models/SiswaModel';
import { GuruModule } from './modules/guru/guru.module';
import { SiswaModule } from './modules/siswa/siswa.module';

const databaseUrl =
  process.env.DATABASE_URL || process.env.DB_MANAGEMENT_URL;

if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL or DB_MANAGEMENT_URL');
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: databaseUrl,
      entities: [Guru, Siswa],
      synchronize: true, // Matikan atau ganti false jika di production (gunakan migrasi)
    }),
    GuruModule,
    SiswaModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: GatewayInternalGuard }],
})
export class AppModule {}
