import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewayInternalGuard } from '@app/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  Category,
  News,
  Announcement,
  Schedule,
} from './entities';
import { CategoryModule } from './modules/category.module';
import { NewsModule } from './modules/news.module';
import { AnnouncementModule } from './modules/announcement.module';
import { SearchModule } from './modules/search.module';
import { ScheduleModule } from './modules/schedule.module';

@Module({
  imports: [
    // 1. Arahkan pembacaan .env ke folder root monorepo
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Pastikan jumlah '../' menunjuk ke root tempat .env berada
    }),

    // 2. Gunakan forRootAsync agar TypeORM menunggu ConfigModule selesai bekerja
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV');
        const forceSync = configService.get<string>('TYPEORM_SYNC') === 'true';
        const databaseUrl =
          configService.get<string>('DATABASE_URL') ||
          configService.get<string>('DB_BERITA_URL');

        // Validate required environment variable
        if (!databaseUrl) {
          console.error(
            '🔴 ERROR: DATABASE_URL or DB_BERITA_URL environment variable is required',
          );
          throw new Error('Missing DATABASE_URL or DB_BERITA_URL');
        }

        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [Category, News, Announcement, Schedule],
          synchronize: forceSync || nodeEnv !== 'production', // Local testing bisa dipaksa sync via TYPEORM_SYNC=true
          logging: nodeEnv !== 'production',
          dropSchema: false,
          // Connection pool configuration for production stability
          poolSize: parseInt(configService.get<string>('DB_POOL_SIZE') || '10', 10),
          maxQueryExecutionTime: parseInt(configService.get<string>('DB_MAX_QUERY_TIME') || '30000', 10),
          poolErrorHandler: (err: any) => {
            console.error('🔴 Database pool error:', err);
          },
          retryAttempts: parseInt(configService.get<string>('DB_RETRY_ATTEMPTS') || '3', 10),
          retryDelay: parseInt(configService.get<string>('DB_RETRY_DELAY') || '3000', 10),
        };
      },
    }),

    CategoryModule,
    NewsModule,
    AnnouncementModule,
    SearchModule,
    ScheduleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: GatewayInternalGuard },
  ],
})
export class AppModule {}
