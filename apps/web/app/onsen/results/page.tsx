import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Drop,
  FunnelSimple,
  ChatCircleText,
  MagnifyingGlass,
  Mountains,
  SealCheck,
  Thermometer,
  ThermometerHot,
  Warning,
  Waves,
} from '@phosphor-icons/react/ssr';
import { getOnsenCandidates } from '@web/lib/onsenCatalog';
import { normalizeOnsenPublicCopy } from '@web/lib/onsenCopy';
import { readOnsenReviewCounts } from '@web/lib/onsenReviews';

export const metadata: Metadata = {
  title: '온천 검색 결과',
  description: '일본 료칸 예약 전 객실탕, 가족탕, 대욕장, 온천수 체감과 주의할 점을 비교합니다.',
  alternates: {
    canonical: '/onsen/results',
  },
};

const regionFilters = [
  { label: '유후인', value: 'yufuin' },
  { label: '벳푸', value: 'beppu', disabled: true },
  { label: '쿠로카와', value: 'kurokawa', disabled: true },
  { label: '하코네', value: 'hakone', disabled: true },
  { label: '노보리베츠', value: 'noboribetsu', disabled: true },
];

const pointFilters = [
  { label: '객실탕 중심', value: 'room-bath', icon: Waves },
  { label: '가족탕/대절탕 있음', value: 'private-bath', icon: Drop },
  { label: '대욕장 중심', value: 'public-bath', icon: Mountains },
  { label: '부드러운 물 느낌', value: 'water-texture', icon: Thermometer },
  { label: '겨울 주의', value: 'winter-caution', icon: Warning },
];

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function normalizeParams(value: string | string[] | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.flatMap((item) => item.split(',')).map((item) => item.trim()).filter(Boolean);
}

function getFilterLabels<T extends { label: string; value: string }>(items: T[], values: string[]) {
  return values
    .map((value) => items.find((item) => item.value === value)?.label)
    .filter((label): label is string => Boolean(label));
}

function getFilterLabel<T extends { label: string; value: string }>(items: T[], value: string) {
  return items.find((item) => item.value === value)?.label;
}

function buildResultsHref(params: { query?: string; region?: string; signals?: string[] }) {
  const nextParams = new URLSearchParams();

  if (params.query) {
    nextParams.set('query', params.query);
  }

  if (params.region) {
    nextParams.set('region', params.region);
  }

  for (const signal of params.signals ?? []) {
    nextParams.append('signal', signal);
  }

  const queryString = nextParams.toString();
  return queryString ? `/onsen/results?${queryString}` : '/onsen/results';
}

export default async function OnsenPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string | string[]; region?: string | string[]; signal?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = normalizeParam(params.query).trim().toLowerCase();
  const region = normalizeParam(params.region);
  const signals = normalizeParams(params.signal);
  const candidates = getOnsenCandidates();
  const reviewCounts = await readOnsenReviewCounts(candidates.map((candidate) => candidate.slug));
  const filtered = candidates.filter((candidate) => {
    const regionMatch = !region || candidate.region === region;
    const signalMatch = signals.every((signal) => candidate.tags.includes(signal));
    const queryText = [candidate.name, candidate.jaName, candidate.area, candidate.primaryBath, candidate.summary, ...candidate.fit, ...candidate.tags]
      .join(' ')
      .toLowerCase();
    const queryMatch = !query || queryText.includes(query);
    return regionMatch && signalMatch && queryMatch;
  });
  const activeRegionLabel = getFilterLabel(regionFilters, region);
  const activeSignalLabels = getFilterLabels(pointFilters, signals);
  const hasActiveFilter = Boolean(query || region || signals.length > 0);
  const currentResultsHref = buildResultsHref({ query, region, signals });
  const selectedSignal = signals[0] ?? '';
  const conditionSummary = [
    activeRegionLabel ?? '전체 지역',
    ...activeSignalLabels,
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
            <span>지역</span>
            <select name="region" defaultValue={region}>
              <option value="">전체 지역</option>
              {regionFilters.map((item) => (
                <option key={item.value} value={item.value} disabled={item.disabled}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="onsen-filter-select">
            <span>확인 포인트</span>
            <select name="signal" defaultValue={selectedSignal}>
              <option value="">전체 포인트</option>
              {pointFilters.map((item) => (
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
            <span>예약 전 체크</span>
          </div>
          <dl className="onsen-summary-metrics">
            <div>
              <dt>검색 결과</dt>
              <dd>{filtered.length}곳</dd>
            </div>
            <div>
              <dt>먼저 볼 것</dt>
              <dd>온천수</dd>
            </div>
            <div>
              <dt>현재 지역</dt>
              <dd>{region ? '유후인' : '유후인 중심'}</dd>
            </div>
          </dl>
          <div className="onsen-check-list">
            <p>같이 봐야 할 항목</p>
            <span>객실탕에도 온천수가 들어오는지</span>
            <span>직수 온천인지</span>
            <span>물 추가나 온도 조정이 있는지</span>
            <span>탕과 풀 조건이 섞여 있지 않은지</span>
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
                    <span>{candidate.jaName}</span>
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
