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

export function getProductStatusLabel(status: AdminProductRow['status']): string {
  if (status === 'draft') return 'Draft';
  if (status === 'paused') return 'Paused';
  if (status === 'retired') return 'Retired';
  return 'Active';
}
