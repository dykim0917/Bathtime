import { buildPreBathChecklist } from '../preBathChecklist';
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
  test('builds three base items for a standard routine', () => {
    const result = buildPreBathChecklist(baseRecommendation);

    expect(result).toHaveLength(3);
    expect(result[0].title).toContain('수온과 시간');
    expect(result[1].title).toContain('입욕 환경');
    expect(result[2].title).toContain('입욕 전 물 한 잔');
  });

  test('adds warning-driven items after the base checklist', () => {
    const result = buildPreBathChecklist({
      ...baseRecommendation,
      safetyWarnings: ['고혈압/심장 질환이 있으시므로 수온이 38°C로 제한됩니다.'],
    });

    expect(result).toHaveLength(5);
    expect(result[3].source).toBe('warning');
    expect(result[3].title).toContain('38°C');
    expect(result[4].title).toContain('즉시 중단');
  });

  test('uses history replay context instead of the hydration item', () => {
    const result = buildPreBathChecklist(baseRecommendation, { source: 'history' });

    expect(result).toHaveLength(3);
    expect(result[2].source).toBe('history');
    expect(result[2].title).toContain('오늘 컨디션');
  });

  test('keeps a stable order with base items first and warning items after', () => {
    const result = buildPreBathChecklist(
      {
        ...baseRecommendation,
        bathType: 'foot',
        safetyWarnings: ['음주 후 입욕은 위험합니다. 미온수 족욕만 가능합니다.'],
      },
      { source: 'history' }
    );

    expect(result.map((item) => item.id)).toEqual([
      'temperature-duration',
      'environment-ready',
      'history-replay',
      'warning-0',
      'warning-1',
    ]);
  });
});
