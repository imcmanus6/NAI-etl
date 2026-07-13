/**
 * Worker host. Connects to Temporal, registers workflows + activities, and
 * polls the task queue. In production this is split into one worker per stage
 * (see docs/WORKFLOWS.md); the MVP runs a single worker on the main queue.
 */
import './load-env.js'; // must be first — populates process.env from the root .env
import { NativeConnection, Worker } from '@temporalio/worker';
import { TASK_QUEUES } from '@etl/workflow-definitions';
import { createLogger } from '@etl/observability';
import * as activities from './activities.js';

const log = createLogger({ component: 'worker' });

async function run() {
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233',
  });

  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE ?? 'default',
    taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? TASK_QUEUES.main,
    // Resolves ./workflows.ts in dev (tsx) and ./workflows.js after build.
    workflowsPath: require.resolve('./workflows'),
    activities,
  });

  log.info({ taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? TASK_QUEUES.main }, 'worker started');
  await worker.run();
}

run().catch((err) => {
  log.error({ err }, 'worker crashed');
  process.exit(1);
});
