import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowCounterClockwise,
  CaretDown,
  Drop,
  FunnelSimple,
  ChatCircleText,
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

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
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
  const hasVisibleFilter = travel.length > 0 || bath.length > 0 || water.length > 0;
  const currentResultsHref = buildResultsHref({ query, regionGroup, area, travel, bath, water });
  const clearVisibleFiltersHref = buildResultsHref({ query, regionGroup, area });
  const quickFilters = [
    {
      label: '객실탕 중심',
      active: bath.includes('room_bath'),
      href: buildResultsHref({ query, regionGroup, area, travel, bath: toggleFilterValue(bath, 'room_bath'), water }),
    },
    {
      label: '가족탕/대절탕 있음',
      active: bath.includes('private_bath'),
      href: buildResultsHref({ query, regionGroup, area, travel, bath: toggleFilterValue(bath, 'private_bath'), water }),
    },
    {
      label: '100% 천연온천',
      active: water.includes('natural_100'),
      href: buildResultsHref({ query, regionGroup, area, travel, bath, water: toggleFilterValue(water, 'natural_100') }),
    },
    {
      label: '온천수 확인',
      active: water.includes('spring_confirmed'),
      href: buildResultsHref({ query, regionGroup, area, travel, bath, water: toggleFilterValue(water, 'spring_confirmed') }),
    },
  ];
  const resultScopeLabel = activeAreaLabel ?? activeRegionGroupLabel ?? '전체 지역';

  return (
    <div className="onsen-results-page">
      <section className="onsen-results-control" aria-label="검색 조건">
        <div className="onsen-filter-quickbar">
          <span className="onsen-filter-strip-label">
            <FunnelSimple size={18} weight="bold" aria-hidden="true" />
            필터
          </span>

          <nav className="onsen-filter-quickchips" aria-label="주요 온천 필터">
            {quickFilters.map((item) => (
              <Link
                key={item.label}
                className="onsen-filter-chip onsen-filter-chip-quick"
                data-state={item.active ? 'active' : undefined}
                href={item.href}
                aria-current={item.active ? 'true' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <details className="onsen-filter-accordion">
            <summary className="onsen-filter-summary" aria-label="전체 필터 펼치기">
              <CaretDown size={16} weight="bold" aria-hidden="true" />
            </summary>

            <nav className="onsen-results-toolbar" aria-label="온천 결과 필터">
              <div className="onsen-filter-group">
                <span>방식</span>
                <div className="onsen-filter-chip-row">
                  {travelContextFilters
                    .filter((item) => !item.disabled)
                    .map((item) => {
                      const active = travel.includes(item.value);
                      return (
                        <Link
                          key={item.value}
                          className="onsen-filter-chip"
                          data-state={active ? 'active' : undefined}
                          href={buildResultsHref({
                            query,
                            regionGroup,
                            area,
                            travel: toggleFilterValue(travel, item.value),
                            bath,
                            water,
                          })}
                          aria-current={active ? 'true' : undefined}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                </div>
              </div>

              <div className="onsen-filter-group">
                <span>구성</span>
                <div className="onsen-filter-chip-row">
                  {bathContextFilters.map((item) => {
                    const active = bath.includes(item.value);
                    return (
                      <Link
                        key={item.value}
                        className="onsen-filter-chip"
                        data-state={active ? 'active' : undefined}
                        href={buildResultsHref({
                          query,
                          regionGroup,
                          area,
                          travel,
                          bath: toggleFilterValue(bath, item.value),
                          water,
                        })}
                        aria-current={active ? 'true' : undefined}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="onsen-filter-group">
                <span>기준</span>
                <div className="onsen-filter-chip-row">
                  {waterCriterionFilters.map((item) => {
                    const active = water.includes(item.value);
                    return (
                      <Link
                        key={item.value}
                        className="onsen-filter-chip"
                        data-state={active ? 'active' : undefined}
                        href={buildResultsHref({
                          query,
                          regionGroup,
                          area,
                          travel,
                          bath,
                          water: toggleFilterValue(water, item.value),
                        })}
                        aria-current={active ? 'true' : undefined}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="onsen-results-actions">
                {hasVisibleFilter ? (
                  <Link className="onsen-reset-action" href={clearVisibleFiltersHref}>
                    <ArrowCounterClockwise size={15} weight="bold" aria-hidden="true" />
                    초기화
                  </Link>
                ) : (
                  <span className="onsen-reset-action" aria-disabled="true">
                    <ArrowCounterClockwise size={15} weight="bold" aria-hidden="true" />
                    초기화
                  </span>
                )}
              </div>
            </nav>
          </details>
        </div>
      </section>

      <section className="onsen-results-shell" aria-label="온천 검색 결과">
        <div className="onsen-result-list">
          <div className="onsen-results-titlebar">
            <div>
              <span className="onsen-filter-label">온천 검색 결과</span>
              <h1 id="onsen-results-title">{resultScopeLabel} 온천 {filtered.length}개</h1>
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
