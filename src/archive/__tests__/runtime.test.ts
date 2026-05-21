import {
  getArchiveContents,
  hydrateArchiveContentsFromApi,
  resetArchiveContents,
} from '@/src/archive/runtime';

const originalEnv = process.env;
const originalFetch = global.fetch;

describe('archive runtime hydration', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    };
    resetArchiveContents();
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    resetArchiveContents();
  });

  test('keeps static fallback contents when the remote public query returns no rows', async () => {
    const fallbackCount = getArchiveContents().length;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }) as unknown as typeof fetch;

    const contents = await hydrateArchiveContentsFromApi();

    expect(contents).toHaveLength(fallbackCount);
    expect(getArchiveContents()).toHaveLength(fallbackCount);
    expect(contents.some((content) => content.id === 'care-sleep-warm-shower-90')).toBe(true);
  });
});
