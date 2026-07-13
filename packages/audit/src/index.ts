/**
 * @etl/audit — append-only audit trail.
 *
 * Every meaningful state change (connection tested, mapping approved, version
 * deployed, run started/finished) is recorded with the actor and the lineage
 * tuple. Audit rows are write-once.
 */
import { prisma } from '@etl/database';
import type { LineageContext } from '@etl/shared-types';

export interface AuditInput {
  lineage: Partial<LineageContext> & { tenantId: string };
  actorId?: string;
  action: string; // e.g. "mapping.approved", "version.deployed"
  subjectType: string; // e.g. "ProjectVersion"
  subjectId: string;
  before?: unknown;
  after?: unknown;
}

export async function recordAudit(input: AuditInput): Promise<void> {
  const { lineage } = input;
  await prisma.auditEvent.create({
    data: {
      tenantId: lineage.tenantId,
      customerId: lineage.customerId ?? null,
      environmentId: lineage.environmentId ?? null,
      projectId: lineage.projectId ?? null,
      projectVersionId: lineage.projectVersionId ?? null,
      runId: lineage.runId ?? null,
      actorId: input.actorId ?? null,
      action: input.action,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      before: (input.before ?? undefined) as object | undefined,
      after: (input.after ?? undefined) as object | undefined,
    },
  });
}
