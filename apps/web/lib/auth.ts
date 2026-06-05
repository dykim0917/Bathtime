'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;

  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        persistSession: true,
      },
    });
  }

  return client;
}

export function buildRedirectTo(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const origin = window.location.origin === 'https://www.getbathtime.com' ? 'https://getbathtime.com' : window.location.origin;
  return new URL('/auth/callback', origin).toString();
}

export function buildNativeAppRedirectTo(): string {
  return 'getbathtime://auth/callback';
}
