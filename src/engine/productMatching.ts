import { BathEnvironment, BathRecommendation, Ingredient } from './types';
import {
  CatalogProduct,
  ProductMechanism,
  ProductPriceTier,
  getCatalogProductsForIngredient,
  isBeginnerFriendlyProduct,
} from '@/src/data/catalog';

export type ProductSlot = 'A' | 'B' | 'C';

export interface ProductMatchItem {
  kind: 'product';
  slot: ProductSlot;
  product: CatalogProduct;
  ingredient: Ingredient;
  mechanism: ProductMechanism;
  reason: string;
  priceTier: ProductPriceTier;
  sommelierPick: boolean;
}

export interface ProductGuideItem {
  kind: 'guide';
  slot: ProductSlot;
  title: string;
  eyebrow: string;
  description: string;
  tags: string[];
}

export type ProductMatchingItem = ProductMatchItem | ProductGuideItem;

interface ProductCandidate {
  ingredient: Ingredient;
  product: CatalogProduct;
  mechanism: ProductMechanism;
}

interface ProductGuideTemplate {
  title: string;
  description: string;
  tags: string[];
}

const GUIDE_LIBRARY: Record<string, ProductGuideTemplate[]> = {
  epsom_salt: [
    {
      title: '무향 마그네슘 솔트',
      description: '향을 더하고 싶지 않은 회복 루틴에는 마그네슘 계열 엡섬 솔트가 잘 맞아요.',
      tags: ['마그네슘', '무향', '회복'],
    },
    {
      title: '미네랄 족욕 솔트',
      description: '다리만 가볍게 쉬고 싶은 날에는 족욕에 넣기 쉬운 미네랄 솔트도 좋아요.',
      tags: ['족욕', '미네랄', '저자극'],
    },
  ],
  carbonated_bath: [
    {
      title: '저자극 탄산 입욕제',
      description: '향과 색이 강하지 않은 중탄산 제품은 짧은 반신욕에도 쓰기 편해요.',
      tags: ['탄산', '저자극', '리셋'],
    },
    {
      title: '데일리 발포 입욕제',
      description: '매일 쓰기에는 한 알씩 넣는 발포 입욕제처럼 양 조절이 쉬운 제품이 좋아요.',
      tags: ['발포', '데일리', '반신욕'],
    },
  ],
  hinoki_oil: [
    {
      title: '우디 그린 바디워시',
      description: '욕조가 없는 날에는 나무 향이나 풀 향이 나는 바디워시로 비슷한 분위기를 낼 수 있어요.',
      tags: ['우디', '그린', '샤워'],
    },
    {
      title: '숲향 샤워 스티머',
      description: '피부에 남는 제품이 부담스럽다면 편백, 유칼립투스 같은 숲 향 스티머를 볼 수 있어요.',
      tags: ['숲향', '스티머', '공간향'],
    },
  ],
  body_wash_relaxing: [
    {
      title: '저자극 향 바디워시',
      description: '향은 느끼고 싶지만 피부가 예민한 날에는 저자극 바디워시를 먼저 보는 편이 좋아요.',
      tags: ['저자극', '바디워시', '향'],
    },
    {
      title: '아로마 샤워 스티머',
      description: '바디워시를 바꾸지 않아도, 샤워 스티머로 욕실 안의 향만 더할 수 있어요.',
      tags: ['샤워스티머', '아로마', '기분전환'],
    },
  ],
};

const FALLBACK_GUIDES: Record<'bathtub' | 'shower', ProductGuideTemplate[]> = {
  bathtub: [
    {
      title: '기본 바스솔트',
      description: '향이 거의 없는 바스솔트는 어떤 루틴에도 무난하게 더하기 좋아요.',
      tags: ['바스솔트', '기본', '저향'],
    },
    {
      title: '보습형 입욕제',
      description: '목욕 뒤 피부가 쉽게 당긴다면 보습 성분이 들어간 입욕제를 함께 볼 수 있어요.',
      tags: ['보습', '입욕제', '데일리'],
    },
  ],
  shower: [
    {
      title: '릴랙싱 바디워시',
      description: '샤워 루틴에는 향이 편안하고 씻은 뒤 건조감이 적은 바디워시가 잘 맞아요.',
      tags: ['바디워시', '릴랙스', '샤워'],
    },
    {
      title: '아로마 샤워 스티머',
      description: '짧은 샤워에도 향을 더하고 싶다면 물줄기 밖에 두고 쓰는 스티머가 좋아요.',
      tags: ['스티머', '아로마', '짧은샤워'],
    },
  ],
};

function pickByMechanism(
  candidates: ProductCandidate[],
  preferred: ProductMechanism[],
  usedIds: Set<string>
): ProductCandidate | null {
  for (const mechanism of preferred) {
    const found = candidates.find(
      (item) => item.mechanism === mechanism && !usedIds.has(item.product.id)
    );
    if (found) return found;
  }

  const fallback = candidates.find((item) => !usedIds.has(item.product.id));
  return fallback ?? null;
}

function buildCompatibleCandidates(
  recommendation: BathRecommendation,
  environment: BathEnvironment
): ProductCandidate[] {
  const usedProductIds = new Set<string>();
  const candidates: ProductCandidate[] = [];

  for (const ingredient of recommendation.ingredients) {
    const products = getCatalogProductsForIngredient(ingredient.id, environment).filter(
      isBeginnerFriendlyProduct
    );

    for (const product of products) {
      if (usedProductIds.has(product.id)) continue;
      usedProductIds.add(product.id);
      candidates.push({
        ingredient,
        product,
        mechanism: product.mechanism,
      });
    }
  }

  return candidates;
}

function buildGuideItems(
  recommendation: BathRecommendation,
  environment: BathEnvironment,
  usedSlots: ProductSlot[],
  usedGuideTitles: Set<string>
): ProductGuideItem[] {
  const normalizedEnvironment = environment === 'shower' ? 'shower' : 'bathtub';
  const templates: ProductGuideTemplate[] = [];

  for (const ingredient of recommendation.ingredients) {
    templates.push(...(GUIDE_LIBRARY[ingredient.id] ?? []));
  }

  templates.push(...FALLBACK_GUIDES[normalizedEnvironment]);

  const availableSlots = (['A', 'B', 'C'] as ProductSlot[]).filter(
    (slot) => !usedSlots.includes(slot)
  );

  const guideItems: ProductGuideItem[] = [];

  for (const template of templates) {
    if (guideItems.length >= availableSlots.length) break;
    if (usedGuideTitles.has(template.title)) continue;
    usedGuideTitles.add(template.title);

    guideItems.push({
      kind: 'guide',
      slot: availableSlots[guideItems.length],
      eyebrow: '함께 찾으면 좋은 제품군',
      title: template.title,
      description: template.description,
      tags: template.tags,
    });
  }

  return guideItems;
}

export function buildProductMatchingSlots(
  recommendation: BathRecommendation,
  environment: BathEnvironment
): ProductMatchingItem[] {
  const compatible = buildCompatibleCandidates(recommendation, environment);
  if (compatible.length === 0 && recommendation.ingredients.length === 0) {
    return [];
  }

  const usedIds = new Set<string>();
  const mode = recommendation.mode === 'trip' ? 'recovery' : recommendation.persona === 'P4_SLEEP' ? 'sleep' : 'recovery';

  const slotAPrefer: ProductMechanism[] =
    mode === 'sleep' ? ['bicarbonate', 'magnesium', 'aromatic', 'neutral'] : ['magnesium', 'bicarbonate', 'aromatic', 'neutral'];

  const slotA = pickByMechanism(compatible, slotAPrefer, usedIds) ?? compatible[0];
  if (slotA) usedIds.add(slotA.product.id);

  const slotB = pickByMechanism(compatible, ['aromatic', 'neutral', 'bicarbonate', 'magnesium'], usedIds);
  if (slotB) usedIds.add(slotB.product.id);

  const slotC = pickByMechanism(compatible, ['neutral', 'bicarbonate', 'magnesium', 'aromatic'], usedIds);

  const productSlots = [slotA, slotB, slotC].filter(
    (item): item is ProductCandidate => item !== undefined && item !== null
  );
  const usedGuideTitles = new Set(productSlots.map((item) => item.product.name));
  const productItems: ProductMatchItem[] = productSlots.map((item, index) => {
    const slot = (['A', 'B', 'C'] as ProductSlot[])[index];

    return {
      kind: 'product',
      slot,
      product: item.product,
      ingredient: item.ingredient,
      mechanism: item.mechanism,
      reason: index === 0
        ? item.mechanism === 'magnesium' ? '몸을 쉬게 하는 제품' : item.mechanism === 'bicarbonate' ? '가볍게 입욕하기 좋은 제품' : '루틴에 먼저 맞는 제품'
        : index === 1
          ? '향을 바꿔볼 수 있는 제품'
          : '함께 비교하기 좋은 제품',
      priceTier: item.product.priceTier,
      sommelierPick: index === 0,
    };
  });

  const guideItems = buildGuideItems(
    recommendation,
    environment,
    productItems.map((item) => item.slot),
    usedGuideTitles
  );

  return [...productItems, ...guideItems];
}
