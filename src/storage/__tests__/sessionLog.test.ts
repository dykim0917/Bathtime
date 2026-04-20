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

import {
  loadSessionLog,
  patchSessionRecord,
  upsertSessionRecord,
} from '../sessionLog';

describe('session log storage', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  test('upsert inserts and overwrites same id', async () => {
    await upsertSessionRecord({
      id: 'rec_1',
      date: '2026-03-04T10:00:00.000Z',
      mode: 'care',
      trip_name: null,
      temperature: 39,
      duration: 15,
      user_feeling_before: 2,
      user_feeling_after: 3,
    });

    await upsertSessionRecord({
      id: 'rec_1',
      date: '2026-03-04T10:05:00.000Z',
      mode: 'care',
      trip_name: null,
      temperature: 39,
      duration: 12,
      user_feeling_before: 2,
      user_feeling_after: 4,
    });

    const list = await loadSessionLog();
    expect(list).toHaveLength(1);
    expect(list[0].duration).toBe(12);
    expect(list[0].user_feeling_after).toBe(4);
  });

  test('patch updates existing record fields', async () => {
    await upsertSessionRecord({
      id: 'rec_2',
      date: '2026-03-04T11:00:00.000Z',
      mode: 'trip',
      trip_name: '교토 포레스트',
      temperature: 38,
      duration: 10,
      user_feeling_before: 3,
      user_feeling_after: 3,
    });

    await patchSessionRecord('rec_2', {
      duration: 8,
      user_feeling_after: 2,
    });

    const list = await loadSessionLog();
    expect(list[0].duration).toBe(8);
    expect(list[0].user_feeling_after).toBe(2);
  });
});
