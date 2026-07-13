/**
 * Tiny API client for the web app. Talks to the NestJS API over REST/JSON and
 * carries the JWT from localStorage. Kept dependency-free.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function token(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('etl_token');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; displayName: string; roles: string[] };
}

export function login(email: string, password: string, tenantSlug?: string) {
  return api<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, tenantSlug }),
  });
}

export interface TenantMe {
  id: string;
  slug: string;
  name: string;
  whiteLabel: {
    productName?: string;
    theme?: Record<string, string>;
  };
}

export function getTenant() {
  return api<TenantMe>('/tenants/me');
}
