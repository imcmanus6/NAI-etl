'use client';

import Link from 'next/link';
import { Shell } from './components/Shell';

const STEPS: Array<[string, string, string?]> = [
  ['Create project', 'Integration or migration.', '/projects'],
  ['Add source', 'CSV/JSON upload or Postgres/MySQL connection.', '/connections'],
  ['Add destination', 'Postgres, MySQL or CSV output.', '/connections'],
  ['Discover schemas', 'Introspect a DB or upload DDL / dictionary / sample.', '/schemas'],
  ['Review AI understanding', 'Table purposes & relationships, with evidence.', '/schemas'],
  ['Generate AI mappings', 'Confidence-scored source → target suggestions.', '/projects'],
  ['Review transformations', 'Visual, plain-English, AI-suggested.'],
  ['Review validations', 'Rules by level, AI-suggested from constraints.'],
  ['Run test', 'Sample data through the deterministic pipeline.'],
  ['Resolve issues', 'AI explains failures & suggests fixes.'],
  ['Approve', 'Immutable, versioned, auditable configuration.'],
  ['Deploy & monitor', 'Run metrics, reconciliation, plain-English errors.'],
];

export default function DashboardPage() {
  return (
    <Shell
      title="Guided setup"
      subtitle="AI does the initial analysis and mapping; you review, test and approve deterministic configuration before anything runs in production."
    >
      <div className="grid">
        {STEPS.map(([title, desc, href], i) => {
          const inner = (
            <div className="step">
              <div className="step-num">{i + 1}</div>
              <div className="step-body">
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </div>
          );
          return href ? (
            <Link className="card" key={title} href={href} style={{ display: 'block' }}>
              {inner}
            </Link>
          ) : (
            <div className="card" key={title}>
              {inner}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
