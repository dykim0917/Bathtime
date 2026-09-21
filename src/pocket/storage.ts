import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient } from '@/src/auth/supabase';
import { normalizeArchiveLink } from './contracts';
import { pocketNative } from './native';

export interface LocalArchiveLink {
  id: string; url: string; title: string; ownerId: string; createdAt: string;
  state: 'pending' | 'synced' | 'error' | 'deleting'; sourceId?: string; error?: string;
}
const queueKey = 'bathtime.pocket.outbox.v1';
let mutation = Promise.resolve();
async function change(fn: (rows: LocalArchiveLink[]) => LocalArchiveLink[]): Promise<void> {
  const next = mutation.then(async () => {
    const rows = JSON.parse(await AsyncStorage.getItem(queueKey) ?? '[]') as LocalArchiveLink[];
    await AsyncStorage.setItem(queueKey, JSON.stringify(fn(rows)));
  });
  mutation = next.catch(() => undefined);
  return next;
}

export async function localArchiveLinks(ownerId: string): Promise<LocalArchiveLink[]> {
  if (pocketNative) return JSON.parse(await pocketNative.getEntries(ownerId));
  await mutation;
  const rows = JSON.parse(await AsyncStorage.getItem(queueKey) ?? '[]') as LocalArchiveLink[];
  return rows.filter((row) => !row.ownerId || row.ownerId === ownerId);
}

export async function saveArchiveLink(input: string, ownerId: string): Promise<void> {
  const link = normalizeArchiveLink(input);
  if (pocketNative) { await pocketNative.enqueue(link.url, ''); return; }
  await change((rows) => {
    if (rows.some((row) => row.url === link.url && row.ownerId === ownerId && row.state === 'deleting')) {
      throw new Error('삭제 중이에요. 잠시 후 다시 저장해 주세요.');
    }
    return rows.some((row) => row.url === link.url && row.ownerId === ownerId) ? rows : [{
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, url: link.url, title: '', ownerId,
    createdAt: new Date().toISOString(), state: 'pending',
  }, ...rows];
  });
}

let syncing: Promise<void> | null = null;
export function syncArchiveLinks(): Promise<void> {
  if (pocketNative) return pocketNative.retry();
  if (syncing) return syncing;
  syncing = syncWebLinks().finally(() => { syncing = null; });
  return syncing;
}

async function syncWebLinks() {
  const client = getSupabaseClient();
  if (!client) return;
  const { data } = await client.auth.getSession();
  const ownerId = data.session?.user.id;
  if (!ownerId) return;
  await change((rows) => rows.map((row) => row.ownerId ? row : { ...row, ownerId }));
  const rows = await localArchiveLinks(ownerId);
  for (const row of rows) {
    if (row.ownerId !== ownerId || !['pending', 'deleting'].includes(row.state)) continue;
    const current = await client.auth.getSession();
    if (current.data.session?.user.id !== ownerId) return;
    const latest = (await localArchiveLinks(ownerId)).find((item) => item.id === row.id);
    if (!latest) continue;
    if (latest.state === 'deleting') {
      await deleteWebRow(latest, current.data.session.access_token);
      continue;
    }
    // Bind the request to the captured owner even if the UI signs out mid-request.
    const { data: result, error } = await client.functions.invoke('archive-save', {
      body: { requestId: row.id, operation: 'save', url: row.url, title: row.title }, headers: { Authorization: `Bearer ${current.data.session.access_token}` },
    });
    if (error) return;
    if (result?.cancelled) { await change((items) => items.filter((item) => item.id !== row.id)); continue; }
    if (!result?.sourceId) return;
    await change((items) => items.map((item) => item.id === row.id ? { ...item, state: item.state === 'deleting' ? 'deleting' : 'synced', sourceId: result.sourceId } : item));
    const completed = (await localArchiveLinks(ownerId)).find((item) => item.id === row.id);
    if (completed?.state === 'deleting') await deleteWebRow(completed, current.data.session.access_token);
  }
}

export async function removeLocalArchiveLink(id: string): Promise<void> {
  if (pocketNative) { await pocketNative.remove(id); return; }
  await change((rows) => rows.filter((row) => row.id !== id || Boolean(row.ownerId))
    .map((row) => row.id === id ? { ...row, state: 'deleting' } : row));
}

async function deleteWebRow(row: LocalArchiveLink, token: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('서버 연결을 확인해 주세요.');
  const { data, error } = await client.functions.invoke('archive-save', {
    body: { requestId: row.id, operation: 'cancel', url: row.url }, headers: { Authorization: `Bearer ${token}` },
  });
  if (error || !data?.cancelled) throw new Error('삭제를 다시 시도할게요.');
  await change((rows) => rows.filter((item) => item.id !== row.id));
}

export const archiveCacheKey = (userId: string) => `bathtime.pocket.cache.v1.${userId}`;
