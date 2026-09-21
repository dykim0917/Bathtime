import { readAdminPostgrestSessionConfig, readPostgrestRows } from './data/postgrest';

export async function pocketRows<T>(table: string, params: Record<string, string> = {}): Promise<T[]> {
  const config = await readAdminPostgrestSessionConfig();
  if (!config) throw new Error('관리자 로그인과 DB 연결을 확인해 주세요.');
  return readPostgrestRows<T>(config, table, params);
}

export async function pocketRpc(name: string, body: Record<string, unknown>): Promise<unknown> {
  const config = await readAdminPostgrestSessionConfig();
  if (!config) throw new Error('관리자 로그인이 필요해요.');
  const result = await fetch(`${config.restUrl}/rpc/${name}`, {
    method: 'POST', cache: 'no-store', headers: { apikey: config.apiKey,
      authorization: `Bearer ${config.authorizationToken}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!result.ok) {
    const error = await result.json().catch(() => ({}));
    if (error.message === 'Review revision conflict') throw new Error('다른 결과가 먼저 반영됐어요. 새로고침 후 확인해 주세요.');
    if (error.message === 'Job is already assigned') throw new Error('다른 관리자가 정리 중이에요.');
    throw new Error(`저장하지 못했어요. 입력 내용과 관리자 권한을 확인해 주세요. (${result.status})`);
  }
  return result.json();
}

export interface PocketSourceRow {
  id: string; url: string; title: string; summary: string; creator: string; status: string;
  revision: number; platform: string; posted_at: string | null; checked_at: string | null;
  created_at: string; reason: string | null;
}

export const pocketStatus: Record<string, string> = {
  queued: '정리 대기', processing: '정리 중', ready: '정리 완료', unavailable: '확인 어려움',
};
