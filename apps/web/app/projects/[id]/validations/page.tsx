'use client';

import { useEffect, useState } from 'react';
import { Shell } from '../../../components/Shell';
import { ProjectTabs } from '../../../components/ProjectTabs';
import {
  decideConfigSuggestion,
  listSchemas,
  listTransformationSuggestions,
  listValidationSuggestions,
  suggestTransformations,
  suggestValidations,
  type ConfigSuggestion,
  type SchemaSummary,
} from '../../../../lib/api';

function StatusPill({ status }: { status: string }) {
  const color = status === 'accepted' ? '#16a34a' : status === 'rejected' ? '#dc2626' : 'var(--color-muted)';
  return <span style={{ color, fontWeight: 600, fontSize: 13 }}>{status}</span>;
}

export default function ValidationsPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const [schemas, setSchemas] = useState<SchemaSummary[]>([]);
  const [targetId, setTargetId] = useState('');
  const [validations, setValidations] = useState<ConfigSuggestion[]>([]);
  const [transforms, setTransforms] = useState<ConfigSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSchemas().then(setSchemas).catch((e) => setError(e.message));
    listValidationSuggestions(projectId).then(setValidations).catch(() => undefined);
    listTransformationSuggestions(projectId).then(setTransforms).catch(() => undefined);
  }, [projectId]);

  async function doSuggestValidations() {
    if (!targetId) return;
    setError(null);
    try {
      setValidations(await suggestValidations(projectId, targetId));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function doSuggestTransforms() {
    setError(null);
    try {
      setTransforms(await suggestTransformations(projectId));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function decide(list: 'v' | 't', s: ConfigSuggestion, decision: 'accepted' | 'rejected') {
    const setter = list === 'v' ? setValidations : setTransforms;
    setter((prev) => prev.map((x) => (x.id === s.id ? { ...x, status: decision } : x)));
    try {
      await decideConfigSuggestion(s.id, decision);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <Shell title="Validations & transformations" subtitle="AI proposes rules from target constraints and value transforms from mapping risks. Accept to add them to the draft.">
      <ProjectTabs projectId={projectId} />
      {error && <p className="error">{error}</p>}

      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ margin: 0 }}>Validation rules</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={targetId} onChange={(e) => setTargetId(e.target.value)} style={sel}>
              <option value="">Target schema…</option>
              {schemas.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button className="btn" onClick={doSuggestValidations} disabled={!targetId}>Suggest validations</button>
          </div>
        </div>
        <SuggestionTable
          rows={validations}
          columns={(s) => [s.ruleType ?? '', (s.fields ?? []).join(', '), s.severity ?? '', s.rationale ?? '']}
          headers={['Rule', 'Fields', 'Severity', 'Rationale']}
          onDecide={(s, d) => decide('v', s, d)}
        />
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Transformations</h3>
          <button className="btn" onClick={doSuggestTransforms}>Suggest from mapping risks</button>
        </div>
        <SuggestionTable
          rows={transforms}
          columns={(s) => [s.targetField ?? '', (s.steps ?? []).map((x) => x.kind).join(' → '), s.explanation ?? '']}
          headers={['Target field', 'Steps', 'Explanation']}
          onDecide={(s, d) => decide('t', s, d)}
        />
      </div>
    </Shell>
  );
}

function SuggestionTable({
  rows,
  columns,
  headers,
  onDecide,
}: {
  rows: ConfigSuggestion[];
  columns: (s: ConfigSuggestion) => string[];
  headers: string[];
  onDecide: (s: ConfigSuggestion, d: 'accepted' | 'rejected') => void;
}) {
  if (rows.length === 0) return <p className="subtle" style={{ fontSize: 13 }}>No suggestions yet.</p>;
  return (
    <div style={{ overflowX: 'auto', marginTop: 10 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: 'var(--color-muted)' }}>
            {headers.map((h) => (
              <th key={h} style={{ padding: '6px 8px', fontWeight: 500 }}>{h}</th>
            ))}
            <th style={{ padding: '6px 8px' }}>Decision</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id} style={{ borderTop: '1px solid var(--color-border)' }}>
              {columns(s).map((c, i) => (
                <td key={i} style={{ padding: '8px' }}>{i <= 1 ? <code>{c}</code> : c}</td>
              ))}
              <td style={{ padding: '8px' }}>
                {s.status === 'proposed' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={mini('#16a34a')} onClick={() => onDecide(s, 'accepted')}>Accept</button>
                    <button style={mini('#dc2626')} onClick={() => onDecide(s, 'rejected')}>Reject</button>
                  </div>
                ) : (
                  <StatusPill status={s.status} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const sel: React.CSSProperties = {
  padding: '9px 12px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  fontSize: 14,
  background: 'var(--color-surface)',
};
const mini = (bg: string): React.CSSProperties => ({
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '5px 10px',
  fontSize: 12,
  cursor: 'pointer',
});
