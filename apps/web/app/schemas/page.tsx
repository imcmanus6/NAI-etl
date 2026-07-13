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
  uploadFixedWidth,
  uploadSample,
  type Connection,
  type SchemaSummary,
} from '../../lib/api';

const SAMPLE_DDL = `CREATE TABLE customers (
  id integer PRIMARY KEY,
  acct_no varchar(20) NOT NULL,
  debtor_first_name varchar(100),
  dob date,
  bal numeric(12,2),
  status_cd varchar(4)
);`;

const SAMPLE_LAYOUT = `Record layout (paste your spec — tabular, position ranges, or COBOL copybook):
05 CUST-ID   PIC 9(6).
05 FIRST-NM  PIC X(15).
05 LAST-NM   PIC X(15).
05 BIRTH-DT  PIC 9(8).
05 BALANCE   PIC 9(8)V99.`;

const SAMPLE_FW = `000001JANE           DOE            19850412000010050
000002ROBERT         ROE            19901130000025000`;

type Mode = 'discover' | 'ddl' | 'dictionary' | 'sample' | 'fixedwidth';

export default function SchemasPage() {
  const [schemas, setSchemas] = useState<SchemaSummary[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [mode, setMode] = useState<Mode>('fixedwidth');
  const [name, setName] = useState('acme_feed');
  const [text, setText] = useState(SAMPLE_LAYOUT);
  const [fwSample, setFwSample] = useState(SAMPLE_FW);
  const [connectionId, setConnectionId] = useState('');
  const [format, setFormat] = useState<'csv' | 'json' | 'xml' | 'delimited'>('csv');
  const [delimiter, setDelimiter] = useState('pipe');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setSchemas(await listSchemas());
  }
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
    listConnections().then(setConnections).catch(() => undefined);
  }, []);

  function onModeChange(m: Mode) {
    setMode(m);
    if (m === 'ddl') setText(SAMPLE_DDL);
    else if (m === 'fixedwidth') setText(SAMPLE_LAYOUT);
    else if (m === 'dictionary') setText('entity,field,type,nullable,description\ncustomers,acct_no,varchar,no,Account number');
    else setText('');
  }

  async function submit() {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      let res: { schemaModelId: string; entities?: number; fields?: number; rowsSampled?: number };
      if (mode === 'discover') res = (await discoverSchema(connectionId)) as any;
      else if (mode === 'ddl') res = (await uploadDdl(name, text)) as any;
      else if (mode === 'dictionary') res = (await uploadDictionary(name, text)) as any;
      else if (mode === 'fixedwidth') res = (await uploadFixedWidth(name, text, fwSample || undefined)) as any;
      else res = (await uploadSample(name, format, text, format === 'delimited' ? { delimiter } : undefined)) as any;
      setMsg(
        `Created schema ${res.schemaModelId}` +
          (res.fields != null ? ` — ${res.fields} fields${res.rowsSampled ? `, ${res.rowsSampled} rows profiled` : ''}` : ` (${res.entities ?? '?'} entities)`),
      );
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const mainLabel =
    mode === 'ddl'
      ? 'DDL'
      : mode === 'dictionary'
        ? 'Dictionary CSV (entity,field,type,nullable,description)'
        : mode === 'fixedwidth'
          ? 'Record-layout documentation (tabular / position ranges / COBOL copybook)'
          : 'Sample content';

  return (
    <Shell title="Schemas" subtitle="Provide schemas by DB discovery, DDL, data dictionary, sample file, or a fixed-width layout derived from its documentation.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Add a schema</h3>
          <div className="field">
            <label>Intake method</label>
            <select value={mode} onChange={(e) => onModeChange(e.target.value as Mode)} style={selectStyle}>
              <option value="fixedwidth">Fixed-width — from documentation</option>
              <option value="sample">Sample file (CSV / JSON / XML / delimited)</option>
              <option value="ddl">Paste SQL DDL</option>
              <option value="dictionary">Paste data dictionary (CSV)</option>
              <option value="discover">Discover from DB connection</option>
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
                    <option key={c.id} value={c.id}>{c.name} ({c.connectorType})</option>
                  ))}
              </select>
              {connections.length === 0 && (
                <p className="subtle" style={{ fontSize: 13 }}>No connections yet — <Link href="/connections">create one</Link>.</p>
              )}
            </div>
          ) : (
            <>
              <div className="field">
                <label>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              {mode === 'sample' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Format</label>
                    <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} style={selectStyle}>
                      <option value="csv">CSV</option>
                      <option value="delimited">Delimited</option>
                      <option value="json">JSON</option>
                      <option value="xml">XML</option>
                    </select>
                  </div>
                  {format === 'delimited' && (
                    <div className="field" style={{ flex: 1 }}>
                      <label>Delimiter</label>
                      <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} style={selectStyle}>
                        <option value="pipe">Pipe (|)</option>
                        <option value="tab">Tab</option>
                        <option value="semicolon">Semicolon (;)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
              <div className="field">
                <label>{mainLabel}</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={mode === 'fixedwidth' ? 7 : 10} style={mono} />
              </div>
              {mode === 'fixedwidth' && (
                <div className="field">
                  <label>Optional data sample (rows to profile using the derived layout)</label>
                  <textarea value={fwSample} onChange={(e) => setFwSample(e.target.value)} rows={4} style={mono} />
                </div>
              )}
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
              <Link href={`/schemas/${s.id}`} style={{ fontWeight: 600 }}>{s.name}</Link>
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
const mono: React.CSSProperties = {
  width: '100%',
  fontFamily: 'monospace',
  fontSize: 13,
  padding: 10,
  borderRadius: 'var(--radius)',
  border: '1px solid var(--color-border)',
};
