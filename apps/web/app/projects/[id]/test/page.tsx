'use client';

import { useEffect, useState } from 'react';
import { Shell } from '../../../components/Shell';
import { ProjectTabs } from '../../../components/ProjectTabs';
import { listConnections, runTest, type Connection, type TestRunResult } from '../../../../lib/api';

const DEFAULT_JSON = JSON.stringify(
  [
    { id: 1, debtor_first_name: 'Jane', debtor_last_name: 'Doe', dob: '1985-04-12', bal: '100.50', email: 'jane@acme.com', status_cd: 'ACT' },
    { id: 2, debtor_first_name: 'Bob', debtor_last_name: 'Roe', dob: '1990-11-30', bal: '250.00', email: 'bob@acme.com', status_cd: 'INA' },
  ],
  null,
  2,
);

/** Minimal CSV/delimited parser (auto-detects comma vs pipe vs tab). */
function parseDelimited(text: string): Record<string, unknown>[] {
  const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.length > 0);
  if (lines.length < 2) return [];
  const head = lines[0];
  const delim = (head.match(/\|/g)?.length ?? 0) > (head.match(/,/g)?.length ?? 0) ? '|' : (head.includes('\t') ? '\t' : ',');
  const parseLine = (line: string) => {
    const out: string[] = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) {
        if (c === '"') {
          if (line[i + 1] === '"') { cur += '"'; i++; } else q = false;
        } else cur += c;
      } else if (c === '"') q = true;
      else if (c === delim) { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur);
    return out;
  };
  const headers = parseLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((l) => {
    const cells = parseLine(l);
    const r: Record<string, unknown> = {};
    headers.forEach((h, i) => (r[h] = (cells[i] ?? '').trim()));
    return r;
  });
}

function Tile({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="card" style={{ padding: '12px 16px', minWidth: 118 }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? 'var(--color-text)' }}>{value}</div>
      <div className="subtle" style={{ fontSize: 12, margin: 0 }}>{label}</div>
    </div>
  );
}

export default function TestPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [sample, setSample] = useState(DEFAULT_JSON);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [deliverConnId, setDeliverConnId] = useState('');
  const [result, setResult] = useState<TestRunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listConnections()
      .then((c) => setConnections(c.filter((x) => x.kind === 'destination')))
      .catch(() => undefined);
  }, []);

  function recordsFromInput(): Record<string, unknown>[] {
    return format === 'csv' ? parseDelimited(sample) : (JSON.parse(sample) as Record<string, unknown>[]);
  }

  async function run(deliver: boolean) {
    setBusy(true);
    setError(null);
    try {
      const records = recordsFromInput();
      setResult(await runTest(projectId, records, deliver && deliverConnId ? { deliverToConnectionId: deliverConnId } : undefined));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((t) => {
      setSample(t);
      setFormat(file.name.toLowerCase().endsWith('.json') ? 'json' : 'csv');
    });
  }

  function downloadCsv() {
    if (!result?.csvOutput) return;
    const blob = new Blob([result.csvOutput], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mapped-output-${projectId.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const targetKeys = result?.preview.length ? Object.keys(result.preview[0].target) : [];

  return (
    <Shell title="Test run" subtitle="Map → transform → validate sample data, then download a Lateral-format CSV or deliver it to the API. Deterministic; iterate here.">
      <ProjectTabs projectId={projectId} />

      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          <label className="subtle" style={{ fontSize: 13 }}>Input</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as 'json' | 'csv')} style={sel}>
            <option value="json">JSON array</option>
            <option value="csv">CSV / delimited</option>
          </select>
          <input type="file" accept=".csv,.txt,.tsv,.json" onChange={onFile} style={{ fontSize: 13 }} />
        </div>
        <textarea
          value={sample}
          onChange={(e) => setSample(e.target.value)}
          rows={8}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 12, padding: 10, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
        />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 10 }}>
          <button className="btn" onClick={() => run(false)} disabled={busy}>
            {busy ? 'Running…' : 'Run mapping'}
          </button>
          <span className="subtle" style={{ fontSize: 13 }}>then:</span>
          <select value={deliverConnId} onChange={(e) => setDeliverConnId(e.target.value)} style={sel}>
            <option value="">Deliver to… (destination)</option>
            {connections.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.connectorType})</option>
            ))}
          </select>
          <button className="btn" style={{ background: 'var(--color-accent)' }} onClick={() => run(true)} disabled={busy || !deliverConnId}>
            Run &amp; deliver via API
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>

      {result && (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18, alignItems: 'stretch' }}>
            <Tile label="Source" value={result.metrics.sourceRecords} />
            <Tile label="Accepted" value={result.metrics.acceptedRecords} color="#16a34a" />
            <Tile label="Rejected" value={result.metrics.rejectedRecords} color="#dc2626" />
            <Tile label="Warnings" value={result.metrics.warnings} color="#d97706" />
            <div className="card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
              <button className="btn" onClick={downloadCsv} disabled={!result.csvOutput}>
                ↓ Download mapped CSV ({result.outputRecords})
              </button>
              <span className="subtle" style={{ fontSize: 11, margin: 0 }}>Lateral-format, target-ready rows</span>
            </div>
          </div>

          {result.delivery && (
            <div className="card" style={{ marginBottom: 18, borderColor: result.delivery.failed === 0 ? '#86efac' : '#fca5a5' }}>
              <h3 style={{ marginTop: 0 }}>Delivery</h3>
              <p style={{ margin: 0, fontSize: 14 }}>
                Sent to destination · <strong style={{ color: '#16a34a' }}>{result.delivery.created} created</strong>
                {result.delivery.failed > 0 && <span style={{ color: '#dc2626' }}> · {result.delivery.failed} failed</span>}
                {result.delivery.skipped > 0 && <span className="subtle"> · {result.delivery.skipped} skipped</span>}
              </p>
              {result.delivery.errors.length > 0 && (
                <pre style={{ fontSize: 12, color: '#dc2626', whiteSpace: 'pre-wrap' }}>{JSON.stringify(result.delivery.errors, null, 2)}</pre>
              )}
            </div>
          )}

          <div className="card" style={{ marginBottom: 18, borderColor: result.reconciliation.passed ? '#86efac' : '#fca5a5' }}>
            <h3 style={{ marginTop: 0 }}>Reconciliation</h3>
            <p style={{ margin: 0, fontSize: 14 }}>
              Source <strong>{result.reconciliation.sourceCount}</strong> → target-ready{' '}
              <strong>{result.reconciliation.targetReadyCount}</strong> · {result.reconciliation.rejected} rejected ·{' '}
              <span style={{ color: result.reconciliation.passed ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                {result.reconciliation.passed ? 'PASSED' : 'FAILED'}
              </span>
            </p>
          </div>

          <div className="card" style={{ marginBottom: 18 }}>
            <h3 style={{ marginTop: 0 }}>AI error explanation</h3>
            <p style={{ fontSize: 14 }}>
              <span className="badge">{result.explanation.probableCause}</span> {result.explanation.plainEnglish}
            </p>
            <ul style={{ fontSize: 13, color: 'var(--color-muted)' }}>
              {result.explanation.suggestedActions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

          {result.rejects.length > 0 && (
            <div className="card" style={{ marginBottom: 18 }}>
              <h3 style={{ marginTop: 0 }}>Rejected records ({result.rejects.length})</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--color-muted)' }}>
                      <th style={th}>Record</th><th style={th}>Failing rule</th><th style={th}>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rejects.map((r) => (
                      <tr key={r.recordKey} style={{ borderTop: '1px solid var(--color-border)' }}>
                        <td style={td}>#{r.recordKey}</td>
                        <td style={td}><code>{r.failingRule}</code></td>
                        <td style={{ ...td, color: '#dc2626' }}>{r.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Mapped output (first {result.preview.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--color-muted)' }}>
                    <th style={th}>#</th>
                    {targetKeys.map((k) => (
                      <th key={k} style={th}>{k.split('.').slice(1).join('.') || k}</th>
                    ))}
                    <th style={th}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {result.preview.map((p, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td style={td}>{i}</td>
                      {targetKeys.map((k) => (
                        <td key={k} style={td}>{String(p.target[k] ?? '∅')}</td>
                      ))}
                      <td style={{ ...td, color: p.passed ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                        {p.passed ? 'pass' : 'reject'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Shell>
  );
}

const th: React.CSSProperties = { padding: '6px 8px', fontWeight: 500 };
const td: React.CSSProperties = { padding: '6px 8px', verticalAlign: 'top' };
const sel: React.CSSProperties = {
  padding: '9px 12px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  fontSize: 14,
  background: 'var(--color-surface)',
};
