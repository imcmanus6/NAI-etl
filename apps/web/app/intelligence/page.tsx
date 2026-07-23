'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IntelChrome, money } from './IntelChrome';
import { intelMetrics, intelOverview, type IntelMetric, type IntelOverview } from '../../lib/api';

export default function IntelligenceOverviewPage() {
  const [ov, setOv] = useState<IntelOverview | null>(null);
  const [metrics, setMetrics] = useState<IntelMetric[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    intelOverview().then(setOv).catch((e) => setError(e.message));
    intelMetrics().then(setMetrics).catch(() => undefined);
  }, []);

  const k = ov?.kpis;
  const cards: Array<[string, string]> = k
    ? [
        ['Active accounts', k.active_accounts.toLocaleString()],
        ['Current outstanding', money(k.current_outstanding_balance)],
        ['Net collections', money(k.net_collections)],
        ['Promise-kept rate', `${k.promise_kept_rate}%`],
      ]
    : [];

  return (
    <IntelChrome freshness={ov?.dataFreshness}>
      {error && <p className="error">{error}</p>}

      <div className="kpis">
        {cards.map(([label, value]) => (
          <div className="kpi" key={label}>
            <div className="label">{label}</div>
            <div className="value">{value}</div>
          </div>
        ))}
        {!ov && !error && <p className="subtle">Loading portfolio…</p>}
      </div>

      <div style={{ margin: '28px 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>Ask a question</h3>
        <Link href="/intelligence/ask" className="btn">
          Open Ask AI →
        </Link>
      </div>
      <p className="subtle" style={{ marginTop: 4 }}>
        Every answer is read-only and traces back to a certified metric. Actions on the results run through
        preview → eligibility → your confirmation → the Lateral API — never a direct write.
      </p>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Certified metric catalog</h3>
        <p className="subtle">The governed definitions behind every number above.</p>
        <table className="table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Definition</th>
              <th>Certification</th>
              <th>Sensitivity</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.metric_id}>
                <td>
                  <strong>{m.display_name}</strong>
                </td>
                <td style={{ color: 'var(--color-muted)' }}>{m.description}</td>
                <td>
                  <span className="badge">{m.certification}</span>
                </td>
                <td style={{ color: 'var(--color-muted)' }}>{m.sensitivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </IntelChrome>
  );
}
