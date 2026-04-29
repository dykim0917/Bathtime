import { BathEnvironment, HealthCondition } from '@/src/engine/types';
import { INGREDIENTS } from '@/src/data/ingredients';
import { getProductImagePath } from '@/src/data/productImages';
import {
  CANONICAL_PRODUCT_SEED_V1,
  PRODUCT_MARKET_LISTING_SEED_V1,
  PRODUCT_MATCH_RULE_SEED_V1,
  type CanonicalProductSeed,
  type ProductMarketListingSeed,
  type ProductMatchRuleSeed,
} from '@/src/data/catalogResearchSeed';

export type ProductCategory =
  | 'all'
  | 'essential_oil'
  | 'bath_salt'
  | 'bath_item'
  | 'body_wash'
  | 'herb';

export type ProductMechanism = 'bicarbonate' | 'magnesium' | 'aromatic' | 'neutral';
export type ProductPriceTier = 'low' | 'mid' | 'high';
export type ProductEnvironment = 'bathtub' | 'shower';

export type CanonicalProductRecord = CanonicalProductSeed;
export type ProductMarketListingRecord = ProductMarketListingSeed;
export type ProductMatchRuleRecord = ProductMatchRuleSeed;
export interface CatalogPresentationRecord {
  canonicalProductId: string;
  tags: string[];
  emoji: string;
  bgColor: string;
  safetyFlags: HealthCondition[];
}

export interface CatalogProduct {
  id: string;
  ingredientKeys: string[];
  name: string;
  brand: string;
  description: string;
  category: Exclude<ProductCategory, 'all'>;
  tags: string[];
  emoji: string;
  bgColor: string;
  environments: ProductEnvironment[];
  safetyFlags: HealthCondition[];
  mechanism: ProductMechanism;
  priceTier: ProductPriceTier;
  priorityWeight: number;
  sommelierPickCandidate: boolean;
  imagePath: string;
  purchaseUrl?: string;
  editorial: {
    eyebrow: string;
    footerHint: string;
  };
  listing?: ProductMarketListingRecord;
}

const BEGINNER_VISIBLE_CATEGORIES: ProductCategory[] = [
  'bath_salt',
  'bath_item',
  'body_wash',
];

interface CatalogPresentationMetadata {
  tags: string[];
  emoji: string;
  bgColor: string;
  safetyFlags?: HealthCondition[];
}

const PRESENTATION_METADATA: Record<string, CatalogPresentationMetadata> = {
  bs_v1_003: {
    tags: ['보습', '우유단백질', '데일리'],
    emoji: 'BR',
    bgColor: '#EADBCB',
  },
  bs_v1_005: {
    tags: ['중탄산', '무향', '기포감'],
    emoji: 'BT',
    bgColor: '#D9E5EA',
  },
  bs_v1_006: {
    tags: ['라벤더', '발포', '반신욕'],
    emoji: 'KB',
    bgColor: '#DED7F0',
  },
  bs_v1_007: {
    tags: ['라벤더', '마조람', '저녁샤워'],
    emoji: 'AS',
    bgColor: '#D8E3D4',
  },
  bs_v1_009: {
    tags: ['히노끼', '편백향', '숲느낌'],
    emoji: 'HK',
    bgColor: '#D7E1C3',
  },
  bs_v1_013: {
    tags: ['엠버', '허브향', '따뜻한잔향'],
    emoji: 'RB',
    bgColor: '#E3D6C9',
  },
  bs_v1_014: {
    tags: ['매그놀리아', '샌달우드', '부드러운향'],
    emoji: 'AM',
    bgColor: '#E5D9D4',
  },
  bs_v1_016: {
    tags: ['천일염', '무향', '족욕'],
    emoji: 'BP',
    bgColor: '#D8E6E2',
  },
  bs_v1_020: {
    tags: ['밀크앤허니', '마그네슘', '엡섬솔트'],
    emoji: 'DT',
    bgColor: '#F0DFC8',
  },
  bs_v1_021: {
    tags: ['페퍼민트', '유칼립투스', '아침샤워'],
    emoji: 'AW',
    bgColor: '#D6E9E3',
  },
};

const ingredientById = new Map(INGREDIENTS.map((ingredient) => [ingredient.id, ingredient]));

function pickPrimaryListing(
  canonicalProductId: string,
  listingMap: Map<string, ProductMarketListingRecord[]>
): ProductMarketListingRecord | undefined {
  const listings = listingMap.get(canonicalProductId) ?? [];

  return [...listings].sort((a, b) => {
    const availabilityScore = (value: ProductMarketListingRecord['availability']) => {
      switch (value) {
        case 'active':
          return 3;
        case 'low_stock':
          return 2;
        case 'unknown':
          return 1;
        case 'out_of_stock':
          return 0;
        default:
          return 0;
      }
    };

    const availabilityDelta =
      availabilityScore(b.availability) - availabilityScore(a.availability);
    if (availabilityDelta !== 0) return availabilityDelta;

    return b.sourceConfidence - a.sourceConfidence;
  })[0];
}

function toCatalogCategory(category: CanonicalProductSeed['category']): Exclude<ProductCategory, 'all'> {
  if (category === 'body_wash') return 'body_wash';
  return category;
}

export function buildCatalogProducts(bundle: {
  canonicalProducts: CanonicalProductRecord[];
  marketListings: ProductMarketListingRecord[];
  matchRules: ProductMatchRuleRecord[];
  presentations?: CatalogPresentationRecord[];
}): CatalogProduct[] {
  const matchRuleByCanonicalId = new Map(
    bundle.matchRules
      .filter((rule) => rule.status === 'active')
      .map((rule) => [rule.canonicalProductId, rule])
  );
  const presentationByCanonicalId = new Map(
    (bundle.presentations ?? []).map((presentation) => [
      presentation.canonicalProductId,
      presentation,
    ])
  );
  const listingsByCanonicalId = new Map<string, ProductMarketListingRecord[]>();

  for (const listing of bundle.marketListings) {
    const current = listingsByCanonicalId.get(listing.canonicalProductId) ?? [];
    current.push(listing);
    listingsByCanonicalId.set(listing.canonicalProductId, current);
  }

  return bundle.canonicalProducts
    .filter((product) => product.status === 'active')
    .map((product) => {
      const rule = matchRuleByCanonicalId.get(product.id);
      if (!rule) {
        throw new Error(`Missing product match rule for canonical product: ${product.id}`);
      }

      const ingredient = ingredientById.get(product.ingredientKey);
      if (!ingredient) {
        throw new Error(`Missing ingredient for canonical product: ${product.id}`);
      }

      const presentation =
        presentationByCanonicalId.get(product.id) ?? PRESENTATION_METADATA[product.id];
      if (!presentation) {
        throw new Error(`Missing presentation metadata for canonical product: ${product.id}`);
      }

      const primaryListing = pickPrimaryListing(product.id, listingsByCanonicalId);

      return {
        id: product.id,
        ingredientKeys: rule.ingredientKeys,
        name: product.nameKo,
        brand: product.brand,
        description: product.summary,
        category: toCatalogCategory(product.category),
        tags: presentation.tags,
        emoji: presentation.emoji,
        bgColor: presentation.bgColor,
        environments: product.environments,
        safetyFlags: [
          ...new Set([
            ...ingredient.contraindications,
            ...(product.safetyFlags ?? []).filter((flag) => flag !== 'none'),
            ...(presentation.safetyFlags ?? []).filter((flag) => flag !== 'none'),
          ]),
        ],
        mechanism: product.mechanism,
        priceTier: product.priceTier,
        priorityWeight: rule.priorityWeight,
        sommelierPickCandidate: rule.isSommelierPickCandidate,
        imagePath: getProductImagePath(product.id),
        purchaseUrl: primaryListing?.sourceUrl ?? ingredient.purchaseUrl,
        editorial: {
          eyebrow: product.editorialEyebrow,
          footerHint: product.editorialFooterHint,
        },
        listing: primaryListing,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

const DEFAULT_PRODUCT_CATALOG = buildCatalogProducts({
  canonicalProducts: CANONICAL_PRODUCT_SEED_V1,
  marketListings: PRODUCT_MARKET_LISTING_SEED_V1,
  matchRules: PRODUCT_MATCH_RULE_SEED_V1,
});

let runtimeProductCatalog = DEFAULT_PRODUCT_CATALOG;

export const PRODUCT_CATALOG: CatalogProduct[] = DEFAULT_PRODUCT_CATALOG;

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  all: '전체',
  essential_oil: '에센셜 오일',
  bath_salt: '입욕제',
  bath_item: '샤워 아이템',
  body_wash: '바디워시',
  herb: '허브 케어',
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'all',
  'bath_salt',
  'bath_item',
  'body_wash',
];

export function getProductCatalog(): CatalogProduct[] {
  return runtimeProductCatalog;
}

export function setProductCatalog(products: CatalogProduct[]) {
  runtimeProductCatalog = products;
}

export function resetProductCatalog() {
  runtimeProductCatalog = DEFAULT_PRODUCT_CATALOG;
}

export function getProductById(productId: string): CatalogProduct | undefined {
  return getProductCatalog().find((item) => item.id === productId);
}

export function getProductsByCategory(category: ProductCategory): CatalogProduct[] {
  if (category === 'all') return getProductCatalog();
  return getProductCatalog().filter((item) => item.category === category);
}

export function isBeginnerFriendlyProduct(product: CatalogProduct): boolean {
  return BEGINNER_VISIBLE_CATEGORIES.includes(product.category);
}

export function getBeginnerFriendlyProductCatalog(): CatalogProduct[] {
  return getProductCatalog().filter(isBeginnerFriendlyProduct);
}

export function getCatalogProductForIngredient(
  ingredientId: string,
  environment: BathEnvironment
): CatalogProduct | undefined {
  return getCatalogProductsForIngredient(ingredientId, environment)[0];
}

export function getCatalogProductsForIngredient(
  ingredientId: string,
  environment: BathEnvironment
): CatalogProduct[] {
  const normalizedEnvironment: ProductEnvironment =
    environment === 'shower' ? 'shower' : 'bathtub';

  return getProductCatalog()
    .filter(
      (item) =>
      item.ingredientKeys.includes(ingredientId) &&
      item.environments.includes(normalizedEnvironment)
    )
    .sort((a, b) => {
      const beginnerDelta =
        Number(isBeginnerFriendlyProduct(b)) - Number(isBeginnerFriendlyProduct(a));
      if (beginnerDelta !== 0) return beginnerDelta;

      const priorityDelta = b.priorityWeight - a.priorityWeight;
      if (priorityDelta !== 0) return priorityDelta;

      const pickDelta =
        Number(b.sommelierPickCandidate) - Number(a.sommelierPickCandidate);
      if (pickDelta !== 0) return pickDelta;

      return a.name.localeCompare(b.name, 'ko');
    });
}
