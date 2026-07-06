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

const regionGroupLabelByValue: Record<OnsenRegionGroup, string> = {
  kyushu: '규슈',
  kanto: '간토',
  kansai: '간사이',
  hokkaido: '홋카이도',
  tohoku: '도호쿠',
  chubu: '주부',
  chugoku_shikoku: '주고쿠/시코쿠',
};

const prefectureLabelByValue: Record<string, string> = {
  oita: '오이타현',
  kanagawa: '가나가와현',
  yamanashi: '야마나시현',
  hokkaido: '홋카이도',
};

const cityLabelByValue: Record<string, string> = {
  yufu: '유후시',
  hakone: '하코네마치',
  yugawara: '유가와라마치',
  fuefuki: '후에후키시',
  fujikawaguchiko: '후지카와구치코마치',
  fujiyoshida: '후지요시다시',
  sapporo: '삿포로시',
  noboribetsu: '노보리베츠시',
  hakodate: '하코다테시',
  toyako: '도야코초',
  otofuke: '오토후케초',
};

const onsenAreaMetaByValue: Record<string, Omit<OnsenLocation, 'country' | 'display'>> = {
  yufuin: {
    regionGroup: 'kyushu',
    regionGroupLabel: '규슈',
    prefecture: 'oita',
    prefectureLabel: '오이타현',
    city: 'yufu',
    cityLabel: '유후시',
    onsenArea: 'yufuin',
    onsenAreaLabel: '유후인',
  },
  hakone: {
    regionGroup: 'kanto',
    regionGroupLabel: '간토',
    prefecture: 'kanagawa',
    prefectureLabel: '가나가와현',
    city: 'hakone',
    cityLabel: '하코네마치',
    onsenArea: 'hakone',
    onsenAreaLabel: '하코네',
  },
  yugawara: {
    regionGroup: 'kanto',
    regionGroupLabel: '간토',
    prefecture: 'kanagawa',
    prefectureLabel: '가나가와현',
    city: 'yugawara',
    cityLabel: '유가와라마치',
    onsenArea: 'yugawara',
    onsenAreaLabel: '유가와라',
  },
  isawa: {
    regionGroup: 'kanto',
    regionGroupLabel: '간토',
    prefecture: 'yamanashi',
    prefectureLabel: '야마나시현',
    city: 'fuefuki',
    cityLabel: '후에후키시',
    onsenArea: 'isawa',
    onsenAreaLabel: '이사와',
  },
  kawaguchiko: {
    regionGroup: 'kanto',
    regionGroupLabel: '간토',
    prefecture: 'yamanashi',
    prefectureLabel: '야마나시현',
    city: 'fujikawaguchiko',
    cityLabel: '후지카와구치코마치',
    onsenArea: 'kawaguchiko',
    onsenAreaLabel: '가와구치코',
  },
  fujiyoshida: {
    regionGroup: 'kanto',
    regionGroupLabel: '간토',
    prefecture: 'yamanashi',
    prefectureLabel: '야마나시현',
    city: 'fujiyoshida',
    cityLabel: '후지요시다시',
    onsenArea: 'fujiyoshida',
    onsenAreaLabel: '후지요시다',
  },
  jozankei: {
    regionGroup: 'hokkaido',
    regionGroupLabel: '홋카이도',
    prefecture: 'hokkaido',
    prefectureLabel: '홋카이도',
    city: 'sapporo',
    cityLabel: '삿포로시',
    onsenArea: 'jozankei',
    onsenAreaLabel: '조잔케이',
  },
  noboribetsu: {
    regionGroup: 'hokkaido',
    regionGroupLabel: '홋카이도',
    prefecture: 'hokkaido',
    prefectureLabel: '홋카이도',
    city: 'noboribetsu',
    cityLabel: '노보리베츠시',
    onsenArea: 'noboribetsu',
    onsenAreaLabel: '노보리베츠',
  },
  'yunokawa-hakodate': {
    regionGroup: 'hokkaido',
    regionGroupLabel: '홋카이도',
    prefecture: 'hokkaido',
    prefectureLabel: '홋카이도',
    city: 'hakodate',
    cityLabel: '하코다테시',
    onsenArea: 'yunokawa-hakodate',
    onsenAreaLabel: '유노카와',
  },
  'hokkaido-toyako': {
    regionGroup: 'hokkaido',
    regionGroupLabel: '홋카이도',
    prefecture: 'hokkaido',
    prefectureLabel: '홋카이도',
    city: 'toyako',
    cityLabel: '도야코초',
    onsenArea: 'hokkaido-toyako',
    onsenAreaLabel: '도야코',
  },
  tokachigawa: {
    regionGroup: 'hokkaido',
    regionGroupLabel: '홋카이도',
    prefecture: 'hokkaido',
    prefectureLabel: '홋카이도',
    city: 'otofuke',
    cityLabel: '오토후케초',
    onsenArea: 'tokachigawa',
    onsenAreaLabel: '도카치가와',
  },
};

export const regionGroupFilters: OnsenTaxonomyFilter<OnsenRegionGroup>[] = [
  { label: '규슈', value: 'kyushu' },
  { label: '간토', value: 'kanto' },
  { label: '홋카이도', value: 'hokkaido' },
  { label: '간사이', value: 'kansai', disabled: true },
  { label: '도호쿠', value: 'tohoku', disabled: true },
];

export const onsenAreaFilters: OnsenTaxonomyFilter[] = [
  { label: '유후인', value: 'yufuin', description: '오이타현 유후시' },
  { label: '하코네', value: 'hakone', description: '가나가와현' },
  { label: '유가와라', value: 'yugawara', description: '가나가와현' },
  { label: '이사와', value: 'isawa', description: '야마나시현' },
  { label: '가와구치코', value: 'kawaguchiko', description: '야마나시현' },
  { label: '후지요시다', value: 'fujiyoshida', description: '야마나시현' },
  { label: '조잔케이', value: 'jozankei', description: '홋카이도 삿포로' },
  { label: '노보리베츠', value: 'noboribetsu', description: '홋카이도' },
  { label: '유노카와', value: 'yunokawa-hakodate', description: '홋카이도 하코다테' },
  { label: '도야코', value: 'hokkaido-toyako', description: '홋카이도' },
  { label: '도카치가와', value: 'tokachigawa', description: '홋카이도' },
  { label: '벳푸', value: 'beppu', description: '오이타현 벳푸시', disabled: true },
  { label: '쿠로카와', value: 'kurokawa', description: '구마모토현', disabled: true },
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

export function getOnsenRegionGroupLabel(value: string | null | undefined) {
  return regionGroupLabelByValue[value as OnsenRegionGroup] ?? value ?? '지역 확인';
}

export function getOnsenPrefectureLabel(value: string | null | undefined) {
  return prefectureLabelByValue[value ?? ''] ?? value ?? '지역 확인';
}

export function getOnsenCityLabel(value: string | null | undefined) {
  return cityLabelByValue[value ?? ''] ?? value ?? '도시 확인';
}

export function getOnsenAreaLabel(value: string | null | undefined) {
  return onsenAreaMetaByValue[value ?? '']?.onsenAreaLabel ?? value ?? '온천지 확인';
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
  const meta = onsenAreaMetaByValue[region ?? ''];
  if (meta) {
    return {
      country: 'JP',
      ...meta,
      display: `${meta.regionGroupLabel} · ${meta.prefectureLabel} · ${meta.onsenAreaLabel}`,
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
