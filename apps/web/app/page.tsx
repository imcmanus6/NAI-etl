'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTenant, type TenantMe } from '../lib/api';

const STEPS = [
  ['Create project', 'Integration or migration.'],
  ['Add source', 'CSV/JSON upload or Postgres/MySQL connection.'],
  ['Add destination', 'Postgres, MySQL or CSV output.'],
  ['Discover schemas', 'Introspect a DB or upload DDL / dictionary / sample.'],
  ['Review AI understanding', 'Table purposes & relationships, with evidence.'],
  ['Generate AI mappings', 'Confidence-scored source → target suggestions.'],
  ['Review transformations', 'Visual, plain-English, AI-suggested.'],
  ['Review validations', 'Rules by level, AI-suggested from constraints.'],
  ['Run test', 'Sample data through the deterministic pipeline.'],
  ['Resolve issues', 'AI explains failures & suggests fixes.'],
  ['Approve', 'Immutable, versioned, auditable configuration.'],
  ['Deploy & monitor', 'Run metrics, reconciliation, plain-English errors.'],
];

/** Apply white-label theme tokens onto the document root. */
function applyTheme(theme?: Record<string, string>) {
  if (!theme) return;
  const map: Record<string, string> = {
    colorPrimary: '--color-primary',
    colorAccent: '--color-accent',
    colorBackground: '--color-bg',
    colorSurface: '--color-surface',
    colorText: '--color-text',
    borderRadius: '--radius',
    fontFamily: '--font',
  };
  for (const [k, cssVar] of Object.entries(map)) {
    if (theme[k]) document.documentElement.style.setProperty(cssVar, theme[k]);
  }
}

export default function DashboardPage() {
  const [tenant, setTenant] = useState<TenantMe | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTenant()
      .then((t) => {
        setTenant(t);
        applyTheme(t.whiteLabel?.theme);
      })
      .catch((e) => setError(e.message));
  }, []);

  const productName = tenant?.whiteLabel?.productName ?? 'ETL Platform';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">{productName}</div>
        <nav className="nav">
          <Link href="/">Dashboard</Link>
          <a href="#">Connections</a>
          <a href="#">Schemas</a>
          <a href="#">Projects</a>
          <a href="#">Migrations</a>
          <a href="#">Runs</a>
          <a href="#">Documents</a>
        </nav>
      </aside>

      <main className="main">
        <h1 className="h1">Welcome{tenant ? ` — ${tenant.name}` : ''}</h1>
        <p className="subtle">
          The guided setup flow. AI does the initial analysis and mapping; you review, test and
          approve deterministic configuration before anything runs in production.
        </p>

        {error && (
          <div className="card" style={{ marginBottom: 20 }}>
            <p className="error">Not signed in ({error}).</p>
            <Link className="btn" href="/login">
              Go to login
            </Link>
          </div>
        )}

        <div className="grid">
          {STEPS.map(([title, desc], i) => (
            <div className="card" key={title}>
              <div className="step">
                <div className="step-num">{i + 1}</div>
                <div className="step-body">
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
