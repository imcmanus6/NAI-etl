/**
 * @etl/auth — provider-agnostic authentication abstraction.
 *
 * The API depends on the {@link AuthProvider} interface, not a concrete
 * implementation, so an enterprise SSO/OIDC provider can drop in later without
 * touching call sites. The MVP ships a local email/password + JWT provider.
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { TenantId, UserId } from '@etl/shared-types';

export interface AuthClaims {
  sub: UserId;
  tenantId: TenantId;
  email: string;
  roles: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthProvider {
  readonly name: string;
  issueTokens(claims: AuthClaims): Promise<TokenPair>;
  verifyAccessToken(token: string): Promise<AuthClaims>;
}

/** Password hashing is separated so providers can share or override it. */
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly rounds = 12) {}
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }
  verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}

export interface LocalJwtConfig {
  secret: string;
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
}

export class LocalJwtAuthProvider implements AuthProvider {
  readonly name = 'local';
  constructor(private readonly config: LocalJwtConfig) {}

  async issueTokens(claims: AuthClaims): Promise<TokenPair> {
    const accessToken = jwt.sign(claims, this.config.secret, {
      expiresIn: this.config.accessTtlSeconds,
    });
    const refreshToken = jwt.sign({ sub: claims.sub, type: 'refresh' }, this.config.secret, {
      expiresIn: this.config.refreshTtlSeconds,
    });
    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<AuthClaims> {
    const decoded = jwt.verify(token, this.config.secret);
    if (typeof decoded === 'string') throw new Error('Invalid token payload');
    const { sub, tenantId, email, roles } = decoded as jwt.JwtPayload & AuthClaims;
    if (!sub || !tenantId) throw new Error('Missing required claims');
    return { sub, tenantId, email, roles: roles ?? [] };
  }
}

/** Factory chosen by AUTH_PROVIDER env. Extend with OIDC/SSO later. */
export function createAuthProvider(config: LocalJwtConfig, provider = 'local'): AuthProvider {
  switch (provider) {
    case 'local':
      return new LocalJwtAuthProvider(config);
    default:
      throw new Error(`Unknown auth provider "${provider}"`);
  }
}
