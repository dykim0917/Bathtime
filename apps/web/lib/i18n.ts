import { getOnsenEntityType, type OnsenCandidate } from './onsenCatalog';

export type BathtimeLocale = 'ko' | 'en';

const englishAreaLabels: Record<string, string> = {
  arima: 'Arima',
  atami: 'Atami',
  beppu: 'Beppu',
  gero: 'Gero',
  hakone: 'Hakone',
  ibusuki: 'Ibusuki',
  ikaho: 'Ikaho',
  izu: 'Izu',
  kinugawa: 'Kinugawa',
  kirishima: 'Kirishima',
  kurokawa: 'Kurokawa',
  kusatsu: 'Kusatsu',
  noboribetsu: 'Noboribetsu',
  nozawa: 'Nozawa Onsen',
  nozawaonsen: 'Nozawa Onsen',
  shirahama: 'Shirahama',
  tokyo: 'Tokyo',
  toyako: 'Lake Toya',
  unzen: 'Unzen',
  ureshino: 'Ureshino',
  yufuin: 'Yufuin',
  yugawara: 'Yugawara',
  yunohira: 'Yunohira',
};

const englishRegionLabels: Record<string, string> = {
  chubu: 'Chubu',
  chugoku_shikoku: 'Chugoku & Shikoku',
  hokkaido: 'Hokkaido',
  kansai: 'Kansai',
  kanto: 'Kanto',
  kyushu: 'Kyushu',
  tohoku: 'Tohoku',
};

function titleCaseCode(value: string) {
  return value
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function isEnglishLocalePath(pathname: string) {
  return pathname === '/en' || pathname.startsWith('/en/');
}

export function stripLocalePath(pathname: string) {
  if (!isEnglishLocalePath(pathname)) return pathname;
  const stripped = pathname.slice(3);
  return stripped || '/';
}

export function localizedPath(pathname: string, locale: BathtimeLocale) {
  const basePath = stripLocalePath(pathname);
  if (locale === 'ko') return basePath;
  return basePath === '/' ? '/en' : `/en${basePath}`;
}

export function localizeHref(href: string, locale: BathtimeLocale) {
  if (locale === 'ko' || !href.startsWith('/') || href.startsWith('//')) return href;
  const [pathAndQuery, hash = ''] = href.split('#', 2);
  const queryIndex = pathAndQuery.indexOf('?');
  const pathname = queryIndex >= 0 ? pathAndQuery.slice(0, queryIndex) : pathAndQuery;
  const query = queryIndex >= 0 ? pathAndQuery.slice(queryIndex) : '';
  const localized = localizedPath(pathname, locale);
  return `${localized}${query}${hash ? `#${hash}` : ''}`;
}

export function getEnglishAreaLabel(value?: string | null) {
  if (!value) return 'Japan';
  return englishAreaLabels[value] ?? titleCaseCode(value);
}

export function getEnglishRegionLabel(value?: string | null) {
  if (!value) return 'Japan';
  return englishRegionLabels[value] ?? titleCaseCode(value);
}

export function getLocalizedCandidateName(candidate: Pick<OnsenCandidate, 'enName' | 'jaName' | 'name' | 'slug'>, locale: BathtimeLocale) {
  if (locale === 'ko') return candidate.name;
  const verifiedEnglishName = candidate.enName?.trim();
  const hasJapaneseOrKoreanScript = (value: string) => /[가-힣ぁ-んァ-ヶ一-龯]/.test(value);
  if (verifiedEnglishName && !hasJapaneseOrKoreanScript(verifiedEnglishName)) return verifiedEnglishName;
  if (candidate.jaName && /[A-Za-z]/.test(candidate.jaName) && !hasJapaneseOrKoreanScript(candidate.jaName)) return candidate.jaName;
  if (/[A-Za-z]/.test(candidate.name) && !hasJapaneseOrKoreanScript(candidate.name)) return candidate.name;
  return titleCaseCode(candidate.slug);
}

export function getLocalizedCandidateLocation(candidate: Pick<OnsenCandidate, 'area' | 'location'>, locale: BathtimeLocale) {
  if (locale === 'ko') return candidate.location?.display ?? candidate.area;
  const area = getEnglishAreaLabel(candidate.location?.onsenArea);
  const region = getEnglishRegionLabel(candidate.location?.regionGroup);
  return area === region ? `${area}, Japan` : `${area} · ${region}, Japan`;
}

export function getEnglishBathSummary(candidate: OnsenCandidate) {
  const contexts = candidate.contexts?.bath ?? [];
  const labels = [
    contexts.includes('room_bath') ? 'In-room private onsen' : null,
    contexts.includes('private_bath') ? 'Reservable private bath' : null,
    contexts.includes('public_bath') ? 'Public bath' : null,
  ].filter((value): value is string => Boolean(value));
  return labels.length > 0 ? labels.join(' · ') : 'Bath setup being verified';
}

export function getEnglishWaterMethod(candidate: OnsenCandidate) {
  if (candidate.waterProfile?.canonicalMethod === 'kakenagashi_pure') return 'Pure kakenagashi';
  if (candidate.waterProfile?.canonicalMethod === 'kakenagashi') return 'Kakenagashi';
  if (candidate.waterProfile?.canonicalMethod === 'junkan') return 'Recirculated';
  return 'Method not yet verified';
}

export function getEnglishCandidateSummary(candidate: OnsenCandidate) {
  if (getOnsenEntityType(candidate) === 'facility') {
    return 'A day-use onsen to compare by its confirmed bath setup, admission details, and opening hours.';
  }
  if (candidate.contexts?.bath.includes('room_bath')) {
    return 'An onsen stay to compare when private bathing in your room is part of the trip.';
  }
  if (candidate.contexts?.bath.includes('private_bath')) {
    return 'An onsen stay with a private bath option worth checking before you book.';
  }
  return 'An onsen stay organized around the bathing experience, not only the room.';
}

export function getEnglishEntityLabel(candidate: OnsenCandidate) {
  return getOnsenEntityType(candidate) === 'facility' ? 'Day-use onsen' : 'Onsen stay';
}
