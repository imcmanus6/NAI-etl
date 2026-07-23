'use client';

import { useEffect, useState } from 'react';
import { IntelChrome } from '../IntelChrome';
import { listAudit, type AuditEvent } from '../../../lib/api';

const CATEGORIES = ['', 'query', 'population', 'action', 'ai'];

/** Human summary for an audit row from its structured detail. */
function summarize(e: AuditEvent): string {
  const d = e.detail ?? {};
  switch (e.action) {
    case 'ask.population':
      return `“${d.nl}” → ${Number(d.row_count).toLocaleString()} accounts (${d.criteria})`;
    case 'ask.metric':
      return `“${d.nl}” → ${(d.metrics as string[] | undefined)?.join(', ')}`;
    case 'ask.clarify':
      return `“${d.nl}” → clarification requested`;
    case 'population.created':
      return `Saved population “${d.name}”`;
    case 'action.proposed':
      return `Proposed ${d.type}: ${Number(d.selected).toLocaleString()} selected → ${Number(d.eligible).toLocaleString()} eligible / ${Number(d.excluded).toLocaleString()} excluded`;
    case 'action.executed':
      return `Executed ${d.type} → Lateral ref ${d.lateralRef} (${Number(d.added).toLocaleString()} added)`;
    default:
      return JSON.stringify(d);
  }
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAudit(category || undefined)
      .then(setEvents)
      .catch((e) => setError(e.message));
  }, [category]);

  return (
    <IntelChrome>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p className="subtle" style={{ margin: 0 }}>
          Every question, population, and action is recorded — an immutable trail for compliance and review.
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          {CATEGORIES.map((c) => (
            <span
              key={c || 'all'}
              className="chip"
              style={category === c ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : undefined}
              onClick={() => setCategory(c)}
            >
              {c || 'All'}
            </span>
          ))}
        </div>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Category</th>
              <th>Event</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td style={{ whiteSpace: 'nowrap', color: 'var(--color-muted)' }}>{new Date(e.createdAt).toLocaleString()}</td>
                <td>
                  <span className={`pill-status ${e.category}`}>{e.category}</span>
                </td>
                <td>
                  <code>{e.action}</code>
                </td>
                <td>{summarize(e)}</td>
              </tr>
            ))}
            {events.length === 0 && !error && (
              <tr>
                <td colSpan={4} className="subtle">
                  No events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </IntelChrome>
  );
}
