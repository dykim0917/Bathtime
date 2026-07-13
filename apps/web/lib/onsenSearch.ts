import { getOnsenEntityType, type OnsenCandidate } from './onsenCatalog';
import {
  getEnglishAreaLabel,
  getLocalizedCandidateLocation,
  getLocalizedCandidateName,
  localizeHref,
  type BathtimeLocale,
} from './i18n';
import { getOnsenRegionImage } from './onsenRegionImages';
import { onsenAreaFilters } from './onsenTaxonomy';

export type OnsenSearchSuggestion = {
  label: string;
  href: string;
  description?: string;
  imageUrl?: string;
  keywords?: string[];
  kind: 'region' | 'stay' | 'facility' | 'keyword';
};

const recommendedOnsenPlacesKo: OnsenSearchSuggestion[] = [
  { label: '유후인, 일본', description: '객실 내 프라이빗탕과 조용한 료칸부터 확인', href: '/onsen/results?area=yufuin', imageUrl: getOnsenRegionImage('yufuin'), kind: 'region' },
  { label: '벳푸, 일본', description: '대욕장과 객실 온천을 함께 확인', href: '/onsen/results?area=beppu', imageUrl: getOnsenRegionImage('beppu'), kind: 'region' },
  { label: '하코네, 일본', description: '도쿄 근교 료칸 온천 후보', href: '/onsen/results?area=hakone', imageUrl: getOnsenRegionImage('hakone'), kind: 'region' },
  { label: '도야호, 일본', description: '홋카이도 호수 전망 온천 후보', href: '/onsen/results?area=hokkaido-toyako', imageUrl: getOnsenRegionImage('hokkaido-toyako'), kind: 'region' },
];

const recommendedOnsenPlacesEn: OnsenSearchSuggestion[] = [
  { label: 'Yufuin, Japan', description: 'Quiet ryokan and in-room private onsen', href: '/en/onsen/results?area=yufuin', imageUrl: getOnsenRegionImage('yufuin'), kind: 'region' },
  { label: 'Beppu, Japan', description: 'Public baths, private baths, and day-use onsen', href: '/en/onsen/results?area=beppu', imageUrl: getOnsenRegionImage('beppu'), kind: 'region' },
  { label: 'Hakone, Japan', description: 'Onsen stays within reach of Tokyo', href: '/en/onsen/results?area=hakone', imageUrl: getOnsenRegionImage('hakone'), kind: 'region' },
  { label: 'Lake Toya, Japan', description: 'Lake-view onsen in Hokkaido', href: '/en/onsen/results?area=hokkaido-toyako', imageUrl: getOnsenRegionImage('hokkaido-toyako'), kind: 'region' },
];

const popularOnsenSearchesKo = [
  { label: '유후인 객실 내 프라이빗탕', href: '/onsen/results?area=yufuin&bath=room_bath' },
  { label: '도쿄 당일온천', href: '/onsen/results?area=tokyo&type=facility' },
  { label: '노천탕 있는 시설', href: '/onsen/results?type=facility&feature=open_air_bath' },
  { label: '직수 숙소', href: '/onsen/results?travel=ryokan_stay&water=kakenagashi' },
];

const popularOnsenSearchesEn = [
  { label: 'In-room private onsen in Yufuin', href: '/en/onsen/results?area=yufuin&bath=room_bath' },
  { label: 'Day-use onsen in Tokyo', href: '/en/onsen/results?area=tokyo&type=facility' },
  { label: 'Open-air day-use baths', href: '/en/onsen/results?type=facility&feature=open_air_bath' },
  { label: 'Kakenagashi stays', href: '/en/onsen/results?travel=ryokan_stay&water=kakenagashi' },
];

export const recommendedOnsenPlaces = recommendedOnsenPlacesKo;
export const popularOnsenSearches = popularOnsenSearchesKo;

export function getRecommendedOnsenPlaces(locale: BathtimeLocale) {
  return locale === 'en' ? recommendedOnsenPlacesEn : recommendedOnsenPlacesKo;
}

export function getPopularOnsenSearches(locale: BathtimeLocale) {
  return locale === 'en' ? popularOnsenSearchesEn : popularOnsenSearchesKo;
}

export function buildOnsenSearchSuggestions(candidates: OnsenCandidate[], locale: BathtimeLocale = 'ko'): OnsenSearchSuggestion[] {
  const areaSuggestions: OnsenSearchSuggestion[] = onsenAreaFilters.map((area) => ({
    label: locale === 'en' ? `${getEnglishAreaLabel(area.value)}, Japan` : `${area.label}, 일본`,
    description: locale === 'en' ? 'Onsen area in Japan' : area.description ?? '일본 온천 지역',
    href: localizeHref(area.disabled ? `/onsen/results?query=${encodeURIComponent(area.label)}` : `/onsen/results?area=${area.value}`, locale),
    keywords: [area.label, area.value],
    kind: 'region',
  }));

  const staySuggestions: OnsenSearchSuggestion[] = candidates.map((candidate) => ({
    label: getLocalizedCandidateName(candidate, locale),
    description: locale === 'en'
      ? `${getLocalizedCandidateLocation(candidate, locale)} · ${getOnsenEntityType(candidate) === 'facility' ? 'Day-use onsen' : 'Onsen stay'}`
      : `${candidate.location?.display ?? candidate.area ?? '일본 온천'} · ${getOnsenEntityType(candidate) === 'facility' ? '당일온천 시설' : '온천 숙소'}`,
    href: localizeHref(`/onsen/${candidate.slug}`, locale),
    keywords: [candidate.name, candidate.jaName, candidate.enName ?? '', candidate.slug],
    kind: getOnsenEntityType(candidate) === 'facility' ? 'facility' : 'stay',
  }));

  return [...areaSuggestions, ...staySuggestions, ...getRecommendedOnsenPlaces(locale)];
}
