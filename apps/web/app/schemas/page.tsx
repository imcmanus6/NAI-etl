'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shell } from '../components/Shell';
import {
  discoverSchema,
  listConnections,
  listSchemas,
  uploadDdl,
  uploadDictionary,
  uploadSample,
  type Connection,
  type SchemaSummary,
} from '../../lib/api';

const SAMPLE_DDL = `CREATE TABLE customers (
  id integer PRIMARY KEY,
  acct_no varchar(20) NOT NULL,
  debtor_first_name varchar(100),
  debtor_last_name varchar(100),
  dob date,
  bal numeric(12,2),
  status_cd varchar(4)
);`;

type Mode = 'discover' | 'ddl' | 'dictionary' | 'sample';

export default function SchemasPage() {
  const [schemas, setSchemas] = useState<SchemaSummary[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [mode, setMode] = useState<Mode>('ddl');
  const [name, setName] = useState('sample_source');
  const [text, setText] = useState(SAMPLE_DDL);
  const [connectionId, setConnectionId] = useState('');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setSchemas(await listSchemas());
  }
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
    listConnections()
      .then(setConnections)
      .catch(() => undefined);
  }, []);

  async function submit() {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      let res: { schemaModelId: string; entities?: number };
      if (mode === 'discover') res = (await discoverSchema(connectionId)) as any;
      else if (mode === 'ddl') res = (await uploadDdl(name, text)) as any;
      else if (mode === 'dictionary') res = (await uploadDictionary(name, text)) as any;
      else res = (await uploadSample(name, format, text)) as any;
      setMsg(`Created schema ${res.schemaModelId} (${res.entities ?? '?'} entities)`);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell title="Schemas" subtitle="Provide source or target schemas by DB discovery, DDL, data dictionary, or sample file.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Add a schema</h3>
          <div className="field">
            <label>Intake method</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} style={selectStyle}>
              <option value="discover">Discover from DB connection</option>
              <option value="ddl">Paste SQL DDL</option>
              <option value="dictionary">Paste data dictionary (CSV)</option>
              <option value="sample">Paste sample file (CSV/JSON)</option>
            </select>
          </div>

          {mode === 'discover' ? (
            <div className="field">
              <label>Connection</label>
              <select value={connectionId} onChange={(e) => setConnectionId(e.target.value)} style={selectStyle}>
                <option value="">Select a source connection…</option>
                {connections
                  .filter((c) => ['postgres', 'mysql'].includes(c.connectorType))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.connectorType})
                    </option>
                  ))}
              </select>
              {connections.length === 0 && (
                <p className="subtle" style={{ fontSize: 13 }}>
                  No connections yet — <Link href="/connections">create one</Link>.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="field">
                <label>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              {mode === 'sample' && (
                <div className="field">
                  <label>Format</label>
                  <select value={format} onChange={(e) => setFormat(e.target.value as 'csv' | 'json')} style={selectStyle}>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
              )}
              <div className="field">
                <label>{mode === 'ddl' ? 'DDL' : mode === 'dictionary' ? 'Dictionary CSV (entity,field,type,nullable,description)' : 'Sample content'}</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, padding: 10, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
                />
              </div>
            </>
          )}

          <button className="btn" onClick={submit} disabled={busy}>
            {busy ? 'Working…' : 'Ingest schema'}
          </button>
          {msg && <p style={{ color: 'var(--color-primary)', fontSize: 13 }}>{msg}</p>}
          {error && <p className="error">{error}</p>}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Your schemas</h3>
          {schemas.length === 0 && <p className="subtle">None yet.</p>}
          {schemas.map((s) => (
            <div key={s.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
              <Link href={`/schemas/${s.id}`} style={{ fontWeight: 600 }}>
                {s.name}
              </Link>
              <div className="subtle" style={{ fontSize: 12, margin: 0 }}>
                <span className="badge">{s.intakeMethod}</span> · {new Date(s.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  fontSize: 14,
  background: 'var(--color-surface)',
};
