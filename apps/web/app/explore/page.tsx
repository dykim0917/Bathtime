import type { Metadata } from 'next';
import { ExploreFilters } from '@web/components/ExploreFilters';
import { getPublishedArchiveContents } from '@web/lib/archive';
import { CATEGORIES } from '@web/lib/labels';
import type { ContentCategory } from '@/src/archive/types';

export const revalidate = 300;

export const metadata: Metadata = {
  title: '아카이브 탐색',
  description: '카테고리와 태그로 바스타임 아카이브를 탐색합니다.',
};

function normalizeCategory(value: string | string[] | undefined): ContentCategory | 'ALL' {
  const raw = Array.isArray(value) ? value[0] : value;
  return CATEGORIES.includes(raw as ContentCategory | 'ALL') ? (raw as ContentCategory | 'ALL') : 'ALL';
}

function normalizeParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; query?: string | string[] }>;
}) {
  const params = await searchParams;
  const category = normalizeCategory(params.category);
  const query = normalizeParam(params.query);
  const contents = await getPublishedArchiveContents();

  return (
    <div className="page-stack">
      <header className="page-header compact">
        <h1>아카이브 탐색</h1>
        <p>카테고리와 태그로 지금 필요한 기록을 골라보세요.</p>
      </header>

      <ExploreFilters contents={contents} initialCategory={category} query={query} />
    </div>
  );
}
