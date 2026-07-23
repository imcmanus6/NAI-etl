'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IntelChrome, money } from '../IntelChrome';
import {
  confirmAction,
  intelAsk,
  previewAction,
  savePopulation,
  type ActionPreview,
  type ActionResult,
  type AskPopulationResult,
  type AskResult,
} from '../../../lib/api';

const EXAMPLES = [
  'Show active accounts with balances over $2,500, no successful contact in 14 days, no active promise, and no compliance hold',
  'What is our net collections and promise-kept rate?',
  'How many active accounts do we have?',
];

export default function AskPage() {
  const [nl, setNl] = useState(EXAMPLES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Population → action state
  const [populationId, setPopulationId] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);
  const [preview, setPreview] = useState<ActionPreview | null>(null);
  const [executed, setExecuted] = useState<ActionResult | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function reset() {
    setResult(null);
    setPopulationId(null);
    setSavedName(null);
    setPreview(null);
    setExecuted(null);
    setError(null);
  }

  async function ask(q?: string) {
    const question = q ?? nl;
    if (q) setNl(q);
    reset();
    setLoading(true);
    try {
      setResult(await intelAsk(question));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const pop = result?.kind === 'population' ? (result as AskPopulationResult) : null;

  async function doSave() {
    if (!pop) return;
    const name = window.prompt('Name this population', 'High-balance, no recent contact');
    if (!name) return;
    setBusy('save');
    setError(null);
    try {
      const breakdowns = Object.keys(pop.breakdowns);
      const saved = await savePopulation(name, pop.predicates, breakdowns);
      setPopulationId(saved.id);
      setSavedName(saved.name);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function doPreview() {
    let id = populationId;
    setBusy('preview');
    setError(null);
    try {
      if (!id && pop) {
        const saved = await savePopulation('Worklist candidates — ' + new Date().toLocaleDateString(), pop.predicates, Object.keys(pop.breakdowns));
        id = saved.id;
        setPopulationId(saved.id);
        setSavedName(saved.name);
      }
      if (!id) return;
      setExecuted(null);
      setPreview(
        await previewAction(id, {
          worklistName: 'High Balance — No Contact 14 Days',
          team: 'Early Resolution',
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function doConfirm() {
    if (!preview) return;
    setBusy('confirm');
    setError(null);
    try {
      setExecuted(await confirmAction(preview.actionId));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <IntelChrome freshness={result && 'dataFreshness' in result ? result.dataFreshness : undefined}>
      <div className="askbar">
        <input
          value={nl}
          onChange={(e) => setNl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="Ask about your portfolio…"
        />
        <button className="btn" onClick={() => ask()} disabled={loading}>
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        {EXAMPLES.map((ex) => (
          <span key={ex} className="chip" onClick={() => ask(ex)}>
            {ex.length > 62 ? ex.slice(0, 60) + '…' : ex}
          </span>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      {/* Clarify */}
      {result?.kind === 'clarify' && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="notice warn">{result.clarify}</div>
        </div>
      )}

      {/* Metric answer */}
      {result?.kind === 'metric' && (
        <div className="card" style={{ marginTop: 20 }}>
          <p className="answer">{result.answer}</p>
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                {Object.keys(result.rows[0] ?? {}).map((c) => (
                  <th key={c} className="num">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r, i) => (
                <tr key={i}>
                  {Object.values(r).map((v, j) => (
                    <td key={j} className="num">
                      {typeof v === 'number' ? v.toLocaleString() : String(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {result.metricsUsed.length > 0 && (
            <p className="subtle" style={{ marginTop: 12 }}>
              Certified metrics used: {result.metricsUsed.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Population answer */}
      {pop && (
        <div className="card" style={{ marginTop: 20 }}>
          <p className="answer">{pop.answer}</p>
          <p className="subtle" style={{ marginTop: 0 }}>
            Interpreted as: {pop.criteria}
          </p>
          {savedName && <div className="notice ok" style={{ marginBottom: 14 }}>Saved as population “{savedName}”. Find it under Populations.</div>}

          {/* Breakdowns */}
          {Object.entries(pop.breakdowns).map(([dim, rows]) => (
            <div key={dim} style={{ marginTop: 16 }}>
              <h4 style={{ margin: '0 0 6px', textTransform: 'capitalize' }}>By {dim}</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ textTransform: 'capitalize' }}>{dim}</th>
                    <th className="num">Accounts</th>
                    <th className="num">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key}>
                      <td>{r.key}</td>
                      <td className="num">{r.accounts.toLocaleString()}</td>
                      <td className="num">{money(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={doSave} disabled={busy !== null || !!savedName}>
              {busy === 'save' ? 'Saving…' : savedName ? '✓ Saved as population' : 'Save as population'}
            </button>
            <button className="btn" onClick={doPreview} disabled={busy !== null}>
              {busy === 'preview' ? 'Preparing…' : 'Create worklist →'}
            </button>
          </div>
        </div>
      )}

      {/* Action preview → confirm */}
      {preview && (
        <div className="card" style={{ marginTop: 16, borderColor: 'var(--color-primary)' }}>
          <h3 style={{ marginTop: 0 }}>Create worklist — preview</h3>
          <p className="subtle" style={{ marginTop: 0 }}>
            “{String(preview.params.worklistName)}” · team {String(preview.params.team)}. Review the eligibility split
            before anything is sent to Lateral.
          </p>

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
              Excluded for compliance/eligibility:{' '}
              {Object.entries(preview.excludedReasons)
                .map(([reason, n]) => `${n} ${reason}`)
                .join(' · ')}
            </p>
          )}
          <p className="subtle">Eligible balance: {money(preview.eligibleBalance)}</p>

          {!executed ? (
            <button className="btn" onClick={doConfirm} disabled={busy !== null}>
              {busy === 'confirm' ? 'Sending to Lateral…' : `Confirm & create worklist (${preview.eligible.toLocaleString()} accounts)`}
            </button>
          ) : (
            <div className="notice ok">
              ✓ Worklist <strong>{executed.ref}</strong> created — {executed.added.toLocaleString()} accounts added via the
              Lateral API.{' '}
              <a href={executed.deepLink} target="_blank" rel="noreferrer">
                Open in Lateral →
              </a>
              <div style={{ marginTop: 8 }}>
                <Link href="/intelligence/audit">View the audit trail →</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </IntelChrome>
  );
}
