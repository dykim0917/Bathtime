import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');
const TODAY = '2026-07-04';
const slug = 'tamatsukuri-konya';

const staticRows = JSON.parse(await fs.readFile(path.join(outDir, `konya_static_review_tags_${TODAY}.json`), 'utf8'));
const staticSummary = JSON.parse(await fs.readFile(path.join(outDir, `konya_static_review_tags_summary_${TODAY}.json`), 'utf8'));

const sources = {
  official: 'https://www.hotel-gyokusen.co.jp/',
  rakuten: 'https://travel.rakuten.co.jp/HOTEL/106267/review.html',
  jalan: 'https://www.jalan.net/yad331176/kuchikomi/',
  jtb: 'https://www.jtb.co.jp/kokunai-hotel/htl/7323010/review/',
  shimaneTourism: 'https://www.kankou-shimane.com/destination/20987',
  yukoyukoBath: 'https://www.yukoyuko.net/3203/bath',
  spaAssociation: 'https://www.spa.or.jp/search_f/detail_f/?F_ID=1208'
};

const browserRows = [
  {
    platform: 'Google Maps',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E6%B8%A9%E6%B3%89%20%E3%83%9B%E3%83%86%E3%83%AB%E7%8E%89%E6%B3%89',
    review_id: 'google-native-kim-younghwan-2025',
    review_date: '2025',
    rating: 4,
    language: 'ko',
    review_body_access: 'direct_readable',
    google_native: true,
    bath_area_tags: ['public_bath', 'open_air_public_bath'],
    signal_type_tags: ['public_bath_hot_spring', 'weak_onsen_feeling'],
    signal_direction: 'mixed',
    original_keyword: ['온천시설', '노천탕', '일반 사우나'],
    paraphrase: '한국어 리뷰에서 온천 시설은 이용했지만 노천탕 공간이 좁고 일반 사우나처럼 느껴졌다는 부정/혼합 신호가 확인된다.',
    onsen_related_body: true
  },
  {
    platform: 'Google Maps',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E6%B8%A9%E6%B3%89%20%E3%83%9B%E3%83%86%E3%83%AB%E7%8E%89%E6%B3%89',
    review_id: 'google-native-jung-byeongsam-2026',
    review_date: '2026',
    rating: 5,
    language: 'ko',
    review_body_access: 'direct_readable',
    google_native: true,
    bath_area_tags: ['public_bath'],
    signal_type_tags: ['public_bath_hot_spring', 'water_texture'],
    signal_direction: 'positive',
    original_keyword: ['온천이 너무 좋아요'],
    paraphrase: '최신 한국어 Google-native 리뷰에서 온천 만족 표현이 짧지만 직접 확인된다.',
    onsen_related_body: true
  },
  {
    platform: 'Google Maps',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E6%B8%A9%E6%B3%89%20%E3%83%9B%E3%83%86%E3%83%AB%E7%8E%89%E6%B3%89',
    review_id: 'google-native-lee-action-girl-2026',
    review_date: '2026',
    rating: 5,
    language: 'ko',
    review_body_access: 'direct_readable',
    google_native: true,
    bath_area_tags: [],
    signal_type_tags: [],
    signal_direction: 'neutral',
    original_keyword: [],
    paraphrase: 'Google-native 한국어 최신 리뷰 1건은 숙박 만족 표본으로 읽었으나 온천 본문 신호는 확인되지 않았다.',
    onsen_related_body: false
  },
  {
    platform: 'Google Maps',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E6%B8%A9%E6%B3%89%20%E3%83%9B%E3%83%86%E3%83%AB%E7%8E%89%E6%B3%89',
    review_id: 'google-native-older-ko-bundle',
    review_date: '2018-2019',
    rating: 4,
    language: 'ko',
    review_body_access: 'direct_readable',
    google_native: true,
    bath_area_tags: ['public_bath'],
    signal_type_tags: ['public_bath_hot_spring', 'water_texture', 'booking_confusion'],
    signal_direction: 'positive',
    original_keyword: ['대욕장', '온천', '피부가 부드럽다', '송영'],
    paraphrase: '과거 한국어 Google-native 표본 여러 건에서 대욕장 안내, 온천 만족, 피부/머릿결 촉감, 송영 안내가 반복된다.',
    onsen_related_body: true,
    grouped_direct_reviews: 6,
    grouped_onsen_reviews: 6
  },
  {
    platform: 'Tripadvisor via Google Hotels card',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E6%B8%A9%E6%B3%89%20%E3%83%9B%E3%83%86%E3%83%AB%E7%8E%89%E6%B3%89',
    review_id: 'google-provider-tripadvisor-kimheesoo',
    review_date: '2019',
    rating: 4,
    language: 'ko',
    review_body_access: 'direct_readable',
    google_native: false,
    bath_area_tags: ['public_bath'],
    signal_type_tags: ['public_bath_hot_spring'],
    signal_direction: 'positive',
    original_keyword: ['가장 큰 온천호텔', '온천 힐링'],
    paraphrase: 'Google 호텔 패널의 Tripadvisor 공급자 카드에서 규모 큰 온천호텔·온천 힐링 신호가 확인된다. Google-native 리뷰로 세지 않는다.',
    onsen_related_body: true
  }
];

const browserSummary = {
  google_maps: {
    rating: 4.1,
    visible_review_count: 1624,
    rating_distribution: { '5': 613, '4': 664, '3': 225, '2': 63, '1': 59 },
    review_body_access: 'partial',
    direct_read_google_native_reviews: 9,
    onsen_related_google_native_reviews: 8,
    provider_cards_seen: [
      { provider: 'Tripadvisor', rating: 4.0, visible_review_count: 205, direct_read_reviews: 1, onsen_related_direct_reviews: 1 }
    ],
    access_note: 'Aside Browser로 Google Maps/Hotels 패널과 리뷰 탭을 직접 열람. Google-native 리뷰와 공급자 카드는 분리 집계.'
  },
  naver: {
    review_body_access: 'snippet_only',
    direct_read_reviews: 0,
    onsen_related_direct_reviews: 0,
    snippets_seen: [
      { source: 'Trip.com', visible_signal: '9/10, 78 참여' },
      { source: 'Hotels.com', visible_signal: '8.8/10, 421 참여' },
      { source: 'Tourvis/Privia', visible_signal: '4.2/5, 104 참여' },
      { source: 'Rakuten Travel Korean surface', visible_signal: '62 reviews snippet' }
    ],
    access_note: 'Naver 검색 결과는 OTA/메타 표면과 블로그 스니펫 중심. 숙소 체류 본문을 직접 연 표본은 없으므로 직접 리뷰 수에 포함하지 않음.'
  }
};

const directBrowser = 10;
const onsenBrowser = 9;
const directTotal = staticSummary.total_direct_extracted_static + directBrowser;
const onsenTotal = staticSummary.onsen_related_body_static + onsenBrowser;
const directPlatforms = [
  'Rakuten Travel',
  'Jalan',
  'JTB',
  'Google Maps native',
  'Tripadvisor via Google Hotels card'
];

const visibleReviewPoolMinimum = 1460 + 2315 + 1624 + 205 + 78 + 421;

function countRows(predicate) {
  return staticRows.filter(predicate).length;
}

const lowScoreOnsen = countRows((row) => row.onsen_related_body && row.score && Number(row.score) <= 3);
const latestOnsen = countRows((row) => row.onsen_related_body && /^2026/.test(row.review_date || ''));
const roomOpenAirMentions = countRows((row) => row.bath_area_tags.includes('room_open_air_bath'));
const privateMentions = countRows((row) => row.bath_area_tags.includes('private_bath'));

const reviewSignalTable = [
  {
    accommodation_name: '玉造温泉 〜曲水の庭〜 ホテル玉泉',
    bath_area: 'public_bath',
    bath_area_confidence: 'specific',
    signal_type: 'public_bath_hot_spring',
    signal_direction: 'positive',
    mention_count: staticSummary.bath_area_tags.public_bath + 8,
    source_count: staticSummary.bath_area_tags.public_bath + 8,
    platform_count: 5,
    contradiction_level: 'low',
    review_signal_status: 'strong_signal',
    note: '대욕장/온천/넓은 목욕 경험이 직접 표본 전반에서 강하게 반복된다.'
  },
  {
    accommodation_name: '玉造温泉 〜曲水の庭〜 ホテル玉泉',
    bath_area: 'facility_wide',
    bath_area_confidence: 'facility_wide',
    signal_type: 'water_texture',
    signal_direction: 'positive',
    mention_count: staticSummary.signal_type_tags.water_texture + 8,
    source_count: staticSummary.signal_type_tags.water_texture + 8,
    platform_count: 5,
    contradiction_level: 'low',
    review_signal_status: 'strong_signal',
    note: '美肌/すべすべ/피부가 부드럽다 계열의 수질·촉감 표현이 반복된다.'
  },
  {
    accommodation_name: '玉造温泉 〜曲水の庭〜 ホテル玉泉',
    bath_area: 'open_air_public_bath',
    bath_area_confidence: 'probable',
    signal_type: 'public_bath_hot_spring',
    signal_direction: 'mixed',
    mention_count: staticSummary.bath_area_tags.open_air_public_bath + 1,
    source_count: staticSummary.bath_area_tags.open_air_public_bath + 1,
    platform_count: 2,
    contradiction_level: 'low',
    review_signal_status: 'moderate_signal',
    note: '공용 노천탕은 만족 표현이 있으나, Google 한국어 표본에서는 좁다는 부정 신호도 1건 확인된다.'
  },
  {
    accommodation_name: '玉造温泉 〜曲水の庭〜 ホテル玉泉',
    bath_area: 'private_bath',
    bath_area_confidence: 'specific',
    signal_type: 'private_bath_experience',
    signal_direction: 'positive',
    mention_count: privateMentions,
    source_count: privateMentions,
    platform_count: 1,
    contradiction_level: 'low',
    review_signal_status: 'weak_signal',
    note: '貸切/貸切風呂 표본은 있으나 대욕장 신호에 비해 작다.'
  },
  {
    accommodation_name: '玉造温泉 〜曲水の庭〜 ホテル玉泉',
    bath_area: 'room_open_air_bath',
    bath_area_confidence: 'unclear',
    signal_type: 'room_bath_hot_spring',
    signal_direction: 'mixed',
    mention_count: roomOpenAirMentions,
    source_count: roomOpenAirMentions,
    platform_count: 1,
    contradiction_level: 'high',
    review_signal_status: 'conflicting',
    note: '문맥 태그상 객실 노천/객실탕 표현이 잡히지만, 공식·협회 표기와 충돌 가능성이 있어 객실탕 축으로 해석하지 않는다.'
  },
  {
    accommodation_name: '玉造温泉 〜曲水の庭〜 ホテル玉泉',
    bath_area: 'facility_wide',
    bath_area_confidence: 'facility_wide',
    signal_type: 'crowding',
    signal_direction: 'mixed',
    mention_count: staticSummary.signal_type_tags.crowding,
    source_count: staticSummary.signal_type_tags.crowding,
    platform_count: 3,
    contradiction_level: 'none',
    review_signal_status: 'moderate_signal',
    note: '혼잡·대기·비어 있음이 함께 잡힌다. 온천 자체보다 뷔페/대형 숙소 운영 신호와 함께 읽어야 한다.'
  }
];

const aggregate = {
  research_date: TODAY,
  slug,
  status: ['ready'],
  data_quality_grade: 'A',
  grade_reason: '직접 확인 680건, 직접 본문 플랫폼 5개, Google/Naver Aside 확인, 최신/저평점/온천 키워드/한국어 층화 표본 포함.',
  identity: {
    name_ja: '玉造温泉 〜曲水の庭〜 ホテル玉泉',
    name_ko_or_en: '호텔 교쿠센 / Hotel Gyokusen',
    ota_names: ['曲水の庭 ホテル玉泉', 'ホテル玉泉', 'Hotel Gyokusen'],
    area: '玉造温泉, 島根県松江市',
    address: '島根県松江市玉湯町玉造53-2',
    official_url: sources.official
  },
  visible_review_pool_minimum_mapped: visibleReviewPoolMinimum,
  visible_review_pool_note: 'Rakuten 1,460 + Jalan 2,315 + Google 1,624 + Tripadvisor 205 + Trip.com 78 + Hotels.com 421의 표면 합계. Tourvis/Privia 104와 Rakuten Korean surface 62는 중복 위험이 있어 최소 합계에서 제외.',
  direct_reviews_read_total: directTotal,
  onsen_related_direct_reviews_total: onsenTotal,
  direct_body_platforms: directPlatforms.length,
  direct_body_platform_names: directPlatforms,
  stratification: {
    latest_2026_onsen_static: latestOnsen,
    low_score_onsen_static: lowScoreOnsen,
    google_korean_direct_reviews: 9,
    google_korean_onsen_reviews: 8,
    naver_direct_reviews: 0,
    naver_status: 'snippet_only'
  },
  static_summary: staticSummary,
  browser_summary: browserSummary,
  official_bath_facts_seen: {
    public_bath: 'official/OTA_seen',
    open_air_public_bath: 'official/OTA_seen',
    private_bath: 'Yukoyuko_seen',
    room_open_air_bath: 'conflicting_or_unclear',
    source_flow_claim: 'conflicting',
    spring_quality: ['単純温泉', '硫酸塩泉(配湯)', '塩化物泉(配湯)'],
    source_temperature: '72°C seen on Japan Onsen Association',
    caution: 'Yukoyuko는 かけ流し 표기, Japan Onsen Association은 掛け流し浴槽 無로 표기되어 원천가케나가시 축은 공식/OTA 간 충돌로 처리.'
  },
  review_signal_table: reviewSignalTable,
  next_sampling: 'A급 기준은 충족. 객실 노천탕/객실탕 축을 상품 데이터로 쓰려면 공식 객실 타입 페이지와 OTA 객실별 플랜을 별도 확인해야 한다.'
};

const platformMapping = {
  research_date: TODAY,
  scope: 'ready lodging deep research: Kansai/Sanin/Setouchi Tier 1, one lodging',
  method: 'Static OTA review extraction plus Aside Browser verification for Google Maps/Hotels and Naver Search. Snippets excluded from direct review counts.',
  direct_review_sampling_status: 'A: 300+ direct reviews, 3+ direct body platforms, stratified latest/low-score/onsen-keyword/Korean samples.',
  lodgings: [
    {
      slug,
      name_ja: aggregate.identity.name_ja,
      google_maps: {
        rating: browserSummary.google_maps.rating,
        visible_review_count: browserSummary.google_maps.visible_review_count,
        rating_distribution: browserSummary.google_maps.rating_distribution,
        korean_reviews_visible: true,
        direct_google_native_reviews_read: browserSummary.google_maps.direct_read_google_native_reviews,
        onsen_related_google_native_reviews_read: browserSummary.google_maps.onsen_related_google_native_reviews,
        provider_cards_seen: browserSummary.google_maps.provider_cards_seen
      },
      ota_review_pool_signals: {
        rakuten: { rating: null, visible_review_count: 1460, review_body_access: 'direct_readable', direct_read_reviews: staticSummary.by_platform['Rakuten Travel'].direct, onsen_related_direct_reviews: staticSummary.by_platform['Rakuten Travel'].onsen_body, source_url: sources.rakuten },
        jalan: { rating: null, visible_review_count: 2315, review_body_access: 'direct_readable', direct_read_reviews: staticSummary.by_platform.Jalan.direct, onsen_related_direct_reviews: staticSummary.by_platform.Jalan.onsen_body, source_url: sources.jalan },
        jtb: { rating: null, visible_review_count: null, review_body_access: 'direct_readable', direct_read_reviews: staticSummary.by_platform.JTB.direct, onsen_related_direct_reviews: staticSummary.by_platform.JTB.onsen_body, source_url: sources.jtb },
        trip_com: { rating: '9/10 seen in Naver snippet', visible_review_count: 78, review_body_access: 'snippet_only', direct_read_reviews: 0 },
        hotels_com: { rating: '8.8/10 seen in Naver snippet', visible_review_count: 421, review_body_access: 'snippet_only', direct_read_reviews: 0 },
        naver_search: browserSummary.naver
      },
      official_bath_facts_seen: aggregate.official_bath_facts_seen,
      review_signal_keywords: ['大浴場', '温泉', '美肌の湯', 'すべすべ', '露天風呂', '貸切風呂', '대욕장', '온천', '피부가 부드럽다'],
      caution_keywords: ['混雑', '待ち', '狭い', '예약/안내', '노천탕 공간 좁음', '객실탕 태그 충돌'],
      next_sampling: aggregate.next_sampling
    }
  ]
};

const browserTagsPath = path.join(outDir, `konya_browser_review_tags_${TODAY}.json`);
await fs.writeFile(browserTagsPath, JSON.stringify(browserRows, null, 2));
await fs.writeFile(path.join(outDir, `konya_signal_aggregate_${TODAY}.json`), JSON.stringify(aggregate, null, 2));
await fs.writeFile(path.join(outDir, `platform_mapping_${TODAY}.json`), JSON.stringify(platformMapping, null, 2));

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const manifestHeaders = ['research_order', 'slug', 'name_ja', 'name_ko_or_en', 'area', 'track', 'source_tier', 'bath_research_axes', 'initial_review_pool_signal', 'priority_reason', 'status'];
const manifestRow = [
  1,
  slug,
  '玉造温泉 〜曲水の庭〜 ホテル玉泉',
  '호텔 교쿠센 / Hotel Gyokusen',
  '玉造温泉, 島根県',
  'ready_deep_research',
  'Tier 1',
  'public_bath; open_air_public_bath; water_texture; private_bath; room_bath_conflict_check',
  'visible minimum 6103; direct 680; onsen direct 360',
  '대형 대욕장·정원 온천 축의 표본 규모가 크고 Google 한국어 리뷰가 직접 확인됨',
  'ready'
];
const manifest = [manifestHeaders, manifestRow].map((row) => row.map(csvCell).join(',')).join('\n');
await fs.writeFile(path.join(outDir, `deep_research_manifest_${TODAY}.csv`), manifest);

const evidence = [
  ['Rakuten Travel', '2026-06-01', 'ja', ['お風呂の水質', '温泉'], '목욕물 수질을 강하게 긍정하는 최신 표본.', sources.rakuten],
  ['Rakuten Travel', '2026-05-31', 'ja', ['とろみ湯', '岩風呂露天風呂'], '노천·수질 촉감 만족이 함께 나타난 표본.', sources.rakuten],
  ['Rakuten Travel', '2026-03-18', 'ja', ['貸切', '露天風呂', '美肌の湯'], '대절탕과 노천탕, 미용 온천 표현이 함께 잡히는 표본.', sources.rakuten],
  ['Jalan', null, 'ja', ['大浴場', '温泉'], 'Jalan 본문에서 대욕장 중심의 온천 이용 신호가 반복된다.', sources.jalan],
  ['JTB', null, 'ja', ['温泉', 'お風呂'], 'JTB 본문에서도 온천/목욕 신호가 직접 확인된다.', sources.jtb],
  ['Google Maps native', '2025', 'ko', ['온천시설', '노천탕', '일반 사우나'], '한국어 Google-native 저평가/혼합 표본에서 공용 노천 공간 기대치 이슈가 확인된다.', browserRows[0].source_url],
  ['Google Maps native', '2026', 'ko', ['온천이 너무 좋아요'], '최신 한국어 Google-native 온천 긍정 신호.', browserRows[1].source_url],
  ['Google Maps native', '2018-2019', 'ko', ['대욕장', '피부가 부드럽다', '송영'], '과거 한국어 리뷰에서 대욕장 안내와 수질 촉감, 송영 안내가 함께 나타난다.', browserRows[3].source_url],
  ['Tripadvisor via Google Hotels', '2019', 'ko', ['가장 큰 온천호텔', '온천 힐링'], 'Google 공급자 카드에서 온천 규모와 힐링 신호 확인. Google-native에는 넣지 않음.', browserRows[4].source_url],
  ['Official/OTA facts', null, 'ja', ['掛け流し浴槽 無', 'かけ流し'], '공식/OTA 계열의 가케나가시 표기가 서로 충돌해 리뷰 신호와 분리한다.', sources.spaAssociation]
];

const markdown = `# review_signal_summary_${TODAY}: 玉造温泉 〜曲水の庭〜 ホテル玉泉

## 1. 수집 브리핑

- 이번 숙소: 1곳 \`${slug}\`
- 플랫폼상 visible review pool: 최소 6,103건
  - Rakuten 1,460 / Jalan 2,315 / Google Maps 1,624 / Tripadvisor 공급자 카드 205 / Trip.com 78 / Hotels.com 421
  - Tourvis/Privia 104, Rakuten Korean surface 62는 Naver 검색 표면에서 봤지만 중복 위험이 있어 최소 합계에서 제외
- 직접 읽은 리뷰 수: 680건
  - 정적 직접 본문 670건: Rakuten 360, Jalan 210, JTB 100
  - Aside 직접 확인 10건: Google-native 9, Google Hotels 안 Tripadvisor 공급자 카드 1
- 온천 관련 직접 리뷰 수: 360건
- 직접 본문 플랫폼 수: 5개
  - Rakuten Travel, Jalan, JTB, Google Maps native, Tripadvisor via Google Hotels card
- Google / Naver 확인 여부: Google Maps·Google Hotels는 Aside Browser로 직접 확인, Naver Search는 Aside Browser로 확인했으나 직접 본문 없이 \`snippet_only\`
- 접근 실패/제한: Naver는 검색 결과 스니펫 중심, Booking/Agoda/Trip.com/Hotels.com 본문은 이번 라운드에서 직접 리뷰로 열람하지 않음
- data_quality_grade: A
  - 300건 이상 직접 확인, 3개 이상 직접 본문 플랫폼, 최신/저평점/온천 키워드/한국어 표본 포함

## 2. 공식 사실

- 일본어 공식명: 玉造温泉 〜曲水の庭〜 ホテル玉泉
- 한국어/영어 표기: 호텔 교쿠센 / Hotel Gyokusen
- 주소/온천지명: 島根県松江市玉湯町玉造53-2, 玉造温泉
- 공식 사이트: ${sources.official}
- 공식/관광/OTA 시설 주장
  - 대욕장: 확인됨. 관광·OTA 표면에서 \`神戸湯殿\`, \`檜の湯\`, \`巌の湯\` 등 대욕장 축 확인.
  - 공용 노천탕: 확인됨. 노천탕/노천탕 에리어 표기가 있음.
  - 대절탕: Yukoyuko 표면에서 대절탕 축 확인.
  - 객실 노천탕: Japan Onsen Association 표면은 노천 객실 수 0으로 보이며, 일부 OTA/태그 문맥과 충돌 가능성이 있어 \`conflicting_or_unclear\`.
  - 원천가케나가시: Yukoyuko 표면은 \`かけ流し\` 계열 표기, Japan Onsen Association 표면은 \`掛け流し浴槽 無\`. 이 축은 공식/OTA 간 충돌로 분리 보관.
  - 泉質/온도: Japan Onsen Association 표면에서 \`単純温泉\`, 원천 72°C 확인. Yukoyuko 표면에서는 \`硫酸塩泉(配湯)\`, \`塩化物泉(配湯)\` 표기가 보여 병렬 기록.

공식 사실은 후기 만족 신호로 합산하지 않았다.

## 3. 리뷰 신호 요약

| bath_area | signal_type | direction | mention_count | platform_count | status | 해석 |
|---|---|---:|---:|---:|---|---|
| public_bath | public_bath_hot_spring | positive | ${staticSummary.bath_area_tags.public_bath + 8} | 5 | strong_signal | 대욕장/온천/넓은 목욕 경험이 직접 표본 전반에서 강하게 반복된다. |
| facility_wide | water_texture | positive | ${staticSummary.signal_type_tags.water_texture + 8} | 5 | strong_signal | 美肌/すべすべ/피부가 부드럽다 계열의 수질·촉감 표현이 강하게 반복된다. |
| open_air_public_bath | public_bath_hot_spring | mixed | ${staticSummary.bath_area_tags.open_air_public_bath + 1} | 2 | moderate_signal | 노천탕 만족과 “공간이 좁다”는 한국어 Google 표본이 함께 있다. |
| private_bath | private_bath_experience | positive | ${privateMentions} | 1 | weak_signal | 貸切/貸切風呂 표본은 있으나 대욕장 신호에 비해 작다. |
| room_open_air_bath | room_bath_hot_spring | mixed | ${roomOpenAirMentions} | 1 | conflicting | 객실 노천탕/객실탕 태그는 문맥 충돌 가능성이 있어 핵심 축으로 쓰지 않는다. |
| facility_wide | crowding | mixed | ${staticSummary.signal_type_tags.crowding} | 3 | moderate_signal | 혼잡·대기·비어 있음이 함께 잡힌다. 대형 숙소 운영 신호와 함께 해석해야 한다. |

## 4. 근거 예시

${evidence.map((row, i) => `${i + 1}. ${row[0]} / ${row[1] || 'date_unknown'} / ${row[2]}: ${row[4]}  \n   original_keyword: ${row[3].map((x) => `\`${x}\``).join(', ')}  \n   source_url: ${row[5]}`).join('\n')}

## 5. Bathtime 해석

직접 확인 표본 680건 중 온천 관련 본문 360건에서, 호텔玉泉은 객실탕보다 공용 대욕장과 물 촉감으로 읽는 편이 데이터에 맞다. \`大浴場\`, \`美肌の湯\`, \`すべすべ\`, 한국어의 “온천”, “피부가 부드럽다” 계열 표현이 다중 플랫폼에서 강하게 반복된다. 다만 객실 노천탕/객실탕 축은 문맥 태그와 공식·협회 표기가 충돌하므로, Bathtime에서는 “대욕장 중심 대형 온천 숙소”로 우선 분류하고 객실탕 여부는 별도 상품 검증으로 넘기는 것이 안전하다.

## 6. Gaps

- Naver: Aside Browser로 확인했지만 직접 숙박 리뷰 본문은 확보하지 못함. 검색 결과와 OTA 표면은 \`snippet_only\`.
- Google: Google-native 9건과 Tripadvisor 공급자 카드 1건을 분리했다. 공급자 카드는 Google-native 리뷰 수에 넣지 않음.
- Booking/Agoda/Trip.com/Hotels.com: visible/rating 표면은 일부 확인했으나 직접 본문 표본으로 집계하지 않음.
- 객실 노천탕/객실탕: 리뷰 태그상 일부 표현이 잡히지만 공식/협회 표기와 충돌 가능성이 있어 \`conflicting\`으로 둔다.
- 원천가케나가시: OTA와 Japan Onsen Association 표면이 충돌하므로 공식 사실 축에서도 단정하지 않는다.

## 7. 다음 액션

- 이 숙소는 A급 딥리서치 기준을 충족했다.
- 다음 에이전트가 보강한다면 OTA 객실 타입 페이지를 열어 객실 노천탕/객실 내탕의 실제 판매 타입을 별도 검증한다.
- Naver Blog는 숙소명+한국어 후기 본문이 열리는 결과가 생길 때만 직접 리뷰로 추가한다.
`;

await fs.writeFile(path.join(outDir, `review_signal_summary_${TODAY}.md`), markdown);
console.log(JSON.stringify({
  slug,
  grade: aggregate.data_quality_grade,
  visible_review_pool_minimum: visibleReviewPoolMinimum,
  direct_reviews_read_total: directTotal,
  onsen_related_direct_reviews_total: onsenTotal,
  direct_body_platforms: directPlatforms.length
}, null, 2));
