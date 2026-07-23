import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsArray, IsIn, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import type { AuthClaims } from '@etl/auth';
import type { PopulationQuery, Predicate } from '@nai/core';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt.guard.js';
import { IntelligenceService } from './intelligence.service.js';

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
}
