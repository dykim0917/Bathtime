export type OnsenReviewSummary = Record<string, number>;

type OnsenReviewCountRow = {
  accommodation_slug: string;
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
