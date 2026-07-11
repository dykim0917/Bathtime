export const onsenRegionImageByArea: Readonly<Record<string, string>> = {
  yufuin: '/images/onsen/regions/yufuin.jpg',
  beppu: '/images/onsen/regions/beppu.jpg',
  kurokawa: '/images/onsen/regions/kurokawa.jpg',
  ibusuki: '/images/onsen/regions/ibusuki.jpg',
  ureshino: '/images/onsen/regions/ureshino.jpg',
  takeo: '/images/onsen/regions/takeo.jpg',
  kirishima: '/images/onsen/regions/kirishima.jpg',
  hakone: '/images/onsen/regions/hakone.jpg',
  yugawara: '/images/onsen/regions/yugawara.jpg',
  isawa: '/images/onsen/regions/isawa.jpg',
  kawaguchiko: '/images/onsen/regions/kawaguchiko.jpg',
  fujiyoshida: '/images/onsen/regions/fujiyoshida.jpg',
  jozankei: '/images/onsen/regions/jozankei.jpg',
  noboribetsu: '/images/onsen/regions/noboribetsu.jpg',
  'yunokawa-hakodate': '/images/onsen/regions/yunokawa-hakodate.jpg',
  'hokkaido-toyako': '/images/onsen/regions/hokkaido-toyako.jpg',
  tokachigawa: '/images/onsen/regions/tokachigawa.jpg',
  atami: '/images/onsen/regions/atami.jpg',
  gero: '/images/onsen/regions/gero.jpg',
  tokyo: '/images/onsen/regions/tokyo.jpg',
  osaka: '/images/onsen/regions/osaka.jpg',
};

export function getOnsenRegionImage(area: string) {
  return onsenRegionImageByArea[area] ?? onsenRegionImageByArea.yufuin;
}
