/**
 * Claude-backed NL → IR planner for the report builder.
 *
 * The AI's job is *understanding*, never SQL: Claude reads the governed catalog
 * and emits a structured query plan (the @nai/core IR) via forced tool-use
 * (structured output). The deterministic compiler + SQL guard still generate and
 * validate every query — so Claude can interpret almost any phrasing while the
 * hard guarantees (no invented fields, allow-listed schema, read-only) hold.
 *
 * Falls back to the deterministic `planQuestion` when no API key is configured
 * or Claude errors, so the product runs offline and degrades gracefully.
 */
import {
  FIELDS,
  METRICS,
  planQuestion,
  type MetricQuery,
  type Operator,
  type PlanResult,
  type PopulationQuery,
  type Predicate,
} from '@nai/core';
import { redact, type AiProvider, type TenantAiSettings } from '@etl/ai-service';

/** Opus for the accuracy-critical NL→IR mapping; a cheaper model for prose. */
export const PLANNER_MODEL = process.env.NAI_PLANNER_MODEL ?? 'claude-opus-4-8';
export const NARRATION_MODEL = process.env.NAI_NARRATION_MODEL ?? 'claude-sonnet-5';

const OPERATORS: Operator[] = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_true', 'is_false', 'older_than_days', 'within_days'];

const fieldNames = Object.keys(FIELDS);
const dimensionNames = Object.entries(FIELDS)
  .filter(([, f]) => f.dimension)
  .map(([k]) => k);
const metricIds = Object.keys(METRICS);

/** Extends PlanResult with which planner produced it (for transparency/telemetry). */
export interface AiPlanResult extends PlanResult {
  source: 'ai' | 'deterministic';
}

const redactSettings: TenantAiSettings = {
  provider: 'anthropic',
  defaultModel: PLANNER_MODEL,
  redactPii: true,
  shareSampleValues: false,
};

/** JSON schema Claude must emit — enums bind every field/metric to the catalog. */
function planSchema(): Record<string, unknown> {
  const predicate = {
    type: 'object',
    additionalProperties: false,
    properties: {
      field: { enum: fieldNames },
      operator: { enum: OPERATORS },
      value: { type: ['string', 'number', 'boolean'] },
    },
    required: ['field', 'operator'],
  };
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      kind: { enum: ['population', 'metric', 'clarify'], description: 'population = select accounts; metric = aggregate report; clarify = question is ambiguous' },
      understood: { type: 'string', description: 'One-sentence restatement of what you understood.' },
      assumptions: { type: 'array', items: { type: 'string' }, description: 'Any assumptions you made (e.g. default thresholds).' },
      clarify: { type: 'string', description: 'When kind=clarify: the clarifying question to ask the user.' },
      // population
      predicates: { type: 'array', items: predicate, description: 'Account-selection filters (kind=population).' },
      breakdowns: { type: 'array', items: { enum: dimensionNames }, description: 'Dimensions to break the population down by.' },
      // metric
      metrics: { type: 'array', items: { enum: metricIds }, description: 'Certified metrics to compute (kind=metric).' },
      dimensions: { type: 'array', items: { enum: dimensionNames }, description: 'Group-by dimensions for the metric.' },
      filters: { type: 'array', items: predicate, description: 'Filters applied to the metric query.' },
      sort: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: { field: { enum: [...metricIds, ...dimensionNames] }, direction: { enum: ['asc', 'desc'] } },
          required: ['field', 'direction'],
        },
      },
      limit: { type: 'integer' },
    },
    required: ['kind', 'understood', 'assumptions'],
  };
}

/** Human-readable catalog handed to Claude so it maps to real fields/metrics only. */
function catalogBrief(): string {
  const fields = Object.values(FIELDS)
    .map((f) => `- ${f.name} (${f.type}${f.dimension ? ', dimension' : ''}, ${f.sensitivity})`)
    .join('\n');
  const metrics = Object.values(METRICS)
    .map((m) => `- ${m.metric_id}: ${m.description} [${m.certification}]`)
    .join('\n');
  return `FIELDS on the account population (use these names exactly):\n${fields}\n\nCERTIFIED METRICS:\n${metrics}`;
}

const SYSTEM = `You are the query planner for a collections analytics report builder.
Translate the user's natural-language question into a structured query plan against the GOVERNED CATALOG below.

Rules:
- Use ONLY the field names and metric ids from the catalog. Never invent fields, metrics, joins, or table names.
- kind="population" for "show/list accounts where ...": emit predicates (and breakdowns if the user asks to break down by a dimension).
- kind="metric" for "what is / how many / trend / by ...": emit metrics (+ dimensions/filters/sort/limit).
- Date-recency filters use older_than_days / within_days with a day count as value.
- Boolean flags use is_true / is_false (no value).
- If the question is too ambiguous to map confidently, use kind="clarify" and put a short clarifying question in "clarify".
- Record any defaults you assumed in "assumptions".
You never write SQL. A deterministic compiler turns your plan into SQL and a guard validates it.`;

export class AiPlanner {
  constructor(private readonly provider: AiProvider) {}

  /** Plan a question: Claude first, deterministic fallback on any failure. */
  async plan(nl: string): Promise<AiPlanResult> {
    try {
      const ai = await this.tryAi(nl);
      if (ai) return ai;
    } catch {
      /* fall through to deterministic */
    }
    return { ...planQuestion(nl), source: 'deterministic' };
  }

  private async tryAi(nl: string): Promise<AiPlanResult | null> {
    const question = redact(nl, redactSettings).text;
    const res = await this.provider.generateStructured({
      model: PLANNER_MODEL,
      maxOutputTokens: 1024,
      jsonSchema: planSchema(),
      messages: [
        { role: 'system', content: `${SYSTEM}\n\n${catalogBrief()}` },
        { role: 'user', content: question },
      ],
    });
    return this.toPlanResult(res.data);
  }

  /** Validate + map Claude's emitted object to a PlanResult (defense in depth). */
  private toPlanResult(data: unknown): AiPlanResult {
    const d = data as Record<string, unknown>;
    const understood = String(d.understood ?? '');
    const assumptions = Array.isArray(d.assumptions) ? d.assumptions.map(String) : [];
    const kind = d.kind;

    if (kind === 'clarify') {
      return { plan: null, understood, assumptions, clarify: String(d.clarify ?? 'Could you rephrase that?'), metricsUsed: [], source: 'ai' };
    }

    const preds = (raw: unknown): Predicate[] =>
      (Array.isArray(raw) ? raw : []).map((p) => {
        const pp = p as Record<string, unknown>;
        if (!FIELDS[String(pp.field)]) throw new Error(`unknown field: ${String(pp.field)}`);
        if (!OPERATORS.includes(pp.operator as Operator)) throw new Error(`bad operator: ${String(pp.operator)}`);
        return { field: String(pp.field), operator: pp.operator as Operator, value: pp.value as string | number | undefined };
      });
    const dims = (raw: unknown): string[] =>
      (Array.isArray(raw) ? raw : []).map(String).filter((x) => FIELDS[x]?.dimension);

    if (kind === 'population') {
      const predicates = preds(d.predicates);
      if (predicates.length === 0) {
        return { plan: null, understood, assumptions, clarify: 'Which accounts do you mean? Add at least one condition (status, balance, contact recency, holds…).', metricsUsed: [], source: 'ai' };
      }
      const plan: PopulationQuery = { grain: 'account', predicates, breakdowns: dims(d.breakdowns) };
      return { plan, understood, assumptions, metricsUsed: [], source: 'ai' };
    }

    if (kind === 'metric') {
      const metrics = (Array.isArray(d.metrics) ? d.metrics : []).map(String).filter((m) => METRICS[m]);
      if (metrics.length === 0) throw new Error('metric plan with no known metrics');
      // A dimension is only valid if it lives on the metric's own view (the
      // compiler enforces this) — plus the collector special-case on
      // payment/promise. Drop anything incompatible instead of 500-ing.
      const from = METRICS[metrics[0]!]!.from;
      const dimOk = (name: string) => FIELDS[name]?.view === from || (name === 'collector' && (from === 'reporting.payment' || from === 'reporting.promise'));
      const requested = dims(d.dimensions);
      const dimensions = requested.filter(dimOk);
      const dropped = requested.filter((x) => !dimOk(x));
      if (dropped.length) assumptions.push(`Ignored breakdown${dropped.length > 1 ? 's' : ''} not available for these metrics: ${dropped.join(', ')}.`);
      const sort = (Array.isArray(d.sort) ? d.sort : [])
        .map((s) => s as Record<string, unknown>)
        .filter((s) => metrics.includes(String(s.field)) || dimensions.includes(String(s.field)))
        .map((s) => ({ field: String(s.field), direction: s.direction === 'asc' ? ('asc' as const) : ('desc' as const) }));
      const plan: MetricQuery = {
        grain: 'aggregate',
        metrics,
        dimensions,
        filters: preds(d.filters),
        sort: sort.length ? sort : undefined,
        limit: typeof d.limit === 'number' ? d.limit : undefined,
      };
      return { plan, understood, assumptions, metricsUsed: metrics, source: 'ai' };
    }

    throw new Error(`unrecognized plan kind: ${String(kind)}`);
  }

  /**
   * Best-effort plain-English narration + follow-up suggestions for a result,
   * on the cheaper model. Returns null when AI is unavailable — callers treat
   * the narrative as optional polish, never load-bearing.
   */
  async narrate(question: string, factsJson: string): Promise<{ narrative: string; followUps: string[] } | null> {
    try {
      const res = await this.provider.generateStructured({
        model: NARRATION_MODEL,
        maxOutputTokens: 512,
        jsonSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            narrative: { type: 'string', description: '2-3 sentence plain-English readout of the result. No fabricated numbers.' },
            followUps: { type: 'array', items: { type: 'string' }, description: '2-3 natural follow-up questions.' },
          },
          required: ['narrative', 'followUps'],
        },
        messages: [
          { role: 'system', content: 'You summarize collections analytics results for an operations manager. Use only the numbers provided; never invent figures. Be concise and specific.' },
          { role: 'user', content: `Question: ${redact(question, redactSettings).text}\n\nResult (JSON):\n${factsJson}` },
        ],
      });
      const d = res.data as Record<string, unknown>;
      return { narrative: String(d.narrative ?? ''), followUps: Array.isArray(d.followUps) ? d.followUps.map(String) : [] };
    } catch {
      return null;
    }
  }
}
