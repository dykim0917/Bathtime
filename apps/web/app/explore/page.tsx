import type { Metadata } from 'next';
import { ArchiveCard } from '@web/components/ArchiveCard';
import { getPublishedArchiveContents, searchArchiveContents } from '@web/lib/archive';
import { ARCHIVE_TAGS, CATEGORIES, CATEGORY_LABELS } from '@web/lib/labels';
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
  searchParams: Promise<{ category?: string | string[]; tag?: string | string[]; query?: string | string[] }>;
}) {
  const params = await searchParams;
  const category = normalizeCategory(params.category);
  const tag = normalizeParam(params.tag);
  const query = normalizeParam(params.query);
  const contents = await getPublishedArchiveContents();
  const results = searchArchiveContents(contents, { category, tag, query });

  return (
    <div className="page-stack">
      <header className="page-header compact">
        <h1>아카이브 탐색</h1>
        <p>카테고리와 태그로 지금 필요한 바스타임 기록을 찾아보세요.</p>
      </header>

      <section className="filter-section" aria-label="카테고리">
        <a className={category === 'ALL' ? 'chip active' : 'chip'} href="/explore">전체</a>
        {CATEGORIES.filter((item): item is ContentCategory => item !== 'ALL').map((item) => (
          <a key={item} className={category === item ? 'chip active' : 'chip'} href={`/explore?category=${item}`}>
            {CATEGORY_LABELS[item]}
          </a>
        ))}
      </section>

      <section className="filter-section" aria-label="태그">
        {ARCHIVE_TAGS.map((item) => {
          const href = `/explore?${new URLSearchParams({
            ...(category !== 'ALL' ? { category } : {}),
            tag: item,
            ...(query ? { query } : {}),
          }).toString()}`;
          return <a key={item} className={tag === item ? 'token active' : 'token'} href={href}>{item}</a>;
        })}
      </section>

      {query ? <p className="result-note">검색어: {query}</p> : null}

      <div className="card-grid">
        {results.map((content) => <ArchiveCard key={content.id} content={content} />)}
      </div>
      {results.length === 0 ? <p className="empty-note">조건에 맞는 콘텐츠를 찾지 못했습니다.</p> : null}
    </div>
  );
}
