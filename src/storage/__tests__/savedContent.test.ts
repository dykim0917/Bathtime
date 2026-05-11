import { requireSupabaseClient } from '@/src/auth/supabase';
import { AuthRequiredError, webSavedContentStorage } from '@/src/storage/savedContent';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@/src/auth/supabase', () => ({
  requireSupabaseClient: jest.fn(),
}));

const mockedRequireSupabaseClient = requireSupabaseClient as jest.Mock;

function mockSupabase(userId: string | null, overrides: Record<string, unknown> = {}) {
  const client = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: userId
            ? {
                id: userId,
                app_metadata: { provider: 'google' },
                user_metadata: {},
                identities: [{ id: 'google-user-1', provider: 'google' }],
              }
            : null,
        },
        error: null,
      }),
    },
    from: jest.fn(),
    ...overrides,
  };
  mockedRequireSupabaseClient.mockReturnValue(client);
  return client;
}

describe('web saved content storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires an authenticated user before reading saved ids', async () => {
    mockSupabase(null);

    await expect(webSavedContentStorage.getSavedIds()).rejects.toBeInstanceOf(AuthRequiredError);
  });

  it('reads saved content ids from Supabase in created order', async () => {
    const order = jest.fn().mockResolvedValue({
      data: [{ target_id: 'content-a' }, { target_id: 'content-b' }],
      error: null,
    });
    const eqTargetType = jest.fn().mockReturnValue({ order });
    const eqUser = jest.fn().mockReturnValue({ eq: eqTargetType });
    const select = jest.fn().mockReturnValue({ eq: eqUser });
    const from = jest.fn().mockReturnValue({ select });
    mockSupabase('user-1', { from });

    await expect(webSavedContentStorage.getSavedIds()).resolves.toEqual(['content-a', 'content-b']);
  });

  it('ignores duplicate save violations', async () => {
    const profileUpsert = jest.fn().mockResolvedValue({ error: null });
    const savedInsert = jest.fn().mockResolvedValue({ error: { code: '23505' } });
    const from = jest.fn((table: string) => ({
      ...(table === 'user_profiles' ? { upsert: profileUpsert } : { insert: savedInsert }),
    }));
    mockSupabase('user-1', { from });

    await expect(webSavedContentStorage.save('content-a')).resolves.toBeUndefined();
    expect(profileUpsert).toHaveBeenCalledWith({
      id: 'user-1',
      provider: 'google',
      provider_user_id: 'google-user-1',
      email: null,
      nickname: null,
      profile_image_url: null,
      updated_at: expect.any(String),
    });
    expect(savedInsert).toHaveBeenCalledWith({
      user_id: 'user-1',
      target_type: 'content',
      target_id: 'content-a',
    });
  });
});
