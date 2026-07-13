import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import type { AuthClaims } from '@etl/auth';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt.guard.js';
import { VersionsService } from './versions.service.js';

class SuggestValidationsDto {
  @IsString()
  targetSchemaId!: string;
}

class DecisionDto {
  @IsIn(['accepted', 'rejected'])
  decision!: 'accepted' | 'rejected';
}

class ApproveDto {
  @IsIn(['approved', 'changes_requested'])
  decision!: 'approved' | 'changes_requested';

  @IsOptional()
  @IsString()
  notes?: string;
}

@ApiTags('versions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class VersionsController {
  constructor(private readonly versions: VersionsService) {}

  @Get('projects/:id/versions')
  list(@CurrentUser() u: AuthClaims, @Param('id') id: string) {
    return this.versions.listVersions(u.tenantId, id);
  }

  @Get('projects/:id/draft')
  draft(@CurrentUser() u: AuthClaims, @Param('id') id: string) {
    return this.versions.getOrCreateDraft(u.tenantId, id, u.sub);
  }

  // Declared before versions/:vid so it is not shadowed by the param route.
  @Get('versions/diff')
  diff(@CurrentUser() u: AuthClaims, @Query('a') a: string, @Query('b') b: string) {
    return this.versions.diff(u.tenantId, a, b);
  }

  @Get('versions/:vid')
  version(@CurrentUser() u: AuthClaims, @Param('vid') vid: string) {
    return this.versions.getVersion(u.tenantId, vid);
  }

  // Validation suggestions
  @Post('projects/:id/validations/suggest')
  suggestValidations(@CurrentUser() u: AuthClaims, @Param('id') id: string, @Body() dto: SuggestValidationsDto) {
    return this.versions.suggestValidations(u.tenantId, id, dto.targetSchemaId, u.sub);
  }

  @Get('projects/:id/validations/suggestions')
  listValidationSuggestions(@CurrentUser() u: AuthClaims, @Param('id') id: string) {
    return this.versions.listConfigSuggestions(u.tenantId, id, 'validation');
  }

  // Transformation suggestions
  @Post('projects/:id/transformations/suggest')
  suggestTransformations(@CurrentUser() u: AuthClaims, @Param('id') id: string) {
    return this.versions.suggestTransformations(u.tenantId, id);
  }

  @Get('projects/:id/transformations/suggestions')
  listTransformationSuggestions(@CurrentUser() u: AuthClaims, @Param('id') id: string) {
    return this.versions.listConfigSuggestions(u.tenantId, id, 'transformation');
  }

  // Accept/reject a validation or transformation suggestion
  @Post('config/suggestions/:sid/decision')
  decide(@CurrentUser() u: AuthClaims, @Param('sid') sid: string, @Body() dto: DecisionDto) {
    return this.versions.decideConfigSuggestion(u.tenantId, sid, dto.decision, u.sub);
  }

  // Lifecycle
  @Post('projects/:id/versions/:vid/submit')
  submit(@CurrentUser() u: AuthClaims, @Param('id') id: string, @Param('vid') vid: string) {
    return this.versions.submitForApproval(u.tenantId, id, vid, u.sub);
  }

  @Post('projects/:id/versions/:vid/approve')
  approve(@CurrentUser() u: AuthClaims, @Param('id') id: string, @Param('vid') vid: string, @Body() dto: ApproveDto) {
    return this.versions.approve(u.tenantId, id, vid, dto.decision, dto.notes, u.sub);
  }

  @Post('projects/:id/versions/:vid/document')
  document(@CurrentUser() u: AuthClaims, @Param('id') id: string, @Param('vid') vid: string) {
    return this.versions.generateDocument(u.tenantId, id, vid, u.sub);
  }
}
