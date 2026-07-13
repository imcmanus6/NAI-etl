import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import type { AuthClaims } from '@etl/auth';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt.guard.js';
import { SchemasService } from './schemas.service.js';

class DiscoverDto {
  @IsString()
  connectionId!: string;
}

class DdlDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(10)
  ddl!: string;
}

class DictionaryDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  csv!: string;
}

class OpenApiDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsObject()
  doc!: Record<string, unknown>;
}

class SampleDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsIn(['csv', 'json', 'xml', 'delimited'])
  format!: 'csv' | 'json' | 'xml' | 'delimited';

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  entityName?: string;

  @IsOptional()
  @IsString()
  delimiter?: string;

  @IsOptional()
  @IsString()
  recordPath?: string;
}

class FixedWidthDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(4)
  layoutDoc!: string;

  @IsOptional()
  @IsString()
  sample?: string;
}

@ApiTags('schemas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schemas')
export class SchemasController {
  constructor(private readonly schemas: SchemasService) {}

  @Get()
  list(@CurrentUser() user: AuthClaims) {
    return this.schemas.list(user.tenantId);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthClaims, @Param('id') id: string) {
    return this.schemas.get(user.tenantId, id);
  }

  @Post('discover')
  discover(@CurrentUser() user: AuthClaims, @Body() dto: DiscoverDto) {
    return this.schemas.discoverFromConnection(user.tenantId, dto.connectionId, user.sub);
  }

  @Post('upload/ddl')
  ddl(@CurrentUser() user: AuthClaims, @Body() dto: DdlDto) {
    return this.schemas.ingestDdl(user.tenantId, dto.name, dto.ddl, user.sub);
  }

  @Post('upload/dictionary')
  dictionary(@CurrentUser() user: AuthClaims, @Body() dto: DictionaryDto) {
    return this.schemas.ingestDictionary(user.tenantId, dto.name, dto.csv, user.sub);
  }

  @Post('upload/openapi')
  openapi(@CurrentUser() user: AuthClaims, @Body() dto: OpenApiDto) {
    return this.schemas.ingestOpenApi(user.tenantId, dto.name, dto.doc, user.sub);
  }

  @Post('upload/sample')
  sample(@CurrentUser() user: AuthClaims, @Body() dto: SampleDto) {
    return this.schemas.ingestSample(
      user.tenantId,
      {
        name: dto.name,
        format: dto.format,
        content: dto.content,
        entityName: dto.entityName,
        delimiter: dto.delimiter,
        recordPath: dto.recordPath,
      },
      user.sub,
    );
  }

  /** Fixed-width intake: derive the layout from its documentation. */
  @Post('upload/fixed-width')
  fixedWidth(@CurrentUser() user: AuthClaims, @Body() dto: FixedWidthDto) {
    return this.schemas.ingestFixedWidth(
      user.tenantId,
      { name: dto.name, layoutDoc: dto.layoutDoc, sample: dto.sample },
      user.sub,
    );
  }

  @Post(':id/snapshot')
  snapshot(@CurrentUser() user: AuthClaims, @Param('id') id: string) {
    return this.schemas.snapshot(user.tenantId, id, user.sub);
  }

  /** Fetch the AI source-system overview (generates one on first access). */
  @Get(':id/overview')
  getOverview(@CurrentUser() user: AuthClaims, @Param('id') id: string) {
    return this.schemas.getOverview(user.tenantId, id);
  }

  /** Force-regenerate the overview. */
  @Post(':id/overview')
  generateOverview(@CurrentUser() user: AuthClaims, @Param('id') id: string) {
    return this.schemas.generateOverview(user.tenantId, id, user.sub);
  }
}
