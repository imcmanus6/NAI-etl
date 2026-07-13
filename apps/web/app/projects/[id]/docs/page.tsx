'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shell } from '../../../components/Shell';
import { ProjectTabs } from '../../../components/ProjectTabs';
import {
  addProjectDoc,
  generateLayer,
  listProjectDocs,
  listSchemas,
  type GeneratedLayer,
  type ProjectDoc,
  type SchemaSummary,
} from '../../../../lib/api';

const SAMPLE_DICT = `Data dictionary (the AI reads this to understand cryptic field names):
cust_id = party identifier
first_nm = given name
last_nm = family name
birth_dt = date of birth
balance = current balance`;

export default function DocsPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const [docs, setDocs] = useState<ProjectDoc[]>([]);
  const [schemas, setSchemas] = useState<SchemaSummary[]>([]);
  const [title, setTitle] = useState('Source data dictionary');
  const [kind, setKind] = useState('data_dictionary');
  const [content, setContent] = useState(SAMPLE_DICT);
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [layer, setLayer] = useState<GeneratedLayer | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setDocs(await listProjectDocs(projectId));
  }
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
    listSchemas().then(setSchemas).catch(() => undefined);
  }, [projectId]);

  async function add() {
    setError(null);
    try {
      await addProjectDoc(projectId, { title, kind, content });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function generate() {
    if (!sourceId || !targetId) return;
    setBusy(true);
    setError(null);
    try {
      setLayer(await generateLayer(projectId, sourceId, targetId));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell title="Documentation & transformation layer" subtitle="Attach reference docs so the AI understands cryptic field names, then generate a complete draft layer (mappings + transforms + validations) in one step.">
      <ProjectTabs projectId={projectId} />
      {error && <p className="error">{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Attach documentation</h3>
          <div className="field">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label>Kind</label>
            <select value={kind} onChange={(e) => setKind(e.target.value)} style={sel}>
              <option value="data_dictionary">Data dictionary</option>
              <option value="record_layout">Record layout</option>
              <option value="business_rules">Business rules</option>
              <option value="reference">Reference</option>
            </select>
          </div>
          <div className="field">
            <label>Content (the AI extracts term → meaning pairs)</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} style={mono} />
          </div>
          <button className="btn" onClick={add}>Attach document</button>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Attached documents</h3>
          {docs.length === 0 && <p className="subtle" style={{ fontSize: 13 }}>None yet. Docs boost mapping accuracy on cryptic names.</p>}
          {docs.map((d) => (
            <div key={d.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <strong>{d.title}</strong> <span className="badge">{d.kind}</span>
              <div className="subtle" style={{ fontSize: 12, whiteSpace: 'pre-wrap', marginTop: 4 }}>{d.content.slice(0, 160)}{d.content.length > 160 ? '…' : ''}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Generate transformation layer</h3>
        <p className="subtle" style={{ fontSize: 13, marginTop: 0 }}>
          Uses the source schema + attached docs + target to propose mappings, value transformations and validations — all reviewable drafts, never code.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} style={sel}>
            <option value="">Source schema…</option>
            {schemas.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <span className="subtle">→</span>
          <select value={targetId} onChange={(e) => setTargetId(e.target.value)} style={sel}>
            <option value="">Target schema…</option>
            {schemas.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="btn" onClick={generate} disabled={busy || !sourceId || !targetId}>
            {busy ? 'Generating…' : 'Generate layer'}
          </button>
        </div>

        {layer && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <Stat label="Mappings" value={layer.summary.mappings} />
              <Stat label="Transformations" value={layer.summary.transformations} />
              <Stat label="Validations" value={layer.summary.validations} />
              <Stat label="Unmapped" value={layer.summary.unmappedSources} color="#d97706" />
              <Stat label="Missing required" value={layer.summary.missingRequiredTargets} color={layer.summary.missingRequiredTargets ? '#dc2626' : undefined} />
            </div>
            <p style={{ fontSize: 13 }}>
              Documentation terms used: <strong>{layer.docTermsUsed}</strong>. Review the drafts in{' '}
              <Link href={`/projects/${projectId}/mappings`}>Mappings</Link> and{' '}
              <Link href={`/projects/${projectId}/validations`}>Validations &amp; transforms</Link>, then{' '}
              <Link href={`/projects/${projectId}/test`}>run a test</Link>.
            </p>
            {layer.transformations.length > 0 && (
              <p className="subtle" style={{ fontSize: 12 }}>
                Proposed transforms: {layer.transformations.map((t) => `${t.targetField} [${t.steps.map((s) => s.kind).join(',')}]`).join(' · ')}
              </p>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="card" style={{ padding: '10px 16px', minWidth: 110 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: color ?? 'var(--color-text)' }}>{value}</div>
      <div className="subtle" style={{ fontSize: 12, margin: 0 }}>{label}</div>
    </div>
  );
}

const sel: React.CSSProperties = {
  padding: '9px 12px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  fontSize: 14,
  background: 'var(--color-surface)',
  minWidth: 180,
};
const mono: React.CSSProperties = {
  width: '100%',
  fontFamily: 'monospace',
  fontSize: 13,
  padding: 10,
  borderRadius: 'var(--radius)',
  border: '1px solid var(--color-border)',
};
