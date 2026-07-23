/** @nai/core — structured query IR (the contract between the AI and the engine). */

export type Operator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'is_true'
  | 'is_false'
  | 'older_than_days' // date field older than N days ago
  | 'within_days'; // date field within the last N days

export interface Predicate {
  field: string;
  operator: Operator;
  value?: string | number;
}

/** Account-selection query (populations, worklists). */
export interface PopulationQuery {
  grain: 'account';
  predicates: Predicate[];
  breakdowns?: string[]; // dimension field names
}

/** Aggregate metric query (reports, charts). */
export interface MetricQuery {
  grain: 'aggregate';
  metrics: string[];
  dimensions?: string[];
  filters?: Predicate[];
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
}

export type QueryPlan = PopulationQuery | MetricQuery;

export const isPopulation = (p: QueryPlan): p is PopulationQuery => p.grain === 'account';
