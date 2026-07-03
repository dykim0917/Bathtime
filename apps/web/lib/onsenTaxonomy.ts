import type { OnsenCandidate } from './onsenCatalog';

export type OnsenCountryCode = 'JP';
export type OnsenRegionGroup = 'kyushu' | 'kanto' | 'kansai' | 'hokkaido' | 'tohoku' | 'chubu' | 'chugoku_shikoku';
export type OnsenTravelContext = 'ryokan_stay' | 'day_trip' | 'city_bath' | 'hotel_public_bath';
export type OnsenBathContext = 'room_bath' | 'private_bath' | 'public_bath';
export type OnsenWaterCriterion = 'direct_source' | 'natural_100' | 'spring_confirmed' | 'water_texture' | 'temperature_adjustment' | 'winter_caution';

export type OnsenLocation = {
  country: OnsenCountryCode;
  regionGroup: OnsenRegionGroup;
  regionGroupLabel: string;
  prefecture: string;
  prefectureLabel: string;
  city: string;
  cityLabel: string;
  onsenArea: string;
  onsenAreaLabel: string;
  display: string;
};

export type OnsenStructuredContexts = {
  travel: OnsenTravelContext[];
  bath: OnsenBathContext[];
  water: OnsenWaterCriterion[];
};

export type OnsenTaxonomyFilter<T extends string = string> = {
  label: string;
  value: T;
  description?: string;
  disabled?: boolean;
};

export const regionGroupFilters: OnsenTaxonomyFilter<OnsenRegionGroup>[] = [
  { label: '규슈', value: 'kyushu' },
  { label: '간토', value: 'kanto', disabled: true },
  { label: '간사이', value: 'kansai', disabled: true },
  { label: '홋카이도', value: 'hokkaido', disabled: true },
  { label: '도호쿠', value: 'tohoku', disabled: true },
];

export const onsenAreaFilters: OnsenTaxonomyFilter[] = [
  { label: '유후인', value: 'yufuin', description: '오이타현 유후시' },
  { label: '벳푸', value: 'beppu', description: '오이타현 벳푸시', disabled: true },
  { label: '쿠로카와', value: 'kurokawa', description: '구마모토현', disabled: true },
  { label: '하코네', value: 'hakone', description: '가나가와현', disabled: true },
  { label: '노보리베츠', value: 'noboribetsu', description: '홋카이도', disabled: true },
  { label: '도쿄', value: 'tokyo', description: '도심 온천/호텔 대욕장', disabled: true },
  { label: '오사카', value: 'osaka', description: '도심 온천/당일온천', disabled: true },
];

export const travelContextFilters: OnsenTaxonomyFilter<OnsenTravelContext>[] = [
  { label: '료칸 숙박', value: 'ryokan_stay' },
  { label: '당일온천', value: 'day_trip', disabled: true },
  { label: '도심 대욕장', value: 'city_bath', disabled: true },
  { label: '호텔 대욕장', value: 'hotel_public_bath', disabled: true },
];

export const bathContextFilters: OnsenTaxonomyFilter<OnsenBathContext>[] = [
  { label: '객실탕 중심', value: 'room_bath' },
  { label: '가족탕/대절탕 있음', value: 'private_bath' },
  { label: '대욕장 중심', value: 'public_bath' },
];

export const waterCriterionFilters: OnsenTaxonomyFilter<OnsenWaterCriterion>[] = [
  { label: '직수 온천', value: 'direct_source' },
  { label: '100% 천연온천', value: 'natural_100' },
  { label: '온천수 확인', value: 'spring_confirmed' },
  { label: '부드러운 물 느낌', value: 'water_texture' },
  { label: '온도 조정 확인', value: 'temperature_adjustment' },
  { label: '겨울 주의', value: 'winter_caution' },
];

export function getFilterLabel<T extends string>(items: OnsenTaxonomyFilter<T>[], value: string) {
  return items.find((item) => item.value === value)?.label;
}

export function getFilterLabels<T extends string>(items: OnsenTaxonomyFilter<T>[], values: string[]) {
  return values
    .map((value) => getFilterLabel(items, value))
    .filter((label): label is string => Boolean(label));
}

function normalizeContextList<T extends string>(value: unknown, allowedItems: OnsenTaxonomyFilter<T>[]): T[] {
  if (!Array.isArray(value)) return [];
  const allowedValues = new Set(allowedItems.map((item) => item.value));
  return value.filter((item): item is T => typeof item === 'string' && allowedValues.has(item as T));
}

export function normalizeOnsenContexts(
  input: { travel?: unknown; bath?: unknown; water?: unknown },
  fallback: OnsenStructuredContexts
): OnsenStructuredContexts {
  const travel = normalizeContextList(input.travel, travelContextFilters);
  const bath = normalizeContextList(input.bath, bathContextFilters);
  const water = normalizeContextList(input.water, waterCriterionFilters);

  return {
    travel: travel.length > 0 ? travel : fallback.travel,
    bath: bath.length > 0 ? bath : fallback.bath,
    water: water.length > 0 ? water : fallback.water,
  };
}

export function getDefaultOnsenLocation(region: string | null | undefined, area?: string | null): OnsenLocation {
  if (region === 'yufuin' || area?.includes('유후인')) {
    return {
      country: 'JP',
      regionGroup: 'kyushu',
      regionGroupLabel: '규슈',
      prefecture: 'oita',
      prefectureLabel: '오이타현',
      city: 'yufu',
      cityLabel: '유후시',
      onsenArea: 'yufuin',
      onsenAreaLabel: '유후인',
      display: '규슈 · 오이타현 · 유후인',
    };
  }

  return {
    country: 'JP',
    regionGroup: 'kyushu',
    regionGroupLabel: '규슈',
    prefecture: 'unknown',
    prefectureLabel: area ?? region ?? '지역 확인',
    city: 'unknown',
    cityLabel: '도시 확인',
    onsenArea: region ?? 'unknown',
    onsenAreaLabel: area ?? region ?? '온천지 확인',
    display: area ?? region ?? '일본 온천',
  };
}

export function deriveOnsenContexts(candidate: Pick<OnsenCandidate, 'tags' | 'primaryBath' | 'summary' | 'waterDecision'>): OnsenStructuredContexts {
  const bath = new Set<OnsenBathContext>();
  const water = new Set<OnsenWaterCriterion>();
  const text = `${candidate.primaryBath} ${candidate.summary} ${candidate.waterDecision.springType} ${candidate.waterDecision.operation} ${candidate.waterDecision.notice ?? ''}`;

  if (candidate.tags.includes('room-bath')) bath.add('room_bath');
  if (candidate.tags.includes('private-bath')) bath.add('private_bath');
  if (candidate.tags.includes('public-bath')) bath.add('public_bath');

  if (/직수/.test(text)) water.add('direct_source');
  if (/100%|천연온천/.test(text)) water.add('natural_100');
  if (/온천수|원천|온천/.test(text)) water.add('spring_confirmed');
  if (candidate.tags.includes('water-texture') || /부드럽|매끈|수질|피부감|물 느낌/.test(text)) water.add('water_texture');
  if (/물을 섞어|온도 조정|가온|가수/.test(text)) water.add('temperature_adjustment');
  if (candidate.tags.includes('winter-caution') || /겨울|추위|춥/.test(text)) water.add('winter_caution');

  return {
    travel: ['ryokan_stay'],
    bath: [...bath],
    water: [...water],
  };
}

export function enrichOnsenCandidate(candidate: OnsenCandidate): OnsenCandidate {
  return {
    ...candidate,
    location: candidate.location ?? getDefaultOnsenLocation(candidate.region, candidate.area),
    contexts: candidate.contexts ?? deriveOnsenContexts(candidate),
  };
}

export function splitLegacySignals(signals: string[]) {
  const bath: OnsenBathContext[] = [];
  const water: OnsenWaterCriterion[] = [];

  for (const signal of signals) {
    if (signal === 'room-bath') bath.push('room_bath');
    if (signal === 'private-bath') bath.push('private_bath');
    if (signal === 'public-bath') bath.push('public_bath');
    if (signal === 'water-texture') water.push('water_texture');
    if (signal === 'winter-caution') water.push('winter_caution');
  }

  return { bath, water };
}
