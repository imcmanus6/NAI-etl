'use client';

import { useState } from 'react';
import { Shell } from '../../../components/Shell';
import { ProjectTabs } from '../../../components/ProjectTabs';
import { runTest, type TestRunResult } from '../../../../lib/api';

const DEFAULT_SAMPLE = JSON.stringify(
  [
    { id: 1, debtor_first_name: 'Jane', debtor_last_name: 'Doe', dob: '1985-04-12', bal: '100.50', email: 'jane@acme.com', status_cd: 'ACT' },
    { id: 2, debtor_first_name: 'Bob', debtor_last_name: 'Roe', dob: '1990-11-30', bal: '250.00', email: 'bob@acme.com', status_cd: 'INA' },
    { id: 3, debtor_first_name: '', debtor_last_name: 'Nobody', dob: 'not-a-date', bal: 'NaN', email: 'broken', status_cd: 'ACT' },
  ],
  null,
  2,
);

function Tile({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="card" style={{ padding: '12px 16px', minWidth: 120 }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? 'var(--color-text)' }}>{value}</div>
      <div className="subtle" style={{ fontSize: 12, margin: 0 }}>{label}</div>
    </div>
  );
}

export default function TestPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const [sample, setSample] = useState(DEFAULT_SAMPLE);
  const [result, setResult] = useState<TestRunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const records = JSON.parse(sample);
      setResult(await runTest(projectId, records));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const targetKeys = result?.preview.length ? Object.keys(result.preview[0].target) : [];

  return (
    <Shell title="Test run" subtitle="Run sample data through mappings → transformations → validations. Deterministic; no AI in the record path.">
      <ProjectTabs projectId={projectId} />

      <div className="card" style={{ marginBottom: 18 }}>
        <label className="subtle" style={{ fontSize: 13 }}>Sample records (JSON array)</label>
        <textarea
          value={sample}
          onChange={(e) => setSample(e.target.value)}
          rows={8}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 12, padding: 10, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', marginTop: 6 }}
        />
        <button className="btn" onClick={run} disabled={busy} style={{ marginTop: 8 }}>
          {busy ? 'Running…' : 'Run test'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>

      {result && (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
            <Tile label="Source" value={result.metrics.sourceRecords} />
            <Tile label="Accepted" value={result.metrics.acceptedRecords} color="#16a34a" />
            <Tile label="Rejected" value={result.metrics.rejectedRecords} color="#dc2626" />
            <Tile label="Warnings" value={result.metrics.warnings} color="#d97706" />
            <Tile label="Duplicates" value={result.metrics.duplicateRecords} />
          </div>

          <div className="card" style={{ marginBottom: 18, borderColor: result.reconciliation.passed ? '#86efac' : '#fca5a5' }}>
            <h3 style={{ marginTop: 0 }}>Reconciliation</h3>
            <p style={{ margin: 0, fontSize: 14 }}>
              Source <strong>{result.reconciliation.sourceCount}</strong> → target-ready{' '}
              <strong>{result.reconciliation.targetReadyCount}</strong> ·{' '}
              {result.reconciliation.rejected} rejected · {result.reconciliation.duplicateTargets} duplicate targets ·{' '}
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
            <h3 style={{ marginTop: 0 }}>Before → after (first {result.preview.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--color-muted)' }}>
                    <th style={th}>#</th>
                    {targetKeys.map((k) => (
                      <th key={k} style={th}>{k}</th>
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
