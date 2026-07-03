export type OnsenReviewSummary = Record<string, number>;

export type OnsenReview = {
  id: string;
  accommodationSlug: string;
  bathType: 'room_bath' | 'private_bath' | 'public_bath' | 'other';
  waterFeel: 'clear' | 'soft' | 'strong' | 'unclear';
  visitSeason: string | null;
  body: string;
  createdAt: string;
};

type OnsenReviewCountRow = {
  accommodation_slug: string;
};

type OnsenReviewRow = {
  id: string;
  accommodation_slug: string;
  bath_type: OnsenReview['bathType'];
  water_feel: OnsenReview['waterFeel'];
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

export async function readOnsenReviewCounts(slugs: string[]): Promise<OnsenReviewSummary> {
  const config = readSupabaseConfig();
  const uniqueSlugs = Array.from(new Set(slugs)).filter(Boolean);

  if (!config || uniqueSlugs.length === 0) return {};

  const url = new URL('/rest/v1/onsen_reviews', config.url);
  url.searchParams.set('select', 'accommodation_slug');
  url.searchParams.set('status', 'eq.approved');
  url.searchParams.set('accommodation_slug', `in.(${uniqueSlugs.map((slug) => `"${slug}"`).join(',')})`);

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
      acc[row.accommodation_slug] = (acc[row.accommodation_slug] ?? 0) + 1;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

export async function readOnsenReviews(slug: string, limit = 6): Promise<OnsenReview[]> {
  const config = readSupabaseConfig();

  if (!config || !slug) return [];

  const url = new URL('/rest/v1/onsen_reviews', config.url);
  url.searchParams.set('select', 'id,accommodation_slug,bath_type,water_feel,visit_season,body,created_at');
  url.searchParams.set('status', 'eq.approved');
  url.searchParams.set('accommodation_slug', `eq.${slug}`);
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
      accommodationSlug: row.accommodation_slug,
      bathType: row.bath_type,
      waterFeel: row.water_feel,
      visitSeason: row.visit_season,
      body: row.body,
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}
