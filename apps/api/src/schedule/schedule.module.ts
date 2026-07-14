import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { TestRunsModule } from '../testruns/testruns.module.js';
import { ScheduleController } from './schedule.controller.js';
import { ScheduleService } from './schedule.service.js';

@Module({
  imports: [AuthModule, TestRunsModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
