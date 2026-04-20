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
  applyFeedbackToThemePreference,
  loadTripMemoryHistory,
  saveCompletionMemory,
} from '../memory';
import { BathRecommendation } from '@/src/engine/types';

const recommendation: BathRecommendation = {
  id: 'rec_memory_1',
  mode: 'trip',
  themeId: 'kyoto_forest',
  themeTitle: 'Kyoto Forest',
  persona: 'P1_SAFETY',
  environmentUsed: 'bathtub',
  bathType: 'half',
  temperature: { min: 38, max: 40, recommended: 39 },
  durationMinutes: 12,
  ingredients: [],
  music: {
    id: 'm1',
    title: 'music',
    filename: 'music.mp3',
    durationSeconds: 180,
    persona: ['P1_SAFETY'],
  },
  ambience: {
    id: 'a1',
    title: 'ambience',
    filename: 'ambience.mp3',
    durationSeconds: 180,
    persona: ['P1_SAFETY'],
  },
  lighting: 'warm',
  safetyWarnings: [],
  environmentHints: [],
  colorHex: '#ffffff',
  createdAt: new Date().toISOString(),
};

describe('memory storage', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  test('saveCompletionMemory stores snapshot and initial theme weight', async () => {
    const result = await saveCompletionMemory(recommendation, null);

    expect(result.completionSnapshot.recommendationId).toBe(recommendation.id);
    expect(result.themePreferenceWeight).toBe(1);
    expect(result.narrativeRecallCard).toContain('Kyoto Forest');

    const history = await loadTripMemoryHistory();
    expect(history).toHaveLength(1);
  });

  test('saveCompletionMemory is idempotent for same recommendation', async () => {
    const first = await saveCompletionMemory(recommendation, null);
    const second = await saveCompletionMemory(recommendation, null);

    expect(second.themePreferenceWeight).toBe(first.themePreferenceWeight);
    const history = await loadTripMemoryHistory();
    expect(history).toHaveLength(1);
  });

  test('saveCompletionMemory applies override snapshot values on existing record', async () => {
    await saveCompletionMemory(recommendation, null);

    const updated = await saveCompletionMemory(recommendation, null, {
      completedAt: '2026-02-25T12:10:00.000Z',
      durationMinutes: 9,
    });

    expect(updated.completionSnapshot.completedAt).toBe('2026-02-25T12:10:00.000Z');
    expect(updated.completionSnapshot.durationMinutes).toBe(9);
  });

  test('positive feedback increases theme preference weight', async () => {
    await saveCompletionMemory(recommendation, null);
    const next = await applyFeedbackToThemePreference('kyoto_forest', 'good');
    expect(next).toBe(2);
  });
});
