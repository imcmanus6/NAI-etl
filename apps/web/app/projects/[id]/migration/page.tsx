'use client';

import { useEffect, useState } from 'react';
import { Shell } from '../../../components/Shell';
import { ProjectTabs } from '../../../components/ProjectTabs';
import { buildMigrationPlan, getMigrationPlan, listSchemas, type MigrationPlan, type SchemaSummary } from '../../../../lib/api';

interface Row {
  entity: string;
  order: number;
  wave: number;
  dependsOn: string[];
  reason?: string;
}

export default function MigrationPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const [schemas, setSchemas] = useState<SchemaSummary[]>([]);
  const [schemaId, setSchemaId] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSchemas().then(setSchemas).catch((e) => setError(e.message));
    getMigrationPlan(projectId)
      .then((p) => {
        if (p) setRows(p.entities.map((e) => ({ entity: e.entityName, order: e.sequence, wave: e.wave, dependsOn: e.dependsOn })));
      })
      .catch(() => undefined);
  }, [projectId]);

  async function build() {
    if (!schemaId) return;
    setError(null);
    try {
      const plan: MigrationPlan = await buildMigrationPlan(projectId, schemaId);
      setRows(plan.sequence);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const waves = [...new Set(rows.map((r) => r.wave))].sort((a, b) => a - b);

  return (
    <Shell title="Migration plan" subtitle="AI sequences entities by foreign-key dependencies so parents load before children. Review and adjust before running.">
      <ProjectTabs projectId={projectId} />
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={schemaId} onChange={(e) => setSchemaId(e.target.value)} style={sel}>
            <option value="">Source schema…</option>
            {schemas.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button className="btn" onClick={build} disabled={!schemaId}>Sequence entities</button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>

      {rows.length > 0 && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {waves.map((w) => (
            <div className="card" key={w} style={{ flex: '1 1 220px' }}>
              <h3 style={{ marginTop: 0 }}>Wave {w}</h3>
              {rows.filter((r) => r.wave === w).map((r) => (
                <div key={r.entity} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <div><span className="step-num" style={{ display: 'inline-grid', width: 22, height: 22, fontSize: 12 }}>{r.order}</span>{' '}<strong>{r.entity}</strong></div>
                  {r.dependsOn.length > 0 && (
                    <div className="subtle" style={{ fontSize: 12, marginTop: 2 }}>depends on {r.dependsOn.join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

const sel: React.CSSProperties = {
  padding: '9px 12px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  fontSize: 14,
  background: 'var(--color-surface)',
};
