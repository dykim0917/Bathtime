import {
  type CanonicalProductRecord,
  type ProductCategory,
  type ProductEnvironment,
  type ProductMarketListingRecord,
  type ProductMatchRuleRecord,
} from '@/src/data/catalog';
import { type CatalogProduct } from '@/src/data/catalog';
import { type HealthCondition } from '@/src/engine/types';

export interface CatalogApiCanonicalProduct {
  id: string;
  ingredient_key: string;
  name_ko: string;
  brand: string;
  category: Exclude<ProductCategory, 'all' | 'herb'>;
  mechanism: CatalogProduct['mechanism'];
  price_tier: CatalogProduct['priceTier'];
  environments: ProductEnvironment[];
  summary: string;
  editorial_eyebrow: string;
  editorial_footer_hint: string;
  status: 'active' | 'paused' | 'retired';
  last_verified_at: string;
}

export interface CatalogApiMarketListing {
  id: string;
  canonical_product_id: string;
  market: ProductMarketListingRecord['market'];
  source_url: string;
  title_snapshot: string;
  seller_snapshot?: string | null;
  price_snapshot_krw?: number | null;
  availability: ProductMarketListingRecord['availability'];
  verified_at: string;
  source_confidence: number;
  notes?: string | null;
}

export interface CatalogApiMatchRule {
  id: string;
  canonical_product_id: string;
  ingredient_keys: string[];
  allowed_environments: ProductEnvironment[];
  mode_bias?: ProductMatchRuleRecord['modeBias'];
  priority_weight: number;
  is_sommelier_pick_candidate: boolean;
  status: ProductMatchRuleRecord['status'];
}

export interface CatalogApiPresentation {
  canonical_product_id: string;
  tags: string[];
  emoji: string;
  bg_color: string;
  safety_flags: HealthCondition[];
}

export interface CatalogApiResponse {
  schema_version: 'catalog.v1';
  snapshot_date: string;
  canonical_products: CatalogApiCanonicalProduct[];
  market_listings: CatalogApiMarketListing[];
  match_rules: CatalogApiMatchRule[];
  presentations: CatalogApiPresentation[];
}

export interface CatalogApiRuntimeBundle {
  canonicalProducts: CanonicalProductRecord[];
  marketListings: ProductMarketListingRecord[];
  matchRules: ProductMatchRuleRecord[];
}

export function toCatalogApiRuntimeBundle(
  payload: CatalogApiResponse
): CatalogApiRuntimeBundle {
  return {
    canonicalProducts: payload.canonical_products.map((item) => ({
      id: item.id,
      ingredientKey: item.ingredient_key,
      nameKo: item.name_ko,
      brand: item.brand,
      category: item.category,
      mechanism: item.mechanism,
      priceTier: item.price_tier,
      environments: item.environments,
      summary: item.summary,
      editorialEyebrow: item.editorial_eyebrow,
      editorialFooterHint: item.editorial_footer_hint,
      status: item.status,
      lastVerifiedAt: item.last_verified_at,
    })),
    marketListings: payload.market_listings.map((item) => ({
      id: item.id,
      canonicalProductId: item.canonical_product_id,
      market: item.market,
      sourceUrl: item.source_url,
      titleSnapshot: item.title_snapshot,
      sellerSnapshot: item.seller_snapshot ?? undefined,
      priceSnapshotKrw: item.price_snapshot_krw ?? undefined,
      availability: item.availability,
      verifiedAt: item.verified_at,
      sourceConfidence: item.source_confidence,
      notes: item.notes ?? undefined,
    })),
    matchRules: payload.match_rules.map((item) => ({
      id: item.id,
      canonicalProductId: item.canonical_product_id,
      ingredientKeys: item.ingredient_keys,
      allowedEnvironments: item.allowed_environments,
      modeBias: item.mode_bias,
      priorityWeight: item.priority_weight,
      isSommelierPickCandidate: item.is_sommelier_pick_candidate,
      status: item.status,
    })),
  };
}
