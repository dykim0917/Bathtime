import AsyncStorage from '@react-native-async-storage/async-storage';
import { localArchiveLinks, removeLocalArchiveLink, saveArchiveLink, syncArchiveLinks } from '../storage';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../native', () => ({ pocketNative: null }));
const mockSession = jest.fn();
const mockInvoke = jest.fn();
jest.mock('@/src/auth/supabase', () => ({
  getSupabaseClient: () => ({ auth: { getSession: mockSession }, functions: { invoke: mockInvoke } }),
}));
const session = (id: string) => ({ data: { session: { user: { id }, access_token: `token-${id}` } } });
beforeEach(async () => {
  await AsyncStorage.clear();
  mockSession.mockReset().mockResolvedValue(session('owner-a'));
  mockInvoke.mockReset().mockImplementation((_name, options) => Promise.resolve({
    data: options.body.operation === 'cancel' ? { cancelled: true } : { sourceId: 'source-a' }, error: null,
  }));
});

it('adopts guest links only for the signing-in owner', async () => {
  await saveArchiveLink('https://example.com/bath', '');
  await syncArchiveLinks();
  expect((await localArchiveLinks('owner-a'))[0]).toMatchObject({ ownerId: 'owner-a', state: 'synced' });
  expect(await localArchiveLinks('owner-b')).toEqual([]);
});

it('does not send one account’s queued links after switching accounts', async () => {
  await saveArchiveLink('https://example.com/bath', 'owner-a');
  mockSession.mockResolvedValue(session('owner-b'));
  await syncArchiveLinks();
  expect(mockInvoke).not.toHaveBeenCalled();
  expect((await localArchiveLinks('owner-a'))[0].state).toBe('pending');
});

it('stops when the account changes between reading and sending', async () => {
  await saveArchiveLink('https://example.com/bath', 'owner-a');
  mockSession.mockResolvedValueOnce(session('owner-a')).mockResolvedValue(session('owner-b'));
  await syncArchiveLinks();
  expect(mockInvoke).not.toHaveBeenCalled();
});

it('deletes a save completed after the user removed it, using the original owner token', async () => {
  await saveArchiveLink('https://example.com/bath', 'owner-a');
  let finish!: (value: unknown) => void;
  let started!: () => void;
  const sending = new Promise<void>((resolve) => { started = resolve; });
  mockInvoke.mockImplementationOnce(() => { started(); return new Promise((resolve) => { finish = resolve; }); });
  const sync = syncArchiveLinks();
  await sending;
  const [row] = await localArchiveLinks('owner-a');
  await removeLocalArchiveLink(row.id);
  mockSession.mockResolvedValue(session('owner-b'));
  finish({ data: { sourceId: 'source-a' }, error: null });
  await sync;
  expect(mockInvoke).toHaveBeenLastCalledWith('archive-save', expect.objectContaining({
    body: expect.objectContaining({ requestId: row.id, operation: 'cancel' }),
    headers: expect.objectContaining({ Authorization: 'Bearer token-owner-a' }),
  }));
  expect(await localArchiveLinks('owner-a')).toEqual([]);
});

it('keeps a failed deletion for a later retry', async () => {
  await saveArchiveLink('https://example.com/bath', 'owner-a');
  await syncArchiveLinks();
  await removeLocalArchiveLink((await localArchiveLinks('owner-a'))[0].id);
  mockInvoke.mockResolvedValueOnce({ error: new Error('network failure') });
  await expect(syncArchiveLinks()).rejects.toThrow('삭제');
  expect((await localArchiveLinks('owner-a'))[0].state).toBe('deleting');
  await syncArchiveLinks();
  expect(await localArchiveLinks('owner-a')).toEqual([]);
});

it('does not upload a pending link deleted before sync', async () => {
  await saveArchiveLink('https://example.com/bath', 'owner-a');
  await removeLocalArchiveLink((await localArchiveLinks('owner-a'))[0].id);
  await syncArchiveLinks();
  expect(mockInvoke).toHaveBeenCalledTimes(1);
  expect(mockInvoke.mock.calls[0][1].body.operation).toBe('cancel');
  expect(await localArchiveLinks('owner-a')).toEqual([]);
});

it('cancels by request ID even when the save response was lost', async () => {
  await saveArchiveLink('https://example.com/bath', 'owner-a');
  mockInvoke.mockResolvedValueOnce({ error: new Error('response lost') });
  await syncArchiveLinks();
  const [row] = await localArchiveLinks('owner-a');
  expect(row.sourceId).toBeUndefined();
  await removeLocalArchiveLink(row.id);
  await syncArchiveLinks();
  expect(mockInvoke).toHaveBeenLastCalledWith('archive-save', expect.objectContaining({
    body: { requestId: row.id, operation: 'cancel', url: row.url },
  }));
  expect(await localArchiveLinks('owner-a')).toEqual([]);
});

it('deduplicates tracking variants and waits for deletion before saving again', async () => {
  await saveArchiveLink('https://youtu.be/ZZdGwLauM00?si=one', 'owner-a');
  await saveArchiveLink('https://youtube.com/shorts/ZZdGwLauM00?si=two', 'owner-a');
  const rows = await localArchiveLinks('owner-a');
  expect(rows).toHaveLength(1);
  await removeLocalArchiveLink(rows[0].id);
  await expect(saveArchiveLink(rows[0].url, 'owner-a')).rejects.toThrow('삭제 중');
});
