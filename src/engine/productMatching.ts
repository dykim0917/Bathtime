import { BathEnvironment, BathRecommendation, Ingredient } from './types';
import {
  CatalogProduct,
  ProductMechanism,
  ProductPriceTier,
  getCatalogProductForIngredient,
  isBeginnerFriendlyProduct,
} from '@/src/data/catalog';

export type ProductSlot = 'A' | 'B' | 'C';

export interface ProductMatchItem {
  slot: ProductSlot;
  product: CatalogProduct;
  ingredient: Ingredient;
  mechanism: ProductMechanism;
  reason: string;
  priceTier: ProductPriceTier;
  sommelierPick: boolean;
}

function pickByMechanism(
  candidates: Array<{
    ingredient: Ingredient;
    product: CatalogProduct;
    mechanism: ProductMechanism;
  }>,
  preferred: ProductMechanism[],
  usedIds: Set<string>
): { ingredient: Ingredient; product: CatalogProduct; mechanism: ProductMechanism } | null {
  for (const mechanism of preferred) {
    const found = candidates.find(
      (item) => item.mechanism === mechanism && !usedIds.has(item.product.id)
    );
    if (found) return found;
  }

  const fallback = candidates.find((item) => !usedIds.has(item.product.id));
  return fallback ?? null;
}

function ensureThreeSlots(
  compatible: Array<{
    ingredient: Ingredient;
    product: CatalogProduct;
    mechanism: ProductMechanism;
  }>
): Array<{ ingredient: Ingredient; product: CatalogProduct; mechanism: ProductMechanism }> {
  if (compatible.length === 0) return [];

  const items = [...compatible];
  while (items.length < 3) {
    items.push(items[items.length - 1]);
  }
  return items;
}

export function buildProductMatchingSlots(
  recommendation: BathRecommendation,
  environment: BathEnvironment
): ProductMatchItem[] {
  const compatible = ensureThreeSlots(
    recommendation.ingredients
      .map((ingredient) => {
        const product = getCatalogProductForIngredient(ingredient.id, environment);
        if (!product || !isBeginnerFriendlyProduct(product)) return null;

        return {
          ingredient,
          product,
          mechanism: product.mechanism,
        };
      })
      .filter(
        (
          item
        ): item is {
          ingredient: Ingredient;
          product: CatalogProduct;
          mechanism: ProductMechanism;
        } => item !== null
      )
  );

  if (compatible.length === 0) {
    return [];
  }

  const usedIds = new Set<string>();
  const mode = recommendation.mode === 'trip' ? 'recovery' : recommendation.persona === 'P4_SLEEP' ? 'sleep' : 'recovery';

  const slotAPrefer: ProductMechanism[] =
    mode === 'sleep' ? ['bicarbonate', 'magnesium', 'aromatic', 'neutral'] : ['magnesium', 'bicarbonate', 'aromatic', 'neutral'];

  const slotA = pickByMechanism(compatible, slotAPrefer, usedIds) ?? compatible[0];
  usedIds.add(slotA.product.id);

  const slotB = pickByMechanism(compatible, ['aromatic', 'neutral', 'bicarbonate', 'magnesium'], usedIds) ?? compatible[1];
  usedIds.add(slotB.product.id);

  const slotC = pickByMechanism(compatible, ['neutral', 'bicarbonate', 'magnesium', 'aromatic'], usedIds) ?? compatible[2];

  return [
    {
      slot: 'A',
      product: slotA.product,
      ingredient: slotA.ingredient,
      mechanism: slotA.mechanism,
      reason: slotA.mechanism === 'magnesium' ? '회복 중심 기전 대표' : slotA.mechanism === 'bicarbonate' ? '수면/이완 기전 대표' : '핵심 루틴 대표',
      priceTier: slotA.product.priceTier,
      sommelierPick: true,
    },
    {
      slot: 'B',
      product: slotB.product,
      ingredient: slotB.ingredient,
      mechanism: slotB.mechanism,
      reason: '향/감성 중심 보조 옵션',
      priceTier: slotB.product.priceTier,
      sommelierPick: false,
    },
    {
      slot: 'C',
      product: slotC.product,
      ingredient: slotC.ingredient,
      mechanism: slotC.mechanism,
      reason: '가성비 대안 옵션',
      priceTier: slotC.product.priceTier,
      sommelierPick: false,
    },
  ];
}
