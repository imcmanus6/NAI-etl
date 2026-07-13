import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { SchemasController } from './schemas.controller.js';
import { SchemasService } from './schemas.service.js';

@Module({
  imports: [AuthModule],
  controllers: [SchemasController],
  providers: [SchemasService],
  exports: [SchemasService],
})
export class SchemasModule {}
