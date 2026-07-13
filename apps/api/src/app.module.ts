import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { HealthController } from './health/health.controller.js';
import { ConnectionsModule } from './connections/connections.module.js';
import { MappingsModule } from './mappings/mappings.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { SchemasModule } from './schemas/schemas.module.js';
import { TenantsModule } from './tenants/tenants.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    TenantsModule,
    ProjectsModule,
    ConnectionsModule,
    SchemasModule,
    MappingsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
