import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
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
