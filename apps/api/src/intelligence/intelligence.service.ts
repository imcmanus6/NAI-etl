import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@etl/database';
import {
  METRICS,
  StubLateralActionClient,
  compileMetric,
  compilePopulationAccounts,
  compilePopulationBreakdown,
  compilePopulationSummary,
  summarizeEligibility,
  validateSql,
  type AccountRow,
  type PopulationQuery,
  type Predicate,
} from '@nai/core';
import { createAiProvider } from '@etl/ai-service';
import { AiPlanner } from './aiPlanner.js';

const lateral = new StubLateralActionClient();

/**
 * NAI Analyst — Lateral Intelligence service (MVP, synthetic DB).
 *
 * ASK → REPORT → ACT. Analytics run read-only through the SQL Guard; the
 * Create-Worklist action goes through preview → eligibility → confirm → execute
 * (stub Lateral client) → audit. Uses @nai/core for planning/compiling/guarding.
 */
@Injectable()
export class IntelligenceService {
  /** Claude-backed planner (Opus for NL→IR); deterministic fallback with no key. */
  private readonly planner = new AiPlanner(createAiProvider(process.env.NAI_AI_PROVIDER ?? 'anthropic', process.env));

  /** Run a guard-validated SELECT against the reporting schema (read-only). */
  private async runSql<T = Record<string, unknown>>(sql: string): Promise<T[]> {
    const guard = validateSql(sql);
    if (!guard.ok) throw new BadRequestException(`Query blocked by SQL guard: ${guard.reason}`);
    // Read-only posture: guard guarantees SELECT-only; real deployments also use
    // a read-only role + read-only transaction. queryRawUnsafe runs the compiled SQL.
    return prisma.$queryRawUnsafe<T[]>(sql);
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
}
