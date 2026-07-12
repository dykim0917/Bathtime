import {
  getTopValue,
  type OnsenPublicProfile,
  type OnsenReviewBathArea,
  type OnsenReviewCleanliness,
  type OnsenReviewCrowding,
  type OnsenReviewRevisitIntent,
  type OnsenReviewTargetType,
  type OnsenReviewTemperature,
  type OnsenReviewWaterColor,
  type OnsenReviewWaterTexture,
} from './onsenPassport';

export type OnsenReviewSummary = Record<string, number>;
export type OnsenReviewSort = 'latest' | 'visit';
export const ONSEN_REVIEW_PAGE_SIZE = 10;

export type OnsenReviewAuthor = {
  handle: string;
  displayName: string;
};

export type OnsenReview = {
  id: string;
  targetType: OnsenReviewTargetType;
  targetSlug: string;
  targetName: string;
  bathType: OnsenReviewBathArea;
  bathAreas: OnsenReviewBathArea[];
  waterFeel: 'clear' | 'soft' | 'strong' | 'unclear';
  waterTexture: OnsenReviewWaterTexture[];
  waterColor: OnsenReviewWaterColor;
  temperatureExperience: OnsenReviewTemperature;
  crowdingLevel: OnsenReviewCrowding;
  cleanlinessLevel: OnsenReviewCleanliness;
  revisitIntent: OnsenReviewRevisitIntent;
  visitedMonth: string | null;
  visitSeason: string | null;
  cautionText: string | null;
  body: string;
  author: OnsenReviewAuthor;
  createdAt: string;
};

export type OnsenReviewAggregate = {
  total: number;
  hasEnoughData: boolean;
  topTexture: { value: OnsenReviewWaterTexture; count: number } | null;
  topTemperature: { value: OnsenReviewTemperature; count: number } | null;
  calmCount: number;
  calmPercent: number | null;
  cleanCount: number;
  cleanPercent: number | null;
  revisitPositiveCount: number;
  revisitResponseCount: number;
  revisitPositivePercent: number | null;
};

export type OnsenPublicPassport = {
  profile: Omit<OnsenPublicProfile, 'userId'>;
  reviews: OnsenReview[];
};

type OnsenReviewCountRow = {
  target_slug: string;
  review_count: number | string;
};

type OnsenReviewRow = {
  id: string;
  target_type: OnsenReview['targetType'];
  target_slug: string;
  target_name: string | null;
  bath_type: OnsenReview['bathType'];
  bath_areas: OnsenReview['bathAreas'];
  water_feel: OnsenReview['waterFeel'];
  water_texture: OnsenReview['waterTexture'];
  water_color: OnsenReview['waterColor'];
  temperature_experience: OnsenReview['temperatureExperience'];
  crowding_level: OnsenReview['crowdingLevel'];
  cleanliness_level: OnsenReview['cleanlinessLevel'];
  revisit_intent: OnsenReview['revisitIntent'];
  visited_month: string | null;
  visit_season: string | null;
  caution_text: string | null;
  body: string;
  author_handle: string;
  author_display_name: string;
  created_at: string;
};

type OnsenPublicProfileRow = {
  handle: string;
  display_name: string;
  bio: string | null;
  passport_is_public: boolean;
  show_visit_month: boolean;
  created_at: string;
  updated_at: string;
};

type OnsenReviewAggregateRow = {
  total_count: number | string;
  calm_count: number | string;
  clean_count: number | string;
  revisit_positive_count: number | string;
  revisit_response_count: number | string;
  top_texture: OnsenReviewWaterTexture | null;
  top_texture_count: number | string;
  top_temperature: OnsenReviewTemperature | null;
  top_temperature_count: number | string;
};

const developmentProfiles: OnsenPublicProfile[] = [
  {
    userId: '00000000-0000-4000-8000-000000000101',
    handle: 'yunohana-note',
    displayName: '유노하나',
    bio: '조용한 노천탕과 오래 머물 수 있는 온도를 좋아합니다.',
    passportIsPublic: true,
    showVisitMonth: true,
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-12T09:00:00.000Z',
  },
  {
    userId: '00000000-0000-4000-8000-000000000102',
    handle: 'slow-bather',
    displayName: '느린목욕',
    bio: '물의 온도와 붐비는 시간을 꼼꼼히 기록합니다.',
    passportIsPublic: true,
    showVisitMonth: false,
    createdAt: '2026-07-02T09:00:00.000Z',
    updatedAt: '2026-07-12T08:00:00.000Z',
  },
];

const developmentSampleReviews: OnsenReview[] = [
  {
    id: 'sample-shirahama-room-soft',
    targetType: 'accommodation',
    targetSlug: 'shirahama-yanagiya',
    targetName: '시라하마 야나기야',
    bathType: 'room_bath',
    bathAreas: ['room_bath'],
    waterFeel: 'soft',
    waterTexture: ['soft', 'slippery'],
    waterColor: 'clear',
    temperatureExperience: 'comfortable',
    crowdingLevel: 'quiet',
    cleanlinessLevel: 'good',
    revisitIntent: 'yes',
    visitedMonth: '2026-06-01',
    visitSeason: null,
    cautionText: null,
    body: '[샘플] 객실 노천탕이라 저녁과 아침에 짧게 여러 번 이용했습니다. 물은 부드럽고 온도도 오래 머물기 편했습니다.',
    author: { handle: 'yunohana-note', displayName: '유노하나' },
    createdAt: '2026-07-12T09:00:00.000Z',
  },
  {
    id: 'sample-shirahama-public-distinctive',
    targetType: 'accommodation',
    targetSlug: 'shirahama-yanagiya',
    targetName: '시라하마 야나기야',
    bathType: 'public_bath',
    bathAreas: ['public_bath', 'open_air_public_bath'],
    waterFeel: 'strong',
    waterTexture: ['distinctive'],
    waterColor: 'clear',
    temperatureExperience: 'mixed',
    crowdingLevel: 'busy',
    cleanlinessLevel: 'good',
    revisitIntent: 'maybe',
    visitedMonth: null,
    visitSeason: null,
    cautionText: '해 질 무렵에는 대욕장이 잠시 붐볐습니다.',
    body: '[샘플] 해 질 무렵 대욕장은 사람이 조금 몰렸지만 답답할 정도는 아니었습니다. 물의 존재감이 뚜렷했고 탕마다 온도 차이가 있었습니다.',
    author: { handle: 'slow-bather', displayName: '느린목욕' },
    createdAt: '2026-07-12T08:00:00.000Z',
  },
  {
    id: 'sample-shirahama-open-air-rain',
    targetType: 'accommodation',
    targetSlug: 'shirahama-yanagiya',
    targetName: '시라하마 야나기야',
    bathType: 'open_air_public_bath',
    bathAreas: ['open_air_public_bath'],
    waterFeel: 'clear',
    waterTexture: ['neutral'],
    waterColor: 'clear',
    temperatureExperience: 'hot',
    crowdingLevel: 'comfortable',
    cleanlinessLevel: 'concern',
    revisitIntent: 'maybe',
    visitedMonth: '2026-02-01',
    visitSeason: null,
    cautionText: '탈의 공간 바닥의 물기가 조금 신경 쓰였습니다.',
    body: '[샘플] 비 오는 아침 노천탕은 비교적 여유로웠고 뜨거운 편이라 짧게 들어갔다 나오기 좋았습니다. 탈의 공간의 물기는 조금 신경 쓰였습니다.',
    author: { handle: 'yunohana-note', displayName: '유노하나' },
    createdAt: '2026-07-12T07:00:00.000Z',
  },
  {
    id: 'sample-shirahama-room-lukewarm',
    targetType: 'accommodation',
    targetSlug: 'shirahama-yanagiya',
    targetName: '시라하마 야나기야',
    bathType: 'room_bath',
    bathAreas: ['room_bath'],
    waterFeel: 'unclear',
    waterTexture: ['unclear'],
    waterColor: 'unclear',
    temperatureExperience: 'lukewarm',
    crowdingLevel: 'quiet',
    cleanlinessLevel: 'neutral',
    revisitIntent: 'no',
    visitedMonth: null,
    visitSeason: null,
    cautionText: null,
    body: '[샘플] 프라이빗하게 이용한 점은 좋았지만 기대보다 미지근하게 느껴졌습니다. 다음에는 객실탕의 온천수 적용 여부와 온도를 먼저 비교할 것 같습니다.',
    author: { handle: 'slow-bather', displayName: '느린목욕' },
    createdAt: '2026-07-12T06:00:00.000Z',
  },
];

function readSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) return null;
  return { url, anonKey };
}

function getRequestHeaders(anonKey: string) {
  return {
    apikey: anonKey,
    authorization: `Bearer ${anonKey}`,
  };
}

function mapReviewRow(row: OnsenReviewRow): OnsenReview {
  return {
    id: row.id,
    targetType: row.target_type,
    targetSlug: row.target_slug,
    targetName: row.target_name?.trim() || row.target_slug,
    bathType: row.bath_type,
    bathAreas: row.bath_areas,
    waterFeel: row.water_feel,
    waterTexture: row.water_texture,
    waterColor: row.water_color,
    temperatureExperience: row.temperature_experience,
    crowdingLevel: row.crowding_level,
    cleanlinessLevel: row.cleanliness_level,
    revisitIntent: row.revisit_intent,
    visitedMonth: row.visited_month,
    visitSeason: row.visit_season,
    cautionText: row.caution_text,
    body: row.body,
    author: {
      handle: row.author_handle,
      displayName: row.author_display_name,
    },
    createdAt: row.created_at,
  };
}

function mapPublicProfileRow(row: OnsenPublicProfileRow): Omit<OnsenPublicProfile, 'userId'> {
  return {
    handle: row.handle,
    displayName: row.display_name,
    bio: row.bio,
    passportIsPublic: row.passport_is_public,
    showVisitMonth: row.show_visit_month,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getDevelopmentSampleReviews(slug: string, targetType: OnsenReviewTargetType) {
  if (process.env.NODE_ENV !== 'development') return [];
  return developmentSampleReviews.filter((review) => review.targetSlug === slug && review.targetType === targetType);
}

function getDevelopmentSampleCounts(slugs: string[], targetType: OnsenReviewTargetType): OnsenReviewSummary {
  if (process.env.NODE_ENV !== 'development') return {};
  const slugSet = new Set(slugs);

  return developmentSampleReviews.reduce<OnsenReviewSummary>((summary, review) => {
    if (review.targetType === targetType && slugSet.has(review.targetSlug)) {
      summary[review.targetSlug] = (summary[review.targetSlug] ?? 0) + 1;
    }
    return summary;
  }, {});
}

function getDevelopmentPublicPassport(handle: string): OnsenPublicPassport | null {
  if (process.env.NODE_ENV !== 'development') return null;
  const profile = developmentProfiles.find((item) => item.handle === handle);
  if (!profile) return null;

  return {
    profile,
    reviews: developmentSampleReviews.filter((review) => review.author.handle === handle),
  };
}

async function fetchPublicReviews(filters: { targetType?: OnsenReviewTargetType; targetSlug?: string; authorHandle?: string; limit: number }) {
  const config = readSupabaseConfig();
  if (!config) return [];

  const url = new URL('/rest/v1/rpc/read_public_onsen_reviews', config.url);

  const response = await fetch(url, {
    method: 'POST',
    headers: { ...getRequestHeaders(config.anonKey), 'content-type': 'application/json' },
    body: JSON.stringify({
      p_target_type: filters.targetType ?? null,
      p_target_slugs: filters.targetSlug ? [filters.targetSlug] : null,
      p_author_handle: filters.authorHandle ?? null,
      p_limit: filters.limit,
    }),
    next: { revalidate: 60 },
  });
  if (!response.ok) return [];

  return ((await response.json()) as OnsenReviewRow[]).map(mapReviewRow);
}

function sortReviews(reviews: OnsenReview[], sort: OnsenReviewSort) {
  return [...reviews].sort((left, right) => {
    if (sort === 'visit') {
      const visitOrder = (right.visitedMonth ?? '').localeCompare(left.visitedMonth ?? '');
      if (visitOrder !== 0) return visitOrder;
    }
    return right.createdAt.localeCompare(left.createdAt);
  });
}

export function summarizeOnsenReviews(reviews: OnsenReview[]): OnsenReviewAggregate {
  const total = reviews.length;
  const topTexture = getTopValue<OnsenReviewWaterTexture>(reviews.flatMap((review) => review.waterTexture), ['unclear']);
  const topTemperature = getTopValue<OnsenReviewTemperature>(reviews.map((review) => review.temperatureExperience), ['unclear']);
  const calmCount = reviews.filter((review) => review.crowdingLevel === 'quiet' || review.crowdingLevel === 'comfortable').length;
  const cleanCount = reviews.filter((review) => review.cleanlinessLevel === 'good').length;
  const revisitResponses = reviews.filter((review) => review.revisitIntent === 'yes' || review.revisitIntent === 'no');
  const revisitPositiveCount = revisitResponses.filter((review) => review.revisitIntent === 'yes').length;

  return {
    total,
    hasEnoughData: total >= 3,
    topTexture,
    topTemperature,
    calmCount,
    calmPercent: total > 0 ? Math.round((calmCount / total) * 100) : null,
    cleanCount,
    cleanPercent: total > 0 ? Math.round((cleanCount / total) * 100) : null,
    revisitPositiveCount,
    revisitResponseCount: revisitResponses.length,
    revisitPositivePercent: revisitResponses.length > 0 ? Math.round((revisitPositiveCount / revisitResponses.length) * 100) : null,
  };
}

export async function readOnsenReviewAggregate(
  slug: string,
  targetType: OnsenReviewTargetType = 'accommodation'
): Promise<OnsenReviewAggregate> {
  const sampleReviews = getDevelopmentSampleReviews(slug, targetType);
  if (sampleReviews.length > 0) return summarizeOnsenReviews(sampleReviews);

  const config = readSupabaseConfig();
  if (!config || !slug) return summarizeOnsenReviews([]);

  const url = new URL('/rest/v1/rpc/read_public_onsen_review_aggregate', config.url);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...getRequestHeaders(config.anonKey), 'content-type': 'application/json' },
      body: JSON.stringify({ p_target_type: targetType, p_target_slug: slug }),
      next: { revalidate: 60 },
    });
    if (!response.ok) return summarizeOnsenReviews([]);

    const [row] = (await response.json()) as OnsenReviewAggregateRow[];
    if (!row) return summarizeOnsenReviews([]);
    const total = Number(row.total_count);
    const calmCount = Number(row.calm_count);
    const cleanCount = Number(row.clean_count);
    const revisitPositiveCount = Number(row.revisit_positive_count);
    const revisitResponseCount = Number(row.revisit_response_count);
    const topTextureCount = Number(row.top_texture_count);
    const topTemperatureCount = Number(row.top_temperature_count);

    return {
      total,
      hasEnoughData: total >= 3,
      topTexture: row.top_texture ? { value: row.top_texture, count: topTextureCount } : null,
      topTemperature: row.top_temperature ? { value: row.top_temperature, count: topTemperatureCount } : null,
      calmCount,
      calmPercent: total > 0 ? Math.round((calmCount / total) * 100) : null,
      cleanCount,
      cleanPercent: total > 0 ? Math.round((cleanCount / total) * 100) : null,
      revisitPositiveCount,
      revisitResponseCount,
      revisitPositivePercent: revisitResponseCount > 0 ? Math.round((revisitPositiveCount / revisitResponseCount) * 100) : null,
    };
  } catch {
    return summarizeOnsenReviews([]);
  }
}

export async function readOnsenReviewCounts(slugs: string[], targetType: OnsenReviewTargetType = 'accommodation'): Promise<OnsenReviewSummary> {
  const config = readSupabaseConfig();
  const uniqueSlugs = Array.from(new Set(slugs)).filter(Boolean);
  const sampleCounts = getDevelopmentSampleCounts(uniqueSlugs, targetType);

  if (!config || uniqueSlugs.length === 0) return sampleCounts;

  const url = new URL('/rest/v1/rpc/read_public_onsen_review_counts', config.url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...getRequestHeaders(config.anonKey), 'content-type': 'application/json' },
      body: JSON.stringify({ p_target_type: targetType, p_target_slugs: uniqueSlugs }),
      next: { revalidate: 60 },
    });
    if (!response.ok) return sampleCounts;

    const rows = (await response.json()) as OnsenReviewCountRow[];
    const counts = rows.reduce<OnsenReviewSummary>((acc, row) => {
      acc[row.target_slug] = Number(row.review_count);
      return acc;
    }, {});
    Object.entries(sampleCounts).forEach(([slug, count]) => {
      counts[slug] = (counts[slug] ?? 0) + count;
    });
    return counts;
  } catch {
    return sampleCounts;
  }
}

export async function readOnsenReviews(slug: string, limit = 12, targetType: OnsenReviewTargetType = 'accommodation'): Promise<OnsenReview[]> {
  if (!slug) return [];
  const sampleReviews = getDevelopmentSampleReviews(slug, targetType);

  try {
    const reviews = await fetchPublicReviews({ targetType, targetSlug: slug, limit });
    return [...sampleReviews, ...reviews].slice(0, limit);
  } catch {
    return sampleReviews.slice(0, limit);
  }
}

export async function readOnsenReviewsPage(
  slug: string,
  page: number,
  sort: OnsenReviewSort = 'latest',
  targetType: OnsenReviewTargetType = 'accommodation'
): Promise<OnsenReview[]> {
  if (!slug) return [];
  const safePage = Math.max(1, Math.floor(page));
  const offset = (safePage - 1) * ONSEN_REVIEW_PAGE_SIZE;
  const sampleReviews = sortReviews(getDevelopmentSampleReviews(slug, targetType), sort);
  const config = readSupabaseConfig();

  if (sampleReviews.length > 0) return sampleReviews.slice(offset, offset + ONSEN_REVIEW_PAGE_SIZE);
  if (!config) return [];

  const url = new URL('/rest/v1/rpc/read_public_onsen_reviews_page', config.url);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...getRequestHeaders(config.anonKey), 'content-type': 'application/json' },
      body: JSON.stringify({
        p_target_type: targetType,
        p_target_slug: slug,
        p_sort: sort,
        p_limit: ONSEN_REVIEW_PAGE_SIZE,
        p_offset: offset,
      }),
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];

    const reviews = ((await response.json()) as OnsenReviewRow[]).map(mapReviewRow);
    return reviews;
  } catch {
    return [];
  }
}

export async function readPublicOnsenPassport(handle: string, limit = 100): Promise<OnsenPublicPassport | null> {
  const normalizedHandle = handle.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{2,23}$/.test(normalizedHandle)) return null;

  const developmentPassport = getDevelopmentPublicPassport(normalizedHandle);
  if (developmentPassport) return developmentPassport;

  const config = readSupabaseConfig();
  if (!config) return null;

  const profileUrl = new URL('/rest/v1/onsen_public_profiles', config.url);
  profileUrl.searchParams.set('select', 'handle,display_name,bio,passport_is_public,show_visit_month,created_at,updated_at');
  profileUrl.searchParams.set('handle', `eq.${normalizedHandle}`);
  profileUrl.searchParams.set('passport_is_public', 'eq.true');
  profileUrl.searchParams.set('limit', '1');

  try {
    const profileResponse = await fetch(profileUrl, {
      headers: getRequestHeaders(config.anonKey),
      next: { revalidate: 60 },
    });
    if (!profileResponse.ok) return null;

    const [profileRow] = (await profileResponse.json()) as OnsenPublicProfileRow[];
    if (!profileRow) return null;

    const reviews = await fetchPublicReviews({ authorHandle: normalizedHandle, limit });
    return { profile: mapPublicProfileRow(profileRow), reviews };
  } catch {
    return null;
  }
}
