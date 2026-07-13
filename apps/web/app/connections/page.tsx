'use client';

import { useEffect, useState } from 'react';
import { Shell } from '../components/Shell';
import { createConnection, listConnections, testConnection, type Connection } from '../../lib/api';

const CONNECTOR_TYPES = ['postgres', 'mysql', 'csv', 'json'];

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [name, setName] = useState('Northwind (Postgres)');
  const [kind, setKind] = useState<'source' | 'destination'>('source');
  const [connectorType, setConnectorType] = useState('postgres');
  const [configText, setConfigText] = useState('{\n  "host": "localhost",\n  "port": 5432,\n  "database": "northwind",\n  "schema": "public"\n}');
  const [secretRef, setSecretRef] = useState('conn/postgres/northwind');
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setConnections(await listConnections());
  }
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, []);

  async function create() {
    setError(null);
    try {
      const config = JSON.parse(configText);
      await createConnection({ name, kind, connectorType, config, secretRef: secretRef || undefined });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function test(id: string) {
    setTestResults((r) => ({ ...r, [id]: 'Testing…' }));
    try {
      const res = await testConnection(id);
      setTestResults((r) => ({ ...r, [id]: res.ok ? `✓ ${res.message}` : `✗ ${res.message}` }));
    } catch (e) {
      setTestResults((r) => ({ ...r, [id]: `✗ ${(e as Error).message}` }));
    }
  }

  return (
    <Shell title="Connections" subtitle="Define source and destination systems. Credentials are stored via the secrets abstraction — only a reference is kept here.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>New connection</h3>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Kind</label>
            <select value={kind} onChange={(e) => setKind(e.target.value as 'source' | 'destination')} style={selectStyle}>
              <option value="source">Source</option>
              <option value="destination">Destination</option>
            </select>
          </div>
          <div className="field">
            <label>Connector type</label>
            <select value={connectorType} onChange={(e) => setConnectorType(e.target.value)} style={selectStyle}>
              {CONNECTOR_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Config (JSON, non-secret only)</label>
            <textarea value={configText} onChange={(e) => setConfigText(e.target.value)} rows={6} style={mono} />
          </div>
          <div className="field">
            <label>Secret reference (resolved at execution)</label>
            <input value={secretRef} onChange={(e) => setSecretRef(e.target.value)} />
          </div>
          <button className="btn" onClick={create}>Create connection</button>
          {error && <p className="error">{error}</p>}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Existing</h3>
          {connections.length === 0 && <p className="subtle">None yet.</p>}
          {connections.map((c) => (
            <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{c.name}</strong>{' '}
                  <span className="badge">{c.connectorType}</span>{' '}
                  <span className="subtle" style={{ fontSize: 12 }}>{c.kind}</span>
                </div>
                <button className="btn" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => test(c.id)}>
                  Test
                </button>
              </div>
              {testResults[c.id] && <div className="subtle" style={{ fontSize: 13, marginTop: 4 }}>{testResults[c.id]}</div>}
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
