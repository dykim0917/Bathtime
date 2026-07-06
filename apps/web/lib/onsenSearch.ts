import type { OnsenCandidate } from './onsenCatalog';
import { onsenAreaFilters } from './onsenTaxonomy';

export type OnsenSearchSuggestion = {
  label: string;
  href: string;
  description?: string;
  kind: 'region' | 'stay' | 'keyword';
};

export const recommendedOnsenPlaces: OnsenSearchSuggestion[] = [
  { label: '유후인, 일본', description: '객실탕과 조용한 료칸부터 확인', href: '/onsen/results?area=yufuin', kind: 'region' },
  { label: '벳푸, 일본', description: '당일온천과 대욕장 후보 준비 중', href: '/onsen/results?query=벳푸', kind: 'region' },
  { label: '하코네, 일본', description: '도쿄 근교 온천 여행 후보', href: '/onsen/results?query=하코네', kind: 'region' },
  { label: '서울 근교 온천', description: '국내 온천 후보 준비 중', href: '/onsen/results?query=서울 근교 온천', kind: 'region' },
];

export const popularOnsenSearches = [
  { label: '유후인 객실탕', href: '/onsen/results?area=yufuin&bath=room_bath' },
  { label: '유후인 가족탕', href: '/onsen/results?area=yufuin&bath=private_bath' },
  { label: '직수 온천 료칸', href: '/onsen/results?travel=ryokan_stay&water=direct_source' },
  { label: '온천수 확인', href: '/onsen/results?water=spring_confirmed' },
];

export function buildOnsenSearchSuggestions(candidates: OnsenCandidate[]): OnsenSearchSuggestion[] {
  const areaSuggestions: OnsenSearchSuggestion[] = onsenAreaFilters.map((area) => ({
    label: `${area.label}, 일본`,
    description: area.description ?? '일본 온천 지역',
    href: area.disabled ? `/onsen/results?query=${encodeURIComponent(area.label)}` : `/onsen/results?area=${area.value}`,
    kind: 'region',
  }));

  const staySuggestions: OnsenSearchSuggestion[] = candidates.slice(0, 40).map((candidate) => ({
    label: candidate.name,
    description: candidate.location?.display ?? candidate.area ?? '일본 온천 숙소',
    href: `/onsen/${candidate.slug}`,
    kind: 'stay',
  }));

  return [...areaSuggestions, ...staySuggestions, ...recommendedOnsenPlaces];
}
