import { Module } from '@nestjs/common';
import { MasterSyncService } from './master-sync.service';

@Module({
    providers: [MasterSyncService],
    exports: [MasterSyncService],
})
export class MasterSyncModule {}