export type ProductMarket =
  | 'coupang'
  | 'naver_smartstore'
  | 'kurly'
  | 'oliveyoung'
  | 'official_store'
  | 'danawa'
  | 'other';
export type ListingAvailability = 'active' | 'low_stock' | 'out_of_stock' | 'unknown';
export type CanonicalProductStatus = 'active' | 'paused' | 'retired';
export type ProductSafetyFlag =
  | 'hypertension_heart'
  | 'pregnant'
  | 'diabetes'
  | 'sensitive_skin'
  | 'none';

export interface CanonicalProductSeed {
  id: string;
  ingredientKey: string;
  nameKo: string;
  brand: string;
  category: 'essential_oil' | 'bath_salt' | 'bath_item' | 'body_wash';
  mechanism: 'aromatic' | 'magnesium' | 'bicarbonate' | 'neutral';
  priceTier: 'low' | 'mid' | 'high';
  environments: Array<'bathtub' | 'shower'>;
  safetyFlags?: ProductSafetyFlag[];
  summary: string;
  editorialEyebrow: string;
  editorialFooterHint: string;
  status: CanonicalProductStatus;
  lastVerifiedAt: string;
}

export interface ProductMarketListingSeed {
  id: string;
  canonicalProductId: string;
  market: ProductMarket;
  sourceUrl: string;
  titleSnapshot: string;
  sellerSnapshot?: string;
  priceSnapshotKrw?: number;
  availability: ListingAvailability;
  verifiedAt: string;
  sourceConfidence: number;
  notes?: string;
}

export interface ProductMatchRuleSeed {
  id: string;
  canonicalProductId: string;
  ingredientKeys: string[];
  allowedEnvironments: Array<'bathtub' | 'shower'>;
  modeBias?: Array<'care' | 'trip' | 'sleep' | 'recovery' | 'reset'>;
  priorityWeight: number;
  isSommelierPickCandidate: boolean;
  status: 'active' | 'paused';
}

export const PRODUCT_RESEARCH_SNAPSHOT_DATE = '2026-04-22';

export const CANONICAL_PRODUCT_SEED_V1: CanonicalProductSeed[] = [
  {
    id: 'bs_v1_003',
    ingredientKey: 'body_wash_relaxing',
    nameKo: '바스로망 밀크 프로테인',
    brand: 'Bath Roman',
    category: 'bath_item',
    mechanism: 'neutral',
    priceTier: 'low',
    environments: ['bathtub'],
    summary: '우유 단백질 계열 보습 성분이 들어 있어, 목욕 뒤 피부 당김이 신경 쓰이는 날에 쓰기 좋아요.',
    editorialEyebrow: 'DAILY MOISTURE',
    editorialFooterHint: '향이 강한 제품보다 피부 보습감을 먼저 보고 싶을 때 잘 맞아요.',
    status: 'active',
    lastVerifiedAt: '2026-04-22',
  },
  {
    id: 'bs_v1_005',
    ingredientKey: 'carbonated_bath',
    nameKo: 'BARTH 바스 중성 중탄산 입욕제',
    brand: 'BARTH',
    category: 'bath_item',
    mechanism: 'bicarbonate',
    priceTier: 'high',
    environments: ['bathtub'],
    safetyFlags: ['pregnant'],
    summary: '향과 색을 거의 더하지 않은 중탄산 입욕제로, 물 안에서 잔잔한 기포가 올라와요.',
    editorialEyebrow: 'CLINICAL RESET',
    editorialFooterHint: '향보다 물의 온도와 기포감을 중심으로 쉬고 싶을 때 잘 맞아요.',
    status: 'active',
    lastVerifiedAt: '2026-04-22',
  },
  {
    id: 'bs_v1_006',
    ingredientKey: 'carbonated_bath',
    nameKo: '카오 바브 탄산 입욕제 라벤더',
    brand: 'Kao',
    category: 'bath_item',
    mechanism: 'bicarbonate',
    priceTier: 'low',
    environments: ['bathtub'],
    safetyFlags: ['pregnant', 'sensitive_skin'],
    summary: '라벤더 향이 나는 발포 입욕제로, 짧은 반신욕에도 쓰기 쉬운 타입이에요.',
    editorialEyebrow: 'DAILY RESET',
    editorialFooterHint: '강한 향보다 익숙한 라벤더 향으로 가볍게 시작하고 싶을 때 좋아요.',
    status: 'active',
    lastVerifiedAt: '2026-04-22',
  },
  {
    id: 'bs_v1_007',
    ingredientKey: 'body_wash_relaxing',
    nameKo: '아로마티카 서렌 바디워시 라벤더 & 마조람',
    brand: 'AROMATICA',
    category: 'body_wash',
    mechanism: 'aromatic',
    priceTier: 'mid',
    environments: ['shower'],
    safetyFlags: ['pregnant'],
    summary: '라벤더의 부드러운 허브 향에 마조람의 따뜻한 풀 향이 더해진 바디워시예요.',
    editorialEyebrow: 'AROMATIC SHOWER',
    editorialFooterHint: '잠들기 전, 향이 너무 날카롭지 않은 샤워 제품을 찾을 때 잘 맞아요.',
    status: 'active',
    lastVerifiedAt: '2026-04-22',
  },
  {
    id: 'bs_v1_009',
    ingredientKey: 'hinoki_oil',
    nameKo: '바스로망 히노끼 입욕제',
    brand: 'Bath Roman',
    category: 'bath_item',
    mechanism: 'aromatic',
    priceTier: 'low',
    environments: ['bathtub'],
    summary: '편백나무를 떠올리게 하는 히노끼 향이 물에 퍼지는 입욕제예요.',
    editorialEyebrow: 'FOREST TRIP',
    editorialFooterHint: '숲이나 목조탕 같은 느낌을 집에서 가볍게 더하고 싶을 때 좋아요.',
    status: 'active',
    lastVerifiedAt: '2026-04-22',
  },
  {
    id: 'bs_v1_013',
    ingredientKey: 'body_wash_relaxing',
    nameKo: '뉴트로지나 레인바스 오리지널 엠버 바디워시',
    brand: 'Neutrogena',
    category: 'body_wash',
    mechanism: 'aromatic',
    priceTier: 'low',
    environments: ['shower'],
    safetyFlags: ['sensitive_skin'],
    summary: '달큰하고 묵직한 엠버 향에 허브 향이 섞인 바디워시예요.',
    editorialEyebrow: 'ORIENTAL TRIP',
    editorialFooterHint: '상쾌한 향보다 차분하고 따뜻한 잔향을 남기고 싶을 때 잘 맞아요.',
    status: 'active',
    lastVerifiedAt: '2026-04-22',
  },
  {
    id: 'bs_v1_014',
    ingredientKey: 'body_wash_relaxing',
    nameKo: '아로마티카 멜로우니스 오일 인 바디워시',
    brand: 'AROMATICA',
    category: 'body_wash',
    mechanism: 'aromatic',
    priceTier: 'mid',
    environments: ['shower'],
    summary: '은은한 매그놀리아 꽃향에 샌달우드의 부드러운 나무 향이 더해진 바디워시예요.',
    editorialEyebrow: 'GENTLE NIGHT TRIP',
    editorialFooterHint: '짙은 향수 같은 바디워시가 부담스러운 밤에 쓰기 좋아요.',
    status: 'active',
    lastVerifiedAt: '2026-04-22',
  },
  {
    id: 'bs_v1_016',
    ingredientKey: 'epsom_salt',
    nameKo: '바스파 바스솔트',
    brand: 'Bathpa',
    category: 'bath_salt',
    mechanism: 'neutral',
    priceTier: 'low',
    environments: ['bathtub'],
    summary: '향이 거의 없는 천일염 계열 바스솔트로, 족욕이나 반신욕에 넣기 쉬워요.',
    editorialEyebrow: 'MINERAL SOAK',
    editorialFooterHint: '향이 부담스러운 날, 미지근한 물에 풀어 가볍게 쓰기 좋아요.',
    status: 'active',
    lastVerifiedAt: '2026-04-22',
  },
  {
    id: 'bs_v1_020',
    ingredientKey: 'epsom_salt',
    nameKo: "닥터틸즈 밀크 앤 허니 엡섬 솔트",
    brand: "Dr Teal's",
    category: 'bath_salt',
    mechanism: 'magnesium',
    priceTier: 'mid',
    environments: ['bathtub'],
    summary: '우유처럼 부드러운 향과 꿀처럼 달콤한 향이 나는 마그네슘 계열 엡섬 솔트예요.',
    editorialEyebrow: 'GENTLE WARMING',
    editorialFooterHint: '몸이 무겁거나 배와 허리가 예민한 날, 따뜻한 입욕에 더하기 좋아요.',
    status: 'active',
    lastVerifiedAt: '2026-04-22',
  },
  {
    id: 'bs_v1_021',
    ingredientKey: 'body_wash_relaxing',
    nameKo: '아로마티카 어웨이크닝 바디워시',
    brand: 'AROMATICA',
    category: 'body_wash',
    mechanism: 'aromatic',
    priceTier: 'mid',
    environments: ['shower'],
    safetyFlags: ['pregnant', 'sensitive_skin'],
    summary: '페퍼민트의 시원한 향과 유칼립투스의 맑은 풀 향이 나는 바디워시예요.',
    editorialEyebrow: 'COLD RELIEF',
    editorialFooterHint: '아침 샤워나 몸이 답답하게 느껴지는 날에 상쾌하게 쓰기 좋아요.',
    status: 'active',
    lastVerifiedAt: '2026-04-22',
  },
];

export const PRODUCT_MARKET_LISTING_SEED_V1: ProductMarketListingSeed[] = [
  {
    id: 'listing_danawa_bs_v1_003_01',
    canonicalProductId: 'bs_v1_003',
    market: 'danawa',
    sourceUrl: 'https://prod.danawa.com/info/?pcode=30478328',
    titleSnapshot: '바스로망 밀크 프로테인',
    sellerSnapshot: '다나와 가격비교',
    priceSnapshotKrw: 9500,
    availability: 'active',
    verifiedAt: '2026-04-22',
    sourceConfidence: 0.95,
    notes: '가격 비교 링크. 직접 구매 링크 확보 시 primary listing 교체 권장',
  },
  {
    id: 'listing_naver_bs_v1_005_01',
    canonicalProductId: 'bs_v1_005',
    market: 'naver_smartstore',
    sourceUrl: 'https://shop.mallpass.co.kr/mall/view/goodsNo/20938948',
    titleSnapshot: 'BARTH 바스 중성 중탄산 입욕제 90정',
    sellerSnapshot: '몰패스스토어',
    priceSnapshotKrw: 54600,
    availability: 'unknown',
    verifiedAt: '2026-04-22',
    sourceConfidence: 0.7,
    notes: '일본 직구 상품. 배송 지연과 관세 리스크 확인 필요',
  },
  {
    id: 'listing_other_bs_v1_006_01',
    canonicalProductId: 'bs_v1_006',
    market: 'other',
    sourceUrl: 'https://japanday.kr/product/카오-바브-입욕제-라벤더향-20정입/263/',
    titleSnapshot: '카오 바브 입욕제 라벤더향 20정입',
    sellerSnapshot: '오픈마켓 대행',
    priceSnapshotKrw: 11760,
    availability: 'active',
    verifiedAt: '2026-04-22',
    sourceConfidence: 0.8,
  },
  {
    id: 'listing_kurly_bs_v1_007_01',
    canonicalProductId: 'bs_v1_007',
    market: 'kurly',
    sourceUrl: 'https://www.kurly.com/goods/5060122',
    titleSnapshot: '아로마티카 서렌 바디워시 라벤더 & 마조람',
    sellerSnapshot: '마켓컬리',
    priceSnapshotKrw: 25000,
    availability: 'active',
    verifiedAt: '2026-04-22',
    sourceConfidence: 0.8,
  },
  {
    id: 'listing_other_bs_v1_009_01',
    canonicalProductId: 'bs_v1_009',
    market: 'other',
    sourceUrl: 'https://www.wishbucket.io/items/3581186',
    titleSnapshot: '바스로망 히노끼 입욕제',
    sellerSnapshot: '위시버킷',
    priceSnapshotKrw: 9670,
    availability: 'active',
    verifiedAt: '2026-04-22',
    sourceConfidence: 0.9,
    notes: '상품 확인 링크. 직접 구매 링크 확보 시 primary listing 교체 권장',
  },
  {
    id: 'listing_oliveyoung_bs_v1_013_01',
    canonicalProductId: 'bs_v1_013',
    market: 'oliveyoung',
    sourceUrl: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000152995',
    titleSnapshot: '뉴트로지나 레인바스 오리지널 엠버 바디워시',
    sellerSnapshot: '올리브영',
    priceSnapshotKrw: 9900,
    availability: 'active',
    verifiedAt: '2026-04-22',
    sourceConfidence: 0.95,
  },
  {
    id: 'listing_kurly_bs_v1_014_01',
    canonicalProductId: 'bs_v1_014',
    market: 'kurly',
    sourceUrl: 'https://www.kurly.com/goods/1000332767',
    titleSnapshot: '아로마티카 멜로우니스 오일 인 바디워시 메그놀리아&샌달우드',
    sellerSnapshot: '마켓컬리',
    priceSnapshotKrw: 20250,
    availability: 'active',
    verifiedAt: '2026-04-22',
    sourceConfidence: 0.85,
  },
  {
    id: 'listing_other_bs_v1_016_01',
    canonicalProductId: 'bs_v1_016',
    market: 'other',
    sourceUrl: 'https://m.gsshop.com/search/searchSect.gs?lseq=415660&tq=%EC%9E%85%EC%9A%95%EC%A0%9C',
    titleSnapshot: '바스파 바스솔트',
    sellerSnapshot: '오픈마켓 대행',
    priceSnapshotKrw: 15900,
    availability: 'active',
    verifiedAt: '2026-04-22',
    sourceConfidence: 0.8,
    notes: '검색 링크 기반. 직접 상품 URL 확보 시 교체 권장',
  },
  {
    id: 'listing_danawa_bs_v1_020_01',
    canonicalProductId: 'bs_v1_020',
    market: 'danawa',
    sourceUrl: 'https://search.danawa.com/dsearch.php?query=엡섬솔트',
    titleSnapshot: '닥터틸즈 퓨어 엡섬 솔트 소킹 솔루션 밀크 앤 허니 1.36kg',
    sellerSnapshot: '다나와 가격비교',
    priceSnapshotKrw: 12750,
    availability: 'active',
    verifiedAt: '2026-04-22',
    sourceConfidence: 0.85,
    notes: '검색 링크 기반. 직접 상품 URL 확보 시 교체 권장',
  },
  {
    id: 'listing_oliveyoung_bs_v1_021_01',
    canonicalProductId: 'bs_v1_021',
    market: 'oliveyoung',
    sourceUrl: 'https://m.oliveyoung.co.kr/m/G.do?goodsNo=A000000229545',
    titleSnapshot: '아로마티카 어웨이크닝 바디워시 페퍼민트&유칼립투스 300ml',
    sellerSnapshot: '올리브영',
    priceSnapshotKrw: 21000,
    availability: 'active',
    verifiedAt: '2026-04-22',
    sourceConfidence: 0.95,
  },
];

export const PRODUCT_MATCH_RULE_SEED_V1: ProductMatchRuleSeed[] = [
  {
    id: 'rule_bs_v1_003',
    canonicalProductId: 'bs_v1_003',
    ingredientKeys: ['body_wash_relaxing'],
    allowedEnvironments: ['bathtub'],
    modeBias: ['care'],
    priorityWeight: 70,
    isSommelierPickCandidate: false,
    status: 'active',
  },
  {
    id: 'rule_bs_v1_005',
    canonicalProductId: 'bs_v1_005',
    ingredientKeys: ['carbonated_bath'],
    allowedEnvironments: ['bathtub'],
    modeBias: ['reset'],
    priorityWeight: 95,
    isSommelierPickCandidate: true,
    status: 'active',
  },
  {
    id: 'rule_bs_v1_006',
    canonicalProductId: 'bs_v1_006',
    ingredientKeys: ['carbonated_bath'],
    allowedEnvironments: ['bathtub'],
    modeBias: ['care', 'reset'],
    priorityWeight: 75,
    isSommelierPickCandidate: false,
    status: 'active',
  },
  {
    id: 'rule_bs_v1_007',
    canonicalProductId: 'bs_v1_007',
    ingredientKeys: ['body_wash_relaxing'],
    allowedEnvironments: ['shower'],
    modeBias: ['care', 'sleep'],
    priorityWeight: 80,
    isSommelierPickCandidate: false,
    status: 'active',
  },
  {
    id: 'rule_bs_v1_009',
    canonicalProductId: 'bs_v1_009',
    ingredientKeys: ['hinoki_oil'],
    allowedEnvironments: ['bathtub'],
    modeBias: ['trip', 'reset'],
    priorityWeight: 75,
    isSommelierPickCandidate: false,
    status: 'active',
  },
  {
    id: 'rule_bs_v1_013',
    canonicalProductId: 'bs_v1_013',
    ingredientKeys: ['body_wash_relaxing'],
    allowedEnvironments: ['shower'],
    modeBias: ['trip', 'care'],
    priorityWeight: 80,
    isSommelierPickCandidate: false,
    status: 'active',
  },
  {
    id: 'rule_bs_v1_014',
    canonicalProductId: 'bs_v1_014',
    ingredientKeys: ['body_wash_relaxing'],
    allowedEnvironments: ['shower'],
    modeBias: ['trip', 'care'],
    priorityWeight: 88,
    isSommelierPickCandidate: true,
    status: 'active',
  },
  {
    id: 'rule_bs_v1_016',
    canonicalProductId: 'bs_v1_016',
    ingredientKeys: ['epsom_salt'],
    allowedEnvironments: ['bathtub'],
    modeBias: ['recovery', 'reset'],
    priorityWeight: 75,
    isSommelierPickCandidate: false,
    status: 'active',
  },
  {
    id: 'rule_bs_v1_020',
    canonicalProductId: 'bs_v1_020',
    ingredientKeys: ['epsom_salt'],
    allowedEnvironments: ['bathtub'],
    modeBias: ['care', 'recovery'],
    priorityWeight: 85,
    isSommelierPickCandidate: false,
    status: 'active',
  },
  {
    id: 'rule_bs_v1_021',
    canonicalProductId: 'bs_v1_021',
    ingredientKeys: ['body_wash_relaxing'],
    allowedEnvironments: ['shower'],
    modeBias: ['reset', 'recovery'],
    priorityWeight: 80,
    isSommelierPickCandidate: false,
    status: 'active',
  },
];

export const PRODUCT_RESEARCH_PROGRESS = {
  snapshotDate: PRODUCT_RESEARCH_SNAPSHOT_DATE,
  canonicalProducts: CANONICAL_PRODUCT_SEED_V1.length,
  marketListings: PRODUCT_MARKET_LISTING_SEED_V1.length,
  matchRules: PRODUCT_MATCH_RULE_SEED_V1.length,
} as const;

export const PRODUCT_RESEARCH_ROW_TEMPLATE = {
  canonicalProduct: {
    id: 'bs_example',
    ingredientKey: 'example_ingredient',
    nameKo: '예시 제품명',
    brand: '예시 브랜드',
    category: 'essential_oil',
    mechanism: 'aromatic',
    priceTier: 'mid',
    environments: ['bathtub'],
    summary: '한 줄 요약',
    editorialEyebrow: 'EDITORIAL LABEL',
    editorialFooterHint: '카드 하단 힌트',
    status: 'active',
    lastVerifiedAt: PRODUCT_RESEARCH_SNAPSHOT_DATE,
  },
  marketListing: {
    id: 'listing_market_bs_example_01',
    canonicalProductId: 'bs_example',
    market: 'coupang',
    sourceUrl: 'https://example.com/product',
    titleSnapshot: '마켓에 보이는 전체 상품명',
    sellerSnapshot: '판매자명',
    priceSnapshotKrw: 0,
    availability: 'unknown',
    verifiedAt: PRODUCT_RESEARCH_SNAPSHOT_DATE,
    sourceConfidence: 0.5,
    notes: '옵션형 여부, 글로벌 셀러 여부 등',
  },
  matchRule: {
    id: 'rule_bs_example',
    canonicalProductId: 'bs_example',
    ingredientKeys: ['example_ingredient'],
    allowedEnvironments: ['bathtub'],
    modeBias: ['care'],
    priorityWeight: 50,
    isSommelierPickCandidate: false,
    status: 'active',
  },
} as const;
