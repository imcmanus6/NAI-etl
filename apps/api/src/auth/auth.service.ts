import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { BcryptPasswordHasher, createAuthProvider, type AuthProvider } from '@etl/auth';
import { prisma } from '@etl/database';

@Injectable()
export class AuthService {
  private readonly provider: AuthProvider;
  private readonly hasher = new BcryptPasswordHasher();

  constructor() {
    this.provider = createAuthProvider(
      {
        secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
        accessTtlSeconds: Number(process.env.JWT_ACCESS_TTL ?? 900),
        refreshTtlSeconds: Number(process.env.JWT_REFRESH_TTL ?? 2592000),
      },
      process.env.AUTH_PROVIDER ?? 'local',
    );
  }

  /** Verify a password against either a bcrypt hash or the dev seed hash. */
  private async verifyPassword(plain: string, hash: string): Promise<boolean> {
    if (hash.startsWith('devsha256:')) {
      return hash === 'devsha256:' + createHash('sha256').update(plain).digest('hex');
    }
    return this.hasher.verify(plain, hash);
  }

  async login(email: string, password: string, tenantSlug = 'demo') {
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new UnauthorizedException('Invalid credentials');

    const user = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email } },
    });
    if (!user || !user.passwordHash || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const ok = await this.verifyPassword(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const memberships = await prisma.membership.findMany({
      where: { userId: user.id },
      include: { role: true },
    });
    const roles = memberships.map((m) => m.role.name);

    const tokens = await this.provider.issueTokens({
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roles,
    });
    return { ...tokens, user: { id: user.id, email: user.email, displayName: user.displayName, roles } };
  }

  verifyAccessToken(token: string) {
    return this.provider.verifyAccessToken(token);
  }
}
