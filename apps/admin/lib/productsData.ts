import {
  readAdminPostgrestSessionConfig,
  readPostgrestRows,
} from './data/postgrest';

export interface AdminProductRow {
  id: string;
  name: string;
  brand: string;
  category: string;
  summary: string;
  tags: string[];
  emoji: string;
  bgColor: string;
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
    summary: '우유 단백질 계열 보습 성분이 들어 있어요.',
    tags: ['보습', '데일리'],
    emoji: 'BR',
    bgColor: '#EADBCB',
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
    summary: '향과 색을 거의 더하지 않은 중탄산 입욕제예요.',
    tags: ['중탄산', '리셋'],
    emoji: 'BT',
    bgColor: '#D8E5EA',
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
    summary: '편백나무를 떠올리게 하는 히노끼 향이 물에 퍼져요.',
    tags: ['히노끼', '숲'],
    emoji: 'HK',
    bgColor: '#D8E4D4',
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
    summary: '향이 거의 없는 천일염 계열 바스솔트예요.',
    tags: ['솔트', '풋배스'],
    emoji: 'BS',
    bgColor: '#E9DEC9',
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
    summary: '페퍼민트와 유칼립투스 향의 산뜻한 바디워시예요.',
    tags: ['페퍼민트', '샤워'],
    emoji: 'AW',
    bgColor: '#D6E9E4',
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
  summary: string;
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
  tags?: string[];
  emoji?: string;
  bg_color?: string;
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

  return products.map((product) => {
    const presentation = presentations.find(
      (item) => item.canonical_product_id === product.id
    );

    return {
      id: product.id,
      name: product.name_ko,
      brand: product.brand,
      category: product.category,
      summary: product.summary,
      tags: presentation?.tags ?? [],
      emoji: presentation?.emoji ?? '-',
      bgColor: presentation?.bg_color ?? '#000000',
      activeListings: countByProductId(listings).get(product.id) ?? 0,
      matchRules: countByProductId(matchRules).get(product.id) ?? 0,
      safetyFlags: presentation?.safety_flags ?? [],
      status: product.status,
      lastVerifiedAt: product.last_verified_at,
    };
  });
}

export function getProductStatusLabel(status: AdminProductRow['status']): string {
  if (status === 'draft') return 'Draft';
  if (status === 'paused') return 'Paused';
  if (status === 'retired') return 'Retired';
  return 'Active';
}
