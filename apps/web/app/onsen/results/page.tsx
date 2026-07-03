import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Drop,
  FunnelSimple,
  ChatCircleText,
  MagnifyingGlass,
  SealCheck,
  ThermometerHot,
  Warning,
  Waves,
} from '@phosphor-icons/react/ssr';
import { normalizeOnsenPublicCopy } from '@web/lib/onsenCopy';
import { readOnsenCandidates } from '@web/lib/onsenData';
import { readOnsenReviewCounts } from '@web/lib/onsenReviews';
import {
  bathContextFilters,
  getFilterLabel,
  getFilterLabels,
  onsenAreaFilters,
  regionGroupFilters,
  splitLegacySignals,
  travelContextFilters,
  waterCriterionFilters,
} from '@web/lib/onsenTaxonomy';

export const metadata: Metadata = {
  title: '온천 검색 결과',
  description: '일본 료칸 예약 전 객실탕, 가족탕, 대욕장, 온천수 체감과 주의할 점을 비교합니다.',
  alternates: {
    canonical: '/onsen/results',
  },
};

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function normalizeParams(value: string | string[] | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.flatMap((item) => item.split(',')).map((item) => item.trim()).filter(Boolean);
}

function buildResultsHref(params: { query?: string; regionGroup?: string; area?: string; travel?: string[]; bath?: string[]; water?: string[] }) {
  const nextParams = new URLSearchParams();

  if (params.query) {
    nextParams.set('query', params.query);
  }

  if (params.regionGroup) {
    nextParams.set('regionGroup', params.regionGroup);
  }

  if (params.area) {
    nextParams.set('area', params.area);
  }

  for (const travel of params.travel ?? []) {
    nextParams.append('travel', travel);
  }

  for (const bath of params.bath ?? []) {
    nextParams.append('bath', bath);
  }

  for (const water of params.water ?? []) {
    nextParams.append('water', water);
  }

  const queryString = nextParams.toString();
  return queryString ? `/onsen/results?${queryString}` : '/onsen/results';
}

export default async function OnsenPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string | string[];
    region?: string | string[];
    regionGroup?: string | string[];
    area?: string | string[];
    travel?: string | string[];
    bath?: string | string[];
    water?: string | string[];
    signal?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = normalizeParam(params.query).trim().toLowerCase();
  const legacyRegion = normalizeParam(params.region);
  const regionGroup = normalizeParam(params.regionGroup);
  const area = normalizeParam(params.area || params.region);
  const legacySignals = splitLegacySignals(normalizeParams(params.signal));
  const travel = normalizeParams(params.travel);
  const bath = [...normalizeParams(params.bath), ...legacySignals.bath];
  const water = [...normalizeParams(params.water), ...legacySignals.water];
  const candidates = await readOnsenCandidates();
  const reviewCounts = await readOnsenReviewCounts(candidates.map((candidate) => candidate.slug));
  const filtered = candidates.filter((candidate) => {
    const location = candidate.location;
    const contexts = candidate.contexts;
    const regionGroupMatch = !regionGroup || location?.regionGroup === regionGroup;
    const areaMatch = !area || location?.onsenArea === area || candidate.region === area;
    const travelMatch = travel.every((item) => contexts?.travel.some((value) => value === item));
    const bathMatch = bath.every((item) => contexts?.bath.some((value) => value === item));
    const waterMatch = water.every((item) => contexts?.water.some((value) => value === item));
    const queryText = [
      candidate.name,
      candidate.jaName,
      candidate.area,
      location?.display,
      location?.regionGroupLabel,
      location?.prefectureLabel,
      location?.cityLabel,
      location?.onsenAreaLabel,
      candidate.primaryBath,
      candidate.summary,
      ...candidate.fit,
      ...candidate.tags,
    ]
      .join(' ')
      .toLowerCase();
    const queryMatch = !query || queryText.includes(query);
    return regionGroupMatch && areaMatch && travelMatch && bathMatch && waterMatch && queryMatch;
  });
  const activeRegionGroupLabel = getFilterLabel(regionGroupFilters, regionGroup);
  const activeAreaLabel = getFilterLabel(onsenAreaFilters, area);
  const activeTravelLabels = getFilterLabels(travelContextFilters, travel);
  const activeBathLabels = getFilterLabels(bathContextFilters, bath);
  const activeWaterLabels = getFilterLabels(waterCriterionFilters, water);
  const hasActiveFilter = Boolean(query || regionGroup || area || travel.length > 0 || bath.length > 0 || water.length > 0);
  const currentResultsHref = buildResultsHref({ query, regionGroup, area, travel, bath, water });
  const selectedTravel = travel[0] ?? '';
  const selectedBath = bath[0] ?? '';
  const selectedWater = water[0] ?? '';
  const conditionSummary = [
    activeRegionGroupLabel ?? '전체 지역',
    activeAreaLabel,
    ...activeTravelLabels,
    ...activeBathLabels,
    ...activeWaterLabels,
    query ? `"${query}"` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="onsen-results-page">
      <section className="onsen-results-control" aria-label="검색 조건">
        <form className="onsen-results-toolbar" action="/onsen/results">
          <div className="onsen-search-box onsen-search-box-compact">
            <MagnifyingGlass size={20} weight="regular" aria-hidden="true" />
            <input name="query" type="search" placeholder="결과 안에서 다시 검색" aria-label="온천 검색어" defaultValue={query} />
          </div>

          <label className="onsen-filter-select">
            <span>지역 범위</span>
            <select name="regionGroup" defaultValue={regionGroup}>
              <option value="">전체 지역</option>
              {regionGroupFilters.map((item) => (
                <option key={item.value} value={item.value} disabled={item.disabled}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="onsen-filter-select">
            <span>온천지/도시</span>
            <select name="area" defaultValue={area || legacyRegion}>
              <option value="">전체 온천지</option>
              {onsenAreaFilters.map((item) => (
                <option key={item.value} value={item.value} disabled={item.disabled}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="onsen-filter-select">
            <span>이용 방식</span>
            <select name="travel" defaultValue={selectedTravel}>
              <option value="">전체 방식</option>
              {travelContextFilters.map((item) => (
                <option key={item.value} value={item.value} disabled={item.disabled}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="onsen-filter-select">
            <span>탕 구성</span>
            <select name="bath" defaultValue={selectedBath}>
              <option value="">전체 구성</option>
              {bathContextFilters.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="onsen-filter-select">
            <span>온천 기준</span>
            <select name="water" defaultValue={selectedWater}>
              <option value="">전체 기준</option>
              {waterCriterionFilters.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className="onsen-results-actions">
            <button type="submit">적용</button>
            {hasActiveFilter && <Link href="/onsen/results">초기화</Link>}
          </div>
        </form>
      </section>

      <section className="onsen-results-shell" aria-label="온천 검색 결과">
        <aside className="onsen-filter-panel">
          <div className="onsen-filter-panel-head">
            <FunnelSimple size={18} weight="bold" aria-hidden="true" />
            <span>온천 기준</span>
          </div>
          <dl className="onsen-summary-metrics">
            <div>
              <dt>검색 결과</dt>
              <dd>{filtered.length}곳</dd>
            </div>
            <div>
              <dt>기본 축</dt>
              <dd>지역 · 방식</dd>
            </div>
            <div>
              <dt>현재 온천지</dt>
              <dd>{activeAreaLabel ?? '유후인 중심'}</dd>
            </div>
          </dl>
          <div className="onsen-check-list">
            <p>같이 봐야 할 항목</p>
            <span>료칸 숙박인지, 당일온천인지</span>
            <span>객실탕, 대절탕, 대욕장 중 무엇이 중심인지</span>
            <span>온천수 운용과 직수 여부</span>
            <span>겨울, 동선, 예약 조건처럼 놓치기 쉬운 점</span>
          </div>
        </aside>

        <div className="onsen-result-list">
          <div className="onsen-results-titlebar">
            <div>
              <span className="onsen-filter-label">온천 검색 결과</span>
              <h1 id="onsen-results-title">{filtered.length}곳을 비교 중입니다</h1>
              <p className="onsen-results-condition">{conditionSummary}</p>
            </div>
          </div>

          {filtered.length === 0 && (
            <div className="onsen-empty-state">
              <strong>조건에 맞는 온천 기록이 아직 없습니다.</strong>
              <p>현재는 유후인 후보부터 정리하고 있습니다. 지역을 유후인으로 바꾸거나 확인 포인트를 줄여보세요.</p>
              <Link href="/onsen/results">전체 결과 보기</Link>
            </div>
          )}

          {filtered.map((candidate) => (
            <article key={candidate.slug} className="onsen-result-card">
              <div className="onsen-card-visual" aria-label={`${candidate.name} 사진 영역`}>
                {candidate.imageUrl ? (
                  <img src={candidate.imageUrl} alt={candidate.imageAlt ?? `${candidate.name} 온천 이미지`} loading="lazy" />
                ) : (
                  <div className="onsen-card-placeholder">
                    <Waves size={26} weight="bold" aria-hidden="true" />
                    <span>사진 준비 중</span>
                  </div>
                )}
              </div>

              <div className="onsen-card-content">
                <div className="onsen-card-head">
                  <div>
                    <p className="onsen-card-area">{candidate.area}</p>
                    <h3>{candidate.name}</h3>
                    <span>{candidate.location?.display ?? candidate.jaName}</span>
                  </div>
                </div>

                <div className="onsen-card-mark-row" aria-label={`${candidate.name} 온천 확인 포인트`}>
                  <span className="onsen-card-mark" title="온천 유형">
                    <Waves size={15} weight="bold" aria-hidden="true" />
                    {normalizeOnsenPublicCopy(candidate.primaryBath)}
                  </span>
                  <span className="onsen-card-mark" data-tone="confirmed" title="공식 안내에서 확인한 정보 포함">
                    <SealCheck size={15} weight="bold" aria-hidden="true" />
                    공식 확인
                  </span>
                  <span className="onsen-card-mark" data-tone="site-review" title="바스타임에서 직접 받은 온천 리뷰">
                    <ChatCircleText size={15} weight="bold" aria-hidden="true" />
                    바스타임 리뷰 {reviewCounts[candidate.slug] ?? 0}
                  </span>
                </div>

                <div className="onsen-card-decision">
                  <p>
                    <strong>{normalizeOnsenPublicCopy(candidate.waterDecision.springType)}.</strong> {normalizeOnsenPublicCopy(candidate.waterDecision.summary)}
                  </p>
                </div>

                <dl className="onsen-card-fact-line" aria-label={`${candidate.name} 온천수 정보`}>
                  <div>
                    <dt>
                      <Drop size={15} weight="bold" aria-hidden="true" />
                      객실탕
                    </dt>
                    <dd>{normalizeOnsenPublicCopy(candidate.waterDecision.roomBath)}</dd>
                  </div>
                  <div>
                    <dt>
                      <ThermometerHot size={15} weight="bold" aria-hidden="true" />
                      운용
                    </dt>
                    <dd>{normalizeOnsenPublicCopy(candidate.waterDecision.operation)}</dd>
                  </div>
                </dl>

                {candidate.waterDecision.notice && (
                  <p className="onsen-card-note">
                    <Warning size={15} weight="bold" aria-hidden="true" />
                    {normalizeOnsenPublicCopy(candidate.waterDecision.notice)}
                  </p>
                )}

                <div className="onsen-fit-row">
                  {candidate.fit.map((item) => (
                    <span key={`${candidate.slug}-${item}`}>{normalizeOnsenPublicCopy(item)}</span>
                  ))}
                </div>

                <Link className="onsen-detail-link" href={`/onsen/${candidate.slug}?from=${encodeURIComponent(currentResultsHref)}`}>
                  더 확인하기
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
