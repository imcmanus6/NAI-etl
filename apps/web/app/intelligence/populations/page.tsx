'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IntelChrome, money } from '../IntelChrome';
import {
  confirmAction,
  listPopulations,
  previewAction,
  type ActionPreview,
  type ActionResult,
  type Population,
} from '../../../lib/api';

export default function PopulationsPage() {
  const [pops, setPops] = useState<Population[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [preview, setPreview] = useState<ActionPreview | null>(null);
  const [executed, setExecuted] = useState<ActionResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listPopulations().then(setPops).catch((e) => setError(e.message));
  }, []);

  async function makeWorklist(p: Population) {
    setActive(p.id);
    setPreview(null);
    setExecuted(null);
    setBusy(true);
    setError(null);
    try {
      setPreview(await previewAction(p.id, { worklistName: p.name, team: 'Early Resolution' }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!preview) return;
    setBusy(true);
    try {
      setExecuted(await confirmAction(preview.actionId));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <IntelChrome>
      <p className="subtle" style={{ marginTop: 0 }}>
        Saved populations are dynamic — they re-run their criteria against the latest read-only snapshot every time you
        open or action them.
      </p>
      {error && <p className="error">{error}</p>}

      {pops.length === 0 && !error && (
        <div className="card">
          <p style={{ margin: 0 }}>
            No saved populations yet. <Link href="/intelligence/ask">Ask a question</Link> and save the result as a
            population.
          </p>
        </div>
      )}

      {pops.length > 0 && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Population</th>
                <th>Type</th>
                <th>Criteria</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pops.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                  </td>
                  <td>
                    <span className="badge">{p.type}</span>
                  </td>
                  <td style={{ color: 'var(--color-muted)' }}>{(p.predicates as unknown[]).length} predicates</td>
                  <td style={{ color: 'var(--color-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-ghost" onClick={() => makeWorklist(p)} disabled={busy}>
                      Create worklist
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {preview && active && (
        <div className="card" style={{ marginTop: 16, borderColor: 'var(--color-primary)' }}>
          <h3 style={{ marginTop: 0 }}>Create worklist — preview</h3>
          <div className="eligibility">
            <div className="cell">
              <div className="n">{preview.selected.toLocaleString()}</div>
              <div className="k">Selected</div>
            </div>
            <div className="cell ok">
              <div className="n">{preview.eligible.toLocaleString()}</div>
              <div className="k">Eligible</div>
            </div>
            <div className="cell exc">
              <div className="n">{preview.excluded.toLocaleString()}</div>
              <div className="k">Excluded</div>
            </div>
          </div>
          {preview.excluded > 0 && (
            <p className="subtle">
              Excluded:{' '}
              {Object.entries(preview.excludedReasons)
                .map(([r, n]) => `${n} ${r}`)
                .join(' · ')}
            </p>
          )}
          <p className="subtle">Eligible balance: {money(preview.eligibleBalance)}</p>
          {!executed ? (
            <button className="btn" onClick={confirm} disabled={busy}>
              {busy ? 'Sending to Lateral…' : `Confirm & create (${preview.eligible.toLocaleString()} accounts)`}
            </button>
          ) : (
            <div className="notice ok">
              ✓ Worklist <strong>{executed.ref}</strong> created — {executed.added.toLocaleString()} accounts added.{' '}
              <a href={executed.deepLink} target="_blank" rel="noreferrer">
                Open in Lateral →
              </a>
            </div>
          )}
        </div>
      )}
    </IntelChrome>
  );
}
