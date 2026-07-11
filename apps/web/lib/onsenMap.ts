import type { OnsenCandidate } from './onsenCatalog';

export type OnsenMapPoint = {
  id: string;
  label: string;
  longitude: number;
  latitude: number;
  count: number;
  targetId: string;
};

const areaCoordinates: Record<string, readonly [longitude: number, latitude: number]> = {
  yufuin: [131.354, 33.264],
  yunohira: [131.326, 33.194],
  beppu: [131.491, 33.284],
  kurokawa: [131.142, 33.076],
  ibusuki: [130.634, 31.252],
  ureshino: [129.985, 33.096],
  takeo: [130.019, 33.193],
  kirishima: [130.834, 31.889],
  unzen: [130.262, 32.743],
  awara: [136.226, 36.223],
  bessho: [138.158, 36.352],
  fukuoka: [130.4, 33.59],
  kumamoto: [130.71, 32.8],
  hakone: [139.107, 35.232],
  yugawara: [139.109, 35.147],
  isawa: [138.64, 35.65],
  kawaguchiko: [138.77, 35.5],
  fujiyoshida: [138.8, 35.49],
  matsumoto: [137.97, 36.24],
  gero: [137.24, 35.81],
  'echigo-yuzawa': [138.81, 36.94],
  yamanaka: [136.37, 36.25],
  katayamazu: [136.369, 36.345],
  yamashiro: [136.36, 36.29],
  wakura: [136.92, 37.09],
  atami: [139.08, 35.1],
  'ito-izu': [139.1, 34.97],
  akazawa: [139.07, 34.86],
  kawana: [139.13, 34.95],
  hokkawa: [139.07, 34.82],
  atagawa: [139.07, 34.81],
  'izu-kogen': [139.1, 34.88],
  'izu-nagaoka': [138.93, 35.03],
  akiu: [140.66, 38.23],
  'miyagi-zao': [140.58, 38.12],
  nyuto: [140.8, 39.81],
  ginzan: [140.53, 38.57],
  'zao-yamagata': [140.4, 38.17],
  kaminoyama: [140.28, 38.15],
  senami: [139.44, 38.22],
  tsukioka: [139.31, 37.88],
  sukayu: [140.85, 40.65],
  asamushi: [140.86, 40.89],
  hanamaki: [141.07, 39.45],
  tsunagi: [141.01, 39.69],
  higashiyama: [139.96, 37.48],
  iizaka: [140.45, 37.83],
  jozankei: [141.17, 42.97],
  noboribetsu: [141.14, 42.49],
  'yunokawa-hakodate': [140.78, 41.78],
  'hokkaido-toyako': [140.82, 42.57],
  tokachigawa: [143.3, 42.93],
  arima: [135.25, 34.8],
  kinosaki: [134.81, 35.63],
  kinugawa: [139.71, 36.82],
  nozawa: [138.44, 36.92],
  shirahone: [137.63, 36.15],
  unazuki: [137.58, 36.82],
  'yudanaka-shibu': [138.43, 36.73],
  shirahama: [135.34, 33.68],
  toba: [136.84, 34.48],
  kaike: [133.35, 35.45],
  misasa: [133.89, 35.41],
  tamatsukuri: [133.01, 35.42],
  dogo: [132.79, 33.85],
  tokyo: [139.76, 35.68],
  yokohama: [139.64, 35.44],
  shonan: [139.4, 35.33],
  saitama: [139.65, 35.86],
  kumagaya: [139.39, 36.15],
  soka: [139.8, 35.83],
  sugito: [139.73, 36.03],
  nagareyama: [139.9, 35.86],
  'narita-airport': [140.39, 35.77],
  kusatsu: [138.6, 36.62],
  ikaho: [138.92, 36.5],
  minakami: [138.97, 36.78],
  shima: [138.77, 36.69],
  nasu: [140, 37.09],
  'nikko-yumoto': [139.42, 36.81],
  yunishigawa: [139.58, 36.96],
  osaka: [135.5, 34.69],
};

const regionCoordinates: Record<string, readonly [longitude: number, latitude: number]> = {
  kyushu: [130.75, 32.55],
  kanto: [139.45, 35.8],
  kansai: [135.4, 34.75],
  hokkaido: [142.6, 43.25],
  tohoku: [140.75, 39.15],
  chubu: [137.75, 35.8],
  chugoku_shikoku: [133.5, 34.25],
};

export function buildOnsenMapPoints(candidates: OnsenCandidate[]) {
  const points = new Map<string, OnsenMapPoint>();

  for (const candidate of candidates) {
    const area = candidate.location?.onsenArea ?? candidate.region;
    const region = candidate.location?.regionGroup ?? 'kanto';
    const coordinates = areaCoordinates[area] ?? regionCoordinates[region];
    if (!coordinates) continue;

    const key = area || `region-${region}`;
    const existing = points.get(key);
    if (existing) {
      existing.count += 1;
      continue;
    }

    points.set(key, {
      id: key,
      label: candidate.location?.onsenAreaLabel ?? candidate.location?.regionGroupLabel ?? candidate.area,
      longitude: coordinates[0],
      latitude: coordinates[1],
      count: 1,
      targetId: `onsen-result-${candidate.slug}`,
    });
  }

  return [...points.values()];
}
