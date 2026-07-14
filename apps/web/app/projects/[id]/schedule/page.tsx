'use client';

import { useEffect, useState } from 'react';
import { Shell } from '../../../components/Shell';
import { ProjectTabs } from '../../../components/ProjectTabs';
import {
  getSchedule,
  listConnections,
  listRuns,
  listSchemas,
  runScheduleNow,
  saveSchedule,
  type Connection,
  type Run,
  type SchemaSummary,
} from '../../../../lib/api';

const CRON_PRESETS: Array<[string, string]> = [
  ['*/15 * * * *', 'Every 15 minutes'],
  ['0 * * * *', 'Hourly'],
  ['0 2 * * *', 'Daily at 02:00'],
  ['0 6 * * 1-5', 'Weekdays at 06:00'],
  ['0 0 * * 0', 'Weekly (Sun 00:00)'],
];

export default function SchedulePage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const [connections, setConnections] = useState<Connection[]>([]);
  const [schemas, setSchemas] = useState<SchemaSummary[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [cron, setCron] = useState('0 2 * * *');
  const [enabled, setEnabled] = useState(false);
  const [sourceConnectionId, setSourceConnectionId] = useState('');
  const [sourceEntity, setSourceEntity] = useState('');
  const [destinationConnectionId, setDestinationConnectionId] = useState('');
  const [outputMode, setOutputMode] = useState<'api' | 'csv' | 'both'>('api');
  const [targetSchemaId, setTargetSchemaId] = useState('');
  const [lastStatus, setLastStatus] = useState<string | null>(null);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [s, conns, schs, r] = await Promise.all([getSchedule(projectId), listConnections(), listSchemas(), listRuns(projectId)]);
    setConnections(conns);
    setSchemas(schs);
    setRuns(r);
    if (s) {
      setCron(s.cron);
      setEnabled(s.enabled);
      setSourceConnectionId(s.sourceConnectionId ?? '');
      setSourceEntity(s.sourceEntity ?? '');
      setDestinationConnectionId(s.destinationConnectionId ?? '');
      setOutputMode(s.outputMode);
      setTargetSchemaId(s.targetSchemaId ?? '');
      setLastStatus(s.lastStatus);
      setLastRunAt(s.lastRunAt);
    }
  }
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, [projectId]);

  async function save() {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      await saveSchedule(projectId, {
        cron,
        enabled,
        sourceConnectionId: sourceConnectionId || undefined,
        sourceEntity: sourceEntity || undefined,
        destinationConnectionId: destinationConnectionId || undefined,
        outputMode,
        targetSchemaId: targetSchemaId || undefined,
      });
      setMsg(enabled ? 'Saved — pipeline scheduled.' : 'Saved (disabled).');
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function runNow() {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await runScheduleNow(projectId);
      setMsg(
        `Ran now: ${res.metrics.acceptedRecords ?? 0} accepted / ${res.metrics.sourceRecords ?? 0} source` +
          (res.outputKey ? ` · CSV written (${res.outputRecords} rows)` : '') +
          (res.delivery ? ' · delivered' : ''),
      );
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const sources = connections.filter((c) => c.kind === 'source');
  const dests = connections.filter((c) => c.kind === 'destination');

  return (
    <Shell title="Schedule" subtitle="Save this project as a runnable pipeline: read a source on a cron, run the approved mapping, deliver via API and/or write a CSV.">
      <ProjectTabs projectId={projectId} />
      {error && <p className="error">{error}</p>}
      {msg && <p style={{ color: 'var(--color-primary)', fontSize: 14 }}>{msg}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Pipeline schedule</h3>

          <div className="field">
            <label>Schedule (cron)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={cron} onChange={(e) => setCron(e.target.value)} style={{ flex: 1 }} />
              <select value="" onChange={(e) => e.target.value && setCron(e.target.value)} style={sel}>
                <option value="">presets…</option>
                {CRON_PRESETS.map(([expr, label]) => (
                  <option key={expr} value={expr}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '6px 0 14px', fontSize: 14 }}>
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            Enabled (runs automatically on the cron)
          </label>

          <div className="field">
            <label>Source connection</label>
            <select value={sourceConnectionId} onChange={(e) => setSourceConnectionId(e.target.value)} style={sel}>
              <option value="">Select a source…</option>
              {sources.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.connectorType})</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Source entity / table (for DB or file entity name)</label>
            <input value={sourceEntity} onChange={(e) => setSourceEntity(e.target.value)} placeholder="e.g. customers" />
          </div>

          <div className="field">
            <label>Output</label>
            <select value={outputMode} onChange={(e) => setOutputMode(e.target.value as 'api' | 'csv' | 'both')} style={sel}>
              <option value="api">Deliver via API</option>
              <option value="csv">Generate CSV file</option>
              <option value="both">Both (API + CSV)</option>
            </select>
          </div>
          {(outputMode === 'api' || outputMode === 'both') && (
            <div className="field">
              <label>Destination (API)</label>
              <select value={destinationConnectionId} onChange={(e) => setDestinationConnectionId(e.target.value)} style={sel}>
                <option value="">Select a destination…</option>
                {dests.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.connectorType})</option>
                ))}
              </select>
            </div>
          )}
          {(outputMode === 'csv' || outputMode === 'both') && (
            <div className="field">
              <label>CSV layout (target schema)</label>
              <select value={targetSchemaId} onChange={(e) => setTargetSchemaId(e.target.value)} style={sel}>
                <option value="">mapped fields only</option>
                {schemas.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} (full layout)</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn" onClick={save} disabled={busy}>Save schedule</button>
            <button className="btn" style={{ background: 'var(--color-accent)' }} onClick={runNow} disabled={busy}>
              ▶ Run now
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Status</h3>
          <p style={{ fontSize: 14, margin: '0 0 12px' }}>
            {enabled ? <span className="badge" style={{ background: '#16a34a22', color: '#16a34a' }}>scheduled</span> : <span className="badge">disabled</span>}{' '}
            {lastStatus && (
              <span style={{ color: lastStatus === 'succeeded' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                last run {lastStatus}
              </span>
            )}
            {lastRunAt && <span className="subtle"> · {new Date(lastRunAt).toLocaleString()}</span>}
          </p>
          <h3>Recent runs</h3>
          {runs.length === 0 && <p className="subtle" style={{ fontSize: 13 }}>No runs yet.</p>}
          {runs.slice(0, 12).map((r) => (
            <div key={r.id} style={{ fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span className="badge">{r.mode}</span>{' '}
              <span style={{ color: r.status === 'succeeded' ? '#16a34a' : r.status === 'failed' ? '#dc2626' : 'var(--color-muted)' }}>{r.status}</span>{' '}
              {r.metrics && <span className="subtle">· {r.metrics.acceptedRecords ?? 0}/{r.metrics.sourceRecords ?? 0} accepted</span>}
              <span className="subtle"> · {new Date(r.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
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
