import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { MappingsController } from './mappings.controller.js';
import { MappingsService } from './mappings.service.js';

@Module({
  imports: [AuthModule],
  controllers: [MappingsController],
  providers: [MappingsService],
})
export class MappingsModule {}
