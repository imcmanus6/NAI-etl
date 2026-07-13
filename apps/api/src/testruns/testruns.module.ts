import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { TestRunsController } from './testruns.controller.js';
import { TestRunsService } from './testruns.service.js';

@Module({
  imports: [AuthModule],
  controllers: [TestRunsController],
  providers: [TestRunsService],
})
export class TestRunsModule {}
