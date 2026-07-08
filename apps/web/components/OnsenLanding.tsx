import Link from 'next/link';
import { Waves } from '@phosphor-icons/react/ssr';
import { readOnsenCandidates } from '@web/lib/onsenData';
import { buildOnsenSearchSuggestions, popularOnsenSearches, recommendedOnsenPlaces } from '@web/lib/onsenSearch';
import type { OnsenCandidate } from '@web/lib/onsenCatalog';
import { getOnsenWaterHighlightMark, hasConfirmedWaterKakenagashi } from '@web/lib/onsenWaterSignal';
import { OnsenSearchForm } from './OnsenSearchForm';

type RegionInventory = {
  area: string;
  label: string;
  href: string;
  publishedCount: number;
  directSourceCount: number;
  imageUrl: string;
};

const regionImageByArea: Record<string, string> = {
  yufuin: '/images/onsen/regions/yufuin.jpg',
  beppu: '/images/onsen/regions/beppu.jpg',
  kurokawa: '/images/onsen/regions/kurokawa.jpg',
  ibusuki: '/images/onsen/regions/ibusuki.jpg',
  ureshino: '/images/onsen/regions/ureshino.jpg',
  takeo: '/images/onsen/regions/takeo.jpg',
  kirishima: '/images/onsen/regions/kirishima.jpg',
  hakone: '/images/onsen/regions/hakone.jpg',
  yugawara: '/images/onsen/regions/yugawara.jpg',
  isawa: '/images/onsen/regions/isawa.jpg',
  kawaguchiko: '/images/onsen/regions/kawaguchiko.jpg',
  fujiyoshida: '/images/onsen/regions/fujiyoshida.jpg',
  jozankei: '/images/onsen/regions/jozankei.jpg',
  noboribetsu: '/images/onsen/regions/noboribetsu.jpg',
  'yunokawa-hakodate': '/images/onsen/regions/yunokawa-hakodate.jpg',
  'hokkaido-toyako': '/images/onsen/regions/hokkaido-toyako.jpg',
  tokachigawa: '/images/onsen/regions/tokachigawa.jpg',
  tokyo: '/images/onsen/regions/tokyo.jpg',
  osaka: '/images/onsen/regions/osaka.jpg',
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function OnsenLaurel({ side = 'left' }: { side?: 'left' | 'right' }) {
  return (
    <svg className="onsen-card-water-award-laurel" data-side={side} viewBox="0 96 192 358" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="m185.152344 425.984375c-12.199219-4.320313-23.851563-10.042969-34.726563-17.054687 27.695313-20.011719 34.761719-58.261719 16.046875-86.851563-27.496094 18.027344-36.859375 53.953125-21.664062 83.105469-13.386719-9.347656-25.335938-20.601563-35.472656-33.398438-6.453126-8.199218-12.140626-16.972656-16.992188-26.210937 31.425781-8.359375 51.582031-38.960938 46.863281-71.132813-28.511719 4.21875-50.6875 26.984375-54.160156 55.597656-8.855469-21.878906-12.945313-45.398437-12-68.984374 33.738281-.210938 61.515625-26.574219 63.488281-60.253907-25.113281-1.4375-48.734375 11.980469-60.359375 34.289063 2.714844-13.710938 7.109375-27.027344 13.089844-39.65625l6.796875-13.992188c23.199219-17.566406 31.628906-48.566406 20.523438-75.457031-29.089844 12.0625-45.0625 43.507813-37.65625 74.113281l-4.082032 8.40625c-4.246094 8.996094-7.765625 18.320313-10.519531 27.878906-4.84375-25.214843-24.289063-45.09375-49.390625-50.496093-6.984375 32.5625 12.171875 65.039062 44.046875 74.679687-2.976563 19.625-2.722656 39.605469.75 59.144532-11.269531-22.445313-34.636719-36.214844-59.734375-35.199219 1.445312 35.25 31.148438 62.679687 66.398438 61.328125 4.132812 12.234375 9.539062 24.003906 16.136718 35.105468-20.191406-12.644531-45.734375-13.023437-66.296875-.984374 16.953125 28.882812 53.308594 39.808593 83.378907 25.0625 9.753906 11.796874 20.941406 22.332031 33.304687 31.359374-27.324219-6.476562-55.679687 5.617188-69.921875 29.816407 29.230469 17.179687 66.78125 8.5625 85.601562-19.640625 9.921876 5.808594 20.367188 10.667968 31.199219 14.519531.851563.300781 1.75.457031 2.65625.457031 3.902344.007813 7.242188-2.804687 7.902344-6.652344.65625-3.847656-1.5625-7.609374-5.246094-8.898437zm0 0"
      />
    </svg>
  );
}

function getVerdictTotal(candidates: OnsenCandidate[]) {
  return candidates.reduce(
    (acc, candidate) => {
      if (!candidate.verdict) return acc;
      return {
        experiencesRead: acc.experiencesRead + (candidate.verdict.briefing.experiencesRead ?? candidate.directReviews ?? 0),
        publishedCount: acc.publishedCount + 1,
      };
    },
    { experiencesRead: 0, publishedCount: 0 }
  );
}

function getFeaturedVerdicts(candidates: OnsenCandidate[]) {
  const currentMonth = new Date().getMonth() + 1;
  const regionCounts = new Map<string, number>();

  return [...candidates]
    .filter((candidate) => candidate.verdict)
    .sort((a, b) => {
      const aSeason = a.verdict?.items.some((item) => item.seasonMonths?.includes(currentMonth)) ? 1 : 0;
      const bSeason = b.verdict?.items.some((item) => item.seasonMonths?.includes(currentMonth)) ? 1 : 0;
      if (aSeason !== bSeason) return bSeason - aSeason;

      const aLevel = a.verdict?.level === 'full' ? 1 : 0;
      const bLevel = b.verdict?.level === 'full' ? 1 : 0;
      if (aLevel !== bLevel) return bLevel - aLevel;

      return (b.verdict?.briefing.experiencesRead ?? b.directReviews ?? 0) - (a.verdict?.briefing.experiencesRead ?? a.directReviews ?? 0);
    })
    .filter((candidate) => {
      const key = candidate.location?.onsenArea ?? candidate.region;
      const count = regionCounts.get(key) ?? 0;
      if (count >= 2) return false;
      regionCounts.set(key, count + 1);
      return true;
    })
    .slice(0, 4);
}

function getRegionInventory(candidates: OnsenCandidate[]): RegionInventory[] {
  const byArea = new Map<string, RegionInventory>();

  for (const candidate of candidates) {
    if (!candidate.verdict) continue;
    const area = candidate.location?.onsenArea ?? candidate.region;
    const label = candidate.location?.onsenAreaLabel ?? candidate.area;
    const existing =
      byArea.get(area) ??
      ({
        area,
        label,
        href: `/onsen/results?area=${encodeURIComponent(area)}`,
        publishedCount: 0,
        directSourceCount: 0,
        imageUrl: regionImageByArea[area] ?? '/images/onsen/regions/yufuin.jpg',
      } satisfies RegionInventory);

    existing.publishedCount += 1;
    if (hasConfirmedWaterKakenagashi(candidate)) {
      existing.directSourceCount += 1;
    }
    byArea.set(area, existing);
  }

  return [...byArea.values()]
    .filter((item) => item.publishedCount > 0)
    .sort((a, b) => b.publishedCount - a.publishedCount || a.label.localeCompare(b.label, 'ko-KR'));
}

export async function OnsenLanding() {
  const candidates = await readOnsenCandidates();
  const suggestions = buildOnsenSearchSuggestions(candidates);
  const totals = getVerdictTotal(candidates);
  const featuredVerdicts = getFeaturedVerdicts(candidates);
  const regionInventory = getRegionInventory(candidates);
  const featuredRegionInventory = regionInventory.slice(0, 6);
  const compactRegionInventory = regionInventory.slice(6);

  return (
    <div className="onsen-home">
      <section className="onsen-search-hero" aria-labelledby="onsen-search-title">
        <div className="onsen-hero-copy-block">
          <p className="onsen-kicker">바스타임 온천 검색기</p>
          <h1 id="onsen-search-title">숙소보다 먼저, 어떤 온천인지 확인하세요.</h1>
          <div className="onsen-total-stamp" aria-label="바스타임 온천 판정 현황">
            <strong>이용 경험 {formatNumber(totals.experiencesRead)}건을 읽고, {formatNumber(totals.publishedCount)}곳을 확인했습니다.</strong>
            <Link href="/onsen/methodology">확인 기준 보기</Link>
          </div>

          <OnsenSearchForm suggestions={suggestions} recommendedPlaces={recommendedOnsenPlaces} popularSearches={popularOnsenSearches} panelMode="autocomplete" />
        </div>
      </section>

      {featuredVerdicts.length > 0 ? (
        <section className="onsen-featured-verdicts" aria-labelledby="onsen-featured-verdicts-title">
          <div className="onsen-home-section-head">
            <p className="onsen-kicker">바스타임 판정</p>
            <h2 id="onsen-featured-verdicts-title">먼저 확인해볼 온천</h2>
            <p>검색어를 정하지 않아도, 바스타임이 확인한 숙소부터 살펴볼 수 있습니다.</p>
          </div>
          <div className="onsen-featured-verdict-grid">
            {featuredVerdicts.map((candidate) => {
              const waterHighlightMark = getOnsenWaterHighlightMark(candidate);

              return (
                <Link key={candidate.slug} className="onsen-featured-verdict-card" href={`/onsen/${candidate.slug}`}>
                  <div className="onsen-featured-verdict-visual" aria-label={`${candidate.name} 사진 영역`}>
                    {candidate.imageUrl ? (
                      <img src={candidate.imageUrl} alt={candidate.imageAlt ?? `${candidate.name} 온천 이미지`} loading="lazy" />
                    ) : (
                      <div className="onsen-card-placeholder">
                        <Waves size={26} weight="bold" aria-hidden="true" />
                        <span>사진 준비 중</span>
                      </div>
                    )}
                  </div>

                  <div className="onsen-featured-verdict-copy">
                    {waterHighlightMark ? (
                      <span className="onsen-card-water-award" data-tone={waterHighlightMark.tone} title={waterHighlightMark.title}>
                        <OnsenLaurel />
                        {waterHighlightMark.label}
                        <OnsenLaurel side="right" />
                      </span>
                    ) : null}
                    <span className="onsen-card-location">{candidate.location?.display ?? candidate.area}</span>
                    <strong>{candidate.name}</strong>
                    <span className="onsen-verdict-card-meta">
                      이용 경험 {formatNumber(candidate.verdict?.briefing.experiencesRead ?? candidate.directReviews)}건 분석 ·{' '}
                      {(candidate.verdict?.items.length ?? 0) > 0 ? `근거 ${candidate.verdict?.items.length ?? 0}개` : '구조 확인'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {regionInventory.length > 0 ? (
        <section className="onsen-region-inventory" aria-labelledby="onsen-region-inventory-title">
          <div className="onsen-home-section-head">
            <p className="onsen-kicker">지역별 보기</p>
            <h2 id="onsen-region-inventory-title">지역별로 확인한 온천</h2>
            <p>숙소 수가 많은 지역을 먼저 정리했습니다.</p>
          </div>
          <div className="onsen-region-inventory-grid">
            {featuredRegionInventory.map((item) => (
              <Link key={item.area} className="onsen-region-inventory-card" href={item.href}>
                <span className="onsen-region-inventory-bg" aria-hidden="true">
                  <img src={item.imageUrl} alt="" loading="lazy" />
                </span>
                <span className="onsen-region-inventory-copy">
                  <strong>{item.label}</strong>
                  <span>숙소 {formatNumber(item.publishedCount)}곳 · 100% 원천 {formatNumber(item.directSourceCount)}곳</span>
                </span>
              </Link>
            ))}
          </div>
          {compactRegionInventory.length > 0 ? (
            <details className="onsen-region-compact-panel" aria-label="더 많은 온천 지역">
              <summary className="onsen-region-compact-head">
                <span className="onsen-region-compact-summary-copy">
                  <strong>더 많은 지역</strong>
                  <span>{formatNumber(compactRegionInventory.length)}개 지역</span>
                </span>
              </summary>
              <div className="onsen-region-compact-grid">
                {compactRegionInventory.map((item) => (
                  <Link key={item.area} className="onsen-region-compact-link" href={item.href}>
                    <strong>{item.label}</strong>
                    <span>숙소 {formatNumber(item.publishedCount)}곳</span>
                  </Link>
                ))}
              </div>
            </details>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
