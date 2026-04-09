import { describe, expect, test } from '@jest/globals';
import { buildRecipeEvidenceLines } from '../explainability';
import { BathRecommendation } from '../types';

const baseRecommendation: BathRecommendation = {
  id: 'rec_1',
  mode: 'care',
  persona: 'P3_MUSCLE',
  environmentUsed: 'bathtub',
  bathType: 'full',
  temperature: { min: 38, max: 41, recommended: 40 },
  durationMinutes: 15,
  ingredients: [],
  music: { id: 'm1', title: 'm', filename: 'm.mp3', durationSeconds: 60, persona: ['P3_MUSCLE'] },
  ambience: { id: 'a1', title: 'a', filename: 'a.mp3', durationSeconds: 60, persona: ['P3_MUSCLE'] },
  lighting: 'soft',
  safetyWarnings: [],
  environmentHints: [],
  colorHex: '#000000',
  createdAt: new Date().toISOString(),
};

describe('buildRecipeEvidenceLines', () => {
  test('returns 2 reason lines and fallback safety for care recommendation', () => {
    const result = buildRecipeEvidenceLines(baseRecommendation);
    expect(result.reasonLines).toHaveLength(2);
    expect(result.reasonLines[0]).toContain('근육 케어');
    expect(result.reasonLines[0]).not.toContain('P3_MUSCLE');
    expect(result.reasonLines[1]).toContain('40°C');
    expect(result.safetyLine).toContain('권장 수온');
  });

  test('uses theme title and warning in trip recommendation', () => {
    const tripRecommendation: BathRecommendation = {
      ...baseRecommendation,
      mode: 'trip',
      bathType: 'shower',
      themeTitle: '교토 포레스트',
      safetyWarnings: ['고혈압/심장 질환이 있으시므로 수온이 38°C로 제한됩니다.'],
    };
    const result = buildRecipeEvidenceLines(tripRecommendation);
    expect(result.reasonLines[0]).toContain('교토 포레스트');
    expect(result.reasonLines[1]).toContain('샤워');
    expect(result.safetyLine).toContain('38°C');
  });
});
