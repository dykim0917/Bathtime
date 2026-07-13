import type { OnsenLocation, OnsenStructuredContexts } from './onsenTaxonomy';

export type OnsenStatus = 'confirmed' | 'needs_check' | 'review_signal' | 'attention';

export type OnsenVerdictLevel = 'full' | 'lite' | 'draft';

export type OnsenEditorialCardSummary = {
  text: string;
  status: 'published' | 'draft';
  officialBasis?: {
    factKo: string;
    sourceUrl?: string;
    sourceFile: string;
  };
  reviewBasis?: {
    findingKo: string;
    directReviewCount: number;
    onsenRelatedCount?: number;
    platformCount?: number;
    sourceFile: string;
  };
  verifiedAt?: string;
};

export type OnsenFactStatus = {
  code: string;
  label?: string;
  status: 'confirmed' | 'needs_check' | 'not_confirmed';
  value?: string;
  source?: string;
};

export type OnsenWaterVerification = {
  status: OnsenStatus;
  basis: string;
  scope?: string;
  conditions: string[];
  unresolved: string[];
  exceptions: string[];
  guidance?: string;
  sources: { label: string; href: string }[];
  verifiedAt?: string;
};

export type OnsenVerdictItem = {
  order: number;
  type: 'positive' | 'conditional' | 'minor';
  headline: string;
  counts: {
    mentions: number;
    negative: number;
    denominator: 'experiences_read' | 'onsen_related';
    platformCount?: number;
    directionCounts?: {
      positive: number;
      mixed: number;
      negative: number;
      neutral: number;
    };
  };
  body: string;
  verdict: string;
  chipLabel?: string;
  seasonMonths?: number[] | null;
};

export type OnsenVerdict = {
  level: OnsenVerdictLevel;
  headline: string;
  briefing: {
    experiencesRead?: number;
    onsenRelated?: number;
    platformCount?: number;
    platforms: string[];
    editorialCardSummary?: OnsenEditorialCardSummary;
  };
  items: OnsenVerdictItem[];
  factStatuses: OnsenFactStatus[];
  verifiedAt?: string;
};

export type OnsenEntityType = 'accommodation' | 'facility';

export type OnsenDecisionFactStatus = 'confirmed' | 'conditional' | 'needs_check';

export type OnsenDecisionFact = {
  code: string;
  label: string;
  value: string;
  status: OnsenDecisionFactStatus;
  detail?: string;
  scope?: string;
  sourceUrl?: string;
  checkedAt?: string;
};

export type OnsenCandidate = {
  entityType?: OnsenEntityType;
  slug: string;
  name: string;
  jaName: string;
  enName?: string;
  imageUrl?: string;
  imageAlt?: string;
  galleryImages?: { url: string; alt?: string }[];
  area: string;
  region: string;
  location?: OnsenLocation;
  contexts?: OnsenStructuredContexts;
  summary: string;
  cardSummary?: OnsenEditorialCardSummary;
  fit: string[];
  primaryBath: string;
  waterDecision: {
    label: string;
    summary: string;
    springType: string;
    roomBath: string;
    operation: string;
    notice?: string;
  };
  waterProfile?: {
    canonicalMethod?: 'kakenagashi_pure' | 'kakenagashi' | 'junkan' | null;
    label?: string;
    badgeGate?: string;
    conditionCodes: string[];
    conditionLabels: string[];
    textureFilters: { code: string; label: string; exposureStatus?: string; mentionCount?: number }[];
    colorFilter?: { code: string; label: string; status?: string; exposeAsFilter?: boolean };
  };
  waterVerification?: OnsenWaterVerification;
  dataQuality: 'A' | 'B' | 'C' | 'D';
  directReviews: number;
  onsenReviews: number;
  updatedAt: string;
  tags: string[];
  badges: { label: string; status: OnsenStatus }[];
  facts: { label: string; value: string; status: OnsenStatus; detail: string }[];
  signals: { label: string; count: number; status: OnsenStatus; summary: string }[];
  cautions: { issue: string; count: number; summary: string }[];
  sources: { label: string; direct: number; onsenRelated: number; note: string }[];
  officialLinks: { label: string; href: string }[];
  officialFilterCodes?: string[];
  decisionFacts?: OnsenDecisionFact[];
  facilityDetails?: {
    type: string;
    typeLabel: string;
    model: string;
    archetype: string;
    bathAreas: string[];
    cleanupStatus: string;
    lodgingAvailable?: boolean;
    mapUrl?: string;
  };
  verdict?: OnsenVerdict;
};

export function getOnsenEntityType(candidate: Pick<OnsenCandidate, 'entityType'>): OnsenEntityType {
  return candidate.entityType ?? 'accommodation';
}

export const statusLabels: Record<OnsenStatus, string> = {
  confirmed: '확인됨',
  needs_check: '예약 전 확인',
  review_signal: '후기 기준',
  attention: '주의',
};

export const onsenCandidates: OnsenCandidate[] = [
  {
    slug: 'yufuin-baien',
    name: '유후인 바이엔 가든 리조트',
    jaName: '由布院 梅園 GARDEN RESORT',
    area: '오이타 유후인',
    region: 'yufuin',
    summary: '대욕장과 대절탕의 체감 후기가 강하고, 원천 온도가 높아 물 추가 여부를 같이 봐야 하는 숙소입니다.',
    fit: ['대욕장도 중요함', '대절탕을 따로 쓰고 싶음', '객실 내 프라이빗탕보다 전체 온천 동선 확인'],
    primaryBath: '대욕장 + 대절탕 중심',
    waterDecision: {
      label: '온천수 사용 확인',
      summary: '대욕장과 대절탕은 온천수 사용이 확인됩니다. 객실 내 프라이빗탕은 객실 타입별로 다시 봐야 합니다.',
      springType: '원천 사용',
      roomBath: '객실 타입별 확인',
      operation: '원천 100% 직수 + 물을 섞어 식힘',
      notice: '원천 온도가 높아 물 추가가 함께 표기됩니다.',
    },
    dataQuality: 'A',
    directReviews: 458,
    onsenReviews: 411,
    updatedAt: '2026-07-01',
    tags: ['room-bath', 'private-bath', 'public-bath', 'water-texture'],
    badges: [
      { label: '대욕장 강함', status: 'review_signal' },
      { label: '대절탕 대기 주의', status: 'attention' },
      { label: '물을 섞어 식힘', status: 'confirmed' },
    ],
    facts: [
      {
        label: '대욕장',
        value: '있음',
        status: 'confirmed',
        detail: '공식 정보와 후기 모두에서 대욕장 언급이 많습니다.',
      },
      {
        label: '대절탕',
        value: '대절탕 2동',
        status: 'confirmed',
        detail: '넓은 대절탕이 확인되지만 선착순 대기 후기가 반복됩니다.',
      },
      {
        label: '객실 내 프라이빗탕',
        value: '별채 객실 선택지',
        status: 'needs_check',
        detail: '객실 타입별 노천탕 포함 여부를 예약 화면에서 다시 확인해야 합니다.',
      },
      {
        label: '온천 운용',
        value: '원천 100% 직수 + 물을 섞어 식힘',
        status: 'confirmed',
        detail: '70도 이상 원천을 쓰는 구조라 물을 섞어 식힌다는 설명이 함께 확인됩니다.',
      },
    ],
    signals: [
      { label: '대욕장 체감', count: 171, status: 'review_signal', summary: '넓은 탕과 풍경에 대한 반복 후기가 많습니다.' },
      { label: '대절탕 체감', count: 96, status: 'review_signal', summary: '프라이빗하게 쓰기 좋다는 후기와 대기 언급이 함께 나옵니다.' },
      { label: '온천수 질감', count: 43, status: 'review_signal', summary: '물이 부드럽다는 표현이 중간 강도로 반복됩니다.' },
    ],
    cautions: [
      { issue: '대절탕 선착순/대기', count: 42, summary: '원하는 시간대 이용 가능 여부를 체크하는 편이 좋습니다.' },
      { issue: '프라이빗 노천탕 객실 혼동', count: 8, summary: '객실 노천탕 포함 상품인지 예약 전 확인이 필요합니다.' },
      { issue: '대욕장 접근 동선', count: 5, summary: '동선 민감도가 높다면 객실 위치를 함께 봐야 합니다.' },
    ],
    sources: [
      { label: '공식 정보', direct: 1, onsenRelated: 1, note: '대욕장, 대절탕, 원천 100% 직수, 물을 섞어 식힘 설명 확인' },
      { label: '이용자 확인', direct: 458, onsenRelated: 411, note: '온천 관련 언급을 함께 확인했습니다.' },
    ],
    officialLinks: [{ label: '공식 사이트', href: 'https://www.yufuin-baien.com/' }],
  },
  {
    slug: 'yufuin-sumika',
    name: '유후인 스미카',
    jaName: '由布院温泉 すみか',
    area: '오이타 유후인',
    region: 'yufuin',
    summary: '객실 노천탕 후기 비중이 매우 높아, 사람 많은 대욕장보다 방 안 온천 경험을 우선할 때 볼 만합니다.',
    fit: ['객실 노천탕이 핵심', '대욕장 혼잡을 피하고 싶음', '프라이버시 우선'],
    primaryBath: '객실 노천탕 중심',
    waterDecision: {
      label: '객실 온천수 예약 전 확인',
      summary: '객실 노천탕 중심 숙소입니다. 온천수 운용 표기는 예약 전 공식 정보에서 한 번 더 확인하세요.',
      springType: '온천수 표기 예약 전 확인',
      roomBath: '객실 노천탕 중심',
      operation: '원천 직수 언급',
      notice: '객실 타입과 금연 여부도 같이 확인하는 편이 좋습니다.',
    },
    dataQuality: 'A',
    directReviews: 460,
    onsenReviews: 460,
    updatedAt: '2026-07-01',
    tags: ['room-bath', 'private-bath', 'water-texture'],
    badges: [
      { label: '객실 내 프라이빗탕 강함', status: 'review_signal' },
      { label: '프라이버시 강함', status: 'review_signal' },
      { label: '흡연 객실 확인', status: 'attention' },
    ],
    facts: [
      {
        label: '객실 내 프라이빗탕',
        value: '객실 노천탕 중심',
        status: 'review_signal',
        detail: '객실 노천탕 이용 만족도가 뚜렷합니다.',
      },
      {
        label: '대욕장',
        value: '비중 낮음',
        status: 'needs_check',
        detail: '검색 목적이 대욕장이라면 공식 시설 정보를 다시 봐야 합니다.',
      },
      {
        label: '온천 운용',
        value: '원천 직수 언급',
        status: 'review_signal',
        detail: '원천 직수 관련 후기가 확인됩니다.',
      },
      {
        label: '예약 주의',
        value: '흡연/객실 타입',
        status: 'attention',
        detail: '흡연 객실 관련 확인 신호가 있어 상품명을 꼼꼼히 볼 필요가 있습니다.',
      },
    ],
    signals: [
      { label: '객실 노천탕 긍정', count: 460, status: 'review_signal', summary: '객실 내 프라이빗탕 체감이 이 숙소의 가장 강한 판단 근거입니다.' },
      { label: '프라이버시/혼잡 회피', count: 82, status: 'review_signal', summary: '대욕장 대신 방 안에서 조용히 쓰는 만족감이 반복됩니다.' },
      { label: '원천 직수 언급', count: 28, status: 'review_signal', summary: '온천 운용에 대한 참고 정보가 확인됩니다.' },
    ],
    cautions: [
      { issue: '흡연 객실/예약 조건', count: 25, summary: '객실 타입과 금연 여부를 예약 단계에서 다시 확인하세요.' },
      { issue: '벌레/자연 환경', count: 7, summary: '노천탕 특성상 계절별 자연 요소에 민감하면 체크가 필요합니다.' },
      { issue: '탕 온도 편차', count: 5, summary: '온도 민감도가 높으면 최근 후기를 같이 보는 편이 좋습니다.' },
    ],
    sources: [
      { label: '이용자 확인', direct: 460, onsenRelated: 460, note: '객실 노천탕 이용 언급을 함께 확인했습니다.' },
      { label: '운용 참고', direct: 28, onsenRelated: 28, note: '원천 직수 관련 표현 반복' },
    ],
    officialLinks: [{ label: '예약 전 공식 정보 확인', href: 'https://www.yufuin-sumika.jp/' }],
  },
  {
    slug: 'yufuin-den-rikyu',
    name: '오야도 덴 리큐',
    jaName: '御宿 田 離宮',
    area: '오이타 유후인',
    region: 'yufuin',
    summary: '전 객실 독채와 실내탕/노천탕 구성이 강점이고, 대욕장보다 객실 안에서 끝나는 온천 경험에 가깝습니다.',
    fit: ['독채 객실 선호', '객실 안에서 온천을 끝내고 싶음', '유후다케 전망 관심'],
    primaryBath: '전 객실 실내탕 + 노천탕',
    waterDecision: {
      label: '전 객실 온천수 확인',
      summary: '전 객실 실내탕과 노천탕 구성이 확인됩니다. 대욕장보다 객실 안 온천을 보는 숙소입니다.',
      springType: '원천 사용',
      roomBath: '전 객실 실내탕 + 노천탕',
      operation: '원천 100% 직수',
      notice: '겨울에는 노천탕 온도 체감 차이를 확인하세요.',
    },
    dataQuality: 'B',
    directReviews: 147,
    onsenReviews: 141,
    updatedAt: '2026-07-01',
    tags: ['room-bath', 'winter-caution', 'water-texture'],
    badges: [
      { label: '객실 내 프라이빗탕 강함', status: 'review_signal' },
      { label: '원천 100% 직수', status: 'confirmed' },
      { label: '겨울 온도 주의', status: 'attention' },
    ],
    facts: [
      {
        label: '객실 내 프라이빗탕',
        value: '전 객실 실내탕 + 노천탕',
        status: 'confirmed',
        detail: '공식 정보상 7개 객실 모두 독채, 객실 내 프라이빗탕 구성이 확인됩니다.',
      },
      {
        label: '대욕장',
        value: '정보 적음',
        status: 'needs_check',
        detail: '대욕장 중심 숙소를 찾는 경우에는 맞지 않을 수 있습니다.',
      },
      {
        label: '온천 운용',
        value: '원천 100% 직수',
        status: 'confirmed',
        detail: '공식 설명에서 원천을 흘려보내는 직수 방식으로 확인됩니다.',
      },
      {
        label: '전망',
        value: '유후다케 방향',
        status: 'confirmed',
        detail: '객실별 전망 차이는 예약 상품에서 확인해야 합니다.',
      },
    ],
    signals: [
      { label: '객실 노천탕', count: 126, status: 'review_signal', summary: '객실 노천탕 경험에 대한 직접 후기가 강합니다.' },
      { label: '객실 내 온천 전반', count: 64, status: 'review_signal', summary: '실내탕과 노천탕을 함께 쓰는 만족감이 반복됩니다.' },
      { label: '온천수 질감', count: 11, status: 'review_signal', summary: '물 체감 표현은 중간 이하 강도입니다.' },
    ],
    cautions: [
      { issue: '객실 내 프라이빗탕 온도 편차', count: 21, summary: '방문 계절과 당일 기온에 따라 체감 차이가 날 수 있습니다.' },
      { issue: '겨울 노천탕/유량', count: 5, summary: '겨울 여행이면 노천탕 온도 후기를 더 확인하세요.' },
      { issue: '자연 환경', count: 3, summary: '독채와 노천탕 특성상 벌레 언급이 일부 있습니다.' },
    ],
    sources: [
      { label: '공식 정보', direct: 1, onsenRelated: 1, note: '전 객실 독채, 실내탕, 노천탕, 원천 100% 직수 확인' },
      { label: '이용자 확인', direct: 147, onsenRelated: 141, note: '객실 내 프라이빗탕 중심으로 확인할 수 있는 언급이 있습니다.' },
    ],
    officialLinks: [{ label: '공식 사이트', href: 'https://www.yufuin-den-rikyu.jp/' }],
  },
  {
    slug: 'yufuin-enowa',
    name: '에노와 유후인',
    jaName: 'ENOWA YUFUIN',
    area: '오이타 유후인',
    region: 'yufuin',
    summary: '객실 온천과 코발트 블루 계열 물빛이 공식적으로 강조되지만, 아직 확인 정보가 적어 공식 설명을 같이 봐야 합니다.',
    fit: ['새로운 숙소 관심', '객실 온천/풀 구성 확인', '공식 설명과 후기를 함께 검토'],
    primaryBath: '객실 온천 + 일부 풀 구성',
    waterDecision: {
      label: '객실 온천수 확인',
      summary: '각 객실 온천 이용이 공식 정보에 나옵니다. 탕과 풀의 이용 조건은 따로 확인해야 합니다.',
      springType: '나트륨 염화물/황산염천',
      roomBath: '각 객실 온천 이용',
      operation: '객실 온천 + 일부 풀 구성',
      notice: '일부 야외 풀은 수영복 조건이 있을 수 있습니다.',
    },
    dataQuality: 'D',
    directReviews: 31,
    onsenReviews: 26,
    updatedAt: '2026-07-01',
    tags: ['room-bath', 'private-bath'],
    badges: [
      { label: '표본 적음', status: 'needs_check' },
      { label: '객실 온천 공식 확인', status: 'confirmed' },
      { label: '수영복 예약 전 확인', status: 'attention' },
    ],
    facts: [
      {
        label: '객실 내 프라이빗탕',
        value: '각 객실 온천 이용',
        status: 'confirmed',
        detail: '공식 정보에서 객실별 온천 이용을 확인할 수 있습니다.',
      },
      {
        label: '온천수',
        value: '나트륨 염화물/황산염천',
        status: 'confirmed',
        detail: '계절에 따라 코발트 블루 물빛을 강조하는 공식 설명이 있습니다.',
      },
      {
        label: '프라이빗탕',
        value: '언급 있음',
        status: 'review_signal',
        detail: '프라이빗하게 쓰는 경험은 확인되지만 아직 추가 확인이 필요합니다.',
      },
      {
        label: '이용 조건',
        value: '일부 야외 풀 수영복',
        status: 'attention',
        detail: '탕과 풀의 이용 조건을 같은 것으로 보면 안 됩니다.',
      },
    ],
    signals: [
      { label: '객실 내 프라이빗탕 만족', count: 18, status: 'review_signal', summary: '객실 온천 이용 만족도는 보이지만, 아직 확인 정보는 적습니다.' },
      { label: '프라이빗 체감', count: 11, status: 'review_signal', summary: '개별 이용 감각에 대한 언급이 확인됩니다.' },
      { label: '물빛/질감', count: 6, status: 'review_signal', summary: '물빛과 온천수 인상은 보조 신호로 보는 편이 좋습니다.' },
    ],
    cautions: [
      { issue: '확인 정보 적음', count: 31, summary: '최근 이용 조건을 반드시 함께 확인하는 편이 좋습니다.' },
      { issue: '탕/풀 구성 혼동', count: 3, summary: '객실 온천, 인피니티 풀, 야외 풀의 조건을 나눠 확인하세요.' },
      { issue: '온천 체감 약함', count: 2, summary: '온천수 질감을 최우선으로 보면 추가 확인이 필요합니다.' },
    ],
    sources: [
      { label: '공식 정보', direct: 1, onsenRelated: 1, note: '객실 온천, 수질, 풀 구성 설명 확인' },
      { label: '이용자 확인', direct: 31, onsenRelated: 26, note: '아직 확인 정보가 적어 공식 설명을 우선합니다.' },
    ],
    officialLinks: [{ label: '공식 사이트', href: 'https://enowa-yufuin.jp/' }],
  },
];

export function getOnsenCandidates() {
  return onsenCandidates;
}

export function getOnsenCandidate(slug: string) {
  return onsenCandidates.find((candidate) => candidate.slug === slug);
}
