import {
  readAdminPostgrestSessionConfig,
  readPostgrestRows,
} from './data/postgrest';

export interface AdminProductRow {
  id: string;
  name: string;
  brand: string;
  category: string;
  activeListings: number;
  matchRules: number;
  safetyFlags: string[];
  status: 'active' | 'draft' | 'paused' | 'retired';
  lastVerifiedAt: string;
}

const productRows: AdminProductRow[] = [
  {
    id: 'bs_v1_003',
    name: '밀크 프로틴 배스',
    brand: 'Daily Bath',
    category: 'bath_salt',
    activeListings: 1,
    matchRules: 1,
    safetyFlags: [],
    status: 'active',
    lastVerifiedAt: '2026-04-29',
  },
  {
    id: 'bs_v1_005',
    name: '중탄산 입욕정',
    brand: 'Bath Therapy',
    category: 'bath_item',
    activeListings: 1,
    matchRules: 1,
    safetyFlags: [],
    status: 'active',
    lastVerifiedAt: '2026-04-29',
  },
  {
    id: 'bs_v1_009',
    name: '히노끼 배스 오일',
    brand: 'Forest Ritual',
    category: 'essential_oil',
    activeListings: 1,
    matchRules: 1,
    safetyFlags: ['sensitive_skin'],
    status: 'active',
    lastVerifiedAt: '2026-04-29',
  },
  {
    id: 'bs_v1_016',
    name: '천일염 풋배스 솔트',
    brand: 'Barefoot Lab',
    category: 'bath_salt',
    activeListings: 1,
    matchRules: 1,
    safetyFlags: [],
    status: 'active',
    lastVerifiedAt: '2026-04-29',
  },
  {
    id: 'bs_v1_021',
    name: '페퍼민트 바디워시',
    brand: 'Awake Shower',
    category: 'body_wash',
    activeListings: 1,
    matchRules: 1,
    safetyFlags: [],
    status: 'active',
    lastVerifiedAt: '2026-04-29',
  },
];

interface CanonicalProductRecord {
  id: string;
  name_ko: string;
  brand: string;
  category: string;
  status: AdminProductRow['status'];
  last_verified_at: string;
}

interface ProductMarketListingRecord {
  canonical_product_id: string;
}

interface ProductMatchRuleRecord {
  canonical_product_id: string;
}

interface ProductPresentationRecord {
  canonical_product_id: string;
  safety_flags?: string[];
}

export interface AdminProductListViewModel {
  rows: AdminProductRow[];
  totalCount: number;
  activeCount: number;
  needsSafetyReviewCount: number;
}

export function buildAdminProductListViewModel(
  rows: AdminProductRow[] = productRows
): AdminProductListViewModel {
  return {
    rows,
    totalCount: rows.length,
    activeCount: rows.filter((row) => row.status === 'active').length,
    needsSafetyReviewCount: rows.filter((row) => row.safetyFlags.length > 0).length,
  };
}

function countByProductId<T extends { canonical_product_id: string }>(
  rows: T[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.canonical_product_id, (counts.get(row.canonical_product_id) ?? 0) + 1);
  }
  return counts;
}

export async function readAdminProductRows(): Promise<AdminProductRow[]> {
  const config = await readAdminPostgrestSessionConfig();
  if (!config) return productRows;

  const [products, listings, matchRules, presentations] = await Promise.all([
    readPostgrestRows<CanonicalProductRecord>(config, 'canonical_product', {
      order: 'id.asc',
    }),
    readPostgrestRows<ProductMarketListingRecord>(config, 'product_market_listing'),
    readPostgrestRows<ProductMatchRuleRecord>(config, 'product_match_rule'),
    readPostgrestRows<ProductPresentationRecord>(config, 'product_presentation'),
  ]);

  return products.map((product) => ({
    id: product.id,
    name: product.name_ko,
    brand: product.brand,
    category: product.category,
    activeListings: countByProductId(listings).get(product.id) ?? 0,
    matchRules: countByProductId(matchRules).get(product.id) ?? 0,
    safetyFlags:
      presentations.find((item) => item.canonical_product_id === product.id)?.safety_flags ?? [],
    status: product.status,
    lastVerifiedAt: product.last_verified_at,
  }));
}

export function getProductStatusLabel(status: AdminProductRow['status']): string {
  if (status === 'draft') return 'Draft';
  if (status === 'paused') return 'Paused';
  if (status === 'retired') return 'Retired';
  return 'Active';
}
