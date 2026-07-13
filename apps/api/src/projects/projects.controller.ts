import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { AuthClaims } from '@etl/auth';
import { prisma } from '@etl/database';
import { recordAudit } from '@etl/audit';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt.guard.js';

class CreateProjectDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  customerId!: string;

  @IsIn(['integration', 'migration'])
  type!: 'integration' | 'migration';

  @IsOptional()
  @IsString()
  product?: string;
}

class AddDocDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsIn(['reference', 'record_layout', 'data_dictionary', 'business_rules'])
  kind?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200000)
  content!: string;
}

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  @Get()
  list(@CurrentUser() user: AuthClaims) {
    return prisma.project.findMany({
      where: { tenantId: user.tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  get(@CurrentUser() user: AuthClaims, @Param('id') id: string) {
    return prisma.project.findFirst({ where: { id, tenantId: user.tenantId } });
  }

  // --- Reference documentation (fed into doc-assisted mapping) ---------------

  @Get(':id/docs')
  listDocs(@CurrentUser() user: AuthClaims, @Param('id') id: string) {
    return prisma.projectDocument.findMany({
      where: { tenantId: user.tenantId, projectId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post(':id/docs')
  async addDoc(@CurrentUser() user: AuthClaims, @Param('id') id: string, @Body() dto: AddDocDto) {
    const doc = await prisma.projectDocument.create({
      data: { tenantId: user.tenantId, projectId: id, title: dto.title, kind: dto.kind ?? 'reference', content: dto.content },
    });
    await recordAudit({
      lineage: { tenantId: user.tenantId, projectId: id },
      actorId: user.sub,
      action: 'project.doc.added',
      subjectType: 'ProjectDocument',
      subjectId: doc.id,
      after: { title: doc.title, kind: doc.kind, chars: dto.content.length },
    });
    return doc;
  }

  @Post()
  async create(@CurrentUser() user: AuthClaims, @Body() dto: CreateProjectDto) {
    const project = await prisma.project.create({
      data: {
        tenantId: user.tenantId,
        customerId: dto.customerId,
        name: dto.name,
        type: dto.type,
        product: dto.product,
      },
    });
    await recordAudit({
      lineage: { tenantId: user.tenantId, customerId: dto.customerId, projectId: project.id },
      actorId: user.sub,
      action: 'project.created',
      subjectType: 'Project',
      subjectId: project.id,
      after: project,
    });
    return project;
  }
}
