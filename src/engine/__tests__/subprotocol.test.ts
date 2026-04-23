import { applySubProtocolOverrides } from '../subprotocol';
import { BathRecommendation, SubProtocolOption } from '../types';

const baseRecommendation: BathRecommendation = {
  id: 'rec_1',
  mode: 'care',
  persona: 'P3_MUSCLE',
  environmentUsed: 'bathtub',
  bathType: 'half',
  temperature: { min: 38, max: 40, recommended: 39 },
  durationMinutes: 10,
  ingredients: [],
  music: {
    id: 'm1',
    title: 'm',
    filename: 'm.mp3',
    durationSeconds: 100,
    persona: ['P3_MUSCLE'],
  },
  ambience: {
    id: 'a1',
    title: 'a',
    filename: 'a.mp3',
    durationSeconds: 100,
    persona: ['P3_MUSCLE'],
  },
  lighting: 'warm',
  safetyWarnings: [],
  environmentHints: [],
  colorHex: '#fff',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('subprotocol', () => {
  test('applies duration delta and behavior blocks', () => {
    const option: SubProtocolOption = {
      id: 'sp1',
      intent_id: 'muscle_relief',
      label: '하체',
      hint: '힌트',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['동작 1회'],
        duration_delta: 2,
      },
    };

    const result = applySubProtocolOverrides(
      baseRecommendation,
      option,
      'bathtub',
      'muscle_relief'
    );

    expect(result.durationMinutes).toBe(12);
    expect(result.behaviorBlocks).toEqual(['동작 1회']);
    expect(result.intentId).toBe('muscle_relief');
    expect(result.subProtocolId).toBe('sp1');
  });

  test('adds advisory warning when environment bias conflicts', () => {
    const option: SubProtocolOption = {
      id: 'sp2',
      intent_id: 'edema_relief',
      label: '하체 붓기',
      hint: '힌트',
      is_default: true,
      partialOverrides: {
        behavior_blocks: [],
        environment_bias: 'partial_bath',
      },
    };

    const result = applySubProtocolOverrides(
      baseRecommendation,
      option,
      'bathtub',
      'edema_relief'
    );

    expect(result.environmentHints.some((line) => line.includes('족욕'))).toBe(true);
  });
});
