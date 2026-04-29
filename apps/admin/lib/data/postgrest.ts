export interface AdminPostgrestConfig {
  restUrl: string;
  serviceRoleKey: string;
}

export function readAdminPostgrestConfig(
  env: Partial<Record<string, string | undefined>> = process.env
): AdminPostgrestConfig | null {
  const restUrl = env.CONTENT_DB_REST_URL?.trim();
  const serviceRoleKey = env.CONTENT_DB_SERVICE_ROLE_KEY?.trim();
  if (!restUrl || !serviceRoleKey) return null;
  return { restUrl: restUrl.replace(/\/+$/, ''), serviceRoleKey };
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
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`PostgREST ${tableName} read failed with status ${response.status}`);
  }

  return (await response.json()) as T[];
}
