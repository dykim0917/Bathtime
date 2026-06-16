'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Bathtub,
  BookOpen,
  CheckCircle,
  HouseLine,
  Lock,
  MapPin,
  MapTrifold,
  Moon,
  Package,
  Shower,
  SquaresFour,
  Timer,
  Umbrella,
  Wind,
  type Icon,
} from '@phosphor-icons/react';
import type { ArchiveContent, ContentCategory } from '@/src/archive/types';
import { trackWebEvent } from '@web/lib/analytics';
import { ARCHIVE_TAGS, CATEGORIES, CATEGORY_LABELS } from '@web/lib/labels';
import { ArchiveCard } from './ArchiveCard';

const categoryTags: Record<ContentCategory | 'ALL', Array<(typeof ARCHIVE_TAGS)[number]>> = {
  ALL: [...ARCHIVE_TAGS],
  HOME_BATH: ['욕조 없음', '수면 전', '운동 후', '혼자 쉬기', '비 오는 날', '짧은 의식'],
  BATH_PLACES: ['서울', '외부인 이용 가능', '프라이빗', '혼자 쉬기'],
  BATH_ITEMS: ['욕조 없음', '수면 전', '프라이빗', '혼자 쉬기'],
  TIPS_CULTURE: ['비 오는 날', '수면 전', '혼자 쉬기', '짧은 의식'],
};

const categoryIcons: Record<ContentCategory | 'ALL', Icon> = {
  ALL: SquaresFour,
  HOME_BATH: Bathtub,
  BATH_PLACES: MapTrifold,
  BATH_ITEMS: Package,
  TIPS_CULTURE: BookOpen,
};

const tagIcons: Record<(typeof ARCHIVE_TAGS)[number], Icon> = {
  '욕조 없음': Shower,
  '수면 전': Moon,
  '운동 후': Wind,
  '혼자 쉬기': HouseLine,
  '외부인 이용 가능': CheckCircle,
  프라이빗: Lock,
  서울: MapPin,
  '비 오는 날': Umbrella,
  '짧은 의식': Timer,
};

function matchesQuery(content: ArchiveContent, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    content.title.toLowerCase().includes(normalized) ||
    content.subtitle?.toLowerCase().includes(normalized) ||
    content.summary.toLowerCase().includes(normalized) ||
    content.tags.some((tag) => tag.toLowerCase().includes(normalized))
  );
}

function filterContents(
  contents: ArchiveContent[],
  category: ContentCategory | 'ALL',
  selectedTags: string[],
  query: string
): ArchiveContent[] {
  return contents.filter((content) => {
    const matchesCategory = category === 'ALL' || content.category === category;
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => content.tags.includes(tag));
    return matchesCategory && matchesTags && matchesQuery(content, query);
  });
}

export function ExploreFilters({
  contents,
  initialCategory,
  query,
}: {
  contents: ArchiveContent[];
  initialCategory: ContentCategory | 'ALL';
  query: string;
}) {
  const [category, setCategory] = useState<ContentCategory | 'ALL'>(initialCategory);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const visibleTags = categoryTags[category];
  const results = useMemo(
    () => filterContents(contents, category, selectedTags, query),
    [category, contents, query, selectedTags]
  );

  function selectCategory(next: ContentCategory | 'ALL') {
    setCategory(next);
    setSelectedTags((current) => current.filter((tag) => categoryTags[next].includes(tag as (typeof ARCHIVE_TAGS)[number])));
    trackWebEvent('explore_filter_used', { filter_type: 'category', category: next });
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) => {
      const selected = current.includes(tag);
      trackWebEvent('explore_filter_used', { filter_type: 'tag', tag, selected: !selected });
      return selected ? current.filter((item) => item !== tag) : [...current, tag];
    });
  }

  return (
    <>
      <section className="filter-section" aria-label="카테고리">
        {CATEGORIES.map((item) => {
          const selected = category === item;
          const IconComponent = categoryIcons[item];
          return (
            <button
              key={item}
              type="button"
              className={selected ? 'chip active' : 'chip'}
              aria-pressed={selected}
              onClick={() => selectCategory(item)}
            >
              <IconComponent size={15} weight={selected ? 'fill' : 'regular'} aria-hidden="true" />
              <span>{item === 'ALL' ? '전체' : CATEGORY_LABELS[item]}</span>
            </button>
          );
        })}
      </section>

      <section className="filter-section" aria-label="태그">
        {visibleTags.map((item) => {
          const selected = selectedTags.includes(item);
          const IconComponent = tagIcons[item];
          return (
            <button
              key={item}
              type="button"
              className={selected ? 'token active' : 'token'}
              role="checkbox"
              aria-checked={selected}
              onClick={() => toggleTag(item)}
            >
              <IconComponent size={12} weight={selected ? 'bold' : 'regular'} aria-hidden="true" />
              <span>{item}</span>
            </button>
          );
        })}
      </section>

      {query ? (
        <div className="search-active-note">
          <p>
            <span>검색어</span>
            <strong>{query}</strong>
          </p>
          <Link href="/explore">전체 아카이브 보기</Link>
        </div>
      ) : null}
      {selectedTags.length > 0 ? <p className="result-note">선택한 태그: {selectedTags.join(', ')}</p> : null}

      <div className="card-grid">
        {results.map((content) => <ArchiveCard key={content.id} content={content} />)}
      </div>
      {results.length === 0 ? <p className="empty-note">조건에 맞는 콘텐츠를 찾지 못했습니다.</p> : null}
    </>
  );
}
