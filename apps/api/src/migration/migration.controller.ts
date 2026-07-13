import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import type { AuthClaims } from '@etl/auth';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt.guard.js';
import { MigrationService } from './migration.service.js';

class PlanDto {
  @IsString()
  schemaId!: string;
}

@ApiTags('migration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:id/migration')
export class MigrationController {
  constructor(private readonly migration: MigrationService) {}

  @Post('plan')
  plan(@CurrentUser() u: AuthClaims, @Param('id') id: string, @Body() dto: PlanDto) {
    return this.migration.buildPlan(u.tenantId, id, dto.schemaId, u.sub);
  }

  @Get()
  get(@CurrentUser() u: AuthClaims, @Param('id') id: string) {
    return this.migration.getPlan(u.tenantId, id);
  }
}
