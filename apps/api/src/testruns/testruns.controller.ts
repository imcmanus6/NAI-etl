import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsArray, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import type { AuthClaims } from '@etl/auth';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt.guard.js';
import { TestRunsService } from './testruns.service.js';

class RunDto {
  @IsOptional()
  @IsArray()
  sampleRecords?: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  sourceConnectionId?: string;

  @IsOptional()
  @IsString()
  sourceEntity?: string;

  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsString()
  versionId?: string;

  @IsOptional()
  @IsIn(['test', 'trial'])
  mode?: 'test' | 'trial';

  @IsOptional()
  @IsString()
  deliverToConnectionId?: string;
}

@ApiTags('test-runs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TestRunsController {
  constructor(private readonly runs: TestRunsService) {}

  @Post('projects/:id/test')
  run(@CurrentUser() u: AuthClaims, @Param('id') id: string, @Body() dto: RunDto) {
    return this.runs.run(u.tenantId, id, dto, u.sub);
  }

  @Get('projects/:id/runs')
  list(@CurrentUser() u: AuthClaims, @Param('id') id: string) {
    return this.runs.listRuns(u.tenantId, id);
  }

  @Get('runs/:runId')
  get(@CurrentUser() u: AuthClaims, @Param('runId') runId: string) {
    return this.runs.getRun(u.tenantId, runId);
  }
}
