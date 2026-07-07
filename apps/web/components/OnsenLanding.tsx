import Link from 'next/link';
import { readOnsenCandidates } from '@web/lib/onsenData';
import { buildOnsenSearchSuggestions, popularOnsenSearches, recommendedOnsenPlaces } from '@web/lib/onsenSearch';
import type { OnsenCandidate } from '@web/lib/onsenCatalog';
import { OnsenSearchForm } from './OnsenSearchForm';

type RegionInventory = {
  area: string;
  label: string;
  href: string;
  publishedCount: number;
  directSourceCount: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value);
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
    .slice(0, 5);
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
      } satisfies RegionInventory);

    existing.publishedCount += 1;
    if (candidate.contexts?.water.includes('direct_source') || candidate.waterDecision.operation.includes('직수')) {
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

  return (
    <div className="onsen-home">
      <section className="onsen-search-hero" aria-labelledby="onsen-search-title">
        <div className="onsen-hero-copy-block">
          <p className="onsen-kicker">바스타임 온천 검색기</p>
          <h1 id="onsen-search-title">숙소보다 먼저, 어떤 온천인지 확인하세요.</h1>
          <div className="onsen-total-stamp" aria-label="바스타임 온천 판정 현황">
            <strong>이용 경험 {formatNumber(totals.experiencesRead)}건을 직접 읽고, {formatNumber(totals.publishedCount)}곳을 판정했습니다.</strong>
            <Link href="/onsen/methodology">바스타임이 확인하는 방법</Link>
          </div>

          <OnsenSearchForm suggestions={suggestions} recommendedPlaces={recommendedOnsenPlaces} popularSearches={popularOnsenSearches} panelMode="autocomplete" />
        </div>
      </section>

      {featuredVerdicts.length > 0 ? (
        <section className="onsen-featured-verdicts" aria-labelledby="onsen-featured-verdicts-title">
          <div className="onsen-home-section-head">
            <p className="onsen-kicker">Verdict</p>
            <h2 id="onsen-featured-verdicts-title">이번 주 바스타임 판정</h2>
            <p>검색어를 몰라도 괜찮습니다. 먼저 읽고 판정해둔 숙소부터 훑어보세요.</p>
          </div>
          <div className="onsen-featured-verdict-grid">
            {featuredVerdicts.map((candidate) => (
              <Link key={candidate.slug} className="onsen-featured-verdict-card" href={`/onsen/${candidate.slug}`}>
                <span className="onsen-card-location">{candidate.location?.display ?? candidate.area}</span>
                <strong>{candidate.name}</strong>
                <p>{candidate.verdict?.headline ?? candidate.summary}</p>
                <span className="onsen-verdict-card-meta">
                  이용 경험 {formatNumber(candidate.verdict?.briefing.experiencesRead ?? candidate.directReviews)}건 분석 ·{' '}
                  {(candidate.verdict?.items.length ?? 0) > 0 ? `판정 근거 ${candidate.verdict?.items.length ?? 0}개` : '구조 판정'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {regionInventory.length > 0 ? (
        <section className="onsen-region-inventory" aria-labelledby="onsen-region-inventory-title">
          <div className="onsen-home-section-head">
            <p className="onsen-kicker">Area Inventory</p>
            <h2 id="onsen-region-inventory-title">지역별 판정 재고</h2>
            <p>판정 데이터가 있는 지역만 보여줍니다. 지역별로 확인된 숙소 수와 직수 온천 수를 함께 봅니다.</p>
          </div>
          <div className="onsen-region-inventory-grid">
            {regionInventory.map((item) => (
              <Link key={item.area} className="onsen-region-inventory-card" href={item.href}>
                <strong>{item.label}</strong>
                <span>판정 {formatNumber(item.publishedCount)}곳 · 직수 {formatNumber(item.directSourceCount)}곳</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
