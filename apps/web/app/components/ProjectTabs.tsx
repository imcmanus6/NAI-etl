'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  ['', 'Overview'],
  ['/mappings', 'Mappings'],
  ['/validations', 'Validations & transforms'],
  ['/test', 'Test'],
  ['/migration', 'Migration'],
  ['/versions', 'Versions'],
];

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 20, borderBottom: '1px solid var(--color-border)' }}>
      {TABS.map(([suffix, label]) => {
        const href = base + suffix;
        const active = pathname === href;
        return (
          <Link
            key={label}
            href={href}
            style={{
              padding: '8px 14px',
              fontSize: 14,
              borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: active ? 'var(--color-primary)' : 'var(--color-text)',
              fontWeight: active ? 600 : 400,
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
