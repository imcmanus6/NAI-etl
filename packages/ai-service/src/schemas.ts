/**
 * Structured-output schemas for AI tasks (Deliverable 11).
 *
 * Every AI conclusion carries a certainty and evidence — guesses are never
 * presented as facts. These Zod schemas both validate model output and generate
 * the JSON schema handed to the provider's structured-output/tool-calling API.
 */
import { z } from 'zod';

export const certainty = z.enum([
  'confirmed',
  'strong_inference',
  'weak_assumption',
  'needs_confirmation',
]);

export const evidence = z.object({
  kind: z.enum([
    'table_name',
    'column_name',
    'foreign_key',
    'example_value',
    'row_distribution',
    'documentation',
    'uploaded_mapping',
  ]),
  detail: z.string(),
  ref: z.string().optional(),
});

export const tableInsight = z.object({
  entityRef: z.string(),
  likelyPurpose: z.string(),
  likelyEntity: z.string(),
  classification: z.enum([
    'transaction',
    'lookup',
    'audit',
    'config',
    'archive',
    'core',
    'junction',
    'unknown',
  ]),
  importantFields: z.array(z.string()),
  certainty,
  evidence: z.array(evidence),
  needsUserConfirmation: z.boolean(),
});

export const sourceOverview = z.object({
  tables: z.array(tableInsight),
  suggestedJoinPaths: z.array(
    z.object({ from: z.string(), to: z.string(), via: z.string(), certainty }),
  ),
  areasRequiringConfirmation: z.array(z.string()),
});

export const mappingSuggestion = z.object({
  sourceField: z.string().nullable(),
  targetField: z.string(),
  mappingType: z.enum([
    'exact',
    'likely',
    'composite',
    'split',
    'lookup',
    'conditional',
    'derived',
    'unmapped',
  ]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  evidence: z.array(evidence),
  risks: z.array(z.string()),
  requiresHumanConfirmation: z.boolean(),
});

export const mappingSuggestions = z.object({
  mappings: z.array(mappingSuggestion),
  unmappedSources: z.array(z.string()),
  missingRequiredTargets: z.array(z.string()),
});

export const validationSuggestion = z.object({
  level: z.enum([
    'file',
    'schema',
    'record',
    'field',
    'cross_field',
    'cross_table',
    'batch',
    'destination',
  ]),
  ruleType: z.string(),
  fields: z.array(z.string()),
  params: z.record(z.unknown()),
  severity: z.enum(['reject', 'warn']),
  rationale: z.string(),
  certainty,
});

export const errorExplanation = z.object({
  plainEnglish: z.string(),
  probableCause: z.enum(['source', 'mapping', 'destination', 'infrastructure', 'data_quality']),
  suggestedActions: z.array(z.string()),
  affectedFields: z.array(z.string()).optional(),
  affectedRecordCount: z.number().optional(),
});

export const migrationOrder = z.object({
  sequence: z.array(
    z.object({
      entityRef: z.string(),
      order: z.number(),
      reason: z.string(),
      dependsOn: z.array(z.string()),
    }),
  ),
  certainty,
  evidence: z.array(evidence),
});

/** Registry mapping a task name to its output schema. */
export const TASK_SCHEMAS = {
  source_overview: sourceOverview,
  mapping: mappingSuggestions,
  validation: z.object({ rules: z.array(validationSuggestion) }),
  error_explanation: errorExplanation,
  migration_order: migrationOrder,
} as const;

export type AiTask = keyof typeof TASK_SCHEMAS;
export type TaskOutput<T extends AiTask> = z.infer<(typeof TASK_SCHEMAS)[T]>;
