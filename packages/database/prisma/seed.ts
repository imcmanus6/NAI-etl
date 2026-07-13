/**
 * Seed a demo tenant so the app is usable immediately after setup.
 *
 * Creates: one white-label tenant, an admin role + user, a demo customer, and
 * dev/staging/production environments. The admin password is `demo1234!` —
 * change it before any real use.
 */
import { PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';

const prisma = new PrismaClient();

// NOTE: dev-only hashing. The real API uses the @etl/auth password hasher
// (argon2/bcrypt). This keeps the seed dependency-free.
const devHash = (pw: string) => 'devsha256:' + createHash('sha256').update(pw).digest('hex');

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      slug: 'demo',
      name: 'Demo Tenant',
      whiteLabel: {
        productName: 'Acme DataBridge',
        logoUrl: null,
        domain: 'localhost',
        supportEmail: 'support@example.com',
        supportUrl: null,
        terminologyOverrides: {},
        enabledConnectors: ['postgres', 'mysql', 'csv', 'json'],
        enabledModules: ['integration', 'migration'],
        theme: {
          colorPrimary: '#2563eb',
          colorAccent: '#7c3aed',
          colorBackground: '#ffffff',
          colorSurface: '#f8fafc',
          colorText: '#0f172a',
          fontFamily: 'Inter, system-ui, sans-serif',
          borderRadius: '8px',
        },
      },
      aiSettings: {
        provider: 'anthropic',
        defaultModel: 'claude-opus-4-8',
        mappingModel: 'claude-sonnet-5',
        redactPii: true,
        shareSampleValues: false,
      },
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'admin' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'admin',
      permissions: ['*'],
    },
  });

  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@example.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@example.com',
      displayName: 'Demo Admin',
      passwordHash: devHash('demo1234!'),
    },
  });

  await prisma.membership.create({
    data: { userId: admin.id, roleId: adminRole.id },
  }).catch(() => undefined); // ignore if already present

  await prisma.customer.upsert({
    where: { id: `${tenant.id}-seed-customer` },
    update: {},
    create: {
      id: `${tenant.id}-seed-customer`,
      tenantId: tenant.id,
      name: 'Northwind Ltd',
    },
  });

  for (const name of ['development', 'staging', 'production']) {
    await prisma.environment.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name } },
      update: {},
      create: { tenantId: tenant.id, name },
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seeded demo tenant. Login: admin@example.com / demo1234!');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
