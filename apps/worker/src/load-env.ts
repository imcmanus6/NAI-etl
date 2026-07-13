/**
 * Loads the monorepo-root `.env` so the worker picks up local config
 * (DATABASE_URL, TEMPORAL_ADDRESS, S3_*, …) regardless of working directory.
 * Imported first in index.ts, before any module (e.g. the Prisma client) reads
 * process.env at load time.
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';

for (const candidate of [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')]) {
  config({ path: candidate });
}
