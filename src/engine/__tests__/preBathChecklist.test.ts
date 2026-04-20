import { buildPreBathChecklist, shouldRequirePreBathGate } from '../preBathChecklist';
import { BathRecommendation } from '../types';

const baseRecommendation: BathRecommendation = {
  id: 'rec_1',
  mode: 'care',
  intentId: 'stress_relief',
  persona: 'P4_SLEEP',
  environmentUsed: 'bathtub',
  bathType: 'full',
  temperature: { min: 38, max: 40, recommended: 39 },
  durationMinutes: 12,
  ingredients: [],
  music: {
    id: 'music_1',
    title: 'm',
    filename: 'm.mp3',
    durationSeconds: 60,
    persona: ['P4_SLEEP'],
  },
  ambience: {
    id: 'ambience_1',
    title: 'a',
    filename: 'a.mp3',
    durationSeconds: 60,
    persona: ['P4_SLEEP'],
  },
  lighting: 'soft',
  safetyWarnings: [],
  environmentHints: [],
  colorHex: '#123456',
  createdAt: '2026-04-20T00:00:00.000Z',
};

describe('buildPreBathChecklist', () => {
  test('does not require a gate for a standard routine', () => {
    expect(shouldRequirePreBathGate(baseRecommendation)).toBe(false);
    const result = buildPreBathChecklist(baseRecommendation);
    expect(result).toHaveLength(0);
  });

  test('builds a concise gate for blocking safety warnings', () => {
    const riskyRecommendation = {
      ...baseRecommendation,
      safetyWarnings: ['고혈압/심장 질환이 있으시므로 수온이 38°C로 제한됩니다.'],
    };

    expect(shouldRequirePreBathGate(riskyRecommendation)).toBe(true);
    const result = buildPreBathChecklist(riskyRecommendation);

    expect(result).toHaveLength(2);
    expect(result[0].source).toBe('warning');
    expect(result[0].title).toContain('38°C');
  });

  test('adds history replay context ahead of a risky restart', () => {
    const result = buildPreBathChecklist(
      {
        ...baseRecommendation,
        safetyWarnings: ['음주 후 입욕은 위험합니다. 미온수 족욕만 가능합니다.'],
      },
      { source: 'history' }
    );

    expect(result).toHaveLength(3);
    expect(result[0].source).toBe('history');
    expect(result[0].title).toContain('오늘 몸 상태');
  });

  test('uses contrast-specific gate items for nordic sauna', () => {
    const result = buildPreBathChecklist(
      {
        ...baseRecommendation,
        mode: 'trip',
        intentId: 'nordic_sauna',
        themeId: 'nordic_sauna',
      }
    );

    expect(shouldRequirePreBathGate({
      ...baseRecommendation,
      mode: 'trip',
      intentId: 'nordic_sauna',
      themeId: 'nordic_sauna',
    })).toBe(true);
    expect(result.map((item) => item.id)).toEqual([
      'contrast-gentle-cool',
      'contrast-rest-cycle',
    ]);
  });
});
