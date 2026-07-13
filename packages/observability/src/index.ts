/**
 * @etl/observability — structured logging (and a seam for tracing/metrics).
 *
 * Every log line from a worker/API handler should include the lineage tuple so
 * runs are traceable end-to-end. Use {@link createLogger} with a bound context.
 */
import pino from 'pino';

export type LogContext = Record<string, unknown>;

const base = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  // Pretty printing is opt-in for local dev to avoid a hard transport dep.
  redact: {
    // Never log secrets or raw credentials.
    paths: ['password', '*.password', 'secret', '*.secret', 'secrets', '*.secrets', 'token', '*.token'],
    censor: '[redacted]',
  },
});

export type Logger = pino.Logger;

export function createLogger(context: LogContext = {}): Logger {
  return base.child(context);
}

export const logger = base;
