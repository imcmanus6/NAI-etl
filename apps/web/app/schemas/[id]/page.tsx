'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shell } from '../../components/Shell';
import { getSchema, snapshotSchema, type Entity, type Field, type SchemaDetail } from '../../../lib/api';

function piiBadge(field: Field) {
  const pii = field.annotations?.pii;
  if (!pii || pii === 'none') return null;
  return (
    <span className="badge" style={{ background: 'rgba(220,38,38,0.12)', color: '#dc2626' }}>
      PII: {pii}
    </span>
  );
}

function keyBadge(field: Field) {
  if (field.isPrimaryKey) return <span className="badge">PK</span>;
  if (field.isForeignKey) return <span className="badge">FK</span>;
  return null;
}

function EntityCard({ entity }: { entity: Entity }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ margin: 0 }}>
          {entity.name} <span className="subtle" style={{ fontSize: 13 }}>({entity.kind})</span>
        </h3>
        <span className="subtle" style={{ fontSize: 12 }}>
          {entity.estimatedRowCount != null ? `~${entity.estimatedRowCount.toLocaleString()} rows` : ''}
        </span>
      </div>
      {entity.inferredPurpose && <p className="subtle" style={{ marginTop: 4 }}>{entity.inferredPurpose}</p>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--color-muted)' }}>
              <th style={th}>Field</th>
              <th style={th}>Type</th>
              <th style={th}>Keys</th>
              <th style={th}>Null%</th>
              <th style={th}>Distinct</th>
              <th style={th}>Flags</th>
            </tr>
          </thead>
          <tbody>
            {entity.fields.map((f) => (
              <tr key={f.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                <td style={td}>{f.name}</td>
                <td style={td}>
                  <code>{f.dataType}</code>
                  {f.nativeType && f.nativeType !== f.dataType && (
                    <span className="subtle" style={{ fontSize: 11 }}> ({f.nativeType})</span>
                  )}
                </td>
                <td style={td}>{keyBadge(f)}</td>
                <td style={td}>{f.profile?.nullRate != null ? `${Math.round(f.profile.nullRate * 100)}%` : '—'}</td>
                <td style={td}>{f.profile?.distinctCount ?? '—'}</td>
                <td style={td}>
                  {piiBadge(f)}
                  {f.annotations?.isLikelyIdentifier && <span className="badge">id</span>}
                  {f.annotations?.detectedFormat && (
                    <span className="badge">{f.annotations.detectedFormat}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SchemaDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [detail, setDetail] = useState<SchemaDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snap, setSnap] = useState<string | null>(null);

  useEffect(() => {
    getSchema(id)
      .then(setDetail)
      .catch((e) => setError(e.message));
  }, [id]);

  async function doSnapshot() {
    try {
      const res = (await snapshotSchema(id)) as { checksum: string };
      setSnap(`Snapshot created (checksum ${res.checksum.slice(0, 12)}…)`);
    } catch (e) {
      setSnap(`Snapshot failed: ${(e as Error).message}`);
    }
  }

  const model = detail?.model;

  return (
    <Shell title={detail?.name ?? 'Schema'} subtitle={model ? `${model.intakeMethod} · ${model.entities.length} entities · ${model.relationships.length} relationships` : undefined}>
      {error && <p className="error">{error}</p>}
      {model && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            <Link className="btn" href={`/schemas/${id}/overview`}>
              AI source understanding →
            </Link>
            <button className="btn" style={{ background: 'var(--color-accent)' }} onClick={doSnapshot}>
              Create snapshot
            </button>
          </div>
          {snap && <p className="subtle">{snap}</p>}

          {model.relationships.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginTop: 0 }}>Relationships</h3>
              {model.relationships.map((r) => (
                <div key={r.id} style={{ fontSize: 13, padding: '4px 0' }}>
                  <code>
                    {r.fromEntityId}.{r.fromFields.join(',')} → {r.toEntityId}.{r.toFields.join(',')}
                  </code>{' '}
                  <span className="badge">{r.declared ? 'declared FK' : 'inferred'}</span>{' '}
                  <span className="subtle" style={{ fontSize: 12 }}>{r.certainty}</span>
                </div>
              ))}
            </div>
          )}

          {model.entities.map((e) => (
            <EntityCard key={e.id} entity={e} />
          ))}
        </>
      )}
    </Shell>
  );
}

const th: React.CSSProperties = { padding: '6px 8px', fontWeight: 500 };
const td: React.CSSProperties = { padding: '6px 8px', verticalAlign: 'top' };
