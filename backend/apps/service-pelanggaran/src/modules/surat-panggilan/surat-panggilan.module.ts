import { Module } from '@nestjs/common';
import { SuratPanggilanController } from './surat-panggilan.controller';
import { SuratPanggilanService } from './surat-panggilan.service';
import { MasterSyncModule } from '../master-sync/master-sync.module';

@Module({
    imports: [MasterSyncModule],
    controllers: [SuratPanggilanController],
    providers: [SuratPanggilanService],
})
export class SuratPanggilanModule { }