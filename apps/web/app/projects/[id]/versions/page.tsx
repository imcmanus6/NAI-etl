'use client';

import { useEffect, useState } from 'react';
import { Shell } from '../../../components/Shell';
import { ProjectTabs } from '../../../components/ProjectTabs';
import {
  approveVersion,
  generateDocument,
  listVersions,
  submitVersion,
  type Version,
} from '../../../../lib/api';

const STATUS_COLOR: Record<string, string> = {
  draft: '#64748b',
  testing: '#d97706',
  awaiting_approval: '#2563eb',
  approved: '#16a34a',
  deployed: '#16a34a',
  paused: '#d97706',
  retired: '#94a3b8',
};

export default function VersionsPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const [versions, setVersions] = useState<Version[]>([]);
  const [doc, setDoc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    setVersions(await listVersions(projectId));
  }
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, [projectId]);

  async function act(fn: () => Promise<unknown>, tag: string) {
    setBusy(tag);
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function showDoc(v: Version) {
    setBusy(`doc-${v.id}`);
    try {
      const res = await generateDocument(projectId, v.id);
      setDoc(res.markdown);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Shell title="Versions & approval" subtitle="Executable config is versioned. Submitting locks a draft for approval; approving deploys it and makes it immutable.">
      <ProjectTabs projectId={projectId} />
      {error && <p className="error">{error}</p>}

      <div className="card" style={{ marginBottom: 18 }}>
        {versions.length === 0 && <p className="subtle">No versions yet — accept some mappings to create a draft.</p>}
        {versions.map((v) => (
          <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span className="badge" style={{ background: `${STATUS_COLOR[v.status] ?? '#64748b'}22`, color: STATUS_COLOR[v.status] ?? '#64748b' }}>
                v{v.versionNumber} · {v.status}
              </span>{' '}
              <span className="subtle" style={{ fontSize: 12 }}>
                {(v.mappings?.length ?? 0)} mappings · {(v.validations?.length ?? 0)} validations
                {v.deployedAt ? ` · deployed ${new Date(v.deployedAt).toLocaleDateString()}` : ''}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(v.status === 'draft' || v.status === 'testing') && (
                <button style={btn('#2563eb')} disabled={busy !== null} onClick={() => act(() => submitVersion(projectId, v.id), `sub-${v.id}`)}>
                  Submit for approval
                </button>
              )}
              {v.status === 'awaiting_approval' && (
                <>
                  <button style={btn('#16a34a')} disabled={busy !== null} onClick={() => act(() => approveVersion(projectId, v.id, 'approved', 'Approved via UI'), `app-${v.id}`)}>
                    Approve & deploy
                  </button>
                  <button style={btn('#dc2626')} disabled={busy !== null} onClick={() => act(() => approveVersion(projectId, v.id, 'changes_requested', 'Needs changes'), `chg-${v.id}`)}>
                    Request changes
                  </button>
                </>
              )}
              <button style={btn('#7c3aed')} disabled={busy !== null} onClick={() => showDoc(v)}>
                {busy === `doc-${v.id}` ? '…' : 'Mapping doc'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {doc && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ marginTop: 0 }}>Generated mapping document</h3>
            <button style={btn('#64748b')} onClick={() => setDoc(null)}>Close</button>
          </div>
          <pre style={{ background: 'var(--color-bg)', padding: 16, borderRadius: 'var(--radius)', overflowX: 'auto', fontSize: 12, whiteSpace: 'pre-wrap' }}>
            {doc}
          </pre>
        </div>
      )}
    </Shell>
  );
}

const btn = (bg: string): React.CSSProperties => ({
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '7px 12px',
  fontSize: 13,
  cursor: 'pointer',
});
