/**
 * @etl/storage — S3-compatible object storage (MinIO locally, S3 in cloud).
 *
 * Holds uploaded source files, samples, generated outputs, rejected-record
 * files, validation reports, schema snapshots, reconciliation files. The
 * control DB stores only keys + checksums, never large payloads.
 */
import { createHash } from 'node:crypto';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface StorageConfig {
  endpoint: string;
  region: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  forcePathStyle: boolean;
}

export function loadStorageConfig(env = process.env): StorageConfig {
  return {
    endpoint: env.S3_ENDPOINT ?? 'http://localhost:9000',
    region: env.S3_REGION ?? 'us-east-1',
    bucket: env.S3_BUCKET ?? 'etl-platform',
    accessKey: env.S3_ACCESS_KEY ?? 'minioadmin',
    secretKey: env.S3_SECRET_KEY ?? 'minioadmin',
    forcePathStyle: (env.S3_FORCE_PATH_STYLE ?? 'true') === 'true',
  };
}

export class ObjectStore {
  private readonly client: S3Client;
  constructor(private readonly config: StorageConfig) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: config.forcePathStyle,
      credentials: { accessKeyId: config.accessKey, secretAccessKey: config.secretKey },
    });
  }

  /** Deterministic key layout keeps objects traceable to their lineage. */
  static key(parts: {
    tenantId: string;
    kind: 'upload' | 'sample' | 'output' | 'reject' | 'report' | 'snapshot' | 'recon';
    projectId?: string;
    runId?: string;
    filename: string;
  }): string {
    const segs = [parts.tenantId, parts.kind, parts.projectId, parts.runId, parts.filename].filter(
      Boolean,
    );
    return segs.join('/');
  }

  async putObject(key: string, body: Buffer | Uint8Array | string): Promise<{ key: string; checksum: string }> {
    const checksum = createHash('sha256').update(body).digest('hex');
    await this.client.send(
      new PutObjectCommand({ Bucket: this.config.bucket, Key: key, Body: body }),
    );
    return { key, checksum };
  }

  async getObject(key: string): Promise<Uint8Array> {
    const res = await this.client.send(
      new GetObjectCommand({ Bucket: this.config.bucket, Key: key }),
    );
    return res.Body!.transformToByteArray();
  }

  /** Presigned URL for direct browser upload/download (keeps big files off the API). */
  async presignPut(key: string, expiresIn = 900): Promise<string> {
    return getSignedUrl(this.client, new PutObjectCommand({ Bucket: this.config.bucket, Key: key }), {
      expiresIn,
    });
  }

  async presignGet(key: string, expiresIn = 900): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.config.bucket, Key: key }), {
      expiresIn,
    });
  }
}
