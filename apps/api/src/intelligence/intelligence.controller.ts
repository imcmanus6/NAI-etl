import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { IsArray, IsBoolean, IsIn, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import type { AuthClaims } from '@etl/auth';
import type { PopulationQuery, Predicate } from '@nai/core';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt.guard.js';
import { IntelligenceService, type ReportSpec } from './intelligence.service.js';

class AskDto {
  @IsString()
  @MinLength(2)
  nl!: string;
}

class SavePopulationDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsArray()
  predicates!: Predicate[];

  @IsOptional()
  @IsArray()
  breakdowns?: string[];
}

class PreviewActionDto {
  @IsString()
  populationId!: string;

  @IsIn(['create_worklist'])
  actionType!: 'create_worklist';

  @IsObject()
  params!: Record<string, unknown>;
}

class RunReportDto {
  @IsObject()
  spec!: ReportSpec;
}

class SaveReportDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsObject()
  spec!: ReportSpec;
}

class ScheduleReportDto {
  @IsOptional()
  @IsString()
  cron?: string | null;

  @IsBoolean()
  enabled!: boolean;
}

@ApiTags('intelligence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('intelligence')
export class IntelligenceController {
  constructor(private readonly svc: IntelligenceService) {}

  @Get('overview')
  overview(@CurrentUser() u: AuthClaims) {
    return this.svc.overview(u.tenantId);
  }

  @Get('catalog/metrics')
  metrics() {
    return this.svc.catalogMetrics();
  }

  @Post('ask')
  ask(@CurrentUser() u: AuthClaims, @Body() dto: AskDto) {
    return this.svc.ask(u.tenantId, u.sub, dto.nl);
  }

  @Get('populations')
  listPopulations(@CurrentUser() u: AuthClaims) {
    return this.svc.listPopulations(u.tenantId);
  }

  @Post('populations')
  savePopulation(@CurrentUser() u: AuthClaims, @Body() dto: SavePopulationDto) {
    const plan: PopulationQuery = { grain: 'account', predicates: dto.predicates, breakdowns: dto.breakdowns };
    return this.svc.savePopulation(u.tenantId, u.sub, dto.name, plan);
  }

  @Post('actions/preview')
  preview(@CurrentUser() u: AuthClaims, @Body() dto: PreviewActionDto) {
    return this.svc.previewAction(u.tenantId, u.sub, dto);
  }

  @Post('actions/:id/confirm')
  confirm(@CurrentUser() u: AuthClaims, @Param('id') id: string) {
    return this.svc.confirmAction(u.tenantId, u.sub, id);
  }

  @Get('audit')
  audit(@CurrentUser() u: AuthClaims, @Query('category') category?: string) {
    return this.svc.listAudit(u.tenantId, category);
  }

  // --- Report builder -------------------------------------------------------

  @Get('report-catalog')
  reportCatalog() {
    return this.svc.reportCatalog();
  }

  @Post('reports/run')
  runReport(@Body() dto: RunReportDto) {
    return this.svc.runReport(dto.spec);
  }

  @Post('reports/assist')
  assistReport(@CurrentUser() u: AuthClaims, @Body() dto: AskDto) {
    return this.svc.assistReport(u.tenantId, u.sub, dto.nl);
  }

  @Get('reports')
  listReports(@CurrentUser() u: AuthClaims) {
    return this.svc.listReports(u.tenantId);
  }

  @Post('reports')
  saveReport(@CurrentUser() u: AuthClaims, @Body() dto: SaveReportDto) {
    return this.svc.saveReport(u.tenantId, u.sub, dto.name, dto.spec);
  }

  @Get('reports/:id/run')
  runSavedReport(@CurrentUser() u: AuthClaims, @Param('id') id: string) {
    return this.svc.runSavedReport(u.tenantId, id);
  }

  @Post('reports/:id/run-now')
  runReportNow(@CurrentUser() u: AuthClaims, @Param('id') id: string) {
    return this.svc.runReportNow(id);
  }

  @Put('reports/:id/schedule')
  scheduleReport(@CurrentUser() u: AuthClaims, @Param('id') id: string, @Body() dto: ScheduleReportDto) {
    return this.svc.scheduleReport(u.tenantId, id, dto.cron ?? null, dto.enabled);
  }

  @Delete('reports/:id')
  deleteReport(@CurrentUser() u: AuthClaims, @Param('id') id: string) {
    return this.svc.deleteReport(u.tenantId, id);
  }

  @Get('reports/:id/export')
  async exportReport(@CurrentUser() u: AuthClaims, @Param('id') id: string, @Res() res: Response) {
    const { filename, csv } = await this.svc.exportReportCsv(u.tenantId, id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}
