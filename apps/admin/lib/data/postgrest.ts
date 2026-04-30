import { createSupabaseServerClient } from '../auth/server';

export interface AdminPostgrestConfig {
  restUrl: string;
  apiKey: string;
  authorizationToken: string;
  mode: 'supabase_auth';
}

function buildSupabaseRestUrl(env: Partial<Record<string, string | undefined>>): string | null {
  const explicitRestUrl = env.CONTENT_DB_REST_URL?.trim();
  if (explicitRestUrl) return explicitRestUrl.replace(/\/+$/, '');

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) return null;
  return `${supabaseUrl.replace(/\/+$/, '')}/rest/v1`;
}

export async function readAdminPostgrestSessionConfig(): Promise<AdminPostgrestConfig | null> {
  const restUrl = buildSupabaseRestUrl(process.env);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!restUrl || !anonKey) return null;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return null;

    return {
      restUrl,
      apiKey: anonKey,
      authorizationToken: session.access_token,
      mode: 'supabase_auth',
    };
  } catch {
    return null;
  }
}

export async function readPostgrestRows<T>(
  config: AdminPostgrestConfig,
  tableName: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  const url = new URL(`${config.restUrl}/${tableName}`);
  url.searchParams.set('select', '*');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: {
      apikey: config.apiKey,
      authorization: `Bearer ${config.authorizationToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`PostgREST ${tableName} read failed with status ${response.status}`);
  }

  return (await response.json()) as T[];
}

export async function updatePostgrestRows(
  config: AdminPostgrestConfig,
  tableName: string,
  filters: Record<string, string>,
  body: Record<string, unknown>
): Promise<void> {
  const url = new URL(`${config.restUrl}/${tableName}`);
  for (const [key, value] of Object.entries(filters)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    method: 'PATCH',
    headers: {
      apikey: config.apiKey,
      authorization: `Bearer ${config.authorizationToken}`,
      'content-type': 'application/json',
      prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`PostgREST ${tableName} update failed with status ${response.status}`);
  }
}

export async function insertPostgrestRow(
  config: AdminPostgrestConfig,
  tableName: string,
  body: Record<string, unknown>
): Promise<void> {
  const url = new URL(`${config.restUrl}/${tableName}`);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      apikey: config.apiKey,
      authorization: `Bearer ${config.authorizationToken}`,
      'content-type': 'application/json',
      prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`PostgREST ${tableName} insert failed with status ${response.status}`);
  }
}
