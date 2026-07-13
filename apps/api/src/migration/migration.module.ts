import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { MigrationController } from './migration.controller.js';
import { MigrationService } from './migration.service.js';

@Module({
  imports: [AuthModule],
  controllers: [MigrationController],
  providers: [MigrationService],
})
export class MigrationModule {}
