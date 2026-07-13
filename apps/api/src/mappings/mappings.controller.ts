import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import type { AuthClaims } from '@etl/auth';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt.guard.js';
import { MappingsService } from './mappings.service.js';

class SuggestDto {
  @IsString()
  sourceSchemaId!: string;

  @IsString()
  targetSchemaId!: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}

class FeedbackDto {
  @IsIn(['accepted', 'rejected', 'modified'])
  decision!: 'accepted' | 'rejected' | 'modified';

  @IsOptional()
  editedPayload?: unknown;
}

@ApiTags('mappings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mappings')
export class MappingsController {
  constructor(private readonly mappings: MappingsService) {}

  @Post('suggest')
  suggest(@CurrentUser() user: AuthClaims, @Body() dto: SuggestDto) {
    return this.mappings.suggest(user.tenantId, dto, user.sub);
  }

  @Get('suggestions')
  list(@CurrentUser() user: AuthClaims, @Query('projectId') projectId: string) {
    return this.mappings.listSuggestions(user.tenantId, projectId);
  }

  @Post('suggestions/:id/feedback')
  feedback(@CurrentUser() user: AuthClaims, @Param('id') id: string, @Body() dto: FeedbackDto) {
    return this.mappings.feedback(user.tenantId, id, dto.decision, dto.editedPayload, user.sub);
  }
}
