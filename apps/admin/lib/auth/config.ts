export interface AdminAuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  allowedEmails: string[];
}

function parseAllowedEmails(value?: string): string[] {
  return (value ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function readAdminAuthConfig(
  env: Partial<Record<string, string | undefined>> = process.env
): AdminAuthConfig | null {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const allowedEmails = parseAllowedEmails(env.ADMIN_ALLOWED_EMAILS);

  if (!supabaseUrl || !supabaseAnonKey) return null;
  return { supabaseUrl, supabaseAnonKey, allowedEmails };
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

export function isAllowedAdminEmail(email: string | null | undefined, allowedEmails: string[]): boolean {
  if (allowedEmails.length === 0) return true;
  if (!email) return false;
  return allowedEmails.includes(email.toLowerCase());
}
