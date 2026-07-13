/**
 * @etl/database — control DB access.
 *
 * Exposes a singleton PrismaClient plus the generated types. Tenant scoping is
 * enforced at the service layer (see @etl/tenancy) and by Postgres RLS.
 */
export * from '@prisma/client';
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __etlPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__etlPrisma ??
  new PrismaClient({
    log: process.env.LOG_LEVEL === 'debug' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__etlPrisma = prisma;
}
