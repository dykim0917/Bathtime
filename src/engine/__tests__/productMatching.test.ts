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
    {
      id: 'body_wash_relaxing',
      nameKo: '릴랙싱 바디워시',
      nameEn: 'Relaxing Body Wash',
      description: '샤워 바디케어',
      contraindications: [],
      purchaseUrl: 'https://example.com/body-wash',
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
    const productSlots = slots.filter((slot) => slot.kind === 'product');

    expect(slots).toHaveLength(3);
    expect(productSlots[0].slot).toBe('A');
    expect(productSlots[0].sommelierPick).toBe(true);
    expect(productSlots[0].product.id).toBe('bs_v1_020');
    expect(productSlots[1].slot).toBe('B');
    expect(productSlots[2].slot).toBe('C');
    expect(
      productSlots.every((slot) => slot.product.ingredientKeys.includes(slot.ingredient.id))
    ).toBe(true);
  });

  test('uses the active carbonated bath alternative instead of paused BARTH listing', () => {
    const slots = buildProductMatchingSlots(
      {
        ...baseRecommendation,
        persona: 'P2_CIRCULATION',
        ingredients: baseRecommendation.ingredients.filter((item) => item.id === 'carbonated_bath'),
      },
      'bathtub'
    );
    const productSlots = slots.filter((slot) => slot.kind === 'product');

    expect(productSlots[0].product.id).toBe('bs_v1_006');
    expect(productSlots.some((slot) => slot.product.id === 'bs_v1_005')).toBe(false);
  });

  test('filters incompatible shower products for bathtub', () => {
    const slots = buildProductMatchingSlots(baseRecommendation, 'bathtub');
    expect(
      slots.some((slot) => slot.kind === 'product' && slot.product.environments.includes('shower'))
    ).toBe(false);
  });

  test('uses shower-compatible products in shower environment', () => {
    const slots = buildProductMatchingSlots(baseRecommendation, 'shower');
    const productSlots = slots.filter((slot) => slot.kind === 'product');

    expect(slots).toHaveLength(3);
    expect(productSlots.every((slot) => slot.product.id.startsWith('bs_v1_'))).toBe(true);
    expect(productSlots.every((slot) => slot.product.environments.includes('shower'))).toBe(true);
  });

  test('does not duplicate the same product to fill sparse routines', () => {
    const slots = buildProductMatchingSlots(
      {
        ...baseRecommendation,
        mode: 'trip',
        ingredients: [
          {
            id: 'hinoki_oil',
            nameKo: '히노끼',
            nameEn: 'Hinoki',
            description: '숲 향',
            contraindications: [],
            purchaseUrl: 'https://example.com/hinoki',
          },
        ],
      },
      'bathtub'
    );
    const productSlots = slots.filter((slot) => slot.kind === 'product');
    const guideSlots = slots.filter((slot) => slot.kind === 'guide');

    expect(slots).toHaveLength(3);
    expect(productSlots).toHaveLength(1);
    expect(guideSlots).toHaveLength(2);
    expect(new Set(productSlots.map((slot) => slot.product.id)).size).toBe(productSlots.length);
  });
});
