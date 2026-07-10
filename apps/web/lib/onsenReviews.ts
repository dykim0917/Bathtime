import type {
  OnsenReviewBathArea,
  OnsenReviewCleanliness,
  OnsenReviewCrowding,
  OnsenReviewRevisitIntent,
  OnsenReviewTargetType,
  OnsenReviewTemperature,
  OnsenReviewWaterColor,
  OnsenReviewWaterTexture,
} from './onsenPassport';

export type OnsenReviewSummary = Record<string, number>;

export type OnsenReview = {
  id: string;
  targetType: OnsenReviewTargetType;
  targetSlug: string;
  bathType: OnsenReviewBathArea;
  bathAreas: OnsenReviewBathArea[];
  waterFeel: 'clear' | 'soft' | 'strong' | 'unclear';
  waterTexture: OnsenReviewWaterTexture[];
  waterColor: OnsenReviewWaterColor;
  temperatureExperience: OnsenReviewTemperature;
  crowdingLevel: OnsenReviewCrowding;
  cleanlinessLevel: OnsenReviewCleanliness;
  revisitIntent: OnsenReviewRevisitIntent;
  visitedOn: string | null;
  visitSeason: string | null;
  body: string;
  createdAt: string;
};

type OnsenReviewCountRow = {
  target_slug: string;
};

type OnsenReviewRow = {
  id: string;
  target_type: OnsenReview['targetType'];
  target_slug: string;
  bath_type: OnsenReview['bathType'];
  bath_areas: OnsenReview['bathAreas'];
  water_feel: OnsenReview['waterFeel'];
  water_texture: OnsenReview['waterTexture'];
  water_color: OnsenReview['waterColor'];
  temperature_experience: OnsenReview['temperatureExperience'];
  crowding_level: OnsenReview['crowdingLevel'];
  cleanliness_level: OnsenReview['cleanlinessLevel'];
  revisit_intent: OnsenReview['revisitIntent'];
  visited_on: string | null;
  visit_season: string | null;
  body: string;
  created_at: string;
};

function readSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) return null;

  return { url, anonKey };
}

export async function readOnsenReviewCounts(slugs: string[], targetType: OnsenReviewTargetType = 'accommodation'): Promise<OnsenReviewSummary> {
  const config = readSupabaseConfig();
  const uniqueSlugs = Array.from(new Set(slugs)).filter(Boolean);

  if (!config || uniqueSlugs.length === 0) return {};

  const url = new URL('/rest/v1/onsen_reviews', config.url);
  url.searchParams.set('select', 'target_slug');
  url.searchParams.set('status', 'eq.approved');
  url.searchParams.set('target_type', `eq.${targetType}`);
  url.searchParams.set('target_slug', `in.(${uniqueSlugs.map((slug) => `"${slug}"`).join(',')})`);

  try {
    const response = await fetch(url, {
      headers: {
        apikey: config.anonKey,
        authorization: `Bearer ${config.anonKey}`,
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) return {};

    const rows = (await response.json()) as OnsenReviewCountRow[];
    return rows.reduce<OnsenReviewSummary>((acc, row) => {
      acc[row.target_slug] = (acc[row.target_slug] ?? 0) + 1;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

export async function readOnsenReviews(slug: string, limit = 6, targetType: OnsenReviewTargetType = 'accommodation'): Promise<OnsenReview[]> {
  const config = readSupabaseConfig();

  if (!config || !slug) return [];

  const url = new URL('/rest/v1/onsen_reviews', config.url);
  url.searchParams.set('select', 'id,target_type,target_slug,bath_type,bath_areas,water_feel,water_texture,water_color,temperature_experience,crowding_level,cleanliness_level,revisit_intent,visited_on,visit_season,body,created_at');
  url.searchParams.set('status', 'eq.approved');
  url.searchParams.set('target_type', `eq.${targetType}`);
  url.searchParams.set('target_slug', `eq.${slug}`);
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', String(limit));

  try {
    const response = await fetch(url, {
      headers: {
        apikey: config.anonKey,
        authorization: `Bearer ${config.anonKey}`,
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) return [];

    const rows = (await response.json()) as OnsenReviewRow[];
    return rows.map((row) => ({
      id: row.id,
      targetType: row.target_type,
      targetSlug: row.target_slug,
      bathType: row.bath_type,
      bathAreas: row.bath_areas,
      waterFeel: row.water_feel,
      waterTexture: row.water_texture,
      waterColor: row.water_color,
      temperatureExperience: row.temperature_experience,
      crowdingLevel: row.crowding_level,
      cleanlinessLevel: row.cleanliness_level,
      revisitIntent: row.revisit_intent,
      visitedOn: row.visited_on,
      visitSeason: row.visit_season,
      body: row.body,
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}
