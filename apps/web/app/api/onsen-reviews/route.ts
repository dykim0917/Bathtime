import { NextResponse } from 'next/server';
import { readOnsenReviewsPage, type OnsenReviewSort } from '@web/lib/onsenReviews';
import type { OnsenReviewTargetType } from '@web/lib/onsenPassport';

const targetTypes = new Set<OnsenReviewTargetType>(['accommodation', 'facility']);
const sortOptions = new Set<OnsenReviewSort>(['latest', 'visit']);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug')?.trim() ?? '';
  const targetType = searchParams.get('targetType') as OnsenReviewTargetType | null;
  const sort = (searchParams.get('sort') ?? 'latest') as OnsenReviewSort;
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10);

  if (!/^[a-z0-9][a-z0-9_-]{1,119}$/.test(slug) || !targetType || !targetTypes.has(targetType) || !sortOptions.has(sort) || !Number.isInteger(page) || page < 1 || page > 1000) {
    return NextResponse.json({ error: 'Invalid review query' }, { status: 400 });
  }

  const reviews = await readOnsenReviewsPage(slug, page, sort, targetType);
  return NextResponse.json(
    { reviews },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  );
}
