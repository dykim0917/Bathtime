import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';

const appDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(appDir, '..', '..');
const rootEnvLocal = join(repoRoot, '.env.local');

function readRootEnvValue(key) {
  if (process.env[key]) return process.env[key];
  if (!existsSync(rootEnvLocal)) return undefined;
  const line = readFileSync(rootEnvLocal, 'utf8')
    .split(/\r?\n/)
    .find((item) => item.startsWith(`${key}=`));
  if (!line) return undefined;
  return line.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, '');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: repoRoot,
  reactStrictMode: true,
  async headers() {
    const scriptSources = [
      "'self'",
      "'unsafe-inline'",
      ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://pagead2.googlesyndication.com',
      'https://*.adtrafficquality.google',
      'https://dapi.kakao.com',
      'https://t1.daumcdn.net',
    ].join(' ');
    const connectSources = [
      "'self'",
      'https://*.supabase.co',
      'https://www.google-analytics.com',
      'https://region1.google-analytics.com',
      'https://pagead2.googlesyndication.com',
      'https://googleads.g.doubleclick.net',
      'https://*.adtrafficquality.google',
      'https://dapi.kakao.com',
      'https://*.kakao.com',
      'https://tiles.openfreemap.org',
    ].join(' ');
    const frameSources = [
      "'self'",
      'https://googleads.g.doubleclick.net',
      'https://tpc.googlesyndication.com',
      'https://*.adtrafficquality.google',
      'https://www.google.com',
    ].join(' ');

    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      `script-src ${scriptSources}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https: data: blob:",
      "font-src 'self' data:",
      "worker-src 'self' blob:",
      `connect-src ${connectSources}`,
      `frame-src ${frameSources}`,
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || readRootEnvValue('EXPO_PUBLIC_SUPABASE_URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || readRootEnvValue('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
    NEXT_PUBLIC_KAKAO_MAP_JS_KEY:
      process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY || readRootEnvValue('NEXT_PUBLIC_KAKAO_MAP_JS_KEY'),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
