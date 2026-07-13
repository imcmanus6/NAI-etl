import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { HealthController } from './health/health.controller.js';
import { ConnectionsModule } from './connections/connections.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { TenantsModule } from './tenants/tenants.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    TenantsModule,
    ProjectsModule,
    ConnectionsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
