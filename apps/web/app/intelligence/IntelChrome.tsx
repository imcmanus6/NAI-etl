'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shell } from '../components/Shell';

const TABS: Array<[string, string]> = [
  ['/intelligence', 'Overview'],
  ['/intelligence/ask', 'Ask AI'],
  ['/intelligence/reports', 'Reports'],
  ['/intelligence/populations', 'Populations'],
  ['/intelligence/audit', 'Audit'],
];

/**
 * Shared chrome for the Lateral Intelligence workspace: the branded
 * "Lateral Intelligence / Powered by NAI Analyst" lockup, a data-freshness
 * indicator, and the sub-navigation tabs.
 */
export function IntelChrome({ children, freshness }: { children: ReactNode; freshness?: string }) {
  const pathname = usePathname();
  return (
    <Shell title="" subtitle="">
      <div className="intel-head">
        <div className="intel-lockup">
          <span className="brand-primary">Lateral Intelligence</span>
          <span className="brand-sub">
            Powered by <strong>NAI Analyst</strong>
          </span>
        </div>
        {freshness && <span className="freshness">Data as of {new Date(freshness).toLocaleString()}</span>}
      </div>

      <nav className="tabs">
        {TABS.map(([href, label]) => {
          const active = href === '/intelligence' ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={active ? 'active' : ''}>
              {label}
            </Link>
          );
        })}
      </nav>

      {children}
    </Shell>
  );
}

export const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
