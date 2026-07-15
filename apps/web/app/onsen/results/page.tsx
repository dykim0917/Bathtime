import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CaretDown,
  ChatCircleText,
  Check,
  CheckCircle,
  MagnifyingGlass,
  MapPin,
  Warning,
  Waves,
  X,
} from '@phosphor-icons/react/ssr';
import { TermInfo, TermTooltip } from '@web/components/TermInfo';
import { OnsenResultImpression, OnsenResultsAnalytics } from '@web/components/OnsenAnalytics';
import { getOnsenEntityType, type OnsenCandidate, type OnsenDecisionFact, type OnsenEntityType } from '@web/lib/onsenCatalog';
import { getOnsenCardSummary, normalizeOnsenPublicCopy } from '@web/lib/onsenCopy';
import { readOnsenCandidates } from '@web/lib/onsenData';
import { getOnsenDecisionProfile, type OnsenDecisionProfile } from '@web/lib/onsenDecision';
import { addOnsenEntryIntent, normalizeOnsenEntryIntent, onsenEntryIntentMeta, type OnsenEntryIntentValue } from '@web/lib/onsenIntent';
import { buildOnsenMapPoints } from '@web/lib/onsenMap';
import { readOnsenReviewCounts } from '@web/lib/onsenReviews';
import {
  bathContextFilters,
  getFilterLabel,
  officialFacilityFeatureFilters,
  onsenAreaFilters,
  onsenEntityFilters,
  regionGroupFilters,
  splitLegacySignals,
  travelContextFilters,
  waterColorFilters,
  waterConditionFilters,
  waterCriterionFilters,
  waterMethodFilters,
  waterTextureFilters,
  type OnsenWaterCriterion,
} from '@web/lib/onsenTaxonomy';
import type { OnsenTermInfoKey } from '@web/lib/onsenTermInfo';
import {
  getOnsenWaterHighlightMark,
  getOnsenWaterSortRank,
  hasConfirmedWaterKakenagashi,
  hasOnsenWaterCriterion,
} from '@web/lib/onsenWaterSignal';
import {
  OnsenResultsFilterAction,
  OnsenResultsSort,
  OnsenResultsWorkspace,
  type OnsenResultsSortValue,
} from './OnsenResultsWorkspace';
import styles from './results.module.css';

type OnsenResultsSearchParams = {
  [key: string]: string | string[] | undefined;
  query?: string | string[];
  type?: string | string[];
  region?: string | string[];
  regionGroup?: string | string[];
  area?: string | string[];
  travel?: string | string[];
  bath?: string | string[];
  water?: string | string[];
  feature?: string | string[];
  signal?: string | string[];
  sort?: string | string[];
  page?: string | string[];
  intent?: string | string[];
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<OnsenResultsSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const hasQueryParams = Object.values(params).some((value) =>
    Array.isArray(value) ? value.some(Boolean) : Boolean(value)
  );

  return {
    title: '온천 검색 결과',
    description: '일본 온천 숙소와 당일입욕 시설의 목욕 구성, 공식 시설 정보, 온천수 근거와 후기를 비교합니다.',
    alternates: {
      canonical: '/onsen/results',
      languages: { 'ko-KR': '/onsen/results', en: '/en/onsen/results', 'x-default': '/onsen/results' },
    },
    robots: hasQueryParams ? { index: false, follow: false } : undefined,
  };
}

const PAGE_SIZE = 24;

const resultSortFilters: { value: OnsenResultsSortValue }[] = [
  { value: 'recommended' },
  { value: 'reviews' },
  { value: 'water' },
  { value: 'name' },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function OnsenLaurel({ side = 'left' }: { side?: 'left' | 'right' }) {
  return (
    <svg className={styles.waterLaurel} data-side={side} viewBox="0 96 192 358" aria-hidden="true" focusable="false">
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

function uniqueValues<T extends string>(values: T[]) {
  return [...new Set(values)];
}

function normalizeFilterParam<T extends string>(value: string | string[] | undefined, filters: { value: T; disabled?: boolean }[]) {
  const normalized = normalizeParam(value);
  const allowed = new Set(filters.filter((item) => !item.disabled).map((item) => item.value));
  return allowed.has(normalized as T) ? (normalized as T) : '';
}

function normalizeFilterParams<T extends string>(value: string | string[] | undefined, filters: { value: T; disabled?: boolean }[]) {
  const allowed = new Set(filters.filter((item) => !item.disabled).map((item) => item.value));
  return uniqueValues(normalizeParams(value).filter((item): item is T => allowed.has(item as T)));
}

function normalizePage(value: string | string[] | undefined) {
  const parsed = Number.parseInt(normalizeParam(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

const legacyWaterParamAliases: Partial<Record<string, OnsenWaterCriterion>> = {
  direct_source: 'kakenagashi',
  temperature_adjustment: 'temperature_adjustment',
  winter_caution: 'winter_caution',
};

function normalizeWaterFilterParams(value: string | string[] | undefined) {
  const allowed = new Set(waterCriterionFilters.filter((item) => !item.disabled).map((item) => item.value));
  return uniqueValues(
    normalizeParams(value)
      .map((item) => {
        if (allowed.has(item as OnsenWaterCriterion)) return item as OnsenWaterCriterion;
        return legacyWaterParamAliases[item] ?? null;
      })
      .filter((item): item is OnsenWaterCriterion => Boolean(item))
  );
}

type ResultsHrefParams = {
  query?: string;
  type?: OnsenEntityType | '';
  regionGroup?: string;
  area?: string;
  travel?: string[];
  bath?: string[];
  water?: string[];
  feature?: string[];
  sort?: OnsenResultsSortValue;
  page?: number;
  intent?: OnsenEntryIntentValue | '';
};

function buildResultsHref(params: ResultsHrefParams) {
  const nextParams = new URLSearchParams();
  if (params.intent && params.intent !== 'unknown') nextParams.set('intent', params.intent);
  if (params.query) nextParams.set('query', params.query);
  if (params.type) nextParams.set('type', params.type);
  if (params.regionGroup) nextParams.set('regionGroup', params.regionGroup);
  if (params.area) nextParams.set('area', params.area);
  for (const travel of params.travel ?? []) nextParams.append('travel', travel);
  for (const bath of params.bath ?? []) nextParams.append('bath', bath);
  for (const water of params.water ?? []) nextParams.append('water', water);
  for (const feature of params.feature ?? []) nextParams.append('feature', feature);
  if (params.sort && params.sort !== 'recommended') nextParams.set('sort', params.sort);
  if (params.page && params.page > 1) nextParams.set('page', String(params.page));

  const queryString = nextParams.toString();
  return queryString ? `/onsen/results?${queryString}` : '/onsen/results';
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

const waterMethodValues = new Set<string>(waterMethodFilters.map((item) => item.value));
const waterColorValues = new Set<string>(waterColorFilters.map((item) => item.value));

function toggleWaterFilterValue(values: OnsenWaterCriterion[], value: OnsenWaterCriterion) {
  if (values.includes(value)) return values.filter((item) => item !== value);
  if (waterMethodValues.has(value)) return [...values.filter((item) => !waterMethodValues.has(item)), value];
  if (waterColorValues.has(value)) return [...values.filter((item) => !waterColorValues.has(item)), value];
  return [...values, value];
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

function formatVerdictStamp(candidate: Pick<OnsenCandidate, 'directReviews' | 'verdict'>) {
  if (!candidate.verdict) return null;
  const experiencesRead = candidate.verdict.briefing.experiencesRead ?? candidate.directReviews;
  const itemCount = candidate.verdict.items.length;
  const evidenceText = itemCount > 0 ? `판정 근거 ${formatNumber(itemCount)}개` : '구조 확인';
  return `후기 ${formatNumber(experiencesRead)}건 분석 · ${evidenceText}`;
}

function getWaterCriterionTermKey(value: OnsenWaterCriterion): OnsenTermInfoKey | null {
  if (value === 'kakenagashi_pure') return 'pureDirectWater';
  if (value === 'kakenagashi') return 'directWater';
  if (value === 'junkan') return 'recirculatedWater';
  if (value === 'slippery') return 'slipperyWater';
  if (value === 'salt_warmth') return 'saltWater';
  if (value === 'sulfur') return 'sulfurWater';
  if (value === 'carbonated') return 'carbonatedWater';
  if (value === 'hakutaku') return 'whiteCloudyWater';
  if (value === 'brown') return 'brownWater';
  if (value === 'temperature_adjustment') return 'temperatureCondition';
  if (value === 'winter_caution') return 'winterCaution';
  return null;
}

function getAvailableWaterValues(candidates: OnsenCandidate[]) {
  return new Set(
    waterCriterionFilters
      .filter((filter) => candidates.some((candidate) => hasOnsenWaterCriterion(candidate, filter.value)))
      .map((filter) => filter.value)
  );
}

function filterAvailableWaterItems<T extends OnsenWaterCriterion, Item extends { value: T }>(filters: Item[], availableValues: Set<OnsenWaterCriterion>) {
  return filters.filter((item) => availableValues.has(item.value));
}

function getReviewVolume(candidate: OnsenCandidate) {
  return candidate.verdict?.briefing.experiencesRead ?? candidate.directReviews ?? 0;
}

function getIntentDecisionCodes(entryIntent: OnsenEntryIntentValue, entityType: OnsenEntityType, bath: string[]) {
  if (bath.includes('room_bath')) return ['room_bath', 'private_bath_reservation_method', 'bath_composition'];
  if (entryIntent === 'stay_private') return ['room_bath', 'private_bath', 'family_bath', 'private_bath_reservation_method'];
  if (entryIntent === 'stay_bath_depth') return ['public_bath', 'open_air_bath', 'bath_count', 'bath_composition'];
  if (entryIntent === 'city_facility') return ['opening_hours', 'adult_price_yen', 'towel_policy', 'bath_count'];
  return entityType === 'facility'
    ? ['adult_price_yen', 'opening_hours', 'bath_count', 'bath_composition']
    : ['room_bath', 'private_bath', 'public_bath', 'bath_composition'];
}

function getResultDecisionFacts(
  profile: OnsenDecisionProfile,
  entityType: OnsenEntityType,
  entryIntent: OnsenEntryIntentValue,
  bath: string[]
) {
  const preferredCodes = getIntentDecisionCodes(entryIntent, entityType, bath);
  const allFacts = [...profile.trip, ...profile.usage, ...profile.experience];
  const confirmedFacts = allFacts.filter((fact) => fact.status !== 'needs_check');
  const selected = [
    ...preferredCodes.map((code) => confirmedFacts.find((fact) => fact.code === code)),
    ...preferredCodes.map((code) => allFacts.find((fact) => fact.code === code)),
  ]
    .filter((fact): fact is NonNullable<typeof fact> => Boolean(fact));
  return [...new Map(selected.map((fact) => [fact.code, fact])).values()].slice(0, 2);
}

function getSelectedConditionState(
  profile: OnsenDecisionProfile,
  entityType: OnsenEntityType,
  entryIntent: OnsenEntryIntentValue,
  bath: string[]
) {
  if (entryIntent === 'unknown' && bath.length === 0) return null;
  const facts = [...profile.trip, ...profile.usage, ...profile.experience];
  const evidence = getIntentDecisionCodes(entryIntent, entityType, bath)
    .map((code) => facts.find((fact) => fact.code === code))
    .find((fact): fact is OnsenDecisionFact => Boolean(fact));

  if (!evidence) return { status: 'needs_check' as const, label: '운영 조건 확인 필요' };
  if (evidence.status === 'confirmed') return { status: evidence.status, label: '선택 조건 확인' };
  if (evidence.status === 'conditional') return { status: evidence.status, label: '조건부 이용' };
  return { status: evidence.status, label: '공식 확인 필요' };
}

function FilterOption({
  label,
  href,
  active,
  count,
  termKey,
}: {
  label: string;
  href: string;
  active: boolean;
  count: number;
  termKey?: OnsenTermInfoKey | null;
}) {
  return (
    <span className={styles.filterOption} data-active={active ? 'true' : undefined}>
      <span className={styles.filterOptionChoice}>
        <OnsenResultsFilterAction className={styles.filterOptionLink} href={href} active={active}>
          <span className={styles.checkBox}><Check size={14} weight="bold" aria-hidden /></span>
          <span className={styles.filterOptionLabel}>{label}</span>
        </OnsenResultsFilterAction>
        {termKey ? <TermInfo termKey={termKey} className={styles.filterOptionInfo} /> : null}
      </span>
      <small className={styles.filterOptionCount}>{formatNumber(count)}</small>
    </span>
  );
}

function getPaginationItems(currentPage: number, pageCount: number) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const pages = new Set([1, pageCount, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = [...pages].filter((page) => page > 0 && page <= pageCount).sort((a, b) => a - b);
  const items: (number | 'ellipsis')[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) items.push('ellipsis');
    items.push(page);
  });
  return items;
}

export default async function OnsenPage({
  searchParams,
}: {
  searchParams: Promise<OnsenResultsSearchParams>;
}) {
  const params = await searchParams;
  const entryIntent = normalizeOnsenEntryIntent(normalizeParam(params.intent));
  const rawQuery = normalizeParam(params.query).trim();
  const query = rawQuery.toLowerCase();
  const entityType = normalizeFilterParam(params.type, onsenEntityFilters);
  const regionGroup = normalizeFilterParam(params.regionGroup, regionGroupFilters);
  const area = normalizeFilterParam(params.area, onsenAreaFilters) || normalizeFilterParam(params.region, onsenAreaFilters);
  const sort = normalizeFilterParam(params.sort, resultSortFilters) || 'recommended';
  const requestedPage = normalizePage(params.page);
  const legacySignals = splitLegacySignals(normalizeParams(params.signal));
  const requestedTravel = normalizeFilterParams(params.travel, travelContextFilters);
  const requestedBath = uniqueValues([...normalizeFilterParams(params.bath, bathContextFilters), ...legacySignals.bath]);
  const requestedWater = uniqueValues([...normalizeWaterFilterParams(params.water), ...legacySignals.water]);
  const candidates = await readOnsenCandidates();
  const decisionProfiles = new Map(candidates.map((candidate) => [candidate.slug, getOnsenDecisionProfile(candidate)]));
  const intentScopeCandidates = entryIntent === 'unknown'
    ? candidates
    : candidates.filter((candidate) => decisionProfiles.get(candidate.slug)?.intents.includes(entryIntent));
  const filterScopeCandidates = entityType
    ? intentScopeCandidates.filter((candidate) => getOnsenEntityType(candidate) === entityType)
    : intentScopeCandidates;
  const availableTravelValues = new Set(filterScopeCandidates.flatMap((candidate) => candidate.contexts?.travel ?? []));
  const availableBathValues = new Set(filterScopeCandidates.flatMap((candidate) => candidate.contexts?.bath ?? []));
  const travel = requestedTravel.filter((item) => availableTravelValues.has(item));
  const bath = requestedBath.filter((item) => availableBathValues.has(item));
  const availableFeatureFilters = officialFacilityFeatureFilters.filter((filter) =>
    filterScopeCandidates.some((candidate) => candidate.officialFilterCodes?.includes(filter.value))
  );
  const feature = normalizeFilterParams(params.feature, availableFeatureFilters);
  const availableWaterValues = getAvailableWaterValues(filterScopeCandidates);
  const water = requestedWater.filter((item) => availableWaterValues.has(item));
  const availableMethodFilters = filterAvailableWaterItems(waterMethodFilters, availableWaterValues);
  const availableTextureFilters = filterAvailableWaterItems(waterTextureFilters, availableWaterValues);
  const availableColorFilters = filterAvailableWaterItems(waterColorFilters, availableWaterValues);
  const availableConditionFilters = filterAvailableWaterItems(waterConditionFilters, availableWaterValues);

  const accommodationSlugs = candidates.filter((candidate) => getOnsenEntityType(candidate) === 'accommodation').map((candidate) => candidate.slug);
  const facilitySlugs = candidates.filter((candidate) => getOnsenEntityType(candidate) === 'facility').map((candidate) => candidate.slug);
  const [accommodationReviewCounts, facilityReviewCounts] = await Promise.all([
    readOnsenReviewCounts(accommodationSlugs, 'accommodation'),
    readOnsenReviewCounts(facilitySlugs, 'facility'),
  ]);

  const filteredEntries = candidates
    .map((candidate, index) => ({ candidate, index }))
    .filter(({ candidate }) => {
      const location = candidate.location;
      const contexts = candidate.contexts;
      const intentMatch = entryIntent === 'unknown' || decisionProfiles.get(candidate.slug)?.intents.includes(entryIntent);
      const entityMatch = !entityType || getOnsenEntityType(candidate) === entityType;
      const regionGroupMatch = !regionGroup || location?.regionGroup === regionGroup;
      const areaMatch = !area || location?.onsenArea === area || candidate.region === area;
      const travelMatch = travel.every((item) => contexts?.travel.some((value) => value === item));
      const bathMatch = bath.every((item) => contexts?.bath.some((value) => value === item));
      const waterMatch = water.every((item) => hasOnsenWaterCriterion(candidate, item));
      const featureMatch = feature.every((item) => candidate.officialFilterCodes?.includes(item));
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
      ].join(' ').toLowerCase();
      const queryMatch = !query || queryText.includes(query);
      return intentMatch && entityMatch && regionGroupMatch && areaMatch && travelMatch && bathMatch && waterMatch && featureMatch && queryMatch;
    });

  filteredEntries.sort((a, b) => {
    if (sort === 'reviews') return getReviewVolume(b.candidate) - getReviewVolume(a.candidate) || a.index - b.index;
    if (sort === 'name') return a.candidate.name.localeCompare(b.candidate.name, 'ko-KR');
    if (sort === 'water') return getOnsenWaterSortRank(a.candidate) - getOnsenWaterSortRank(b.candidate) || a.index - b.index;
    const aProfile = decisionProfiles.get(a.candidate.slug);
    const bProfile = decisionProfiles.get(b.candidate.slug);
    return (bProfile?.coverage ?? 0) - (aProfile?.coverage ?? 0)
      || Number(Boolean(bProfile?.price)) - Number(Boolean(aProfile?.price))
      || getReviewVolume(b.candidate) - getReviewVolume(a.candidate)
      || a.index - b.index;
  });

  const filtered = filteredEntries.map(({ candidate }) => candidate);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, pageCount);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);
  const pageCandidates = filtered.slice(rangeStart === 0 ? 0 : rangeStart - 1, rangeEnd);
  const activeRegionGroupLabel = getFilterLabel(regionGroupFilters, regionGroup);
  const activeAreaLabel = getFilterLabel(onsenAreaFilters, area);
  const resultScopeLabel = activeAreaLabel ?? activeRegionGroupLabel ?? '전체 지역';
  const intentMeta = entryIntent === 'unknown' ? null : onsenEntryIntentMeta[entryIntent];

  const currentState: ResultsHrefParams = {
    intent: entryIntent,
    query: rawQuery,
    type: entityType,
    regionGroup,
    area,
    travel,
    bath,
    water,
    feature,
    sort,
    page: currentPage,
  };
  const hrefFor = (overrides: Partial<ResultsHrefParams>) => buildResultsHref({ ...currentState, ...overrides });
  const currentResultsHref = hrefFor({ page: currentPage });
  const resetFiltersHref = hrefFor({ type: '', travel: [], bath: [], water: [], feature: [], page: 1 });

  const activeFilters: { key: string; label: string; href: string }[] = [];
  if (entryIntent !== 'unknown') activeFilters.push({
    key: 'intent',
    label: onsenEntryIntentMeta[entryIntent].eyebrow,
    href: hrefFor({ intent: '', page: 1 }),
  });
  if (rawQuery) activeFilters.push({ key: 'query', label: `“${rawQuery}” 검색`, href: hrefFor({ query: '', page: 1 }) });
  if (regionGroup) activeFilters.push({ key: 'regionGroup', label: activeRegionGroupLabel ?? regionGroup, href: hrefFor({ regionGroup: '', page: 1 }) });
  if (area) activeFilters.push({ key: 'area', label: activeAreaLabel ?? area, href: hrefFor({ area: '', page: 1 }) });
  if (entityType) activeFilters.push({ key: 'type', label: getFilterLabel(onsenEntityFilters, entityType) ?? entityType, href: hrefFor({ type: '', page: 1 }) });
  travel.forEach((value) => activeFilters.push({
    key: `travel-${value}`,
    label: getFilterLabel(travelContextFilters, value) ?? value,
    href: hrefFor({ travel: travel.filter((item) => item !== value), page: 1 }),
  }));
  bath.forEach((value) => activeFilters.push({
    key: `bath-${value}`,
    label: getFilterLabel(bathContextFilters, value) ?? value,
    href: hrefFor({ bath: bath.filter((item) => item !== value), page: 1 }),
  }));
  water.forEach((value) => activeFilters.push({
    key: `water-${value}`,
    label: getFilterLabel(waterCriterionFilters, value) ?? value,
    href: hrefFor({ water: water.filter((item) => item !== value), page: 1 }),
  }));
  feature.forEach((value) => activeFilters.push({
    key: `feature-${value}`,
    label: getFilterLabel(availableFeatureFilters, value) ?? value,
    href: hrefFor({ feature: feature.filter((item) => item !== value), page: 1 }),
  }));

  const countBy = (predicate: (candidate: OnsenCandidate) => boolean, scope = filterScopeCandidates) =>
    scope.reduce((count, candidate) => count + (predicate(candidate) ? 1 : 0), 0);

  const filterBody = (
    <>
      <details className={styles.filterGroup} open>
        <summary><span>이용 형태</span><CaretDown size={16} weight="bold" aria-hidden /></summary>
        <div className={styles.filterGroupBody}>
          {onsenEntityFilters.map((item) => {
            const active = entityType === item.value;
            return (
              <FilterOption
                key={item.value}
                label={item.label}
                active={active}
                count={countBy((candidate) => getOnsenEntityType(candidate) === item.value, candidates)}
                href={hrefFor({ type: active ? '' : item.value, intent: '', page: 1 })}
              />
            );
          })}
          <span className={styles.filterSubgroup}>이용 방식</span>
          {travelContextFilters.filter((item) => !item.disabled && availableTravelValues.has(item.value)).map((item) => {
            const active = travel.includes(item.value);
            return (
              <FilterOption
                key={item.value}
                label={item.label}
                active={active}
                count={countBy((candidate) => candidate.contexts?.travel.includes(item.value) ?? false)}
                href={hrefFor({ travel: toggleFilterValue(travel, item.value), page: 1 })}
              />
            );
          })}
        </div>
      </details>

      <details className={styles.filterGroup} open>
        <summary><span>목욕 구성</span><CaretDown size={16} weight="bold" aria-hidden /></summary>
        <div className={styles.filterGroupBody}>
          {bathContextFilters.filter((item) => availableBathValues.has(item.value)).map((item) => {
            const active = bath.includes(item.value);
            return (
              <FilterOption
                key={item.value}
                label={item.label}
                active={active}
                count={countBy((candidate) => candidate.contexts?.bath.includes(item.value) ?? false)}
                href={hrefFor({ bath: toggleFilterValue(bath, item.value), page: 1 })}
              />
            );
          })}
        </div>
      </details>

      {availableFeatureFilters.length > 0 ? (
        <details className={styles.filterGroup} open>
          <summary><span>이용 조건</span><CaretDown size={16} weight="bold" aria-hidden /></summary>
          <div className={styles.filterGroupBody}>
            {['목욕 구성', '사우나·체험', '이용 편의'].flatMap((group) => {
              const items = availableFeatureFilters.filter((item) => item.description === group);
              if (items.length === 0) return [];
              return [
                <span className={styles.filterSubgroup} key={`${group}-label`}>{group}</span>,
                ...items.map((item) => {
                  const active = feature.includes(item.value);
                  return (
                    <FilterOption
                      key={item.value}
                      label={item.label}
                      active={active}
                      count={countBy((candidate) => candidate.officialFilterCodes?.includes(item.value) ?? false)}
                      href={hrefFor({ feature: toggleFilterValue(feature, item.value), page: 1 })}
                    />
                  );
                }),
              ];
            })}
          </div>
        </details>
      ) : null}

      {availableMethodFilters.length > 0 ? (
        <details className={styles.filterGroup}>
          <summary><span>온천수 상세</span><CaretDown size={16} weight="bold" aria-hidden /></summary>
          <div className={styles.filterGroupBody}>
            {availableMethodFilters.map((item) => {
              const active = water.includes(item.value);
              return (
                <FilterOption
                  key={item.value}
                  label={item.label}
                  active={active}
                  count={countBy((candidate) => hasOnsenWaterCriterion(candidate, item.value))}
                  href={hrefFor({ water: toggleWaterFilterValue(water, item.value), page: 1 })}
                  termKey={getWaterCriterionTermKey(item.value)}
                />
              );
            })}
            {availableConditionFilters.length > 0 ? <span className={styles.filterSubgroup}>운용 조건</span> : null}
            {availableConditionFilters.map((item) => {
              const active = water.includes(item.value);
              return (
                <FilterOption
                  key={item.value}
                  label={item.label}
                  active={active}
                  count={countBy((candidate) => hasOnsenWaterCriterion(candidate, item.value))}
                  href={hrefFor({ water: toggleWaterFilterValue(water, item.value), page: 1 })}
                  termKey={getWaterCriterionTermKey(item.value)}
                />
              );
            })}
          </div>
        </details>
      ) : null}

      {availableTextureFilters.length + availableColorFilters.length > 0 ? (
        <details className={styles.filterGroup}>
          <summary><span>물의 감촉과 색</span><CaretDown size={16} weight="bold" aria-hidden /></summary>
          <div className={styles.filterGroupBody}>
            {availableTextureFilters.length > 0 ? <span className={styles.filterSubgroup}>감촉</span> : null}
            {availableTextureFilters.map((item) => {
              const active = water.includes(item.value);
              return (
                <FilterOption
                  key={item.value}
                  label={item.label}
                  active={active}
                  count={countBy((candidate) => hasOnsenWaterCriterion(candidate, item.value))}
                  href={hrefFor({ water: toggleWaterFilterValue(water, item.value), page: 1 })}
                  termKey={getWaterCriterionTermKey(item.value)}
                />
              );
            })}
            {availableColorFilters.length > 0 ? <span className={styles.filterSubgroup}>색</span> : null}
            {availableColorFilters.map((item) => {
              const active = water.includes(item.value);
              return (
                <FilterOption
                  key={item.value}
                  label={item.label}
                  active={active}
                  count={countBy((candidate) => hasOnsenWaterCriterion(candidate, item.value))}
                  href={hrefFor({ water: toggleWaterFilterValue(water, item.value), page: 1 })}
                  termKey={getWaterCriterionTermKey(item.value)}
                />
              );
            })}
          </div>
        </details>
      ) : null}

      {availableFeatureFilters.some((item) => item.description === '공식 성분') ? (
        <details className={styles.filterGroup}>
          <summary><span>공식 수질</span><CaretDown size={16} weight="bold" aria-hidden /></summary>
          <div className={styles.filterGroupBody}>
            {availableFeatureFilters.filter((item) => item.description === '공식 성분').map((item) => {
              const active = feature.includes(item.value);
              return (
                <FilterOption
                  key={item.value}
                  label={item.label}
                  active={active}
                  count={countBy((candidate) => candidate.officialFilterCodes?.includes(item.value) ?? false)}
                  href={hrefFor({ feature: toggleFilterValue(feature, item.value), page: 1 })}
                />
              );
            })}
          </div>
        </details>
      ) : null}
    </>
  );

  const paginationItems = getPaginationItems(currentPage, pageCount);
  const mapPoints = buildOnsenMapPoints(pageCandidates);

  return (
    <div className={styles.page}>
      <OnsenResultsAnalytics
        entryIntent={entryIntent}
        activeFilters={activeFilters.map((item) => item.key)}
        queryType={rawQuery ? 'text' : 'empty'}
      />
      <section className={styles.overview} aria-labelledby="onsen-results-title">
        <div className={styles.overviewMain}>
          <div className={styles.overviewCopy}>
            <span className={styles.scopeLabel}>
              <MapPin size={14} weight="bold" aria-hidden />
              {resultScopeLabel === '전체 지역' ? '일본 전역' : resultScopeLabel}
            </span>
            <h1 id="onsen-results-title">{intentMeta?.resultTitle ?? `${resultScopeLabel} 온천`} <strong>{formatNumber(filtered.length)}곳</strong></h1>
          </div>
          <OnsenResultsSort value={sort} />
        </div>

        {activeFilters.length > 0 ? (
          <div className={styles.selectedRow}>
            <span className={styles.selectedLabel}>선택한 조건</span>
            <div className={styles.selectedList}>
              {activeFilters.map((item) => (
                <Link key={item.key} href={item.href} prefetch={false} rel="nofollow" aria-label={`${item.label} 조건 제거`}>
                  {item.label}
                  <X size={14} weight="bold" aria-hidden />
                </Link>
              ))}
            </div>
            <Link className={styles.clearAll} href="/onsen/results" prefetch={false}>모두 지우기</Link>
          </div>
        ) : null}
      </section>

      <OnsenResultsWorkspace
        filterBody={filterBody}
        resetHref={resetFiltersHref}
        hasFilters={Boolean(entryIntent !== 'unknown' || entityType || travel.length || bath.length || water.length || feature.length)}
        resultCount={filtered.length}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        sort={sort}
        mapPoints={mapPoints}
        visibleResultCount={pageCandidates.length}
      >
        <div className={styles.resultList}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <MagnifyingGlass size={28} weight="bold" aria-hidden />
              <strong>조건에 맞는 온천이 없습니다.</strong>
              <p>{intentMeta ? '선택한 이용 조건을 줄이거나 전체 온천에서 다시 찾아보세요.' : '온천수나 목욕 조건을 하나 줄여 다시 살펴보세요.'}</p>
              <Link href="/onsen/results" prefetch={false}>전체 온천 보기</Link>
            </div>
          ) : null}

          {pageCandidates.map((candidate, pageIndex) => {
            const waterHighlightMark = getOnsenWaterHighlightMark(candidate);
            const candidateType = getOnsenEntityType(candidate);
            const reviewCount = candidateType === 'facility'
              ? facilityReviewCounts[candidate.slug] ?? 0
              : accommodationReviewCounts[candidate.slug] ?? 0;
            const verdictStamp = formatVerdictStamp(candidate);
            const waterOperation = normalizeResultCardCopy(candidate.waterDecision.operation || candidate.waterDecision.springType);
            const decisionProfile = decisionProfiles.get(candidate.slug) ?? getOnsenDecisionProfile(candidate);
            const resultDecisionFacts = getResultDecisionFacts(decisionProfile, candidateType, entryIntent, bath);
            const selectedConditionState = getSelectedConditionState(decisionProfile, candidateType, entryIntent, bath);
            const resultPosition = rangeStart + pageIndex;

            return (
              <Link
                id={`onsen-result-${candidate.slug}`}
                key={candidate.slug}
                className={styles.resultCardLink}
                href={addOnsenEntryIntent(`/onsen/${candidate.slug}`, entryIntent)}
                prefetch={false}
                data-return-href={currentResultsHref}
                data-onsen-result-link="true"
                data-entry-intent={entryIntent}
                data-entity-type={candidateType}
                data-target-slug={candidate.slug}
                data-onsen-area={candidate.location?.onsenArea ?? candidate.region}
                data-result-position={resultPosition}
                data-decision-fact-coverage={decisionProfile.coverage}
                data-has-price={decisionProfile.price ? 'true' : 'false'}
              >
                <article className={styles.resultCard} data-onsen-result-card="true">
                  <OnsenResultImpression
                    entryIntent={entryIntent}
                    entityType={candidateType}
                    targetSlug={candidate.slug}
                    onsenArea={candidate.location?.onsenArea ?? candidate.region}
                    sourceComponent="onsen_results_card"
                    resultPosition={resultPosition}
                    decisionFactCoverage={decisionProfile.coverage}
                  />
                  <div className={styles.resultMedia} aria-label={`${candidate.name} 사진 영역`}>
                    {candidate.imageUrl ? (
                      <img src={candidate.imageUrl} alt={candidate.imageAlt ?? `${candidate.name} 온천 이미지`} loading="lazy" />
                    ) : (
                      <div className={styles.resultPlaceholder}>
                        <Waves size={26} weight="bold" aria-hidden />
                        <span>사진 준비 중</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.resultMain}>
                    <div className={styles.resultMeta}>
                      <span>{candidate.location?.display ?? candidate.area}</span>
                      <span className={styles.entityType} data-type={candidateType}>
                        {candidateType === 'facility' ? '여행 중 방문' : '숙박하며 이용'}
                      </span>
                    </div>
                    <div className={styles.resultTitleRow}>
                      <h2>{candidate.name}</h2>
                      {waterHighlightMark ? (
                        <TermTooltip
                          className={styles.waterAwardTooltip}
                          title={waterHighlightMark.label}
                          description={waterHighlightMark.title}
                          align="end"
                        >
                          <span className={styles.waterAward} data-tone={waterHighlightMark.tone}>
                            <OnsenLaurel />
                            {waterHighlightMark.label}
                            <OnsenLaurel side="right" />
                          </span>
                        </TermTooltip>
                      ) : null}
                    </div>
                    {candidate.jaName ? <span className={styles.originalName}>{candidate.jaName}</span> : null}
                    {selectedConditionState ? (
                      <span className={styles.resultConditionState} data-status={selectedConditionState.status}>
                        {selectedConditionState.status === 'confirmed'
                          ? <CheckCircle size={14} weight="fill" aria-hidden />
                          : <Warning size={14} weight="bold" aria-hidden />}
                        {selectedConditionState.label}
                      </span>
                    ) : null}
                    <p className={styles.resultVerdict}>{normalizeOnsenPublicCopy(getOnsenCardSummary(candidate))}</p>
                    <div className={styles.resultEvidence}>
                      {verdictStamp ? (
                        <span><CheckCircle size={14} weight="bold" aria-hidden />{verdictStamp}</span>
                      ) : null}
                      <span className={styles.reviewCount} title="바스타임 후기" aria-label={`바스타임 후기 ${reviewCount}건`}>
                        <ChatCircleText size={14} weight="bold" aria-hidden />
                        {formatNumber(reviewCount)}건
                      </span>
                    </div>
                    {candidate.waterDecision.notice ? (
                      <p className={styles.resultNotice}>
                        <Warning size={14} weight="bold" aria-hidden />
                        {normalizeOnsenPublicCopy(candidate.waterDecision.notice)}
                      </p>
                    ) : null}
                  </div>

                  <dl className={styles.resultFacts} aria-label={`${candidate.name} 결정 정보`}>
                    {(resultDecisionFacts.length > 0 ? resultDecisionFacts : [{
                      code: 'bath_composition',
                      label: candidateType === 'facility' ? '이용 구성' : '목욕 구성',
                      value: normalizeResultCardCopy(candidate.primaryBath),
                    }, {
                      code: 'water',
                      label: '온천수',
                      value: waterOperation,
                    }]).map((fact) => (
                      <div key={fact.code} data-status={'status' in fact ? fact.status : undefined}>
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                        {'status' in fact && fact.status !== 'confirmed' ? (
                          <small>{fact.status === 'conditional' ? '조건 확인' : '공식 확인 필요'}</small>
                        ) : null}
                      </div>
                    ))}
                    <ArrowRight size={18} weight="bold" aria-hidden />
                  </dl>
                </article>
              </Link>
            );
          })}
        </div>

        {filtered.length > PAGE_SIZE ? (
          <nav className={styles.pagination} aria-label="결과 페이지">
            {currentPage > 1 ? (
              <Link href={hrefFor({ page: currentPage - 1 })} prefetch={false} rel="nofollow" aria-label="이전 페이지"><ArrowLeft size={17} weight="bold" aria-hidden /></Link>
            ) : (
              <span aria-disabled="true"><ArrowLeft size={17} aria-hidden /></span>
            )}
            {paginationItems.map((item, index) => item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`}>…</span>
            ) : (
              <Link key={item} href={hrefFor({ page: item })} prefetch={false} rel="nofollow" aria-current={item === currentPage ? 'page' : undefined}>{item}</Link>
            ))}
            {currentPage < pageCount ? (
              <Link href={hrefFor({ page: currentPage + 1 })} prefetch={false} rel="nofollow" aria-label="다음 페이지"><ArrowRight size={17} weight="bold" aria-hidden /></Link>
            ) : (
              <span aria-disabled="true"><ArrowRight size={17} aria-hidden /></span>
            )}
          </nav>
        ) : null}
      </OnsenResultsWorkspace>
    </div>
  );
}
