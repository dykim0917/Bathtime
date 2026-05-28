import Link from 'next/link';
import { ArchiveCard } from '@web/components/ArchiveCard';
import { ArchiveVisual } from '@web/components/ArchiveVisual';
import { RoutineCard } from '@web/components/RoutineCard';
import {
  getContentsByCategory,
  getFeaturedContent,
  getLatestContents,
  getPublishedArchiveContents,
  getPublishedRoutinePresets,
} from '@web/lib/archive';
import { CATEGORIES, CATEGORY_LABELS } from '@web/lib/labels';
import type { ContentCategory } from '@/src/archive/types';

export const revalidate = 300;

export default async function HomePage() {
  const contents = await getPublishedArchiveContents();
  const featured = getFeaturedContent(contents);
  const latest = getLatestContents(contents, 6);
  const routines = getPublishedRoutinePresets(2);
  const categories = CATEGORIES.filter((category): category is ContentCategory => category !== 'ALL');

  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="kicker">BATH TIME ARCHIVE</p>
        <h1>좋은 바스타임을 발견하고, 저장하고, 바로 따라 해보세요.</h1>
        <p>사우나, 스파, 홈스파 세팅, 욕실 아이템, 짧은 의식을 같은 기준으로 정리하는 웹 아카이브입니다.</p>
      </header>

      {featured ? (
        <section className="feature-band">
          <div>
            <ArchiveVisual content={featured} priority />
          </div>
          <div className="feature-copy">
            <p className="kicker">이달의 픽</p>
            <h2>{featured.title}</h2>
            <p>{featured.subtitle ?? featured.summary}</p>
            <Link className="button-primary" href={`/content/${featured.id}`}>기록 보기</Link>
          </div>
        </section>
      ) : null}

      <section className="section">
        <h2>카테고리</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <Link key={category} className="category-card" href={`/explore?category=${category}`}>
              <strong>{CATEGORY_LABELS[category]}</strong>
              <span>{getContentsByCategory(contents, category).length}개 기록</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading-row">
          <h2>새로 정리한 기록</h2>
          <Link href="/explore">전체 보기</Link>
        </div>
        <div className="card-grid">
          {latest.map((content) => <ArchiveCard key={content.id} content={content} />)}
        </div>
      </section>

      <section className="section">
        <h2>바로 해볼 수 있는 의식</h2>
        <div className="routine-grid">
          {routines.map((routine) => <RoutineCard key={routine.id} routine={routine} />)}
        </div>
      </section>
    </div>
  );
}
