/**
 * @etl/secrets — secrets-management abstraction.
 *
 * Connection credentials are NEVER stored in the control DB. The DB holds only
 * an opaque `secretRef`; workers resolve the real values at execution time
 * through a {@link SecretsProvider}.
 *
 *   env  -> dev-only, reads from process.env (SECRET_<REF>)
 *   aws  -> AWS Secrets Manager (interface stubbed; wire the SDK in deployment)
 */

/** An opaque pointer to a secret, e.g. "conn/postgres/northwind". */
export type SecretRef = string;

export interface SecretsProvider {
  readonly name: string;
  /** Resolve a secret ref to its key/value pairs (e.g. { user, password }). */
  resolve(ref: SecretRef): Promise<Record<string, string>>;
  /** Store/rotate a secret; returns the ref. */
  put(ref: SecretRef, value: Record<string, string>): Promise<SecretRef>;
}

/**
 * Dev provider. Looks up `SECRET_<SANITISED_REF>` in the environment, expecting
 * a JSON object. Never use in production.
 */
export class EnvSecretsProvider implements SecretsProvider {
  readonly name = 'env';
  private readonly mem = new Map<string, Record<string, string>>();

  async resolve(ref: SecretRef): Promise<Record<string, string>> {
    if (this.mem.has(ref)) return this.mem.get(ref)!;
    const key = 'SECRET_' + ref.replace(/[^A-Za-z0-9]/g, '_').toUpperCase();
    const raw = process.env[key];
    if (!raw) throw new Error(`Secret "${ref}" not found (env ${key})`);
    return JSON.parse(raw) as Record<string, string>;
  }

  async put(ref: SecretRef, value: Record<string, string>): Promise<SecretRef> {
    this.mem.set(ref, value);
    return ref;
  }
}

/**
 * AWS Secrets Manager provider. The SDK call is intentionally left as a seam so
 * the package stays dependency-free until deployment wires it in.
 */
export class AwsSecretsManagerProvider implements SecretsProvider {
  readonly name = 'aws';
  constructor(private readonly region: string) {}

  async resolve(_ref: SecretRef): Promise<Record<string, string>> {
    throw new Error(
      'AwsSecretsManagerProvider.resolve not wired. Add @aws-sdk/client-secrets-manager in deployment.',
    );
  }

  async put(_ref: SecretRef, _value: Record<string, string>): Promise<SecretRef> {
    throw new Error('AwsSecretsManagerProvider.put not wired.');
  }
}

export function createSecretsProvider(provider = 'env', region = 'eu-west-2'): SecretsProvider {
  switch (provider) {
    case 'env':
      return new EnvSecretsProvider();
    case 'aws':
      return new AwsSecretsManagerProvider(region);
    default:
      throw new Error(`Unknown secrets provider "${provider}"`);
  }
}
