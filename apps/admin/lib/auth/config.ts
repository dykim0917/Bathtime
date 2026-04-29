export interface AdminAuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function readAdminAuthConfig(
  env: Partial<Record<string, string | undefined>> = process.env
): AdminAuthConfig | null {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) return null;
  return { supabaseUrl, supabaseAnonKey };
}

export function requireAdminAuthConfig(): AdminAuthConfig {
  const config = readAdminAuthConfig();
  if (!config) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }
  return config;
}
