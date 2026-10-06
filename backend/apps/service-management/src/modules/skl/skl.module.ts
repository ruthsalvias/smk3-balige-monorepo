import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SklFolder } from '../../models/SklFolderModel';
import { SklFile } from '../../models/SklFileModel';
import { SklService } from './skl.service';
import { SklController } from './skl.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SklFolder, SklFile])],
  controllers: [SklController],
  providers: [SklService],
  exports: [SklService],
})
export class SklModule {}
