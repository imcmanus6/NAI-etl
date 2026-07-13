import { Injectable, NotFoundException } from '@nestjs/common';
import type { CanonicalSchema } from '@etl/schema-model';
import { prisma } from '@etl/database';
import { recordAudit } from '@etl/audit';
import { sequenceEntities } from './sequence.js';

/**
 * Migration planning (Phase 6).
 *
 * Computes a dependency-driven entity sequence (parents before children) from
 * foreign-key / inferred relationships, and persists it as the migration plan.
 * The AI can suggest an order too; this dependency order is the reproducible
 * backbone the user reviews and adjusts.
 */
@Injectable()
export class MigrationService {
  async buildPlan(tenantId: string, projectId: string, schemaId: string, userId?: string) {
    const project = await prisma.project.findFirst({ where: { id: projectId, tenantId } });
    if (!project) throw new NotFoundException('Project not found');
    const schemaRow = await prisma.schemaModel.findFirst({ where: { id: schemaId, tenantId } });
    if (!schemaRow) throw new NotFoundException('Schema not found');

    const schema = schemaRow.model as unknown as CanonicalSchema;
    const { sequence, cyclesBrokenBetween } = sequenceEntities(schema);

    const plan = await prisma.migrationPlan.upsert({
      where: { projectId },
      update: { scope: { schemaId, cyclesBrokenBetween } as object },
      create: { tenantId, projectId, scope: { schemaId, cyclesBrokenBetween } as object },
    });

    // Rebuild entity rows.
    await prisma.migrationEntity.deleteMany({ where: { migrationPlanId: plan.id } });
    await prisma.migrationEntity.createMany({
      data: sequence.map((s) => ({
        migrationPlanId: plan.id,
        entityName: s.entity,
        sequence: s.order,
        wave: s.wave,
        dependsOn: s.dependsOn as object,
        extractionStrategy: 'full',
      })),
    });

    await recordAudit({
      lineage: { tenantId, projectId },
      actorId: userId,
      action: 'migration.plan.sequenced',
      subjectType: 'MigrationPlan',
      subjectId: plan.id,
      after: { entities: sequence.length, cyclesBroken: cyclesBrokenBetween.length },
    });

    return { planId: plan.id, sequence, cyclesBrokenBetween };
  }

  async getPlan(tenantId: string, projectId: string) {
    const plan = await prisma.migrationPlan.findUnique({ where: { projectId } });
    if (!plan || plan.tenantId !== tenantId) return null;
    const entities = await prisma.migrationEntity.findMany({
      where: { migrationPlanId: plan.id },
      orderBy: { sequence: 'asc' },
    });
    return { planId: plan.id, scope: plan.scope, entities };
  }
}
