'use client';

import { useEffect, useMemo, useState } from 'react';
import { IntelChrome } from '../IntelChrome';
import {
  assistReport,
  deleteReport,
  downloadReportCsv,
  listReports,
  reportCatalog,
  runReport,
  runReportNow,
  saveReport,
  scheduleReport,
  type ReportCatalog,
  type ReportRun,
  type ReportSpec,
  type SavedReport,
} from '../../../lib/api';

const fmt = (v: unknown, format?: string) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v ?? '');
  if (format === 'currency') return '$' + Math.round(n).toLocaleString();
  if (format === 'percent') return n.toFixed(1) + '%';
  return n.toLocaleString();
};

type Filter = { field: string; operator: string; value?: string | number };

const OP_LABELS: Record<string, string> = {
  eq: '=', neq: '≠', gt: '>', gte: '≥', lt: '<', lte: '≤',
  older_than_days: 'older than (days)', within_days: 'within (days)',
  is_true: 'is true', is_false: 'is false',
};
/** Operators valid for a field's type. */
const opsForType = (t: string): string[] =>
  t === 'boolean' ? ['is_true', 'is_false']
    : t === 'date' ? ['older_than_days', 'within_days']
      : t === 'number' ? ['eq', 'neq', 'gt', 'gte', 'lt', 'lte']
        : ['eq', 'neq'];
const opNeedsValue = (op: string) => op !== 'is_true' && op !== 'is_false';
/** Drop filters whose operator needs a value but none was entered. */
const cleanFilters = (fs: Filter[]): Filter[] =>
  fs.filter((f) => f.field && (!opNeedsValue(f.operator) || (f.value !== '' && f.value !== undefined && f.value !== null)));

/** Simple theme-aware vertical bar chart (first metric, by dimension). */
function BarChart({ rows, dim, metric, format }: { rows: Array<Record<string, unknown>>; dim: string; metric: string; format?: string }) {
  const data = rows.slice(0, 12).map((r) => ({ label: String(r[dim] ?? ''), value: Number(r[metric] ?? 0) }));
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 200, padding: '8px 0', overflowX: 'auto' }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56, flex: 1 }} title={`${d.label}: ${fmt(d.value, format)}`}>
          <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>{fmt(d.value, format)}</div>
          <div style={{ width: '70%', maxWidth: 44, height: `${(d.value / max) * 150}px`, minHeight: 2, background: 'var(--color-primary)', borderRadius: '4px 4px 0 0' }} />
          <div style={{ fontSize: 11, color: 'var(--color-text)', marginTop: 6, textAlign: 'center', maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const [cat, setCat] = useState<ReportCatalog | null>(null);
  const [saved, setSaved] = useState<SavedReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  // builder state
  const [metrics, setMetrics] = useState<string[]>([]);
  const [dimension, setDimension] = useState('');
  const [filters, setFilters] = useState<Filter[]>([]);
  const [limit, setLimit] = useState(12);
  const [nl, setNl] = useState('current outstanding balance and account count by workflow');
  const [assistNote, setAssistNote] = useState<{ understood: string; planner: string; clarify?: string } | null>(null);
  const [result, setResult] = useState<ReportRun | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    reportCatalog().then(setCat).catch((e) => setError(e.message));
    refreshSaved();
  }, []);
  const refreshSaved = () => listReports().then(setSaved).catch(() => undefined);

  const spec = useMemo<ReportSpec>(() => ({ metrics, dimensions: dimension ? [dimension] : [], filters: cleanFilters(filters), limit, chart: dimension ? 'bar' : 'none' }), [metrics, dimension, filters, limit]);
  const metricFormat = useMemo(() => Object.fromEntries((result?.metrics ?? []).map((m) => [m.id, m.format])), [result]);
  const fieldType = (name: string) => cat?.fields.find((f) => f.name === name)?.type ?? 'string';

  function toggleMetric(id: string) {
    setMetrics((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  }

  // --- filter editor ---
  function addFilter() {
    const f = cat?.fields[0];
    if (!f) return;
    const op = opsForType(f.type)[0]!;
    setFilters((fs) => [...fs, { field: f.name, operator: op, value: opNeedsValue(op) ? (f.type === 'string' ? '' : 0) : undefined }]);
  }
  function updateFilter(i: number, patch: Partial<Filter>) {
    setFilters((fs) => fs.map((f, j) => {
      if (j !== i) return f;
      const next = { ...f, ...patch };
      if (patch.field !== undefined) {
        // field changed → reset operator + value to the new type's default
        const op = opsForType(fieldType(patch.field))[0]!;
        next.operator = op;
        next.value = opNeedsValue(op) ? (fieldType(patch.field) === 'string' ? '' : 0) : undefined;
      } else if (patch.operator !== undefined) {
        next.value = opNeedsValue(patch.operator) ? (next.value ?? (fieldType(next.field) === 'string' ? '' : 0)) : undefined;
      }
      return next;
    }));
  }
  const removeFilter = (i: number) => setFilters((fs) => fs.filter((_, j) => j !== i));

  async function run(s: ReportSpec = spec) {
    if (!s.metrics.length) {
      setError('Pick at least one metric.');
      return;
    }
    setBusy('run');
    setError(null);
    try {
      setResult(await runReport(s));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function assist() {
    setBusy('assist');
    setError(null);
    setAssistNote(null);
    try {
      const a = await assistReport(nl);
      setAssistNote({ understood: a.understood, planner: a.planner, clarify: a.clarify });
      if (a.spec) {
        setMetrics(a.spec.metrics);
        setDimension(a.spec.dimensions?.[0] ?? '');
        setFilters((a.spec.filters ?? []) as Filter[]);
        if (a.spec.limit) setLimit(a.spec.limit);
        await run({ ...a.spec, chart: a.spec.dimensions?.length ? 'bar' : 'none' });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    const name = window.prompt('Name this report', assistNote?.understood?.slice(0, 60) || 'My report');
    if (!name) return;
    setBusy('save');
    try {
      await saveReport(name, spec);
      await refreshSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function open(r: SavedReport) {
    setMetrics(r.spec.metrics ?? []);
    setDimension(r.spec.dimensions?.[0] ?? '');
    setFilters((r.spec.filters ?? []) as Filter[]);
    setLimit(r.spec.limit ?? 12);
    setAssistNote(null);
    run(r.spec);
  }

  async function schedule(r: SavedReport) {
    const current = r.cron ?? '0 8 * * 1';
    const cronExpr = window.prompt(`Cron schedule for "${r.name}" (blank to disable)`, r.enabled ? current : '');
    if (cronExpr === null) return;
    try {
      await scheduleReport(r.id, cronExpr.trim() || null, !!cronExpr.trim());
      await refreshSaved();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function runNow(r: SavedReport) {
    try {
      await runReportNow(r.id);
      await refreshSaved();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function remove(r: SavedReport) {
    if (!window.confirm(`Delete report "${r.name}"?`)) return;
    await deleteReport(r.id).catch((e) => setError(e.message));
    await refreshSaved();
  }

  const chartMetric = metrics[0];

  return (
    <IntelChrome freshness={result?.dataFreshness}>
      <p className="subtle" style={{ marginTop: 0 }}>
        Build a report from certified metrics — or describe it in plain English and let Claude fill it in. Every number
        is read-only and traces back to the catalog.
      </p>

      {/* AI assist */}
      <div className="askbar" style={{ marginBottom: 8 }}>
        <input value={nl} onChange={(e) => setNl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && assist()} placeholder="Describe the report you want…" />
        <button className="btn" onClick={assist} disabled={busy !== null}>
          {busy === 'assist' ? 'Building…' : '✨ Build with AI'}
        </button>
      </div>
      {assistNote && (
        <div className={`notice ${assistNote.clarify ? 'warn' : 'ok'}`} style={{ marginBottom: 12 }}>
          {assistNote.clarify ? assistNote.clarify : `Interpreted as: ${assistNote.understood}`}{' '}
          <span className="badge" style={{ marginLeft: 6 }}>{assistNote.planner === 'ai' ? 'Claude' : 'rules'}</span>
        </div>
      )}
      {error && <p className="error">{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Builder controls */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Metrics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cat?.metrics.map((m) => (
              <label key={m.metric_id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer', fontSize: 14 }} title={m.description}>
                <input type="checkbox" checked={metrics.includes(m.metric_id)} onChange={() => toggleMetric(m.metric_id)} style={{ marginTop: 3 }} />
                <span>{m.display_name}</span>
              </label>
            ))}
          </div>

          <h3 style={{ margin: '20px 0 8px' }}>Break down by</h3>
          <select value={dimension} onChange={(e) => setDimension(e.target.value)} style={selectStyle}>
            <option value="">No breakdown (totals)</option>
            {cat?.dimensions.map((d) => (
              <option key={d.name} value={d.name}>{d.label}</option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 8px' }}>
            <h3 style={{ margin: 0 }}>Filters</h3>
            <button className="chip" onClick={addFilter} style={{ margin: 0 }}>+ Add</button>
          </div>
          {filters.length === 0 && <p className="subtle" style={{ margin: 0, fontSize: 13 }}>No filters — all accounts.</p>}
          {filters.map((f, i) => {
            const type = fieldType(f.field);
            return (
              <div key={i} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 10, marginBottom: 8 }}>
                <select value={f.field} onChange={(e) => updateFilter(i, { field: e.target.value })} style={{ ...selectStyle, marginBottom: 6 }}>
                  {cat?.fields.map((fl) => (
                    <option key={fl.name} value={fl.name}>{fl.label}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: 6 }}>
                  <select value={f.operator} onChange={(e) => updateFilter(i, { operator: e.target.value })} style={{ ...selectStyle, flex: opNeedsValue(f.operator) ? '0 0 46%' : 1 }}>
                    {opsForType(type).map((op) => (
                      <option key={op} value={op}>{OP_LABELS[op]}</option>
                    ))}
                  </select>
                  {opNeedsValue(f.operator) && (
                    <input
                      style={{ ...selectStyle, flex: 1 }}
                      type={type === 'number' || type === 'date' ? 'number' : 'text'}
                      value={f.value ?? ''}
                      onChange={(e) => updateFilter(i, { value: type === 'number' || type === 'date' ? Number(e.target.value) : e.target.value })}
                      placeholder={type === 'date' ? 'days' : 'value'}
                    />
                  )}
                </div>
                <button className="chip" onClick={() => removeFilter(i)} style={{ marginTop: 6, borderColor: 'transparent', color: 'var(--color-muted)', padding: '2px 4px' }}>Remove</button>
              </div>
            );
          })}

          <h3 style={{ margin: '20px 0 8px' }}>Row limit</h3>
          <input type="number" min={1} max={1000} value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={{ ...selectStyle, width: 100 }} />

          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button className="btn" onClick={() => run()} disabled={busy !== null || !metrics.length}>
              {busy === 'run' ? 'Running…' : 'Run report'}
            </button>
            <button className="btn btn-ghost" onClick={save} disabled={busy !== null || !metrics.length}>
              {busy === 'save' ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          {!result && <div className="card"><p className="subtle" style={{ margin: 0 }}>Pick metrics (and optionally a breakdown), then Run — or use Build with AI above.</p></div>}
          {result && (
            <div className="card">
              {result.warnings.length > 0 && <div className="notice warn" style={{ marginBottom: 12 }}>{result.warnings.join(' ')}</div>}
              {dimension && chartMetric && result.rows.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div className="subtle" style={{ fontSize: 13, marginBottom: 4 }}>{result.metrics.find((m) => m.id === chartMetric)?.display_name} by {cat?.dimensions.find((d) => d.name === dimension)?.label}</div>
                  <BarChart rows={result.rows} dim={dimension} metric={chartMetric} format={metricFormat[chartMetric]} />
                </div>
              )}
              <table className="table">
                <thead>
                  <tr>
                    {result.columns.map((c) => {
                      const m = result.metrics.find((x) => x.id === c);
                      return (
                        <th key={c} className={m ? 'num' : ''}>{m ? m.display_name : cat?.dimensions.find((d) => d.name === c)?.label ?? c}</th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r, i) => (
                    <tr key={i}>
                      {result.columns.map((c) => {
                        const m = result.metrics.find((x) => x.id === c);
                        return (
                          <td key={c} className={m ? 'num' : ''}>{m ? fmt(r[c], m.format) : String(r[c] ?? '')}</td>
                        );
                      })}
                    </tr>
                  ))}
                  {result.rows.length === 0 && (
                    <tr>
                      <td colSpan={result.columns.length} className="subtle">No rows match.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Saved reports */}
      <h3 style={{ margin: '28px 0 8px' }}>Saved reports</h3>
      {saved.length === 0 ? (
        <div className="card"><p className="subtle" style={{ margin: 0 }}>No saved reports yet. Build one above and hit Save.</p></div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Metrics</th>
                <th>Schedule</th>
                <th>Last run</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {saved.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.name}</strong></td>
                  <td style={{ color: 'var(--color-muted)' }}>{(r.spec.metrics ?? []).length} metric{(r.spec.metrics ?? []).length === 1 ? '' : 's'}{r.spec.dimensions?.length ? ` · by ${r.spec.dimensions[0]}` : ''}</td>
                  <td>{r.enabled && r.cron ? <span className="badge">{r.cron}</span> : <span className="subtle">—</span>}</td>
                  <td style={{ color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>{r.lastRunAt ? `${new Date(r.lastRunAt).toLocaleDateString()} · ${r.lastStatus} (${r.lastRows ?? 0})` : 'never'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="chip" onClick={() => open(r)}>Open</button>
                    <button className="chip" onClick={() => downloadReportCsv(r.id, r.name)}>CSV</button>
                    <button className="chip" onClick={() => runNow(r)}>Run now</button>
                    <button className="chip" onClick={() => schedule(r)}>Schedule</button>
                    <button className="chip" onClick={() => remove(r)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </IntelChrome>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  fontSize: 14,
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
};
