import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GatewayInternalGuard } from '@app/common';
import { SuratPanggilanModule } from './modules/surat-panggilan/surat-panggilan.module';
import { MasterSyncModule } from './modules/master-sync/master-sync.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        SuratPanggilanModule,
        MasterSyncModule,
    ],
    controllers: [],
    providers: [
        { provide: APP_GUARD, useClass: GatewayInternalGuard },
    ],
})
export class AppModule { }
