import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import cron, { type ScheduledTask } from 'node-cron';
import { prisma } from '@etl/database';
import { ObjectStore, loadStorageConfig } from '@etl/storage';
import {
  FIELDS,
  METRICS,
  StubLateralActionClient,
  compileMetric,
  compilePopulationAccounts,
  compilePopulationBreakdown,
  compilePopulationSummary,
  summarizeEligibility,
  validateSql,
  type AccountRow,
  type MetricQuery,
  type PopulationQuery,
  type Predicate,
} from '@nai/core';
import { createAiProvider } from '@etl/ai-service';
import { AiPlanner } from './aiPlanner.js';

const lateral = new StubLateralActionClient();
const OPERATORS = new Set(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_true', 'is_false', 'older_than_days', 'within_days']);

/** The built query behind a saved report (from the visual builder). */
export interface ReportSpec {
  metrics: string[];
  dimensions?: string[];
  filters?: Predicate[];
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
  chart?: 'bar' | 'line' | 'none';
}

/**
 * NAI Analyst — Lateral Intelligence service (MVP, synthetic DB).
 *
 * ASK → REPORT → ACT. Analytics run read-only through the SQL Guard; the
 * Create-Worklist action goes through preview → eligibility → confirm → execute
 * (stub Lateral client) → audit. Uses @nai/core for planning/compiling/guarding.
 */
@Injectable()
export class IntelligenceService implements OnModuleInit {
  /** Claude-backed planner (Opus for NL→IR); deterministic fallback with no key. */
  private readonly planner = new AiPlanner(createAiProvider(process.env.NAI_AI_PROVIDER ?? 'anthropic', process.env));
  /** node-cron jobs for scheduled reports, keyed by report id. */
  private readonly reportJobs = new Map<string, ScheduledTask>();

  /** Re-register cron jobs for enabled scheduled reports on boot. */
  async onModuleInit() {
    try {
      const reports = await prisma.naiReport.findMany({ where: { enabled: true, NOT: { cron: null } } });
      for (const r of reports) if (r.cron) this.registerReportJob(r.id, r.cron);
    } catch {
      /* db unavailable at boot — scheduler will register on next save */
    }
  }

  private registerReportJob(id: string, expr: string) {
    this.reportJobs.get(id)?.stop();
    this.reportJobs.delete(id);
    if (!cron.validate(expr)) return;
    this.reportJobs.set(id, cron.schedule(expr, () => void this.runReportNow(id).catch(() => undefined)));
  }

  private unregisterReportJob(id: string) {
    this.reportJobs.get(id)?.stop();
    this.reportJobs.delete(id);
  }

  /** Run a guard-validated SELECT against the reporting schema (read-only). */
  private async runSql<T = Record<string, unknown>>(sql: string): Promise<T[]> {
    const guard = validateSql(sql);
    if (!guard.ok) throw new BadRequestException(`Query blocked by SQL guard: ${guard.reason}`);
    // Read-only posture: guard guarantees SELECT-only; real deployments also use
    // a read-only role + read-only transaction. queryRawUnsafe runs the compiled SQL.
    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(sql);
    // Postgres count(*) comes back as BigInt, which JSON.stringify can't emit —
    // coerce BigInt → Number so results serialize cleanly over the API.
    for (const row of rows) {
      for (const k of Object.keys(row)) {
        if (typeof row[k] === 'bigint') row[k] = Number(row[k]);
      }
    }
    return rows as T[];
  }

  private async audit(tenantId: string, userId: string | undefined, category: string, action: string, detail: unknown) {
    await prisma.naiAuditEvent.create({ data: { tenantId, userId: userId ?? null, category, action, detail: (detail ?? {}) as object } });
  }

  private freshness() {
    return new Date().toISOString();
  }

  /** Executive KPI bundle for the Overview page. */
  async overview(tenantId: string) {
    const one = async (metricId: string) => {
      const rows = await this.runSql<Record<string, unknown>>(compileMetric({ grain: 'aggregate', metrics: [metricId] }));
      return Number(Object.values(rows[0] ?? { v: 0 })[0] ?? 0);
    };
    const [activeAccounts, outstanding, netCollections, promiseKept] = await Promise.all([
      one('active_accounts'),
      one('current_outstanding_balance'),
      one('net_collections'),
      one('promise_kept_rate'),
    ]);
    return {
      kpis: {
        active_accounts: activeAccounts,
        current_outstanding_balance: outstanding,
        net_collections: netCollections,
        promise_kept_rate: promiseKept,
      },
      dataFreshness: this.freshness(),
    };
  }

  catalogMetrics() {
    return Object.values(METRICS).map((m) => ({
      metric_id: m.metric_id,
      display_name: m.display_name,
      description: m.description,
      format: m.format,
      certification: m.certification,
      sensitivity: m.sensitivity,
      version: m.version,
    }));
  }

  /** ASK — natural language → structured plan → result + explanation. */
  async ask(tenantId: string, userId: string | undefined, nl: string) {
    const planned = await this.planner.plan(nl);
    if (!planned.plan) {
      await this.audit(tenantId, userId, 'ai', 'ask.clarify', { nl, source: planned.source });
      return { kind: 'clarify' as const, clarify: planned.clarify, planner: planned.source };
    }

    if (planned.plan.grain === 'account') {
      const plan = planned.plan;
      const [summary] = await this.runSql<{ accounts: number; balance: string }>(compilePopulationSummary(plan));
      const breakdowns: Record<string, Array<{ key: string; accounts: number; balance: number }>> = {};
      for (const dim of plan.breakdowns ?? []) {
        const rows = await this.runSql<{ key: string; accounts: number; balance: string }>(compilePopulationBreakdown(plan, dim));
        breakdowns[dim] = rows.map((r) => ({ key: r.key, accounts: Number(r.accounts), balance: Number(r.balance) }));
      }
      const accounts = Number(summary?.accounts ?? 0);
      const balance = Number(summary?.balance ?? 0);
      const narration = await this.planner.narrate(nl, JSON.stringify({ accounts, balance, criteria: planned.understood, breakdowns }));
      await this.audit(tenantId, userId, 'query', 'ask.population', { nl, criteria: planned.understood, row_count: accounts, source: planned.source, dataFreshness: this.freshness() });
      return {
        kind: 'population' as const,
        answer: `${accounts.toLocaleString()} accounts found · $${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} outstanding.`,
        accounts,
        balance,
        criteria: planned.understood,
        narrative: narration?.narrative,
        predicates: plan.predicates,
        breakdowns,
        dataFreshness: this.freshness(),
        assumptions: planned.assumptions,
        followUps: narration?.followUps?.length ? narration.followUps : ['Save this as a population', 'Break down by collector', 'Create a worklist for these accounts'],
        actions: ['save_population', 'create_worklist', 'export'],
        planner: planned.source,
      };
    }

    // metric query
    const rows = await this.runSql(compileMetric(planned.plan));
    const narration = await this.planner.narrate(nl, JSON.stringify({ answer: planned.understood, rows }));
    await this.audit(tenantId, userId, 'query', 'ask.metric', { nl, metrics: planned.metricsUsed, row_count: rows.length, source: planned.source, dataFreshness: this.freshness() });
    return {
      kind: 'metric' as const,
      answer: planned.understood,
      narrative: narration?.narrative,
      metricsUsed: planned.metricsUsed,
      definitions: planned.metricsUsed.map((id) => ({ id, ...METRICS[id]! })),
      rows,
      dataFreshness: this.freshness(),
      assumptions: planned.assumptions,
      followUps: narration?.followUps ?? [],
      planner: planned.source,
    };
  }

  /** Save the current population plan (dynamic — re-runs on open). */
  async savePopulation(tenantId: string, userId: string | undefined, name: string, plan: PopulationQuery) {
    const pop = await prisma.naiPopulation.create({
      data: { tenantId, name, type: 'dynamic', predicates: plan.predicates as object, breakdowns: (plan.breakdowns ?? []) as object, createdBy: userId ?? null },
    });
    await this.audit(tenantId, userId, 'population', 'population.created', { id: pop.id, name });
    return { id: pop.id, name: pop.name, type: pop.type };
  }

  listPopulations(tenantId: string) {
    return prisma.naiPopulation.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  /** Fetch the account rows for a population (re-runs the criteria). */
  private async populationAccounts(tenantId: string, populationId: string): Promise<AccountRow[]> {
    const pop = await prisma.naiPopulation.findFirst({ where: { id: populationId, tenantId } });
    if (!pop) throw new NotFoundException('Population not found');
    const plan: PopulationQuery = { grain: 'account', predicates: pop.predicates as unknown as Predicate[] };
    const sql = compilePopulationAccounts(plan, ['account_id', 'current_balance', 'has_compliance_hold', 'has_active_arrangement', 'is_locked'], 5000);
    return this.runSql<AccountRow>(sql);
  }

  /** ACT — preview a Create-Worklist action (eligibility split). */
  async previewAction(tenantId: string, userId: string | undefined, input: { populationId: string; actionType: 'create_worklist'; params: Record<string, unknown> }) {
    const accounts = await this.populationAccounts(tenantId, input.populationId);
    const eligibility = await lateral.validateEligibility(accounts, { type: input.actionType, params: input.params });
    const summary = summarizeEligibility(accounts, eligibility);
    const req = await prisma.naiActionRequest.create({
      data: {
        tenantId,
        actionType: input.actionType,
        populationId: input.populationId,
        status: 'previewed',
        params: input.params as object,
        preview: { selected: summary.selected, eligible: summary.eligible, excluded: summary.excluded, excludedReasons: summary.excludedReasons, eligibleBalance: summary.eligibleBalance } as object,
        createdBy: userId ?? null,
      },
    });
    await this.audit(tenantId, userId, 'action', 'action.proposed', { actionId: req.id, type: input.actionType, ...summary, eligibleAccounts: undefined });
    return {
      actionId: req.id,
      actionType: input.actionType,
      selected: summary.selected,
      eligible: summary.eligible,
      excluded: summary.excluded,
      excludedReasons: summary.excludedReasons,
      eligibleBalance: summary.eligibleBalance,
      params: input.params,
    };
  }

  /** ACT — explicit confirm → execute via Lateral (stub) → audit. */
  async confirmAction(tenantId: string, userId: string | undefined, actionId: string) {
    const req = await prisma.naiActionRequest.findFirst({ where: { id: actionId, tenantId } });
    if (!req) throw new NotFoundException('Action not found');
    if (req.status === 'executed') throw new BadRequestException('Action already executed');
    if (!req.populationId) throw new BadRequestException('Action has no population');

    const accounts = await this.populationAccounts(tenantId, req.populationId);
    const eligibility = await lateral.validateEligibility(accounts, { type: 'create_worklist', params: req.params as Record<string, unknown> });
    const { eligibleAccounts } = summarizeEligibility(accounts, eligibility);
    const result = await lateral.execute(eligibleAccounts, { type: 'create_worklist', params: req.params as Record<string, unknown> });

    await prisma.naiActionRequest.update({ where: { id: req.id }, data: { status: 'executed', result: result as object, lateralRef: result.ref } });
    await this.audit(tenantId, userId, 'action', 'action.executed', { actionId: req.id, type: 'create_worklist', added: result.added, failed: result.failed, lateralRef: result.ref });
    return { actionId: req.id, ...result };
  }

  listAudit(tenantId: string, category?: string) {
    return prisma.naiAuditEvent.findMany({
      where: { tenantId, ...(category ? { category } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  // --- Report builder -------------------------------------------------------

  /** Catalog for the builder pickers: certified metrics + group-by dimensions. */
  reportCatalog() {
    const metrics = Object.values(METRICS).map((m) => ({
      metric_id: m.metric_id,
      display_name: m.display_name,
      description: m.description,
      format: m.format,
      certification: m.certification,
      from: m.from,
    }));
    const dimensions = Object.values(FIELDS)
      .filter((f) => f.dimension)
      .map((f) => ({ name: f.name, label: f.label ?? f.name, view: f.view }));
    const fields = Object.values(FIELDS).map((f) => ({ name: f.name, type: f.type, label: f.label ?? f.name }));
    return { metrics, dimensions, fields };
  }

  /** Normalize a raw builder spec: keep metrics sharing one reporting view,
   *  drop breakdowns/metrics that aren't compatible (with warnings). */
  private sanitizeSpec(spec: ReportSpec): { metrics: string[]; dimensions: string[]; filters: Predicate[]; from: string; warnings: string[] } {
    const warnings: string[] = [];
    const known = (spec.metrics ?? []).filter((m) => METRICS[m]);
    if (known.length === 0) throw new BadRequestException('Pick at least one certified metric.');
    // All metrics in a report must resolve to the same reporting view so they
    // can be grouped by a shared dimension and merged.
    const from = METRICS[known[0]!]!.from;
    const metrics = known.filter((m) => {
      if (METRICS[m]!.from === from) return true;
      warnings.push(`Metric "${METRICS[m]!.display_name}" uses a different data source and wasn't combined.`);
      return false;
    });
    const dimOk = (name: string) => FIELDS[name]?.view === from || (name === 'collector' && (from === 'reporting.payment' || from === 'reporting.promise'));
    const dimensions = (spec.dimensions ?? []).filter((d) => {
      if (dimOk(d)) return true;
      warnings.push(`Dropped breakdown "${d}" — not available for these metrics.`);
      return false;
    });
    const filters = (spec.filters ?? []).filter((p) => {
      if (!FIELDS[p.field] || !OPERATORS.has(p.operator)) return false;
      if (FIELDS[p.field]!.view === from) return true;
      warnings.push(`Dropped filter on "${p.field}" — not available for these metrics.`);
      return false;
    });
    return { metrics, dimensions, filters, from, warnings };
  }

  /**
   * Run a report spec live (read-only, guarded). Each metric is compiled and run
   * separately (the compiler is single-metric) then merged by the breakdown key,
   * producing one row per dimension tuple with a column per metric.
   */
  async runReport(spec: ReportSpec) {
    const { metrics, dimensions, filters, warnings } = this.sanitizeSpec(spec);
    const keyOf = (r: Record<string, unknown>) => dimensions.map((d) => String(r[d] ?? '')).join('');
    const byKey = new Map<string, Record<string, unknown>>();

    for (const metric of metrics) {
      const q: MetricQuery = { grain: 'aggregate', metrics: [metric], dimensions, filters };
      const rows = await this.runSql<Record<string, unknown>>(compileMetric(q));
      for (const r of rows) {
        const k = keyOf(r);
        const agg = byKey.get(k) ?? Object.fromEntries(dimensions.map((d) => [d, r[d]]));
        agg[metric] = Number(r[metric] ?? 0);
        byKey.set(k, agg);
      }
    }

    let rows = [...byKey.values()];
    // Backfill metric cells a metric's WHERE clause excluded (e.g. an
    // active-only balance is 0 for a closed account) so every column is present.
    for (const r of rows) for (const m of metrics) if (r[m] === undefined) r[m] = 0;
    // Sort: honor the requested sort, else default to the first metric desc.
    const sort = (spec.sort ?? []).filter((s) => metrics.includes(s.field) || dimensions.includes(s.field));
    const sortBy = sort[0] ?? (dimensions.length ? { field: metrics[0]!, direction: 'desc' as const } : undefined);
    if (sortBy) {
      const dir = sortBy.direction === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        const av = a[sortBy.field] as number | string, bv = b[sortBy.field] as number | string;
        return (typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))) * dir;
      });
    }
    if (typeof spec.limit === 'number' && spec.limit > 0) rows = rows.slice(0, Math.min(spec.limit, 1000));

    return {
      rows,
      columns: [...dimensions, ...metrics],
      metrics: metrics.map((id) => ({ id, ...METRICS[id]! })),
      warnings,
      dataFreshness: this.freshness(),
    };
  }

  /** AI assist: plain-English → a prefilled builder spec (metric plan). */
  async assistReport(tenantId: string, userId: string | undefined, nl: string) {
    const planned = await this.planner.plan(nl);
    await this.audit(tenantId, userId, 'ai', 'report.assist', { nl, source: planned.source });
    if (planned.plan?.grain === 'aggregate') {
      return {
        understood: planned.understood,
        assumptions: planned.assumptions,
        planner: planned.source,
        spec: { metrics: planned.plan.metrics, dimensions: planned.plan.dimensions ?? [], filters: planned.plan.filters ?? [], sort: planned.plan.sort, limit: planned.plan.limit, chart: (planned.plan.dimensions?.length ? 'bar' : 'none') as 'bar' | 'none' },
      };
    }
    // population/clarify → no metric spec; surface the interpretation so the UI can guide the user
    return { understood: planned.understood || '', assumptions: planned.assumptions ?? [], planner: planned.source, clarify: planned.clarify ?? 'Try asking for a metric, e.g. "net collections by client".', spec: null };
  }

  listReports(tenantId: string) {
    return prisma.naiReport.findMany({ where: { tenantId }, orderBy: { updatedAt: 'desc' } });
  }

  async saveReport(tenantId: string, userId: string | undefined, name: string, spec: ReportSpec) {
    this.sanitizeSpec(spec); // validate before persisting
    const report = await prisma.naiReport.create({ data: { tenantId, name, spec: spec as object, createdBy: userId ?? null } });
    await this.audit(tenantId, userId, 'report', 'report.created', { id: report.id, name });
    return report;
  }

  async getReport(tenantId: string, id: string) {
    const r = await prisma.naiReport.findFirst({ where: { id, tenantId } });
    if (!r) throw new NotFoundException('Report not found');
    return r;
  }

  /** Re-run a saved report live (dynamic — reflects the latest snapshot). */
  async runSavedReport(tenantId: string, id: string) {
    const r = await this.getReport(tenantId, id);
    return { report: { id: r.id, name: r.name, spec: r.spec }, ...(await this.runReport(r.spec as unknown as ReportSpec)) };
  }

  /** CSV of a saved report's current rows. */
  async exportReportCsv(tenantId: string, id: string): Promise<{ filename: string; csv: string }> {
    const r = await this.getReport(tenantId, id);
    const { rows, columns } = await this.runReport(r.spec as unknown as ReportSpec);
    return { filename: `${r.name.replace(/[^\w.-]+/g, '_')}.csv`, csv: toCsv(columns, rows) };
  }

  /** Set/clear a report's cron schedule and (de)register the job. */
  async scheduleReport(tenantId: string, id: string, cronExpr: string | null, enabled: boolean) {
    const r = await this.getReport(tenantId, id);
    if (cronExpr && !cron.validate(cronExpr)) throw new BadRequestException(`Invalid cron expression: ${cronExpr}`);
    const updated = await prisma.naiReport.update({ where: { id: r.id }, data: { cron: cronExpr, enabled } });
    if (enabled && cronExpr) this.registerReportJob(id, cronExpr);
    else this.unregisterReportJob(id);
    await this.audit(tenantId, undefined, 'report', 'report.scheduled', { id, cron: cronExpr, enabled });
    return updated;
  }

  /** Run a report now: compute rows, write CSV to object storage, record status. */
  async runReportNow(id: string) {
    const r = await prisma.naiReport.findFirst({ where: { id } });
    if (!r) return;
    try {
      const { rows, columns } = await this.runReport(r.spec as unknown as ReportSpec);
      const csv = toCsv(columns, rows);
      let key: string | null = null;
      try {
        const store = new ObjectStore(loadStorageConfig());
        key = `reports/${r.tenantId}/${r.id}/${r.updatedAt.toISOString().slice(0, 10)}.csv`;
        await store.putObject(key, csv);
      } catch {
        /* storage optional in dev — still record the run */
      }
      const updated = await prisma.naiReport.update({ where: { id }, data: { lastRunAt: new Date(), lastStatus: 'succeeded', lastRows: rows.length, lastOutputKey: key } });
      await this.audit(r.tenantId, undefined, 'report', 'report.run', { id, rows: rows.length, outputKey: key });
      return { rows: rows.length, outputKey: key, report: updated };
    } catch (e) {
      await prisma.naiReport.update({ where: { id }, data: { lastRunAt: new Date(), lastStatus: 'failed' } });
      await this.audit(r.tenantId, undefined, 'report', 'report.run.failed', { id, error: (e as Error).message });
      throw e;
    }
  }

  async deleteReport(tenantId: string, id: string) {
    await this.getReport(tenantId, id);
    this.unregisterReportJob(id);
    await prisma.naiReport.delete({ where: { id } });
    await this.audit(tenantId, undefined, 'report', 'report.deleted', { id });
    return { deleted: true };
  }
}

/** Render rows to CSV with a fixed column order; quote/escape safely. */
function toCsv(columns: string[], rows: Array<Record<string, unknown>>): string {
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = columns.map(esc).join(',');
  const body = rows.map((r) => columns.map((c) => esc(r[c])).join(',')).join('\n');
  return body ? `${head}\n${body}` : head;
}
