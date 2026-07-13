'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shell } from '../components/Shell';
import { createProject, listCustomers, listProjects, type Customer, type Project } from '../../lib/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState('Debt migration — Q3');
  const [type, setType] = useState<'integration' | 'migration'>('migration');
  const [customerId, setCustomerId] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setProjects(await listProjects());
  }
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
    listCustomers()
      .then((cs) => {
        setCustomers(cs);
        if (cs[0]) setCustomerId(cs[0].id);
      })
      .catch(() => undefined);
  }, []);

  async function create() {
    setError(null);
    try {
      await createProject({ name, customerId, type });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <Shell title="Projects" subtitle="Reusable integration and migration projects. Each carries source, destination, mappings, validations and an approved version.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>New project</h3>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as 'integration' | 'migration')} style={selectStyle}>
              <option value="migration">Migration</option>
              <option value="integration">Integration</option>
            </select>
          </div>
          <div className="field">
            <label>Customer</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} style={selectStyle}>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button className="btn" onClick={create} disabled={!customerId}>Create project</button>
          {error && <p className="error">{error}</p>}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Your projects</h3>
          {projects.length === 0 && <p className="subtle">None yet.</p>}
          {projects.map((p) => (
            <div key={p.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{p.name}</strong> <span className="badge">{p.type}</span>
              </div>
              <Link href={`/projects/${p.id}`}>Open →</Link>
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
