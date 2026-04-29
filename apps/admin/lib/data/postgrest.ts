import { createSupabaseServerClient } from '../auth/server';

export interface AdminPostgrestConfig {
  restUrl: string;
  apiKey: string;
  authorizationToken: string;
  mode: 'supabase_auth' | 'service_role';
}

export function readAdminPostgrestConfig(
  env: Partial<Record<string, string | undefined>> = process.env
): AdminPostgrestConfig | null {
  const restUrl = env.CONTENT_DB_REST_URL?.trim();
  const serviceRoleKey = env.CONTENT_DB_SERVICE_ROLE_KEY?.trim();
  if (!restUrl || !serviceRoleKey) return null;
  return {
    restUrl: restUrl.replace(/\/+$/, ''),
    apiKey: serviceRoleKey,
    authorizationToken: serviceRoleKey,
    mode: 'service_role',
  };
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

  if (!restUrl || !anonKey) return readAdminPostgrestConfig();

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return readAdminPostgrestConfig();

    return {
      restUrl,
      apiKey: anonKey,
      authorizationToken: session.access_token,
      mode: 'supabase_auth',
    };
  } catch {
    return readAdminPostgrestConfig();
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
    next: { revalidate: 60 },
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
