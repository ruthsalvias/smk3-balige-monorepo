import { Module } from '@nestjs/common';
import { AkunController } from './akun.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AkunController],
})
export class AkunModule {}
