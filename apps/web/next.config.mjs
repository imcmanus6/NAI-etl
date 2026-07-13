import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Load the monorepo-root .env so the web app shares the same local config.
// Resolved from this file's location, so it works regardless of cwd.
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });

// The browser talks to the API. Precedence:
//   1. NEXT_PUBLIC_API_URL if explicitly set (e.g. a remote/staging API)
//   2. derived from API_PORT (one knob in .env drives both api + web)
//   3. localhost:3001 default
const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.API_PORT ? `http://localhost:${process.env.API_PORT}` : 'http://localhost:3001');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
  },
};

export default nextConfig;
