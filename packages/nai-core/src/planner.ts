/**
 * @nai/core — query planner (NL → structured IR).
 *
 * Deterministic backbone that maps natural-language questions to a validated
 * plan against the catalog. An LLM planner (via @etl/ai-service, structured
 * output constrained to this IR) can replace this for open-ended questions; the
 * deterministic path guarantees the demo works offline and never invents joins.
 * If a request can't be mapped to certified metrics/known fields, it returns a
 * clarification instead of guessing.
 */
import type { MetricQuery, Operator, PopulationQuery, Predicate, QueryPlan } from './ir.js';
import { METRICS } from './catalog.js';

export interface PlanResult {
  plan: QueryPlan | null;
  understood: string;
  assumptions: string[];
  clarify?: string;
  metricsUsed: string[];
}

const num = (s: string) => Number(s.replace(/[$,\s]/g, ''));

export function planQuestion(nl: string): PlanResult {
  const q = nl.toLowerCase();
  const assumptions: string[] = [];

  // ---- Population intent (account selection) -------------------------------
  const populationish =
    /\baccounts?\b/.test(q) &&
    /(over|above|greater than|no |without|inactive|not contacted|no contact|balance|hold|promise|activity)/.test(q);

  if (populationish) {
    const predicates: Predicate[] = [];
    const push = (field: string, operator: Operator, value?: string | number) => predicates.push({ field, operator, value });

    if (/\bactive accounts?\b/.test(q) || /status.*active/.test(q)) push('status', 'eq', 'active');

    const bal = q.match(/(?:over|above|greater than|more than|>)\s*\$?\s*([\d,]+(?:\.\d+)?)/);
    if (bal) push('current_balance', 'gt', num(bal[1]!));

    const contact = q.match(/no (?:successful )?contact(?:ed)?\s*(?:in|for|within)?\s*(?:the last\s*)?(\d+)\s*days?/);
    if (contact) push('last_successful_contact_at', 'older_than_days', Number(contact[1]));

    const activity = q.match(/no (?:recent )?activity\s*(?:in|for|within)?\s*(?:the last\s*)?(\d+)?\s*days?/);
    if (activity && !contact) push('last_activity_at', 'older_than_days', activity[1] ? Number(activity[1]) : 14);

    if (/no active promise|without (?:an? )?promise|no promise/.test(q)) push('has_active_promise', 'is_false');
    if (/no compliance hold|no hold|not on hold/.test(q)) push('has_compliance_hold', 'is_false');
    if (/no (?:active )?arrangement/.test(q)) push('has_active_arrangement', 'is_false');

    if (predicates.length === 0) {
      return { plan: null, understood: '', assumptions, metricsUsed: [], clarify: 'Which accounts? Try: "active accounts over $2,500 with no successful contact in 14 days".' };
    }

    const breakdowns: string[] = [];
    for (const [kw, dim] of [['collector', 'collector'], ['client', 'client'], ['workflow', 'workflow'], ['team', 'team'], ['jurisdiction', 'jurisdiction'], ['account type', 'account_type']] as const) {
      if (q.includes(kw)) breakdowns.push(dim);
    }
    if (breakdowns.length === 0) {
      breakdowns.push('collector', 'client', 'workflow');
      assumptions.push('Breakdowns default to collector, client and workflow.');
    }

    const plan: PopulationQuery = { grain: 'account', predicates, breakdowns };
    return { plan, understood: describePredicates(predicates), assumptions, metricsUsed: [] };
  }

  // ---- Metric intent (aggregate report) ------------------------------------
  const metricMap: Array<[RegExp, string]> = [
    [/promise[- ]?kept rate/, 'promise_kept_rate'],
    [/promises? kept/, 'promises_kept'],
    [/net collections|collections|payments\b/, 'net_collections'],
    [/collection rate/, 'collection_rate'],
    [/outstanding balance|current balance|balance/, 'current_outstanding_balance'],
    [/active accounts/, 'active_accounts'],
    [/total accounts|how many accounts/, 'total_accounts'],
  ];
  const metric = metricMap.find(([re]) => re.test(q))?.[1];
  if (metric && METRICS[metric]) {
    const dimensions: string[] = [];
    for (const [kw, dim] of [['collector', 'collector'], ['client', 'client'], ['workflow', 'workflow'], ['team', 'team']] as const) {
      if (q.includes(kw)) dimensions.push(dim);
    }
    const plan: MetricQuery = {
      grain: 'aggregate',
      metrics: [metric],
      dimensions: dimensions.length ? dimensions : undefined,
      sort: dimensions.length ? [{ field: metric, direction: 'desc' }] : undefined,
      limit: 100,
    };
    return { plan, understood: `${METRICS[metric]!.display_name}${dimensions.length ? ' by ' + dimensions.join(', ') : ''}`, assumptions, metricsUsed: [metric] };
  }

  return {
    plan: null,
    understood: '',
    assumptions,
    metricsUsed: [],
    clarify: 'I can answer with certified metrics (e.g. net collections, promise-kept rate) or find populations of accounts (e.g. "active accounts over $2,500 with no contact in 14 days"). Could you rephrase?',
  };
}

const OP_TEXT: Record<Operator, string> = {
  eq: 'is', neq: 'is not', gt: 'over', gte: '≥', lt: 'under', lte: '≤',
  is_true: 'is set', is_false: 'is not set', older_than_days: 'older than', within_days: 'within',
};

function describePredicates(preds: Predicate[]): string {
  return preds
    .map((p) => {
      if (p.operator === 'older_than_days') return `no ${p.field.replace(/_at$/, '').replace(/_/g, ' ')} in ${p.value} days`;
      if (p.operator === 'within_days') return `${p.field} within ${p.value} days`;
      if (p.operator === 'is_false') return `no ${p.field.replace(/^has_/, '').replace(/_/g, ' ')}`;
      if (p.operator === 'is_true') return `${p.field}`;
      return `${p.field.replace(/_/g, ' ')} ${OP_TEXT[p.operator]} ${p.value}`;
    })
    .join(', ');
}
