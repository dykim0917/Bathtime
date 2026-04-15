import { buildProductMatchingSlots } from '../productMatching';
import { BathRecommendation } from '../types';

const baseRecommendation: BathRecommendation = {
  id: 'rec_test',
  mode: 'care',
  persona: 'P3_MUSCLE',
  environmentUsed: 'bathtub',
  bathType: 'half',
  temperature: { min: 38, max: 40, recommended: 39 },
  durationMinutes: 12,
  ingredients: [
    {
      id: 'epsom_salt',
      nameKo: '엡섬 솔트',
      nameEn: 'Epsom Salt',
      description: '회복',
      contraindications: [],
      purchaseUrl: 'https://example.com/epsom-salt',
    },
    {
      id: 'carbonated_bath',
      nameKo: '탄산 입욕제',
      nameEn: 'Carbonated Bath',
      description: '중탄산',
      contraindications: [],
      purchaseUrl: 'https://example.com/carbonated-bath',
    },
    {
      id: 'lavender_oil',
      nameKo: '라벤더 오일',
      nameEn: 'Lavender Oil',
      description: '향',
      contraindications: [],
      purchaseUrl: 'https://example.com/lavender',
    },
    {
      id: 'shower_steamer',
      nameKo: '샤워 스티머',
      nameEn: 'Shower Steamer',
      description: '샤워',
      contraindications: [],
      purchaseUrl: 'https://example.com/shower-steamer',
    },
  ],
  music: {
    id: 'm1',
    title: 'track',
    filename: 'track.mp3',
    durationSeconds: 180,
    persona: ['P3_MUSCLE'],
  },
  ambience: {
    id: 'a1',
    title: 'amb',
    filename: 'amb.mp3',
    durationSeconds: 180,
    persona: ['P3_MUSCLE'],
  },
  lighting: 'soft white',
  safetyWarnings: [],
  environmentHints: [],
  colorHex: '#ffffff',
  createdAt: new Date().toISOString(),
};

describe('productMatching', () => {
  test('builds three slots with sommelier pick in slot A', () => {
    const slots = buildProductMatchingSlots(baseRecommendation, 'bathtub');

    expect(slots).toHaveLength(3);
    expect(slots[0].slot).toBe('A');
    expect(slots[0].sommelierPick).toBe(true);
    expect(slots[0].product.id).toBe('p_epsom_salt');
    expect(slots[1].slot).toBe('B');
    expect(slots[2].slot).toBe('C');
    expect(slots.every((slot) => slot.product.ingredientKeys.includes(slot.ingredient.id))).toBe(true);
  });

  test('filters incompatible shower products for bathtub', () => {
    const slots = buildProductMatchingSlots(baseRecommendation, 'bathtub');
    expect(slots.some((slot) => slot.product.id === 'p_shower_steamer')).toBe(false);
  });

  test('uses shower-compatible products in shower environment', () => {
    const slots = buildProductMatchingSlots(baseRecommendation, 'shower');
    expect(
      slots.every((slot) =>
        ['p_shower_steamer', 'p_carbonated_bath'].includes(slot.product.id)
      )
    ).toBe(true);
    expect(slots.every((slot) => slot.product.environments.includes('shower'))).toBe(true);
  });
});
