import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import type { AuthClaims } from '@etl/auth';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt.guard.js';
import { ScheduleService } from './schedule.service.js';

class SaveScheduleDto {
  @IsString()
  cron!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsString()
  sourceConnectionId?: string;

  @IsOptional()
  @IsString()
  sourceEntity?: string;

  @IsOptional()
  @IsString()
  destinationConnectionId?: string;

  @IsIn(['api', 'csv', 'both'])
  outputMode!: 'api' | 'csv' | 'both';

  @IsOptional()
  @IsString()
  targetSchemaId?: string;
}

@ApiTags('schedule')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:id/schedule')
export class ScheduleController {
  constructor(private readonly schedule: ScheduleService) {}

  @Get()
  get(@CurrentUser() u: AuthClaims, @Param('id') id: string) {
    return this.schedule.get(u.tenantId, id);
  }

  @Put()
  save(@CurrentUser() u: AuthClaims, @Param('id') id: string, @Body() dto: SaveScheduleDto) {
    return this.schedule.upsert(u.tenantId, id, dto, u.sub);
  }

  @Post('run-now')
  runNow(@CurrentUser() u: AuthClaims, @Param('id') id: string) {
    return this.schedule.runNow(u.tenantId, id, u.sub);
  }
}
