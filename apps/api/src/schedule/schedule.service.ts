import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import cron, { type ScheduledTask } from 'node-cron';
import { prisma } from '@etl/database';
import { ObjectStore, loadStorageConfig } from '@etl/storage';
import { createLogger } from '@etl/observability';
import { recordAudit } from '@etl/audit';
import { TestRunsService } from '../testruns/testruns.service.js';

const log = createLogger({ component: 'scheduler' });

export interface ScheduleInput {
  cron: string;
  enabled: boolean;
  sourceConnectionId?: string | null;
  sourceEntity?: string | null;
  destinationConnectionId?: string | null;
  outputMode: 'api' | 'csv' | 'both';
  targetSchemaId?: string | null;
}

/**
 * Saved ETL pipelines + scheduler.
 *
 * Each project can have one pipeline schedule (source → approved config →
 * destination / CSV file, on a cron). This MVP runs jobs in-process via
 * node-cron and reuses the deterministic test-run pipeline; the production path
 * is a Temporal cron workflow per pipeline (see docs/WORKFLOWS.md).
 */
@Injectable()
export class ScheduleService implements OnModuleInit {
  private readonly jobs = new Map<string, ScheduledTask>();

  constructor(private readonly testRuns: TestRunsService) {}

  async onModuleInit() {
    try {
      const schedules = await prisma.pipelineSchedule.findMany({ where: { enabled: true } });
      for (const s of schedules) this.register(s.id, s.cron);
      log.info({ count: schedules.length }, 'scheduler loaded enabled pipelines');
    } catch (e) {
      log.warn({ err: (e as Error).message }, 'scheduler init skipped (db unavailable?)');
    }
  }

  private register(scheduleId: string, expr: string) {
    this.unregister(scheduleId);
    if (!cron.validate(expr)) {
      log.warn({ scheduleId, expr }, 'invalid cron expression — not scheduled');
      return;
    }
    const task = cron.schedule(expr, () => {
      this.execute(scheduleId).catch((e) => log.error({ err: (e as Error).message, scheduleId }, 'scheduled run failed'));
    });
    this.jobs.set(scheduleId, task);
  }

  private unregister(scheduleId: string) {
    const t = this.jobs.get(scheduleId);
    if (t) {
      t.stop();
      this.jobs.delete(scheduleId);
    }
  }

  get(tenantId: string, projectId: string) {
    return prisma.pipelineSchedule.findFirst({ where: { tenantId, projectId } });
  }

  async upsert(tenantId: string, projectId: string, input: ScheduleInput, userId?: string) {
    if (!cron.validate(input.cron)) throw new NotFoundException(`Invalid cron expression: ${input.cron}`);
    const existing = await prisma.pipelineSchedule.findFirst({ where: { tenantId, projectId } });
    const data = {
      cron: input.cron,
      enabled: input.enabled,
      sourceConnectionId: input.sourceConnectionId ?? null,
      sourceEntity: input.sourceEntity ?? null,
      destinationConnectionId: input.destinationConnectionId ?? null,
      outputMode: input.outputMode,
      targetSchemaId: input.targetSchemaId ?? null,
    };
    const saved = existing
      ? await prisma.pipelineSchedule.update({ where: { id: existing.id }, data })
      : await prisma.pipelineSchedule.create({ data: { tenantId, projectId, ...data } });

    if (saved.enabled) this.register(saved.id, saved.cron);
    else this.unregister(saved.id);

    await recordAudit({
      lineage: { tenantId, projectId },
      actorId: userId,
      action: 'schedule.saved',
      subjectType: 'PipelineSchedule',
      subjectId: saved.id,
      after: { cron: saved.cron, enabled: saved.enabled, outputMode: saved.outputMode },
    });
    return saved;
  }

  async runNow(tenantId: string, projectId: string, userId?: string) {
    const s = await prisma.pipelineSchedule.findFirst({ where: { tenantId, projectId } });
    if (!s) throw new NotFoundException('No pipeline schedule configured for this project');
    return this.execute(s.id, userId);
  }

  /** Execute one pipeline run: read source → map/validate → deliver + file output. */
  private async execute(scheduleId: string, userId?: string) {
    const s = await prisma.pipelineSchedule.findUnique({ where: { id: scheduleId } });
    if (!s) return;
    const project = await prisma.project.findUnique({ where: { id: s.projectId } });
    log.info({ scheduleId, projectId: s.projectId }, 'executing scheduled pipeline');

    try {
      const result = await this.testRuns.run(
        s.tenantId,
        s.projectId,
        {
          sourceConnectionId: s.sourceConnectionId ?? undefined,
          sourceEntity: s.sourceEntity ?? undefined,
          deliverToConnectionId:
            s.outputMode === 'api' || s.outputMode === 'both' ? s.destinationConnectionId ?? undefined : undefined,
          targetSchemaId: s.targetSchemaId ?? undefined,
          versionId: project?.currentVersionId ?? undefined, // run the approved version if deployed
          mode: 'production',
        },
        userId,
      );

      let outputKey: string | null = null;
      if ((s.outputMode === 'csv' || s.outputMode === 'both') && result.csvOutput) {
        try {
          const store = new ObjectStore(loadStorageConfig());
          outputKey = ObjectStore.key({
            tenantId: s.tenantId,
            kind: 'output',
            projectId: s.projectId,
            runId: result.runId,
            filename: `output-${result.runId.slice(0, 8)}.csv`,
          });
          await store.putObject(outputKey, result.csvOutput);
          await prisma.runStage.create({
            data: { runId: result.runId, name: 'file_generation', status: 'succeeded', detail: { storageKey: outputKey, rows: result.outputRecords } as object },
          });
        } catch (e) {
          log.warn({ err: (e as Error).message }, 'csv output storage failed');
        }
      }

      await prisma.pipelineSchedule.update({
        where: { id: s.id },
        data: { lastRunAt: new Date(), lastRunId: result.runId, lastStatus: 'succeeded' },
      });
      return { runId: result.runId, metrics: result.metrics, delivery: result.delivery, outputKey, outputRecords: result.outputRecords };
    } catch (e) {
      await prisma.pipelineSchedule
        .update({ where: { id: s.id }, data: { lastRunAt: new Date(), lastStatus: 'failed' } })
        .catch(() => undefined);
      log.error({ err: (e as Error).message, scheduleId }, 'scheduled pipeline failed');
      throw e;
    }
  }
}
