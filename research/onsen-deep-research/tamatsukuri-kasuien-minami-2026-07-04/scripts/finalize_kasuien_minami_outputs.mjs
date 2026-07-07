import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');
const TODAY = '2026-07-04';
const staticRowsPath = path.join(outDir, `kasuien_minami_static_review_tags_${TODAY}.json`);
const staticSummaryPath = path.join(outDir, `kasuien_minami_static_review_tags_summary_${TODAY}.json`);

const browserRows = [
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E6%B8%A9%E6%B3%89%20%E4%BD%B3%E7%BF%A0%E8%8B%91%E7%9A%86%E7%BE%8E',
    review_body_access: 'direct_readable',
    review_date: '2018 approx',
    score: 5,
    language: 'ko',
    original_keyword: ['료칸', '만족'],
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: [],
    onsen_related_body: false
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E6%B8%A9%E6%B3%89%20%E4%BD%B3%E7%BF%A0%E8%8B%91%E7%9A%86%E7%BE%8E',
    review_body_access: 'direct_readable',
    review_date: '2026 approx',
    score: 5,
    language: 'ja',
    original_keyword: ['大浴場', '9階展望風呂', '玉造温泉', 'すべすべ'],
    bath_area_tags: ['public_bath', 'open_air_public_bath'],
    signal_type_tags: ['public_bath_hot_spring', 'water_texture'],
    caution_tags: ['view_garden_rooftop'],
    onsen_related_body: true
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E6%B8%A9%E6%B3%89%20%E4%BD%B3%E7%BF%A0%E8%8B%91%E7%9A%86%E7%BE%8E',
    review_body_access: 'direct_readable',
    review_date: '2026 approx',
    score: 5,
    language: 'ja',
    original_keyword: ['お湯', '客室温泉'],
    bath_area_tags: ['room_bath'],
    signal_type_tags: ['room_bath_hot_spring', 'water_texture'],
    caution_tags: ['room_bath_presence'],
    onsen_related_body: true
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E6%B8%A9%E6%B3%89%20%E4%BD%B3%E7%BF%A0%E8%8B%91%E7%9A%86%E7%BE%8E',
    review_body_access: 'direct_readable',
    review_date: '2026 approx',
    score: 5,
    language: 'ja',
    original_keyword: ['温泉'],
    bath_area_tags: ['facility_wide'],
    signal_type_tags: ['water_texture'],
    caution_tags: [],
    onsen_related_body: true
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E6%B8%A9%E6%B3%89%20%E4%BD%B3%E7%BF%A0%E8%8B%91%E7%9A%86%E7%BE%8E',
    review_body_access: 'direct_readable',
    review_date: '2026 approx',
    score: 5,
    language: 'ja',
    original_keyword: ['夕食利用'],
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: [],
    onsen_related_body: false
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E6%B8%A9%E6%B3%89%20%E4%BD%B3%E7%BF%A0%E8%8B%91%E7%9A%86%E7%BE%8E',
    review_body_access: 'direct_readable',
    review_date: '2026 approx',
    score: 4,
    language: 'ja',
    original_keyword: ['予約', '部屋', '食事量'],
    bath_area_tags: [],
    signal_type_tags: ['booking_confusion'],
    caution_tags: ['access_booking'],
    onsen_related_body: false
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E6%B8%A9%E6%B3%89%20%E4%BD%B3%E7%BF%A0%E8%8B%91%E7%9A%86%E7%BE%8E',
    review_body_access: 'direct_readable',
    review_date: '2026 approx',
    score: 4,
    language: 'ja',
    original_keyword: ['朝食会場の混雑', '展望風呂の展望', '温泉指南書'],
    bath_area_tags: ['open_air_public_bath'],
    signal_type_tags: ['public_bath_hot_spring', 'crowding'],
    caution_tags: ['view_garden_rooftop'],
    onsen_related_body: true
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E6%B8%A9%E6%B3%89%20%E4%BD%B3%E7%BF%A0%E8%8B%91%E7%9A%86%E7%BE%8E',
    review_body_access: 'direct_readable',
    review_date: '2026 approx',
    score: 5,
    language: 'ja',
    original_keyword: ['ゆっくり'],
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: [],
    onsen_related_body: false
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E6%B8%A9%E6%B3%89%20%E4%BD%B3%E7%BF%A0%E8%8B%91%E7%9A%86%E7%BE%8E',
    review_body_access: 'direct_readable',
    review_date: '2026 approx',
    score: 5,
    language: 'ja',
    original_keyword: ['家族旅行'],
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: [],
    onsen_related_body: false
  },
  ...[
    ['2026-06-28', 5.00, ['源泉かけ流しのお風呂'], ['room_bath', 'room_open_air_bath'], ['room_bath_hot_spring', 'water_texture'], ['room_bath_presence']],
    ['2026-06-25', 5.00, ['温泉', '清掃'], ['facility_wide'], ['water_texture'], ['cleanliness_aging']],
    ['2026-06-19', 4.67, ['湯につかり'], ['facility_wide'], ['water_texture'], []],
    ['2026-06-17', 3.17, ['食事'], [], [], []],
    ['2026-06-16', 4.83, ['源泉掛け流し大好き'], ['room_bath'], ['room_bath_hot_spring'], ['room_bath_presence']],
    ['2026-06-15', 3.67, ['団体', '朝食ビュッフェ'], [], ['crowding', 'booking_confusion'], ['access_booking']],
    ['2026-06-14', 5.00, ['満足'], [], [], []],
    ['2026-06-08', 4.33, ['玉造温泉', '大きなお風呂'], ['public_bath'], ['public_bath_hot_spring', 'water_texture'], []],
    ['2026-05-30', 5.00, ['温泉', '清潔', 'お湯も熱く'], ['facility_wide'], ['water_texture'], ['temperature_control', 'cleanliness_aging']],
    ['2026-05-28', 5.00, ['温泉の風呂', '大きくはない'], ['public_bath'], ['public_bath_hot_spring'], []],
    ['2026-05-23', 5.00, ['大浴場', '玉造温泉'], ['public_bath'], ['public_bath_hot_spring', 'water_texture'], []],
    ['2026-05-22', 5.00, ['部屋の源泉掛け流しの露天風呂', '温度調節', '清潔感'], ['room_open_air_bath'], ['room_bath_hot_spring', 'water_texture'], ['temperature_control', 'cleanliness_aging', 'room_bath_presence']],
    ['2026-05-07', 5.00, ['温泉も良かった'], ['facility_wide'], ['water_texture'], []],
    ['2026-05-05', 4.83, ['部屋風呂', 'まろやかなお湯'], ['room_bath'], ['room_bath_hot_spring', 'water_texture'], ['room_bath_presence']],
    ['2026-04-10', 5.00, ['予約時から丁寧'], [], ['booking_confusion'], ['access_booking']],
    ['2026-04-04', 4.83, ['サービス', '料理'], [], [], []],
    ['2026-03-27', 4.83, ['玉造温泉', '部屋', 'レストラン'], ['facility_wide'], ['water_texture', 'booking_confusion'], ['access_booking']],
    ['2026-03-21', 4.17, ['送迎', '笑顔'], [], ['booking_confusion'], ['access_booking']],
    ['2026-03-17', 2.83, ['源泉掛け流しではなく', '駐車'], ['facility_wide'], ['weak_onsen_feeling', 'booking_confusion'], ['access_booking']],
    ['2026-01-01', 5.00, ['泉質', '肌に優しく'], ['facility_wide'], ['water_texture'], []],
    ['2025-12-21', 4.17, ['足湯', '大浴場', '椅子', 'タオル'], ['public_bath', 'facility_wide'], ['public_bath_hot_spring'], ['access_booking']],
    ['2025-12-11', 5.00, ['客室も温泉も'], ['room_bath'], ['room_bath_hot_spring', 'water_texture'], ['room_bath_presence']],
    ['2025-12-09', 5.00, ['お風呂も広々'], ['public_bath'], ['public_bath_hot_spring'], []]
  ].map(([reviewDate, score, originalKeyword, bathAreas, signals, cautions], idx) => ({
    platform: 'Ikkyu',
    source_url: 'https://www.ikyu.com/00001076/review/',
    review_body_access: 'direct_readable',
    review_id: `ikyu_page1_${idx + 1}`,
    review_date: reviewDate,
    score,
    language: 'ja',
    original_keyword: originalKeyword,
    bath_area_tags: bathAreas,
    signal_type_tags: signals,
    caution_tags: cautions,
    onsen_related_body: bathAreas.length > 0 || signals.includes('water_texture') || signals.includes('weak_onsen_feeling')
  })),
  {
    platform: 'Tripadvisor provider card in Google',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E6%B8%A9%E6%B3%89%20%E4%BD%B3%E7%BF%A0%E8%8B%91%E7%9A%86%E7%BE%8E',
    review_body_access: 'partial',
    review_date: '2025 approx',
    score: 3,
    language: 'ja',
    original_keyword: ['Tripadvisor 에 게시됨', '朝食混雑'],
    bath_area_tags: [],
    signal_type_tags: ['crowding'],
    caution_tags: [],
    onsen_related_body: false,
    excluded_from_direct_total: true,
    not_counted_reason: 'Google 패널 안 공급자 카드이므로 Google-native 직접 수에서 제외'
  },
  {
    platform: 'Naver Search',
    source_url: 'https://search.naver.com/search.naver?query=%EA%B0%80%EC%8A%A4%EC%9D%B4%EC%97%94%20%EB%AF%B8%EB%82%98%EB%AF%B8%20%ED%9B%84%EA%B8%B0%20%EC%98%A8%EC%B2%9C',
    review_body_access: 'snippet_only',
    language: 'ko',
    original_keyword: ['마쓰에 온천 숙소 베스트 3', '가스이엔 미나미', '다마츠쿠리 온천'],
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: [],
    onsen_related_body: false,
    excluded_from_direct_total: true,
    not_counted_reason: '검색 결과 스니펫만 확인되어 직접 리뷰 수에 포함하지 않음'
  },
  {
    platform: 'Naver Blog',
    source_url: 'https://search.naver.com/search.naver?ssc=tab.blog.all&query=%EA%B0%80%EC%8A%A4%EC%9D%B4%EC%97%94%20%EB%AF%B8%EB%82%98%EB%AF%B8%20%ED%9B%84%EA%B8%B0%20%EC%98%A8%EC%B2%9C',
    review_body_access: 'snippet_only',
    language: 'ko',
    original_keyword: ['지역 글', '요약 글'],
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: [],
    onsen_related_body: false,
    excluded_from_direct_total: true,
    not_counted_reason: '블로그 검색 결과 표면만 확인, 개별 숙박 후기 본문으로 보지 않음'
  }
];

function tally(rows, key) {
  const out = {};
  for (const row of rows) {
    const values = Array.isArray(row[key]) ? row[key] : [row[key]];
    for (const value of values.filter(Boolean)) out[value] = (out[value] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(out).sort((a, b) => b[1] - a[1]));
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function platformCounts(rows) {
  const directRows = rows.filter((r) => !r.excluded_from_direct_total && r.review_body_access === 'direct_readable');
  const platforms = [...new Set(directRows.map((r) => r.platform))];
  return Object.fromEntries(platforms.map((platform) => [
    platform,
    {
      direct_reviews_read: directRows.filter((r) => r.platform === platform).length,
      onsen_related_direct_reviews: directRows.filter((r) => r.platform === platform && r.onsen_related_body).length
    }
  ]));
}

function signalRows(allRows) {
  const direct = allRows.filter((r) => !r.excluded_from_direct_total && r.review_body_access !== 'snippet_only');
  const rows = [
    ['room_bath', 'room_bath_hot_spring', 'positive', '객실 내탕/객실 온천은 일부 객실 옵션으로 반복된다.'],
    ['room_open_air_bath', 'room_bath_hot_spring', 'positive', '객실 노천탕은 2026년 리뉴얼 객실 및 고급 객실 표본에서 강하게 잡힌다.'],
    ['public_bath', 'public_bath_hot_spring', 'positive', '대욕장, 1층/전망탕, 두 곳의 목욕장 이용 신호가 반복된다.'],
    ['open_air_public_bath', 'public_bath_hot_spring', 'mixed', '전망 노천/옥상 노천의 장점과 전망·규모 기대 차이가 함께 보인다.'],
    ['facility_wide', 'water_texture', 'positive', '玉造温泉, 美肌, すべすべ, 泉質, まろやか 표현이 반복된다.'],
    ['facility_wide', 'weak_onsen_feeling', 'negative', '源泉掛け流しではない/循環 인식은 소수 부정 신호다.'],
    ['facility_wide', 'chlorine_smell', 'negative', '塩素/カルキ는 정적 표본에서 2건만 확인된다.'],
    ['facility_wide', 'crowding', 'mixed', '혼잡 확인/공실감/단체·조식 혼잡 신호가 섞인다.'],
    ['facility_wide', 'booking_confusion', 'mixed', '예약, 송영, 주차, 안내, 객실·식사 옵션 신호는 운영 메모로 분리한다.']
  ];
  return rows.map(([bathArea, signalType, direction, interpretation]) => {
    const matched = direct.filter((r) => (
      (bathArea === 'facility_wide' || r.bath_area_tags?.includes(bathArea)) &&
      r.signal_type_tags?.includes(signalType)
    ));
    const platforms = new Set(matched.map((r) => r.platform));
    const status = matched.length >= 30 || platforms.size >= 3 ? 'strong_signal'
      : matched.length >= 10 || platforms.size >= 2 ? 'moderate_signal'
        : matched.length > 0 ? 'weak_signal' : 'insufficient';
    const contradiction = ['open_air_public_bath', 'facility_wide'].includes(bathArea) && ['weak_onsen_feeling', 'crowding'].includes(signalType) ? 'medium'
      : direction === 'mixed' ? 'low' : 'none';
    return {
      accommodation_name: '玉造温泉 佳翠苑皆美',
      bath_area: bathArea,
      bath_area_confidence: bathArea === 'facility_wide' ? 'facility_wide' : 'specific',
      signal_type: signalType,
      signal_direction: direction,
      mention_count: matched.length,
      source_count: matched.length,
      platform_count: platforms.size,
      contradiction_level: contradiction,
      review_signal_status: status,
      interpretation
    };
  });
}

async function main() {
  const staticRows = JSON.parse(await fs.readFile(staticRowsPath, 'utf8'));
  const staticSummary = JSON.parse(await fs.readFile(staticSummaryPath, 'utf8'));
  const allRows = [...staticRows, ...browserRows];
  const directRows = allRows.filter((r) => !r.excluded_from_direct_total && r.review_body_access !== 'snippet_only');
  const platformDirectCounts = {
    ...Object.fromEntries(Object.entries(staticSummary.by_platform).map(([platform, counts]) => [
      platform,
      {
        visible_review_count: platform === 'Rakuten Travel' ? staticSummary.visible_review_pool_static.rakuten : staticSummary.visible_review_pool_static.jalan,
        direct_reviews_read: counts.direct,
        onsen_related_direct_reviews: counts.onsen_body,
        review_body_access: 'direct_readable'
      }
    ])),
    'Google Maps native': {
      visible_review_count: 1977,
      rating: 4.4,
      rating_distribution: { '5': 1206, '4': 568, '3': 118, '2': 33, '1': 52 },
      direct_reviews_read: browserRows.filter((r) => r.platform === 'Google Maps native').length,
      onsen_related_direct_reviews: browserRows.filter((r) => r.platform === 'Google Maps native' && r.onsen_related_body).length,
      review_body_access: 'partial'
    },
    Ikkyu: {
      visible_review_count: 265,
      rating: 4.73,
      direct_reviews_read: browserRows.filter((r) => r.platform === 'Ikkyu').length,
      onsen_related_direct_reviews: browserRows.filter((r) => r.platform === 'Ikkyu' && r.onsen_related_body).length,
      review_body_access: 'direct_readable',
      note: '브라우저 표면 기준. Ikkyu/Yahoo 합산 총점 265건이나 페이지는 Ikkyu 게시 리뷰만 표시한다고 안내.'
    },
    'Tripadvisor provider card in Google': {
      visible_review_count: null,
      direct_reviews_read: 0,
      onsen_related_direct_reviews: 0,
      review_body_access: 'partial',
      not_counted_reason: 'Google 패널 안 공급자 카드라 Google-native 리뷰 수에서 제외'
    },
    'Yahoo Travel': {
      visible_review_count: 265,
      rating: 4.73,
      direct_reviews_read: 0,
      onsen_related_direct_reviews: 0,
      review_body_access: 'blocked',
      not_counted_reason: '정적 요청 403. Aside에서는 Ikkyu 표면이 Yahoo 합산 점수를 안내하므로 중복 가능성이 있어 직접 수 미반영.'
    },
    'Naver Search': {
      visible_review_count: null,
      direct_reviews_read: 0,
      onsen_related_direct_reviews: 0,
      review_body_access: 'snippet_only'
    },
    'Naver Blog': {
      visible_review_count: null,
      direct_reviews_read: 0,
      onsen_related_direct_reviews: 0,
      review_body_access: 'snippet_only'
    },
    Agoda: {
      visible_review_count: null,
      direct_reviews_read: 0,
      onsen_related_direct_reviews: 0,
      review_body_access: 'partial',
      not_counted_reason: 'Google 가격 카드 표면만 확인. 개별 리뷰 본문 미확보.'
    },
    Booking: {
      visible_review_count: null,
      direct_reviews_read: 0,
      onsen_related_direct_reviews: 0,
      review_body_access: 'snippet_only',
      not_counted_reason: 'Naver 검색 광고/요약 표면만 확인.'
    },
    Tripcom: {
      visible_review_count: 35,
      direct_reviews_read: 0,
      onsen_related_direct_reviews: 0,
      review_body_access: 'snippet_only',
      not_counted_reason: 'Naver 검색 표면에서 평점/참여 수와 객실명 스니펫만 확인.'
    },
    Tripadvisor: {
      visible_review_count: null,
      direct_reviews_read: 0,
      onsen_related_direct_reviews: 0,
      review_body_access: 'blocked',
      not_counted_reason: '정적 요청은 JS/ad-blocker 안내. Google provider card 일부만 확인.'
    }
  };

  const directReadTotal = Object.values(platformDirectCounts).reduce((sum, p) => sum + (p.direct_reviews_read || 0), 0);
  const onsenDirectTotal = Object.values(platformDirectCounts).reduce((sum, p) => sum + (p.onsen_related_direct_reviews || 0), 0);
  const aggregate = {
    research_date: TODAY,
    slug: 'tamatsukuri-kasuien-minami',
    accommodation_name: '玉造温泉 佳翠苑皆美',
    direct_read_total: directReadTotal,
    onsen_related_direct_total: onsenDirectTotal,
    direct_body_platform_count: 4,
    data_quality_grade: 'A',
    platform_direct_counts: platformDirectCounts,
    bath_area_tags: tally(directRows, 'bath_area_tags'),
    signal_type_tags: tally(directRows, 'signal_type_tags'),
    caution_tags: tally(directRows, 'caution_tags'),
    signal_rows: signalRows(allRows),
    notes: [
      'Rakuten/Jalan 직접 표본이 충분하지만 단일/이중 OTA에 머물지 않도록 Google Maps native와 Ikkyu 브라우저 직접 표본을 보강했다.',
      'Naver 검색/블로그는 snippet_only로 분리했고 직접 리뷰 수에 넣지 않았다.',
      'Google 패널의 Tripadvisor 공급자 카드는 Google-native 수에서 제외했다.'
    ]
  };

  const mapping = {
    research_date: TODAY,
    scope: 'tamatsukuri-kasuien-minami ready lodging deep research',
    method: 'Rakuten API/Jalan static extraction + Aside Browser confirmation for Google Maps, Naver and Ikkyu + web source verification. Snippets and provider cards excluded from direct review totals.',
    direct_review_sampling_status: 'A: 300+ direct reviews, 4 direct-body platforms, latest/low-score/onsen-keyword/Korean-surface checks completed.',
    lodgings: [
      {
        slug: 'tamatsukuri-kasuien-minami',
        name_ja: '玉造温泉 佳翠苑皆美',
        name_ko_or_en: '가스이엔 미나미 / Kasuien Minami',
        google_maps: {
          rating: 4.4,
          visible_review_count: 1977,
          rating_distribution: { '5': 1206, '4': 568, '3': 118, '2': 33, '1': 52 },
          korean_reviews_visible: true,
          review_body_access: 'partial',
          direct_google_native_reviews_read: platformDirectCounts['Google Maps native'].direct_reviews_read,
          onsen_related_google_native_reviews: platformDirectCounts['Google Maps native'].onsen_related_direct_reviews,
          provider_cards_seen: ['Tripadvisor', 'Agoda', 'Trip.com', 'Rakuten Travel', 'JAPANiCAN']
        },
        ota_review_pool_signals: platformDirectCounts,
        official_bath_facts_seen: {
          official_site: 'public bath/open-air public bath: 浮舟, 浮殿, 天遊の湯; hand/foot bath; spring quality and temperature shown',
          room_bath: 'some rooms with source-flow bath per official top; Jalan/Ikkyu identify rooms with open-air bath, not all rooms',
          private_or_family_bath: 'not confirmed as shared reservable bath in official/Jalan checked sources',
          spring_quality: 'ナトリウム・カルシウム-硫酸塩・塩化物泉, 52.1C, weak alkaline high-temperature spring',
          circulation_addition: 'Jalan states 加水・循環ろ過; Ikkyu states open-air bath not kakenagashi and 加水'
        },
        review_signal_keywords: ['玉造温泉', '美肌', 'すべすべ', '大浴場', '9階展望風呂', '天遊の湯', '部屋風呂', '源泉掛け流し', '温泉露付スイート'],
        caution_keywords: ['混雑', '団体', '予約', '送迎', '駐車場', '源泉掛け流しではなく', '塩素', '温度調節'],
        next_sampling: 'A 유지. 추가 보강은 Google 저평점 필터와 Naver 원문 블로그/카페 접근, Yahoo Travel 별도 본문 중복 제거 확인.'
      }
    ]
  };

  const manifestRows = [
    ['research_order', 'slug', 'name_ja', 'name_ko_or_en', 'area', 'track', 'source_tier', 'bath_research_axes', 'initial_review_pool_signal', 'priority_reason', 'status'],
    ['1', 'tamatsukuri-kasuien-minami', '玉造温泉 佳翠苑皆美', '가스이엔 미나미 / Kasuien Minami', '玉造温泉, 島根県松江市', 'ready_deep_research', 'Tier 1', 'public_bath;open_air_public_bath;room_bath;room_open_air_bath;water_texture;crowding', 'raw visible pool 5,478+ with 603 direct reads', '옥상/전망 노천과 미인탕, 객실 온천 옵션이 모두 반복되는 대형 료칸', 'ready_A']
  ];
  const manifest = manifestRows.map((row) => row.map(csvEscape).join(',')).join('\n') + '\n';

  const report = `# 玉造温泉 佳翠苑皆美 온천 리뷰 신호 요약

## 1. 수집 브리핑

- 조사 숙소: 1곳 (\`tamatsukuri-kasuien-minami\`)
- 플랫폼상 전체 리뷰풀: 원시 표면 합산 5,478건 이상. Rakuten 1,167건, Jalan 2,071건, Google Maps 1,977건, Ikkyu/Yahoo 합산 표면 265건, Trip.com/Naver 표면 일부를 포함한다. 중복 가능성이 있어 독립 리뷰풀로 해석하지 않는다.
- 직접 읽은 리뷰 수: ${directReadTotal}건
- 온천 관련 직접 리뷰 수: ${onsenDirectTotal}건
- 직접 본문 플랫폼 수: 4개(Rakuten Travel, Jalan, Google Maps native, Ikkyu)
- Google 확인: Aside Browser로 Google Maps/Hotel 패널과 리뷰 탭 확인. visible 1,977건, 4.4점, 분포 5성 1,206 / 4성 568 / 3성 118 / 2성 33 / 1성 52. Google-native 직접 9건, 온천 관련 4건. Tripadvisor 공급자 카드는 Google-native 수에 포함하지 않았다.
- Naver 확인: Aside Browser로 전체/블로그 탭 확인. 직접 숙박 후기 본문은 확보하지 못했고, 지역 글·요약 글 표면은 \`snippet_only\`로 분리했다.
- data_quality_grade: \`A\`. 300건 이상 직접 확인, 3개 이상 직접 본문 플랫폼, 최신/저평점/온천 키워드/한국어 검색 표면 확인을 충족한다.

## 2. 공식 사실

공식 온천 페이지는 玉造温泉을 \`神の湯\`로 소개하며, 공용 욕장은 여탕 \`浮舟\`, 남탕 \`浮殿\`, 최상층 전망탕 \`天遊の湯\`로 나뉜다. 공식 표기상 \`浮舟\`과 \`浮殿\`은 내탕과 노천탕을 갖고, \`天遊の湯\`은 내탕과 전망 노천탕을 갖는다. 이용 시간은 \`浮舟/浮殿\` 15:00-24:30 및 5:00-9:30, \`天遊の湯\` 15:00-23:00 및 6:00-9:30로 확인된다.

泉質은 나트륨·칼슘-황산염·염화물천, 저張성 약알칼리성 고온천이며, 공식 온천 정보에는 원천 온도 52.1도, 무색·투명·무미·무취가 표기된다. Jalan은 玉造温泉 \`加水・循環ろ過\`와 노천탕 남녀 각 2, 내탕 남녀 각 2, 대욕장 2곳 조건을 표기하고, Ikkyu는 노천탕 \`かけ流しなし\`, 보충사항 \`加水\`, 온천·노천탕 딸린 객실·대욕장·岩盤浴·무료 송영을 시설 특징으로 표기한다.

객실탕은 전 객실 신호가 아니다. 공식 톱/OTA 표면에서 원천가케나가시 객실 욕탕과 2026년 7월 리뉴얼 오픈한 노천탕 딸린 객실 13실이 확인되므로, Bathtime에서는 \`room_bath\`, \`room_open_air_bath\`, \`public_bath\`, \`open_air_public_bath\`를 분리해야 한다.

## 3. 리뷰 신호 요약 표

| bath_area | signal_type | direction | mention_count | platform_count | status | 해석 |
|---|---:|---:|---:|---:|---|---|
${aggregate.signal_rows.map((r) => `| ${r.bath_area} | ${r.signal_type} | ${r.signal_direction} | ${r.mention_count} | ${r.platform_count} | ${r.review_signal_status} | ${r.interpretation} |`).join('\n')}

## 4. 근거 예시

| source | language | review_date | paraphrase | original_keyword |
|---|---|---:|---|---|
| Rakuten Travel | ja | 2026 recent | 두 곳의 온천과 혼잡 상황 확인이 함께 언급됐다. | \`温泉\`, \`混雑状況\` |
| Rakuten Travel | ja | mixed | 玉造温泉, 美肌, 대욕장, 전망 노천 신호가 반복됐다. | \`玉造温泉\`, \`美肌\`, \`大浴場\`, \`展望露天\` |
| Jalan | ja | mixed | 객실 노천탕 리뉴얼 객실명과 대욕장/노천탕 시설 신호가 함께 나타났다. | \`温泉露付スイート\`, \`露天風呂\`, \`大浴場\` |
| Google Maps native | ja | 2026 approx | 1층 대욕장과 9층 전망 목욕탕을 비교하며 玉造温泉의 촉감을 언급했다. | \`大浴場\`, \`9階展望風呂\`, \`すべすべ\` |
| Google Maps native | ja | 2026 approx | 객실 온천과 온수 만족을 함께 언급했다. | \`客室温泉\`, \`お湯\` |
| Google Maps native | ja | 2026 approx | 조식 혼잡과 전망탕 기대 차이를 함께 남겼다. | \`朝食会場の混雑\`, \`展望風呂\` |
| Ikkyu | ja | 2026-05-22 | 객실 노천탕, 온도 조절, 청결감이 한 리뷰에 묶였다. | \`部屋の源泉掛け流しの露天風呂\`, \`温度調節\` |
| Ikkyu | ja | 2026-05-05 | 객실 풍로의 물감과 안정감을 긍정적으로 평가했다. | \`部屋風呂\`, \`まろやかなお湯\` |
| Ikkyu | ja | 2026-03-17 | 대욕장이 원천가케나가시가 아니라는 부정 인식이 확인됐다. | \`源泉掛け流しではなく\` |
| Ikkyu | ja | 2025-12-21 | 족욕과 대욕장 편의, 의자/타월 동선 불편을 함께 언급했다. | \`足湯\`, \`大浴場\`, \`タオル\` |

## 5. Bathtime 해석

직접 확인 표본 ${directReadTotal}건 중 온천 관련 본문은 ${onsenDirectTotal}건이며, 이 숙소는 “대욕장 두 축 + 전망 노천 + 일부 객실 온천”으로 읽는 편이 데이터에 맞다. 玉造温泉의 \`美肌\`, \`すべすべ\`, \`まろやか\` 수질 신호가 강하게 반복되지만, 공식/OTA 표면에서는 가수·순환 여지가 명확하므로 “원천가케나가시 전면 숙소”로 해석하면 안 된다.

객실 노천탕은 만족 신호가 강하지만 일부 객실 옵션이며, 2026년 7월 리뉴얼 객실 13실이라는 시설 표면과 기존 객실탕 리뷰 신호를 분리해야 한다. 공용탕은 대욕장·전망탕 만족이 강한 반면, 혼잡·단체·전망 기대 차이·동선 편의 같은 운영 신호가 섞이므로 온천 품질 신호와 운영 메모를 분리 표시하는 편이 안전하다.

## 6. Gaps

- Rakuten은 visible 1,167건 중 440건을 직접 확인했다. 이미 A급이지만 저평점 필터 확장 여지가 있다.
- Jalan은 visible 2,071건 중 134건을 직접 확인했다. archive/과거 페이지 확장 여지가 있다.
- Google은 visible 1,977건이나 Google-native 직접 본문은 9건만 안정적으로 카운트했다. 공급자 카드 리뷰는 제외했다.
- Ikkyu는 브라우저에서 직접 접근됐고 23건을 직접 표본화했다. 정적 fetch는 403이어서 Aside 확인 결과를 기준으로 접근 상태를 갱신했다.
- Yahoo Travel은 정적 요청 403이며 Ikkyu/Yahoo 합산 표면과 중복 가능성이 있어 직접 수에 넣지 않았다.
- Naver Blog/Search는 \`snippet_only\`다. 직접 숙박 후기 본문은 0건으로 처리했다.
- Tripadvisor 정적 접근은 JS/ad-blocker 안내로 차단됐고, Google 패널 공급자 카드 일부만 확인됐다.

현재 등급은 A로 운영 가능하다. 다음 보강은 Google 저평점 필터 직접 표본, Naver 원문 블로그/카페 접근, Yahoo Travel과 Ikkyu 중복 제거 후 별도 본문 확대다.
`;

  await fs.writeFile(path.join(outDir, `kasuien_minami_browser_review_tags_${TODAY}.json`), JSON.stringify(browserRows, null, 2));
  await fs.writeFile(path.join(outDir, `kasuien_minami_signal_aggregate_${TODAY}.json`), JSON.stringify(aggregate, null, 2));
  await fs.writeFile(path.join(outDir, `platform_mapping_${TODAY}.json`), JSON.stringify(mapping, null, 2));
  await fs.writeFile(path.join(outDir, `deep_research_manifest_${TODAY}.csv`), manifest);
  await fs.writeFile(path.join(outDir, `review_signal_summary_${TODAY}.md`), report);
  console.log(JSON.stringify({
    directReadTotal,
    onsenDirectTotal,
    directPlatforms: Object.entries(platformDirectCounts).filter(([, p]) => p.direct_reviews_read > 0).map(([p]) => p),
    outputDir: outDir
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
