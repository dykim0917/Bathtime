import type { OnsenCandidate } from './onsenCatalog';
import { onsenAreaFilters } from './onsenTaxonomy';

export type OnsenSearchSuggestion = {
  label: string;
  href: string;
  description?: string;
  kind: 'region' | 'stay' | 'keyword';
};

export const recommendedOnsenPlaces: OnsenSearchSuggestion[] = [
  { label: '유후인, 일본', description: '객실 내 프라이빗탕과 조용한 료칸부터 확인', href: '/onsen/results?area=yufuin', kind: 'region' },
  { label: '벳푸, 일본', description: '대욕장과 객실 온천을 함께 확인', href: '/onsen/results?area=beppu', kind: 'region' },
  { label: '하코네, 일본', description: '도쿄 근교 료칸 온천 후보', href: '/onsen/results?area=hakone', kind: 'region' },
  { label: '도야호, 일본', description: '홋카이도 호수 전망 온천 후보', href: '/onsen/results?area=toyako', kind: 'region' },
];

export const popularOnsenSearches = [
  { label: '유후인 객실 내 프라이빗탕', href: '/onsen/results?area=yufuin&bath=room_bath' },
  { label: '유후인 대절탕', href: '/onsen/results?area=yufuin&bath=private_bath' },
  { label: '원천 100% 직수 료칸', href: '/onsen/results?travel=ryokan_stay&water=direct_source' },
  { label: '객실 내 프라이빗탕', href: '/onsen/results?bath=room_bath' },
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
