import { BathEnvironment, HealthCondition } from '@/src/engine/types';
import { INGREDIENTS } from '@/src/data/ingredients';
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
}

const PRESENTATION_METADATA: Record<string, CatalogPresentationMetadata> = {
  p_lavender_eo: {
    tags: ['수면', '이완', '스트레스'],
    emoji: 'LV',
    bgColor: '#E8E1F9',
  },
  p_marjoram_eo: {
    tags: ['이완', '혈압안정', '근육'],
    emoji: 'MJ',
    bgColor: '#DDE7CF',
  },
  p_carbonated_bath: {
    tags: ['순환', '리셋', '탄산'],
    emoji: 'CB',
    bgColor: '#C9D9F7',
  },
  p_grapefruit_eo: {
    tags: ['부종', '순환', '기분전환'],
    emoji: 'GF',
    bgColor: '#F7D7A4',
  },
  p_epsom_salt: {
    tags: ['근육통', '회복', '마그네슘'],
    emoji: 'EP',
    bgColor: '#B5D5C0',
  },
  p_peppermint_eo: {
    tags: ['두통', '피로', '집중'],
    emoji: 'PM',
    bgColor: '#D8ECDE',
  },
  p_hinoki_eo: {
    tags: ['삼림욕', '안정', '수면'],
    emoji: 'HK',
    bgColor: '#D7E1C3',
  },
  p_rosemary_eo: {
    tags: ['순환', '근육', '활력'],
    emoji: 'RS',
    bgColor: '#DCE6F8',
  },
  p_clary_sage_eo: {
    tags: ['생리통', '안정', '밸런스'],
    emoji: 'CS',
    bgColor: '#E7D8D0',
  },
  p_eucalyptus_eo: {
    tags: ['호흡', '감기', '집중'],
    emoji: 'EU',
    bgColor: '#D8ECDE',
  },
  p_chamomile_oil: {
    tags: ['진정', '민감피부', '수면'],
    emoji: 'CM',
    bgColor: '#F5E5A3',
  },
  p_shower_steamer: {
    tags: ['샤워', '아로마', '리프레시'],
    emoji: 'SH',
    bgColor: '#CFE2F3',
  },
  p_relaxing_body_wash: {
    tags: ['샤워', '바디케어', '릴랙스'],
    emoji: 'BW',
    bgColor: '#DCCFEB',
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
}): CatalogProduct[] {
  const matchRuleByCanonicalId = new Map(
    bundle.matchRules.map((rule) => [rule.canonicalProductId, rule])
  );
  const listingsByCanonicalId = new Map<string, ProductMarketListingRecord[]>();

  for (const listing of bundle.marketListings) {
    const current = listingsByCanonicalId.get(listing.canonicalProductId) ?? [];
    current.push(listing);
    listingsByCanonicalId.set(listing.canonicalProductId, current);
  }

  return bundle.canonicalProducts
    .map((product) => {
      const rule = matchRuleByCanonicalId.get(product.id);
      if (!rule) {
        throw new Error(`Missing product match rule for canonical product: ${product.id}`);
      }

      const ingredient = ingredientById.get(product.ingredientKey);
      if (!ingredient) {
        throw new Error(`Missing ingredient for canonical product: ${product.id}`);
      }

      const presentation = PRESENTATION_METADATA[product.id];
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
        safetyFlags: ingredient.contraindications,
        mechanism: product.mechanism,
        priceTier: product.priceTier,
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
  const normalizedEnvironment: ProductEnvironment =
    environment === 'shower' ? 'shower' : 'bathtub';

  return getProductCatalog().find(
    (item) =>
      item.ingredientKeys.includes(ingredientId) &&
      item.environments.includes(normalizedEnvironment)
  );
}
