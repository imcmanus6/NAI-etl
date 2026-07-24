/** @nai/core — structured query IR (the contract between the AI and the engine). */

export type Operator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in' // value is a list — matches any (multi-select)
  | 'not_in'
  | 'is_true'
  | 'is_false'
  | 'is_set' // field has a value (not null / not empty)
  | 'is_empty' // field is null / empty
  | 'older_than_days' // date field older than N days ago
  | 'within_days'; // date field within the last N days

export interface Predicate {
  field: string;
  operator: Operator;
  value?: string | number | Array<string | number>;
}

/**
 * A boolean filter tree — leaves are predicates, groups combine with AND/OR/NOT.
 * A bare Predicate is a valid leaf. Powers the inventory "advanced filter"
 * builder (nested AND/OR, exclusions) and is the shared filter contract.
 */
export type FilterNode =
  | { and: FilterNode[] }
  | { or: FilterNode[] }
  | { not: FilterNode }
  | Predicate;

export const isPredicateLeaf = (n: FilterNode): n is Predicate =>
  typeof (n as Predicate).field === 'string' && typeof (n as Predicate).operator === 'string';

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
