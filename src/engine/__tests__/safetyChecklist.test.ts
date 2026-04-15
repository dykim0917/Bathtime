import { describe, expect, test } from '@jest/globals';
import { buildSafetyChecklist } from '../safetyChecklist';

describe('buildSafetyChecklist', () => {
  test('maps hypertension warning to actionable checklist', () => {
    const result = buildSafetyChecklist([
      '고혈압/심장 질환이 있으시므로 수온이 38°C로 제한됩니다.',
    ]);
    expect(result.some((line) => line.includes('38°C'))).toBe(true);
    expect(result.some((line) => line.includes('즉시 중단'))).toBe(true);
  });

  test('returns fallback checklist when warning keywords are unknown', () => {
    const result = buildSafetyChecklist(['알 수 없는 경고 문구']);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain('권장 수온');
  });

  test('deduplicates checklist items on repeated warnings', () => {
    const result = buildSafetyChecklist([
      '당뇨가 있으시므로 족욕 시 수온을 자주 확인해주세요. 화상에 유의하세요.',
      '당뇨가 있으시므로 족욕 시 수온을 자주 확인해주세요. 화상에 유의하세요.',
    ]);
    expect(new Set(result).size).toBe(result.length);
  });
});
