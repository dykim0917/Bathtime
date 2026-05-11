import {
  clearPendingAuthAction,
  completePendingAuthAction,
  readPendingAuthAction,
  setPendingAuthAction,
} from '@/src/auth/pendingActions';
import { getSavedContentStorage } from '@/src/storage/savedContent';
import { saveSubmission } from '@/src/storage/submissions';

jest.mock('@/src/storage/savedContent', () => ({
  getSavedContentStorage: jest.fn(),
}));

jest.mock('@/src/storage/submissions', () => ({
  saveSubmission: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@/src/analytics/events', () => ({
  trackArchiveEvent: jest.fn(),
}));

const mockedGetSavedContentStorage = getSavedContentStorage as jest.Mock;
const mockedSaveSubmission = saveSubmission as jest.Mock;

function installSessionStorage() {
  const store: Record<string, string> = {};
  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: jest.fn((key: string) => store[key] ?? null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        for (const key of Object.keys(store)) delete store[key];
      }),
    },
  });
}

describe('pending auth actions', () => {
  beforeEach(() => {
    installSessionStorage();
    window.sessionStorage.clear();
    jest.clearAllMocks();
  });

  it('stores and clears a pending save action', async () => {
    await setPendingAuthAction({ type: 'save_content', contentId: 'content-a', returnTo: '/content/content-a' });

    expect(readPendingAuthAction()).toEqual({
      type: 'save_content',
      contentId: 'content-a',
      returnTo: '/content/content-a',
    });

    clearPendingAuthAction();
    expect(readPendingAuthAction()).toBeNull();
  });

  it('runs a pending content save after login', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    mockedGetSavedContentStorage.mockReturnValue({ save });
    await setPendingAuthAction({ type: 'save_content', contentId: 'content-a', returnTo: '/content/content-a' });

    await expect(completePendingAuthAction()).resolves.toMatchObject({ type: 'save_content' });
    expect(save).toHaveBeenCalledWith('content-a');
    expect(readPendingAuthAction()).toBeNull();
  });

  it('runs a pending submission after login', async () => {
    mockedSaveSubmission.mockResolvedValue({ id: 'submission-1' });
    const draft = { type: 'topic' as const, comment: '확인해주세요', canPublish: true };
    await setPendingAuthAction({ type: 'submit_draft', draft, returnTo: '/submit' });

    await expect(completePendingAuthAction()).resolves.toMatchObject({ type: 'submit_draft' });
    expect(mockedSaveSubmission).toHaveBeenCalledWith(draft);
    expect(readPendingAuthAction()).toBeNull();
  });
});
