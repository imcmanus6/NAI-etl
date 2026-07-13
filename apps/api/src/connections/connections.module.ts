import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ConnectionsController } from './connections.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [ConnectionsController],
})
export class ConnectionsModule {}
