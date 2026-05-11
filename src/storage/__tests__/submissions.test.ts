import { requireSupabaseClient } from '@/src/auth/supabase';
import { AuthRequiredError } from '@/src/storage/savedContent';
import { saveSubmission } from '@/src/storage/submissions';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@/src/auth/supabase', () => ({
  requireSupabaseClient: jest.fn(),
}));

const mockedRequireSupabaseClient = requireSupabaseClient as jest.Mock;

describe('submission storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires authentication before inserting a submission', async () => {
    mockedRequireSupabaseClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    await expect(saveSubmission({ type: 'topic', comment: '다뤄주세요' })).rejects.toBeInstanceOf(AuthRequiredError);
  });

  it('inserts the authenticated submission without trusting client userId', async () => {
    const profileUpsert = jest.fn().mockResolvedValue({ error: null });
    const single = jest.fn().mockResolvedValue({
      data: {
        id: 'submission-1',
        user_id: 'user-1',
        type: 'topic',
        link_or_image: null,
        comment: '다뤄주세요',
        nickname: null,
        can_publish: true,
        status: 'new',
        created_at: '2026-05-11T00:00:00.000Z',
        updated_at: '2026-05-11T00:00:00.000Z',
      },
      error: null,
    });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const from = jest.fn((table: string) => (table === 'user_profiles' ? { upsert: profileUpsert } : { insert }));
    mockedRequireSupabaseClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user-1',
              app_metadata: { provider: 'google' },
              user_metadata: {},
              identities: [{ id: 'google-user-1', provider: 'google' }],
            },
          },
          error: null,
        }),
      },
      from,
    });

    await expect(saveSubmission({ type: 'topic', comment: '다뤄주세요', canPublish: true })).resolves.toMatchObject({
      id: 'submission-1',
      userId: 'user-1',
      status: 'new',
    });
    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      type: 'topic',
      link_or_image: null,
      comment: '다뤄주세요',
      nickname: null,
      can_publish: true,
    });
  });
});
