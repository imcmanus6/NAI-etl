import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { VersionsController } from './versions.controller.js';
import { VersionsService } from './versions.service.js';

@Module({
  imports: [AuthModule],
  controllers: [VersionsController],
  providers: [VersionsService],
  exports: [VersionsService],
})
export class VersionsModule {}
