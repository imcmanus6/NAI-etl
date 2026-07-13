'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getTenant, type TenantMe } from '../../lib/api';

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

const NAV: Array<[string, string]> = [
  ['/', 'Dashboard'],
  ['/connections', 'Connections'],
  ['/schemas', 'Schemas'],
  ['/projects', 'Projects'],
];

export function Shell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tenant, setTenant] = useState<TenantMe | null>(null);

  useEffect(() => {
    getTenant()
      .then((t) => {
        setTenant(t);
        applyTheme(t.whiteLabel?.theme);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const productName = tenant?.whiteLabel?.productName ?? 'ETL Platform';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">{productName}</div>
        <nav className="nav">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} style={pathname === href ? { background: 'var(--color-bg)', fontWeight: 600 } : undefined}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main">
        <h1 className="h1">{title}</h1>
        {subtitle && <p className="subtle">{subtitle}</p>}
        {children}
      </main>
    </div>
  );
}
