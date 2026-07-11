import { getOnsenEntityType, type OnsenCandidate } from './onsenCatalog';
import { getOnsenRegionImage } from './onsenRegionImages';
import { onsenAreaFilters } from './onsenTaxonomy';

export type OnsenSearchSuggestion = {
  label: string;
  href: string;
  description?: string;
  imageUrl?: string;
  kind: 'region' | 'stay' | 'facility' | 'keyword';
};

export const recommendedOnsenPlaces: OnsenSearchSuggestion[] = [
  { label: '유후인, 일본', description: '객실 내 프라이빗탕과 조용한 료칸부터 확인', href: '/onsen/results?area=yufuin', imageUrl: getOnsenRegionImage('yufuin'), kind: 'region' },
  { label: '벳푸, 일본', description: '대욕장과 객실 온천을 함께 확인', href: '/onsen/results?area=beppu', imageUrl: getOnsenRegionImage('beppu'), kind: 'region' },
  { label: '하코네, 일본', description: '도쿄 근교 료칸 온천 후보', href: '/onsen/results?area=hakone', imageUrl: getOnsenRegionImage('hakone'), kind: 'region' },
  { label: '도야호, 일본', description: '홋카이도 호수 전망 온천 후보', href: '/onsen/results?area=hokkaido-toyako', imageUrl: getOnsenRegionImage('hokkaido-toyako'), kind: 'region' },
];

export const popularOnsenSearches = [
  { label: '유후인 객실 내 프라이빗탕', href: '/onsen/results?area=yufuin&bath=room_bath' },
  { label: '도쿄 당일온천', href: '/onsen/results?area=tokyo&type=facility' },
  { label: '노천탕 있는 시설', href: '/onsen/results?type=facility&feature=open_air_bath' },
  { label: '직수 숙소', href: '/onsen/results?travel=ryokan_stay&water=kakenagashi' },
];

export function buildOnsenSearchSuggestions(candidates: OnsenCandidate[]): OnsenSearchSuggestion[] {
  const areaSuggestions: OnsenSearchSuggestion[] = onsenAreaFilters.map((area) => ({
    label: `${area.label}, 일본`,
    description: area.description ?? '일본 온천 지역',
    href: area.disabled ? `/onsen/results?query=${encodeURIComponent(area.label)}` : `/onsen/results?area=${area.value}`,
    kind: 'region',
  }));

  const staySuggestions: OnsenSearchSuggestion[] = candidates.map((candidate) => ({
    label: candidate.name,
    description: `${candidate.location?.display ?? candidate.area ?? '일본 온천'} · ${getOnsenEntityType(candidate) === 'facility' ? '당일온천 시설' : '온천 숙소'}`,
    href: `/onsen/${candidate.slug}`,
    kind: getOnsenEntityType(candidate) === 'facility' ? 'facility' : 'stay',
  }));

  return [...areaSuggestions, ...staySuggestions, ...recommendedOnsenPlaces];
}
