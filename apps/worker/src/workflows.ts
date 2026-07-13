/**
 * Temporal workflows (Deliverable 10, implemented).
 *
 * Workflows are DETERMINISTIC: no direct I/O, clocks, or randomness. They
 * orchestrate activities (declared in ./activities) via proxyActivities. Human
 * approval is modelled with signals; progress via queries.
 *
 * This file is bundled and run in Temporal's isolated workflow sandbox — it may
 * only import other deterministic modules (types/constants), never Node APIs.
 */
import { proxyActivities, defineSignal, defineQuery, setHandler, condition } from '@temporalio/workflow';
import type { LineageContext, RunMetrics } from '@etl/shared-types';
import type { MappingSet } from '@etl/mapping-engine';
import type { ValidationSet } from '@etl/validation-engine';
import { SIGNALS, QUERIES } from '@etl/workflow-definitions';
import type * as activities from './activities.js';

const acts = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 minutes',
  retry: { maximumAttempts: 3 },
});

// --- Signals & queries ------------------------------------------------------

export const cancelSignal = defineSignal(SIGNALS.cancel);
export const approvalSignal = defineSignal<[{ decision: 'approved' | 'changes_requested'; approverId: string }]>(
  SIGNALS.submitApproval,
);
export const getStatusQuery = defineQuery<{ stage: string; done: boolean }>(QUERIES.getStatus);

// --- schemaIntakeWorkflow ---------------------------------------------------

export async function schemaIntakeWorkflow(input: { lineage: LineageContext; connectionId: string }) {
  let stage = 'discovering';
  setHandler(getStatusQuery, () => ({ stage, done: stage === 'complete' }));

  const test = await acts.testConnection({ lineage: input.lineage, connectionId: input.connectionId });
  if (!test.ok) throw new Error(`Connection failed: ${test.message}`);

  const discovered = await acts.discoverSchema({ lineage: input.lineage, connectionId: input.connectionId });
  stage = 'complete';
  return discovered;
}

// --- testRunWorkflow --------------------------------------------------------

export async function testRunWorkflow(input: {
  lineage: LineageContext;
  records: Record<string, unknown>[];
  mappingSet: MappingSet;
  validationSet: ValidationSet;
  targetCount?: number;
}) {
  let stage = 'transforming';
  setHandler(getStatusQuery, () => ({ stage, done: stage === 'complete' }));

  const tv = await acts.transformAndValidate({
    lineage: input.lineage,
    records: input.records,
    mappingSet: input.mappingSet,
    validationSet: input.validationSet,
  });

  stage = 'reconciling';
  const recon = await acts.reconcileCounts({
    lineage: input.lineage,
    sourceCount: input.records.length,
    targetCount: input.targetCount ?? tv.accepted,
  });

  stage = 'complete';
  const metrics: Partial<RunMetrics> = {
    sourceRecords: input.records.length,
    acceptedRecords: tv.accepted,
    rejectedRecords: tv.rejected,
  };
  await acts.notify({ lineage: input.lineage, event: 'test_run.completed', detail: { ...metrics } });
  return { metrics, reconciliation: recon, rejects: tv.rejects };
}

// --- productionRunWorkflow (approval-gated skeleton) ------------------------

export async function productionRunWorkflow(input: {
  lineage: LineageContext;
  records: Record<string, unknown>[];
  mappingSet: MappingSet;
  validationSet: ValidationSet;
}) {
  let approved = false;
  setHandler(approvalSignal, (decision) => {
    approved = decision.decision === 'approved';
  });

  // Wait for an explicit human approval signal before any production write.
  await condition(() => approved, '7 days');
  if (!approved) throw new Error('Production run not approved within window');

  return testRunWorkflow(input);
}
