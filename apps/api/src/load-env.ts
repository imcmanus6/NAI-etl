/**
 * Loads the monorepo-root `.env` so the app picks up local config (API_PORT,
 * DATABASE_URL, TEMPORAL_ADDRESS, …) no matter which directory `pnpm dev` /
 * turbo / a built run starts it from.
 *
 * MUST be imported before any module that reads process.env at load time (e.g.
 * the Prisma client). dotenv never overrides already-set vars, so a real shell
 * environment variable still wins over the file.
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';

// Cover both common working directories: repo root (built runs) and the app
// dir (pnpm --filter / turbo). A missing file is a silent no-op.
for (const candidate of [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')]) {
  config({ path: candidate });
}
