import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowCounterClockwise,
  CaretDown,
  Drop,
  FunnelSimple,
  ChatCircleText,
  SealCheck,
  Warning,
  Waves,
} from '@phosphor-icons/react/ssr';
import { normalizeOnsenPublicCopy } from '@web/lib/onsenCopy';
import { readOnsenCandidates } from '@web/lib/onsenData';
import { readOnsenReviewCounts } from '@web/lib/onsenReviews';
import {
  getOnsenWaterHighlightMark,
  getOnsenWaterSortRank,
  hasConfirmedWaterKakenagashi,
  hasOnsenWaterCriterion,
} from '@web/lib/onsenWaterSignal';
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
  description: '일본 료칸 예약 전 객실 내 프라이빗탕, 대절탕, 대욕장, 온천수 체감과 주의할 점을 비교합니다.',
  alternates: {
    canonical: '/onsen/results',
  },
};

const MIN_VISIBLE_REVIEW_COUNT = 5;

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

function normalizeResultCardCopy(value: string) {
  const copy = normalizeOnsenPublicCopy(value);

  if (copy === '온천수 확인') return '온천수 확인';
  if (copy === '온천수 참고 확인') return '참고 확인';
  if (copy === '온천수 확인 필요') return '예약 전 확인';
  if (copy === '객실 온천수 확인') return '객실 온천탕';
  if (copy === '객실 온천수 확인 필요') return '객실 타입별 확인';
  if (copy === '전 객실 온천수 확인') return '전 객실 온천탕';

  return copy;
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
  const filtered = candidates
    .map((candidate, index) => ({ candidate, index }))
    .filter(({ candidate }) => {
      const location = candidate.location;
      const contexts = candidate.contexts;
      const regionGroupMatch = !regionGroup || location?.regionGroup === regionGroup;
      const areaMatch = !area || location?.onsenArea === area || candidate.region === area;
      const travelMatch = travel.every((item) => contexts?.travel.some((value) => value === item));
      const bathMatch = bath.every((item) => contexts?.bath.some((value) => value === item));
      const waterMatch = water.every((item) => hasOnsenWaterCriterion(candidate, item));
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
    })
    .sort((a, b) => getOnsenWaterSortRank(a.candidate) - getOnsenWaterSortRank(b.candidate) || a.index - b.index)
    .map(({ candidate }) => candidate);
  const resultStats = filtered.reduce(
    (acc, candidate) => ({
      verdictCount: acc.verdictCount + (candidate.verdict ? 1 : 0),
      directSourceCount: acc.directSourceCount + (hasConfirmedWaterKakenagashi(candidate) ? 1 : 0),
      experiencesRead: acc.experiencesRead + (candidate.verdict?.briefing.experiencesRead ?? candidate.directReviews ?? 0),
    }),
    { verdictCount: 0, directSourceCount: 0, experiencesRead: 0 }
  );
  const activeRegionGroupLabel = getFilterLabel(regionGroupFilters, regionGroup);
  const activeAreaLabel = getFilterLabel(onsenAreaFilters, area);
  const hasVisibleFilter = travel.length > 0 || bath.length > 0 || water.length > 0;
  const currentResultsHref = buildResultsHref({ query, regionGroup, area, travel, bath, water });
  const clearVisibleFiltersHref = buildResultsHref({ query, regionGroup, area });
  const quickFilters = [
    {
      label: '객실 내 프라이빗탕 중심',
      active: bath.includes('room_bath'),
      href: buildResultsHref({ query, regionGroup, area, travel, bath: toggleFilterValue(bath, 'room_bath'), water }),
    },
    {
      label: '대절탕 있음',
      active: bath.includes('private_bath'),
      href: buildResultsHref({ query, regionGroup, area, travel, bath: toggleFilterValue(bath, 'private_bath'), water }),
    },
    {
      label: '원천 100% 직수',
      active: water.includes('direct_source'),
      href: buildResultsHref({ query, regionGroup, area, travel, bath, water: toggleFilterValue(water, 'direct_source') }),
    },
    {
      label: '부드러운 물 느낌',
      active: water.includes('water_texture'),
      href: buildResultsHref({ query, regionGroup, area, travel, bath, water: toggleFilterValue(water, 'water_texture') }),
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
            <dl className="onsen-results-counts" aria-label="현재 결과 판정 요약">
              <div>
                <dt>판정</dt>
                <dd>{formatNumber(resultStats.verdictCount)}곳</dd>
              </div>
              {resultStats.directSourceCount > 0 ? (
                <div>
                  <dt>직수</dt>
                  <dd>{formatNumber(resultStats.directSourceCount)}곳</dd>
                </div>
              ) : null}
              <div>
                <dt>읽은 경험</dt>
                <dd>{formatNumber(resultStats.experiencesRead)}건</dd>
              </div>
            </dl>
          </div>

          {filtered.length === 0 && (
            <div className="onsen-empty-state">
              <strong>조건에 맞는 온천 기록이 아직 없습니다.</strong>
              <p>현재는 유후인 후보부터 정리하고 있습니다. 지역을 유후인으로 바꾸거나 확인 포인트를 줄여보세요.</p>
              <Link href="/onsen/results">전체 결과 보기</Link>
            </div>
          )}

          {filtered.map((candidate) => (
            (() => {
              const waterHighlightMark = getOnsenWaterHighlightMark(candidate);
              const reviewCount = reviewCounts[candidate.slug] ?? 0;

              return (
                <Link
                  key={candidate.slug}
                  className="onsen-result-card-link"
                  href={`/onsen/${candidate.slug}?from=${encodeURIComponent(currentResultsHref)}`}
                >
                  <article className="onsen-result-card">
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
                          <div className="onsen-card-meta-row">
                            <span className="onsen-card-location">{candidate.location?.display ?? candidate.area}</span>
                          </div>
                          <div className="onsen-card-title-row">
                            <h2>{candidate.name}</h2>
                            <span className="onsen-card-official-mark" role="img" title="공식 안내에서 확인한 정보 포함" aria-label="공식 안내 확인">
                              <SealCheck size={18} weight="fill" aria-hidden="true" />
                            </span>
                            {waterHighlightMark ? (
                              <span className="onsen-card-water-award" data-tone={waterHighlightMark.tone} title={waterHighlightMark.title}>
                                <OnsenLaurel />
                                {waterHighlightMark.label}
                                <OnsenLaurel side="right" />
                              </span>
                            ) : null}
                          </div>
                          {candidate.jaName ? <span className="onsen-card-original-name">{candidate.jaName}</span> : null}
                        </div>
                      </div>

                      <div className="onsen-card-decision">
                        <p>{normalizeOnsenPublicCopy(candidate.verdict?.headline ?? candidate.waterDecision.summary)}</p>
                      </div>

                      <dl className="onsen-card-fact-line" aria-label={`${candidate.name} 온천수 정보`}>
                        <div>
                          <dt>
                            <Waves size={15} weight="bold" aria-hidden="true" />
                            구성
                          </dt>
                          <dd>{normalizeResultCardCopy(candidate.primaryBath)}</dd>
                        </div>
                        <div>
                          <dt>
                            <Drop size={15} weight="bold" aria-hidden="true" />
                            객실
                          </dt>
                          <dd>{normalizeResultCardCopy(candidate.waterDecision.roomBath)}</dd>
                        </div>
                      </dl>

                      {reviewCount >= MIN_VISIBLE_REVIEW_COUNT ? (
                        <span className="onsen-card-review-count" title="바스타임 리뷰 수" aria-label={`바스타임 리뷰 ${reviewCount}개`}>
                          <ChatCircleText size={15} weight="bold" aria-hidden="true" />
                          {reviewCount}
                        </span>
                      ) : null}

                      {candidate.waterDecision.notice && (
                        <p className="onsen-card-note">
                          <Warning size={15} weight="bold" aria-hidden="true" />
                          {normalizeOnsenPublicCopy(candidate.waterDecision.notice)}
                        </p>
                      )}
                    </div>
                  </article>
                </Link>
              );
            })()
          ))}
        </div>
      </section>
    </div>
  );
}
