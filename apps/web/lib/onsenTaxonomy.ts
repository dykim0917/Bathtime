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
  kumamoto: '구마모토현',
  kagoshima: '가고시마현',
  saga: '사가현',
  nagasaki: '나가사키현',
  kanagawa: '가나가와현',
  yamanashi: '야마나시현',
  hokkaido: '홋카이도',
  hyogo: '효고현',
  wakayama: '와카야마현',
  mie: '미에현',
  nagano: '나가노현',
  gifu: '기후현',
  niigata: '니가타현',
  ishikawa: '이시카와현',
  shizuoka: '시즈오카현',
  akita: '아키타현',
  aomori: '아오모리현',
  fukushima: '후쿠시마현',
  iwate: '이와테현',
  miyagi: '미야기현',
  yamagata: '야마가타현',
  tottori: '돗토리현',
  shimane: '시마네현',
  ehime: '에히메현',
  okayama: '오카야마현',
  yamaguchi: '야마구치현',
};

const cityLabelByValue: Record<string, string> = {
  yufu: '유후시',
  beppu: '벳푸시',
  minamioguni: '미나미오구니마치',
  ibusuki: '이부스키시',
  ureshino: '우레시노시',
  takeo: '다케오시',
  kirishima: '기리시마시',
  unzen: '운젠시',
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
  kobe: '고베시',
  toyooka: '도요오카시',
  shirahama: '시라하마초',
  toba: '도바시',
  matsumoto: '마쓰모토시',
  gero: '게로시',
  yuzawa: '유자와마치',
  kaga: '가가시',
  atami: '아타미시',
  ito: '이토시',
  semboku: '센보쿠시',
  aomori: '아오모리시',
  aizuwakamatsu: '아이즈와카마쓰시',
  fukushima: '후쿠시마시',
  hanamaki: '하나마키시',
  morioka: '모리오카시',
  sendai: '센다이시',
  zao: '자오마치',
  kaminoyama: '가미노야마시',
  obanazawa: '오바나자와시',
  yamagata: '야마가타시',
  yonago: '요나고시',
  misasa: '미사사초',
  matsue: '마쓰에시',
  matsuyama: '마쓰야마시',
  maniwa: '마니와시',
  yamaguchi: '야마구치시',
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
  yunohira: {
    regionGroup: 'kyushu',
    regionGroupLabel: '규슈',
    prefecture: 'oita',
    prefectureLabel: '오이타현',
    city: 'yufu',
    cityLabel: '유후시',
    onsenArea: 'yunohira',
    onsenAreaLabel: '유노히라',
  },
  beppu: {
    regionGroup: 'kyushu',
    regionGroupLabel: '규슈',
    prefecture: 'oita',
    prefectureLabel: '오이타현',
    city: 'beppu',
    cityLabel: '벳푸시',
    onsenArea: 'beppu',
    onsenAreaLabel: '벳푸',
  },
  kurokawa: {
    regionGroup: 'kyushu',
    regionGroupLabel: '규슈',
    prefecture: 'kumamoto',
    prefectureLabel: '구마모토현',
    city: 'minamioguni',
    cityLabel: '미나미오구니마치',
    onsenArea: 'kurokawa',
    onsenAreaLabel: '구로카와',
  },
  ibusuki: {
    regionGroup: 'kyushu',
    regionGroupLabel: '규슈',
    prefecture: 'kagoshima',
    prefectureLabel: '가고시마현',
    city: 'ibusuki',
    cityLabel: '이부스키시',
    onsenArea: 'ibusuki',
    onsenAreaLabel: '이부스키',
  },
  ureshino: {
    regionGroup: 'kyushu',
    regionGroupLabel: '규슈',
    prefecture: 'saga',
    prefectureLabel: '사가현',
    city: 'ureshino',
    cityLabel: '우레시노시',
    onsenArea: 'ureshino',
    onsenAreaLabel: '우레시노',
  },
  takeo: {
    regionGroup: 'kyushu',
    regionGroupLabel: '규슈',
    prefecture: 'saga',
    prefectureLabel: '사가현',
    city: 'takeo',
    cityLabel: '다케오시',
    onsenArea: 'takeo',
    onsenAreaLabel: '다케오',
  },
  kirishima: {
    regionGroup: 'kyushu',
    regionGroupLabel: '규슈',
    prefecture: 'kagoshima',
    prefectureLabel: '가고시마현',
    city: 'kirishima',
    cityLabel: '기리시마시',
    onsenArea: 'kirishima',
    onsenAreaLabel: '기리시마',
  },
  unzen: {
    regionGroup: 'kyushu',
    regionGroupLabel: '규슈',
    prefecture: 'nagasaki',
    prefectureLabel: '나가사키현',
    city: 'unzen',
    cityLabel: '운젠시',
    onsenArea: 'unzen',
    onsenAreaLabel: '운젠',
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
  matsumoto: {
    regionGroup: 'chubu',
    regionGroupLabel: '주부',
    prefecture: 'nagano',
    prefectureLabel: '나가노현',
    city: 'matsumoto',
    cityLabel: '마쓰모토시',
    onsenArea: 'matsumoto',
    onsenAreaLabel: '마쓰모토',
  },
  gero: {
    regionGroup: 'chubu',
    regionGroupLabel: '주부',
    prefecture: 'gifu',
    prefectureLabel: '기후현',
    city: 'gero',
    cityLabel: '게로시',
    onsenArea: 'gero',
    onsenAreaLabel: '게로',
  },
  'echigo-yuzawa': {
    regionGroup: 'chubu',
    regionGroupLabel: '주부',
    prefecture: 'niigata',
    prefectureLabel: '니가타현',
    city: 'yuzawa',
    cityLabel: '유자와마치',
    onsenArea: 'echigo-yuzawa',
    onsenAreaLabel: '에치고유자와',
  },
  yamanaka: {
    regionGroup: 'chubu',
    regionGroupLabel: '주부',
    prefecture: 'ishikawa',
    prefectureLabel: '이시카와현',
    city: 'kaga',
    cityLabel: '가가시',
    onsenArea: 'yamanaka',
    onsenAreaLabel: '야마나카',
  },
  atami: {
    regionGroup: 'chubu',
    regionGroupLabel: '주부',
    prefecture: 'shizuoka',
    prefectureLabel: '시즈오카현',
    city: 'atami',
    cityLabel: '아타미시',
    onsenArea: 'atami',
    onsenAreaLabel: '아타미',
  },
  'ito-izu': {
    regionGroup: 'chubu',
    regionGroupLabel: '주부',
    prefecture: 'shizuoka',
    prefectureLabel: '시즈오카현',
    city: 'ito',
    cityLabel: '이토시',
    onsenArea: 'ito-izu',
    onsenAreaLabel: '이토/이즈고원',
  },
  akiu: {
    regionGroup: 'tohoku',
    regionGroupLabel: '도호쿠',
    prefecture: 'miyagi',
    prefectureLabel: '미야기현',
    city: 'sendai',
    cityLabel: '센다이시',
    onsenArea: 'akiu',
    onsenAreaLabel: '아키우',
  },
  'miyagi-zao': {
    regionGroup: 'tohoku',
    regionGroupLabel: '도호쿠',
    prefecture: 'miyagi',
    prefectureLabel: '미야기현',
    city: 'zao',
    cityLabel: '자오마치',
    onsenArea: 'miyagi-zao',
    onsenAreaLabel: '미야기 자오',
  },
  nyuto: {
    regionGroup: 'tohoku',
    regionGroupLabel: '도호쿠',
    prefecture: 'akita',
    prefectureLabel: '아키타현',
    city: 'semboku',
    cityLabel: '센보쿠시',
    onsenArea: 'nyuto',
    onsenAreaLabel: '뉴토온천향',
  },
  ginzan: {
    regionGroup: 'tohoku',
    regionGroupLabel: '도호쿠',
    prefecture: 'yamagata',
    prefectureLabel: '야마가타현',
    city: 'obanazawa',
    cityLabel: '오바나자와시',
    onsenArea: 'ginzan',
    onsenAreaLabel: '긴잔온천',
  },
  'zao-yamagata': {
    regionGroup: 'tohoku',
    regionGroupLabel: '도호쿠',
    prefecture: 'yamagata',
    prefectureLabel: '야마가타현',
    city: 'yamagata',
    cityLabel: '야마가타시',
    onsenArea: 'zao-yamagata',
    onsenAreaLabel: '자오온천',
  },
  kaminoyama: {
    regionGroup: 'tohoku',
    regionGroupLabel: '도호쿠',
    prefecture: 'yamagata',
    prefectureLabel: '야마가타현',
    city: 'kaminoyama',
    cityLabel: '가미노야마시',
    onsenArea: 'kaminoyama',
    onsenAreaLabel: '가미노야마',
  },
  sukayu: {
    regionGroup: 'tohoku',
    regionGroupLabel: '도호쿠',
    prefecture: 'aomori',
    prefectureLabel: '아오모리현',
    city: 'aomori',
    cityLabel: '아오모리시',
    onsenArea: 'sukayu',
    onsenAreaLabel: '스카유',
  },
  asamushi: {
    regionGroup: 'tohoku',
    regionGroupLabel: '도호쿠',
    prefecture: 'aomori',
    prefectureLabel: '아오모리현',
    city: 'aomori',
    cityLabel: '아오모리시',
    onsenArea: 'asamushi',
    onsenAreaLabel: '아사무시',
  },
  hanamaki: {
    regionGroup: 'tohoku',
    regionGroupLabel: '도호쿠',
    prefecture: 'iwate',
    prefectureLabel: '이와테현',
    city: 'hanamaki',
    cityLabel: '하나마키시',
    onsenArea: 'hanamaki',
    onsenAreaLabel: '하나마키',
  },
  tsunagi: {
    regionGroup: 'tohoku',
    regionGroupLabel: '도호쿠',
    prefecture: 'iwate',
    prefectureLabel: '이와테현',
    city: 'morioka',
    cityLabel: '모리오카시',
    onsenArea: 'tsunagi',
    onsenAreaLabel: '쓰나기',
  },
  higashiyama: {
    regionGroup: 'tohoku',
    regionGroupLabel: '도호쿠',
    prefecture: 'fukushima',
    prefectureLabel: '후쿠시마현',
    city: 'aizuwakamatsu',
    cityLabel: '아이즈와카마쓰시',
    onsenArea: 'higashiyama',
    onsenAreaLabel: '아이즈 히가시야마',
  },
  iizaka: {
    regionGroup: 'tohoku',
    regionGroupLabel: '도호쿠',
    prefecture: 'fukushima',
    prefectureLabel: '후쿠시마현',
    city: 'fukushima',
    cityLabel: '후쿠시마시',
    onsenArea: 'iizaka',
    onsenAreaLabel: '이이자카',
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
  arima: {
    regionGroup: 'kansai',
    regionGroupLabel: '간사이',
    prefecture: 'hyogo',
    prefectureLabel: '효고현',
    city: 'kobe',
    cityLabel: '고베시',
    onsenArea: 'arima',
    onsenAreaLabel: '아리마',
  },
  kinosaki: {
    regionGroup: 'kansai',
    regionGroupLabel: '간사이',
    prefecture: 'hyogo',
    prefectureLabel: '효고현',
    city: 'toyooka',
    cityLabel: '도요오카시',
    onsenArea: 'kinosaki',
    onsenAreaLabel: '기노사키',
  },
  shirahama: {
    regionGroup: 'kansai',
    regionGroupLabel: '간사이',
    prefecture: 'wakayama',
    prefectureLabel: '와카야마현',
    city: 'shirahama',
    cityLabel: '시라하마초',
    onsenArea: 'shirahama',
    onsenAreaLabel: '시라하마',
  },
  toba: {
    regionGroup: 'kansai',
    regionGroupLabel: '간사이',
    prefecture: 'mie',
    prefectureLabel: '미에현',
    city: 'toba',
    cityLabel: '도바시',
    onsenArea: 'toba',
    onsenAreaLabel: '도바',
  },
  kaike: {
    regionGroup: 'chugoku_shikoku',
    regionGroupLabel: '주고쿠/시코쿠',
    prefecture: 'tottori',
    prefectureLabel: '돗토리현',
    city: 'yonago',
    cityLabel: '요나고시',
    onsenArea: 'kaike',
    onsenAreaLabel: '가이케',
  },
  misasa: {
    regionGroup: 'chugoku_shikoku',
    regionGroupLabel: '주고쿠/시코쿠',
    prefecture: 'tottori',
    prefectureLabel: '돗토리현',
    city: 'misasa',
    cityLabel: '미사사초',
    onsenArea: 'misasa',
    onsenAreaLabel: '미사사',
  },
  tamatsukuri: {
    regionGroup: 'chugoku_shikoku',
    regionGroupLabel: '주고쿠/시코쿠',
    prefecture: 'shimane',
    prefectureLabel: '시마네현',
    city: 'matsue',
    cityLabel: '마쓰에시',
    onsenArea: 'tamatsukuri',
    onsenAreaLabel: '다마쓰쿠리',
  },
  dogo: {
    regionGroup: 'chugoku_shikoku',
    regionGroupLabel: '주고쿠/시코쿠',
    prefecture: 'ehime',
    prefectureLabel: '에히메현',
    city: 'matsuyama',
    cityLabel: '마쓰야마시',
    onsenArea: 'dogo',
    onsenAreaLabel: '도고',
  },
  yubara: {
    regionGroup: 'chugoku_shikoku',
    regionGroupLabel: '주고쿠/시코쿠',
    prefecture: 'okayama',
    prefectureLabel: '오카야마현',
    city: 'maniwa',
    cityLabel: '마니와시',
    onsenArea: 'yubara',
    onsenAreaLabel: '유바라',
  },
  yuda: {
    regionGroup: 'chugoku_shikoku',
    regionGroupLabel: '주고쿠/시코쿠',
    prefecture: 'yamaguchi',
    prefectureLabel: '야마구치현',
    city: 'yamaguchi',
    cityLabel: '야마구치시',
    onsenArea: 'yuda',
    onsenAreaLabel: '유다',
  },
};

export const regionGroupFilters: OnsenTaxonomyFilter<OnsenRegionGroup>[] = [
  { label: '규슈', value: 'kyushu' },
  { label: '간토', value: 'kanto' },
  { label: '홋카이도', value: 'hokkaido' },
  { label: '주부', value: 'chubu' },
  { label: '간사이', value: 'kansai' },
  { label: '주고쿠/시코쿠', value: 'chugoku_shikoku' },
  { label: '도호쿠', value: 'tohoku' },
];

export const onsenAreaFilters: OnsenTaxonomyFilter[] = [
  { label: '유후인', value: 'yufuin', description: '오이타현 유후시' },
  { label: '유노히라', value: 'yunohira', description: '오이타현 유후시' },
  { label: '벳푸', value: 'beppu', description: '오이타현 벳푸시' },
  { label: '구로카와', value: 'kurokawa', description: '구마모토현' },
  { label: '이부스키', value: 'ibusuki', description: '가고시마현' },
  { label: '우레시노', value: 'ureshino', description: '사가현' },
  { label: '다케오', value: 'takeo', description: '사가현' },
  { label: '기리시마', value: 'kirishima', description: '가고시마현' },
  { label: '운젠', value: 'unzen', description: '나가사키현' },
  { label: '하코네', value: 'hakone', description: '가나가와현' },
  { label: '유가와라', value: 'yugawara', description: '가나가와현' },
  { label: '이사와', value: 'isawa', description: '야마나시현' },
  { label: '가와구치코', value: 'kawaguchiko', description: '야마나시현' },
  { label: '후지요시다', value: 'fujiyoshida', description: '야마나시현' },
  { label: '마쓰모토', value: 'matsumoto', description: '나가노현' },
  { label: '게로', value: 'gero', description: '기후현' },
  { label: '에치고유자와', value: 'echigo-yuzawa', description: '니가타현' },
  { label: '야마나카', value: 'yamanaka', description: '이시카와현' },
  { label: '아타미', value: 'atami', description: '시즈오카현' },
  { label: '이토/이즈고원', value: 'ito-izu', description: '시즈오카현' },
  { label: '아키우', value: 'akiu', description: '미야기현 센다이' },
  { label: '미야기 자오', value: 'miyagi-zao', description: '미야기현' },
  { label: '뉴토온천향', value: 'nyuto', description: '아키타현' },
  { label: '긴잔온천', value: 'ginzan', description: '야마가타현' },
  { label: '자오온천', value: 'zao-yamagata', description: '야마가타현' },
  { label: '가미노야마', value: 'kaminoyama', description: '야마가타현' },
  { label: '스카유', value: 'sukayu', description: '아오모리현' },
  { label: '아사무시', value: 'asamushi', description: '아오모리현' },
  { label: '하나마키', value: 'hanamaki', description: '이와테현' },
  { label: '쓰나기', value: 'tsunagi', description: '이와테현 모리오카' },
  { label: '아이즈 히가시야마', value: 'higashiyama', description: '후쿠시마현' },
  { label: '이이자카', value: 'iizaka', description: '후쿠시마현' },
  { label: '조잔케이', value: 'jozankei', description: '홋카이도 삿포로' },
  { label: '노보리베츠', value: 'noboribetsu', description: '홋카이도' },
  { label: '유노카와', value: 'yunokawa-hakodate', description: '홋카이도 하코다테' },
  { label: '도야코', value: 'hokkaido-toyako', description: '홋카이도' },
  { label: '도카치가와', value: 'tokachigawa', description: '홋카이도' },
  { label: '아리마', value: 'arima', description: '효고현 고베' },
  { label: '기노사키', value: 'kinosaki', description: '효고현 도요오카' },
  { label: '시라하마', value: 'shirahama', description: '와카야마현' },
  { label: '도바', value: 'toba', description: '미에현' },
  { label: '가이케', value: 'kaike', description: '돗토리현 요나고' },
  { label: '미사사', value: 'misasa', description: '돗토리현' },
  { label: '다마쓰쿠리', value: 'tamatsukuri', description: '시마네현' },
  { label: '도고', value: 'dogo', description: '에히메현 마쓰야마' },
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
  { label: '객실 내 프라이빗탕 중심', value: 'room_bath' },
  { label: '대절탕 있음', value: 'private_bath' },
  { label: '대욕장 중심', value: 'public_bath' },
];

export const waterCriterionFilters: OnsenTaxonomyFilter<OnsenWaterCriterion>[] = [
  { label: '원천 직수 확인', value: 'direct_source' },
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

function getSafeLocalLabel(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim();
  if (!normalized) return fallback;
  if (/[A-Za-z_]/.test(normalized)) return fallback;
  return normalized;
}

export function getOnsenRegionGroupLabel(value: string | null | undefined) {
  return regionGroupLabelByValue[value as OnsenRegionGroup] ?? getSafeLocalLabel(value, '지역 확인');
}

export function getOnsenPrefectureLabel(value: string | null | undefined) {
  return prefectureLabelByValue[value ?? ''] ?? getSafeLocalLabel(value, '지역 확인');
}

export function getOnsenCityLabel(value: string | null | undefined) {
  return cityLabelByValue[value ?? ''] ?? getSafeLocalLabel(value, '도시 확인');
}

export function getOnsenAreaLabel(value: string | null | undefined) {
  return onsenAreaMetaByValue[value ?? '']?.onsenAreaLabel ?? getSafeLocalLabel(value, '온천지 확인');
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
      display: formatOnsenLocationDisplay(meta),
    };
  }

  return {
    country: 'JP',
    regionGroup: 'kyushu',
    regionGroupLabel: '규슈',
    prefecture: 'unknown',
    prefectureLabel: getSafeLocalLabel(area ?? region, '지역 확인'),
    city: 'unknown',
    cityLabel: '도시 확인',
    onsenArea: region ?? 'unknown',
    onsenAreaLabel: getSafeLocalLabel(area ?? region, '온천지 확인'),
    display: getSafeLocalLabel(area ?? region, '일본 온천'),
  };
}

export function formatOnsenLocationDisplay(location: Pick<OnsenLocation, 'regionGroupLabel' | 'prefectureLabel' | 'onsenAreaLabel'>) {
  return [...new Set([location.regionGroupLabel, location.prefectureLabel, location.onsenAreaLabel].filter(Boolean))].join(' · ');
}

export function deriveOnsenContexts(candidate: Pick<OnsenCandidate, 'tags' | 'primaryBath' | 'summary' | 'waterDecision'>): OnsenStructuredContexts {
  const bath = new Set<OnsenBathContext>();
  const water = new Set<OnsenWaterCriterion>();
  const text = `${candidate.primaryBath} ${candidate.summary} ${candidate.waterDecision.springType} ${candidate.waterDecision.operation} ${candidate.waterDecision.notice ?? ''}`;

  if (candidate.tags.includes('room-bath')) bath.add('room_bath');
  if (candidate.tags.includes('private-bath')) bath.add('private_bath');
  if (candidate.tags.includes('public-bath')) bath.add('public_bath');

  if (/직수/.test(text)) water.add('direct_source');
  if (/100%\s*천연|천연온천|천연 온천/.test(text)) water.add('natural_100');
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
