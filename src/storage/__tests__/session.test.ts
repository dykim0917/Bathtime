const mockStore = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
    getItem: jest.fn(async (key: string) => mockStore.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStore.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      mockStore.delete(key);
    }),
  },
}));

import { loadSession, saveSession, updateSessionCompletion } from '../session';

describe('session storage', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  test('updateSessionCompletion updates completedAt and actual duration', async () => {
    await saveSession({
      recommendationId: 'rec_1',
      startedAt: '2026-02-25T12:00:00.000Z',
    });

    await updateSessionCompletion('rec_1', '2026-02-25T12:10:00.000Z', 600);

    const updated = await loadSession();
    expect(updated?.recommendationId).toBe('rec_1');
    expect(updated?.completedAt).toBe('2026-02-25T12:10:00.000Z');
    expect(updated?.actualDurationSeconds).toBe(600);
  });

  test('updateSessionCompletion ignores mismatched recommendation id', async () => {
    await saveSession({
      recommendationId: 'rec_1',
      startedAt: '2026-02-25T12:00:00.000Z',
    });

    await updateSessionCompletion('rec_2', '2026-02-25T12:10:00.000Z', 600);

    const unchanged = await loadSession();
    expect(unchanged?.completedAt).toBeUndefined();
    expect(unchanged?.actualDurationSeconds).toBeUndefined();
  });
});
