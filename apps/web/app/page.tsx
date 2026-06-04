import Link from 'next/link';
import { BookmarkSimple, DeviceMobile, MagnifyingGlass, PaperPlaneTilt } from '@phosphor-icons/react/ssr';
import { ArchiveCard } from '@web/components/ArchiveCard';
import { ArchiveVisual } from '@web/components/ArchiveVisual';
import {
  getContentsByCategory,
  getFeaturedContent,
  getLatestContents,
  getPublishedArchiveContents,
} from '@web/lib/archive';
import { CATEGORIES, CATEGORY_LABELS } from '@web/lib/labels';
import type { ContentCategory } from '@/src/archive/types';

export const revalidate = 300;

const situationLinks = [
  {
    title: '욕조 없는 집',
    description: '샤워와 족욕으로 가능한 홈케어를 찾습니다.',
    href: '/explore?query=%EC%9A%95%EC%A1%B0%20%EC%97%86%EC%9D%8C',
    image: '/images/situations/no-bathtub-home.png',
    imageAlt: '작은 욕실에서 샤워와 족욕을 준비하는 사람',
  },
  {
    title: '수면 전',
    description: '잠들기 전 부담이 낮은 바스타임을 고릅니다.',
    href: '/explore?query=%EC%88%98%EB%A9%B4%20%EC%A0%84',
    image: '/images/situations/before-sleep.png',
    imageAlt: '밤 욕실에서 조용히 쉬는 사람',
  },
  {
    title: '퇴근 후',
    description: '하루를 닫는 짧은 회복 콘텐츠를 봅니다.',
    href: '/explore?query=%ED%87%B4%EA%B7%BC%20%ED%9B%84',
    image: '/images/situations/after-work.png',
    imageAlt: '퇴근 후 따뜻한 물로 쉬는 사람',
  },
  {
    title: '몸이 찬 날',
    description: '오래 버티지 않는 온기 루틴을 찾습니다.',
    href: '/explore?query=%EC%9C%BC%EC%8A%AC%EC%9C%BC%EC%8A%AC',
    image: '/images/situations/cold-day.png',
    imageAlt: '추운 날 따뜻한 음료와 목도리로 몸을 녹이는 사람',
  },
  {
    title: '욕실 아이템',
    description: '도구를 사기 전 현실 조건을 확인합니다.',
    href: '/explore?category=BATH_ITEMS',
    image: '/images/situations/bathroom-items.png',
    imageAlt: '욕실 도구와 세면용품을 살펴보는 사람',
  },
  {
    title: '좋은 공간 제보',
    description: '알고 있는 사우나, 숙소, 세팅 단서를 남깁니다.',
    href: '/submit',
    image: '/images/situations/submit-place.png',
    imageAlt: '좋은 목욕 공간을 휴대폰으로 제보하는 사람',
  },
];

export default async function HomePage() {
  const contents = await getPublishedArchiveContents();
  const featured = getFeaturedContent(contents);
  const latest = getLatestContents(contents.filter((content) => content.id !== featured?.id), 6);
  const categories = CATEGORIES.filter((category): category is ContentCategory => category !== 'ALL');
  const visibleCategories = categories
    .map((category) => ({ category, count: getContentsByCategory(contents, category).length }))
    .filter((item) => item.count > 0);

  return (
    <div className="page-stack home-stack">
      <section className="home-hero">
        <header className="page-header home-hero-copy">
          <p className="kicker">BATH TIME ARCHIVE</p>
          <h1>오늘의 상태에 맞는 바스타임을 찾아보세요.</h1>
          <p>웹에서는 홈케어, 욕실 아이템, 목욕 공간의 단서를 발견하고 저장합니다. 실제 의식은 앱에서 이어집니다.</p>
        </header>
        <div className="home-hero-actions" aria-label="메인 행동">
          <Link className="button-primary" href="/explore">
            <MagnifyingGlass size={16} weight="bold" aria-hidden="true" />
            상황별 콘텐츠 보기
          </Link>
          <Link className="button-secondary" href="/saved">
            <BookmarkSimple size={16} weight="bold" aria-hidden="true" />
            저장한 기록 보기
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-heading-row">
          <h2>상황별로 찾기</h2>
          <Link href="/explore">전체 탐색</Link>
        </div>
        <div className="situation-grid">
          {situationLinks.map((item) => (
            <Link key={item.title} className="situation-card" href={item.href}>
              <span className="situation-illustration">
                <img src={item.image} alt={item.imageAlt} loading="lazy" />
              </span>
              <span className="situation-copy">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {featured ? (
        <section className="feature-band">
          <div>
            <ArchiveVisual content={featured} priority />
          </div>
          <div className="feature-copy">
            <p className="kicker">오늘의 추천 아카이브</p>
            <h2>{featured.title}</h2>
            <p>{featured.subtitle ?? featured.summary}</p>
            <Link className="button-primary" href={`/content/${featured.id}`}>기록 보기</Link>
          </div>
        </section>
      ) : null}

      {visibleCategories.length > 0 ? (
        <section className="section">
          <h2>아카이브 갈래</h2>
          <div className="category-grid">
            {visibleCategories.map(({ category, count }) => (
              <Link key={category} className="category-card" href={`/explore?category=${category}`}>
                <strong>{CATEGORY_LABELS[category]}</strong>
                <span>{count}개 기록</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="section-heading-row">
          <h2>새로 정리한 기록</h2>
          <Link href="/explore">전체 보기</Link>
        </div>
        <div className="card-grid">
          {latest.map((content) => <ArchiveCard key={content.id} content={content} />)}
        </div>
      </section>

      <section className="app-bridge">
        <div className="app-bridge-icon" aria-hidden="true">
          <DeviceMobile size={22} weight="bold" />
        </div>
        <div>
          <p className="kicker">APP RITUAL FLOW</p>
          <h2>저장한 콘텐츠는 앱에서 의식으로 이어집니다.</h2>
          <p>웹은 좋은 바스타임을 찾고 저장하는 곳입니다. 앱에서는 저장한 기록을 바탕으로 샤워, 족욕, 입욕 의식을 실행합니다.</p>
        </div>
        <Link className="button-secondary" href="/app">
          <PaperPlaneTilt size={16} weight="bold" aria-hidden="true" />
          앱에서 이어보기
        </Link>
      </section>
    </div>
  );
}
