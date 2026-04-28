import { buildHistoryInsights } from '../historyInsights';
import { BathRecommendation, TripMemoryRecord } from '../types';

const rec = (overrides: Partial<BathRecommendation>): BathRecommendation => ({
  id: 'rec_base',
  mode: 'care',
  persona: 'P1_SAFETY',
  environmentUsed: 'bathtub',
  bathType: 'half',
  temperature: { min: 38, max: 40, recommended: 39 },
  durationMinutes: 10,
  ingredients: [],
  music: { id: 'm', title: 'm', filename: 'm.mp3', durationSeconds: 1, persona: ['P1_SAFETY'] },
  ambience: { id: 'a', title: 'a', filename: 'a.mp3', durationSeconds: 1, persona: ['P1_SAFETY'] },
  lighting: 'warm',
  safetyWarnings: [],
  environmentHints: [],
  colorHex: '#fff',
  createdAt: '2026-02-25T00:00:00.000Z',
  ...overrides,
});

const memory = (overrides: Partial<TripMemoryRecord>): TripMemoryRecord => ({
  completionId: 'completion_base',
  recommendationId: 'rec_base',
  themeId: null,
  themeTitle: null,
  completionSnapshot: {
    recommendationId: 'rec_base',
    completedAt: '2026-02-25T12:00:00.000Z',
    mode: 'care',
    environment: 'bathtub',
    temperatureRecommended: 39,
    durationMinutes: 10,
    feedback: null,
  },
  themePreferenceWeight: 0,
  narrativeRecallCard: '기록',
  ...overrides,
});

describe('historyInsights', () => {
  test('builds aggregate metrics and top environment', () => {
    const history = [
      rec({ id: 'r1', mode: 'care', environmentUsed: 'bathtub' }),
      rec({ id: 'r2', mode: 'trip', environmentUsed: 'shower' }),
      rec({ id: 'r3', mode: 'trip', environmentUsed: 'shower' }),
    ];

    const memories = [
      memory({ recommendationId: 'r1', completionSnapshot: { ...memory({}).completionSnapshot, durationMinutes: 8 } }),
      memory({ recommendationId: 'r2', completionSnapshot: { ...memory({}).completionSnapshot, mode: 'trip', environment: 'shower', durationMinutes: 12 } }),
      memory({ recommendationId: 'r3', completionSnapshot: { ...memory({}).completionSnapshot, mode: 'trip', environment: 'shower', durationMinutes: 10 } }),
    ];

    const result = buildHistoryInsights(history, memories);

    expect(result.totalSessions).toBe(3);
    expect(result.careSessions).toBe(1);
    expect(result.tripSessions).toBe(2);
    expect(result.avgDurationMinutes).toBe(10);
    expect(result.topEnvironment).toBe('shower');
  });

  test('keeps recent recall max 3 sorted by completion time desc', () => {
    const history = [rec({ id: 'r1' })];
    const memories = [
      memory({ recommendationId: 'r1', completionSnapshot: { ...memory({}).completionSnapshot, completedAt: '2026-02-25T09:00:00.000Z' }, narrativeRecallCard: 'one' }),
      memory({ recommendationId: 'r2', completionSnapshot: { ...memory({}).completionSnapshot, completedAt: '2026-02-25T11:00:00.000Z' }, narrativeRecallCard: 'two' }),
      memory({ recommendationId: 'r3', completionSnapshot: { ...memory({}).completionSnapshot, completedAt: '2026-02-25T10:00:00.000Z' }, narrativeRecallCard: 'three' }),
      memory({ recommendationId: 'r4', completionSnapshot: { ...memory({}).completionSnapshot, completedAt: '2026-02-25T12:00:00.000Z' }, narrativeRecallCard: 'four' }),
    ];

    const result = buildHistoryInsights(history, memories);
    expect(result.recentRecalls).toHaveLength(3);
    expect(result.recentRecalls[0].text).toBe('four');
    expect(result.recentRecalls[1].text).toBe('two');
    expect(result.recentRecalls[2].text).toBe('three');
  });
});
