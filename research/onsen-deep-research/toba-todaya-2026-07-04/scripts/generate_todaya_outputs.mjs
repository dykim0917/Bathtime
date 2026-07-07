import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');
const date = '2026-07-04';
const staticSummary = JSON.parse(await fs.readFile(path.join(outDir, `todaya_static_review_tags_summary_${date}.json`), 'utf8'));

const browserTags = [
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E6%88%B8%E7%94%B0%E5%AE%B6%20%E9%B3%A5%E7%BE%BD',
    review_id: 'google-native-ko-san9-10y',
    review_date: 'about 10 years ago',
    language: 'ko',
    access: 'aside_review_tab_read',
    onsen_related_body: true,
    bath_area_tags: ['private_bath', 'family_bath'],
    signal_type_tags: ['private_bath_experience'],
    caution_tags: ['korean_private_bath_not_room_bath'],
    original_keywords: ['작은 개인 욕탕', '족탕'],
    paraphrase: 'Google-native 한국어 리뷰에서 작은 개인 욕탕 이용 가능성과 족탕을 언급한다. 객실탕 근거가 아니라 공용 프라이빗/대절탕 신호로 처리한다.'
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E6%88%B8%E7%94%B0%E5%AE%B6%20%E9%B3%A5%E7%BE%BD',
    review_id: 'google-native-ko-ksm-2y',
    review_date: 'about 2 years ago',
    language: 'ko',
    access: 'aside_review_tab_read',
    onsen_related_body: false,
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: ['view_privacy'],
    original_keywords: ['방에서 보이는', '바다의 뷰'],
    paraphrase: 'Google-native 한국어 리뷰에서 객실 바다 전망과 식사 만족을 언급하나 온천 본문은 확인되지 않는다.'
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E6%88%B8%E7%94%B0%E5%AE%B6%20%E9%B3%A5%E7%BE%BD',
    review_id: 'google-native-ko-yoon-9y',
    review_date: 'about 9 years ago',
    language: 'ko',
    access: 'aside_review_tab_read',
    onsen_related_body: false,
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: ['cleanliness_aging'],
    original_keywords: ['옛날식 관광호텔'],
    paraphrase: 'Google-native 한국어 리뷰에서 오래된 관광호텔 느낌과 직원/식사 신호가 보인다.'
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E6%88%B8%E7%94%B0%E5%AE%B6%20%E9%B3%A5%E7%BE%BD',
    review_id: 'google-native-ja-meme-1m',
    review_date: 'about 1 month ago',
    language: 'ja',
    access: 'aside_review_tab_read',
    onsen_related_body: false,
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: ['cleanliness_aging', 'access_booking'],
    original_keywords: ['大きな旅館', '古式ゆかしい'],
    paraphrase: 'Google-native 일본어 리뷰에서 대형 노포 료칸, 역 접근성, 외국인 직원 신호가 보이나 욕장 본문은 접힌 상태다.'
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E6%88%B8%E7%94%B0%E5%AE%B6%20%E9%B3%A5%E7%BE%BD',
    review_id: 'google-native-ja-tadashi-2w',
    review_date: 'about 2 weeks ago',
    language: 'ja',
    access: 'aside_review_tab_read',
    onsen_related_body: false,
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: ['buffet_crowding'],
    original_keywords: ['大きな旅館', '団体客'],
    paraphrase: 'Google-native 최신 일본어 리뷰에서 단체 손님과 식사 동선 신호가 보이나 온천 본문은 접힌 상태다.'
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E6%88%B8%E7%94%B0%E5%AE%B6%20%E9%B3%A5%E7%BE%BD',
    review_id: 'google-native-ja-jonathan-1m',
    review_date: 'about 1 month ago',
    language: 'ja',
    access: 'aside_review_tab_read',
    onsen_related_body: false,
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: [],
    original_keywords: ['鳥羽', '宿泊'],
    paraphrase: 'Google-native 일본어 리뷰가 보이지만 snapshot 본문은 여행 맥락 중심이다.'
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E6%88%B8%E7%94%B0%E5%AE%B6%20%E9%B3%A5%E7%BE%BD',
    review_id: 'google-native-ja-nametake-4m',
    review_date: 'about 4 months ago',
    language: 'ja',
    access: 'aside_review_tab_read',
    onsen_related_body: false,
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: ['buffet_crowding'],
    original_keywords: ['過去一番', 'バイキング'],
    paraphrase: 'Google-native 일본어 리뷰에서 직원과 뷔페 긍정이 보이나 온천 본문은 접힌 상태다.'
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E6%88%B8%E7%94%B0%E5%AE%B6%20%E9%B3%A5%E7%BE%BD',
    review_id: 'google-native-ja-chiyobubu-3w',
    review_date: 'about 3 weeks ago',
    language: 'ja',
    access: 'aside_review_tab_read',
    onsen_related_body: false,
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: [],
    original_keywords: ['写真'],
    paraphrase: 'Google-native 최신 일본어 사진 리뷰가 보이나 snapshot 본문은 온천 경험으로 판정하지 않는다.'
  },
  {
    platform: 'Tripadvisor provider card in Google Maps',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E6%88%B8%E7%94%B0%E5%AE%B6%20%E9%B3%A5%E7%BE%BD',
    review_id: 'google-provider-tripadvisor-ko-shg0111-9y',
    review_date: 'about 9 years ago',
    language: 'ko',
    access: 'provider_card_direct_read',
    google_native: false,
    onsen_related_body: false,
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: ['provider_card_not_google_native', 'access_booking'],
    original_keywords: ['역바로앞', '차량제공', '건물내부'],
    paraphrase: 'Google Maps의 Tripadvisor 공급자 카드에서 역 접근성과 복잡한 동선 신호가 보인다.'
  },
  {
    platform: 'Tripadvisor provider card in Google Maps',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E6%88%B8%E7%94%B0%E5%AE%B6%20%E9%B3%A5%E7%BE%BD',
    review_id: 'google-provider-tripadvisor-ja-2025',
    review_date: '2025-10',
    language: 'ja_to_ko_machine',
    access: 'provider_card_direct_read',
    google_native: false,
    onsen_related_body: true,
    bath_area_tags: ['open_air_public_bath'],
    signal_type_tags: ['public_bath_hot_spring', 'booking_confusion'],
    caution_tags: ['provider_card_not_google_native', 'access_booking', 'buffet_crowding'],
    original_keywords: ['온천마을', '경로가 번거롭다'],
    paraphrase: 'Google Maps의 Tripadvisor 공급자 카드에서 온천마을 동선이 번거롭다는 신호가 확인된다.'
  }
];

function addCounts(base, rows, field) {
  const out = { ...base };
  for (const row of rows) for (const key of row[field] || []) out[key] = (out[key] || 0) + 1;
  return out;
}

function csvEscape(value) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const directTotal = staticSummary.total_direct_extracted_static + browserTags.length;
const onsenTotal = staticSummary.onsen_related_body_static + browserTags.filter((r) => r.onsen_related_body).length;
const bathAreaTags = addCounts(staticSummary.bath_area_tags, browserTags, 'bath_area_tags');
const signalTypeTags = addCounts(staticSummary.signal_type_tags, browserTags, 'signal_type_tags');
const cautionTags = addCounts(staticSummary.caution_tags, browserTags, 'caution_tags');

const aggregate = {
  research_date: date,
  slug: 'toba-todaya',
  accommodation_name: '伊勢志摩国立公園 / 鳥羽温泉郷 戸田家',
  name_ko_or_en: 'Todaya / 토다야',
  data_quality_grade: 'A',
  grade_reason: '300건 이상 직접 확인, 3개 이상 직접 본문 플랫폼, 최신/저평점/온천 키워드/한국어 리뷰/Google/Naver 확인 완료.',
  visible_review_pool_minimum_mapped: 7108,
  direct_reviews_read_total: directTotal,
  onsen_related_direct_reviews_total: onsenTotal,
  direct_body_platform_count: 5,
  direct_body_platforms: ['Rakuten Travel', 'Jalan', 'JTB', 'Google Maps native', 'Tripadvisor provider card'],
  static_summary: staticSummary,
  browser_summary: {
    direct_reviews_read: browserTags.length,
    onsen_related_direct_reviews: browserTags.filter((r) => r.onsen_related_body).length,
    google_maps_checked: true,
    google_rating: 4.0,
    google_visible_review_count: 915,
    google_rating_distribution: { '5': 385, '4': 313, '3': 113, '2': 44, '1': 60 },
    google_native_direct_read: 8,
    google_native_onsen_related_reviews: 1,
    provider_cards_direct_read: 2,
    provider_card_onsen_related_reviews: 1,
    naver_checked: true,
    naver_direct_blog_read: 0,
    naver_snippet_only: true
  },
  combined_bath_area_tags: bathAreaTags,
  combined_signal_type_tags: signalTypeTags,
  combined_caution_tags: cautionTags,
  interpretive_caution: '객실 노천탕은 공식상 일부 객실에 있으나, 남관 魚魚夢露天風呂付客室 안내에는 沸かし湯 표기가 있다. 후기의 露天風呂는 객실 노천탕과 공용 野天風呂가 섞이므로 room_open_air_bath와 open_air_public_bath를 분리 해석해야 한다. 한국어 개인탕 표현은 객실탕으로 단정하지 않고 무료 대절탕/가족탕 문맥을 우선한다.'
};

const platformMapping = {
  research_date: date,
  scope: 'ready lodging deep research: Kansai/Sanin/Setouchi Tier 1 lodging',
  method: 'Rakuten API, Jalan HTML, JTB HTML로 직접 본문 수집 후 Aside Browser로 Google Maps와 Naver Search를 확인. Naver 검색 스니펫과 Google 공급자 카드는 직접 리뷰 수/Google-native 리뷰와 분리.',
  direct_review_sampling_status: 'A: 300+ direct reviews, 3+ direct-body platforms, Google/Naver checked',
  lodgings: [
    {
      slug: 'toba-todaya',
      name_ja: '伊勢志摩国立公園 / 鳥羽温泉郷 戸田家',
      name_ko_or_en: 'Todaya / 토다야',
      address: '三重県鳥羽市鳥羽1丁目24-26',
      onsen_area: '鳥羽温泉郷 / 榊原温泉（七栗の湯）引湯',
      google_maps: {
        rating: 4.0,
        visible_review_count: 915,
        rating_distribution: { '5': 385, '4': 313, '3': 113, '2': 44, '1': 60 },
        korean_reviews_visible: true,
        review_body_access: 'aside_review_tab_read plus provider_cards_direct_read',
        direct_google_native_reviews_read: 8,
        onsen_related_google_native_reviews: 1,
        ota_provider_cards_seen: ['Tripadvisor'],
        provider_card_direct_reviews_read: 2,
        provider_card_onsen_related_reviews: 1,
        caution: 'Tripadvisor 카드는 Google-native 리뷰로 세지 않았다.'
      },
      ota_review_pool_signals: {
        'Rakuten Travel': {
          visible_review_count: 1593,
          rating: null,
          review_body_access: 'direct_readable',
          direct_reviews_read: 360,
          onsen_related_direct_reviews: 159,
          source_url: 'https://travel.rakuten.co.jp/HOTEL/4761/review.html'
        },
        Jalan: {
          visible_review_count: 3128,
          rating: 4.5,
          review_body_access: 'direct_readable',
          direct_reviews_read: 210,
          onsen_related_direct_reviews: 80,
          source_url: 'https://www.jalan.net/yad322346/kuchikomi/'
        },
        JTB: {
          visible_review_count: null,
          rating: null,
          review_body_access: 'direct_readable',
          direct_reviews_read: 99,
          onsen_related_direct_reviews: 33,
          source_url: 'https://www.jtb.co.jp/kokunai-hotel/htl/6112005/review/'
        },
        Tripadvisor: {
          visible_review_count: 267,
          rating: 3.7,
          review_body_access: 'google_provider_card_direct_read',
          direct_reviews_read: 2,
          onsen_related_direct_reviews: 1
        },
        Agoda: {
          visible_review_count: null,
          rating: null,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          source_basis: 'Naver Search result'
        },
        'Hotels.com / Expedia': {
          visible_review_count: 590,
          rating: 8.8,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          source_basis: 'Naver Search result'
        },
        'Trip.com': {
          visible_review_count: 58,
          rating: 9.2,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          source_basis: 'Naver Search result'
        },
        Klook: {
          visible_review_count: null,
          rating: null,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          source_basis: 'Naver Search result'
        },
        'Naver Search / Blog': {
          visible_review_count: null,
          rating: null,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          snippet_only_results_seen: ['Agoda Todaya result', 'Hotels.com/Expedia 8.8/10 590', 'Trip.com 58', 'Klook surface', 'Hotelping 557']
        }
      },
      official_bath_facts_seen: {
        official_site_url: 'https://www.todaya.co.jp/',
        hotsprings_url: 'https://www.todaya.co.jp/hotspring/',
        rooms_url: 'https://www.todaya.co.jp/room/',
        room_open_air_bath: '공식 객실 정보: 총 168실 중 南館 114실(露天風呂付客室 5실), 嬉春亭 54실(露天風呂付客室 5실). 南館 魚魚夢露天風呂付客室은 沸かし湯 사용 표기.',
        room_bath: '일반 객실 내 욕실은 있으나 온천 객실탕으로 공식 확인하지 않음.',
        public_bath: '嬉春亭大浴場, 南館大浴場 등 대욕장 운영.',
        open_air_public_bath: '戸田家温泉村/風流野天風呂棟 湯亭. 남녀 노천/야천탕과 湯めぐり 구조. 이용 시간 24시간 표기.',
        private_bath: '무료貸切風呂 5종: しゃこ貝風呂, 浮世風呂, 瓶風呂, 釜風呂, たぬき風呂. 예약 불필요, 안에서 잠그고 이용, 제한시간 없음, 6:00-24:00.',
        family_bath: '有料 貸切風水家族風呂/貸切風水貝殻家族風呂. 45분 3,300엔. 풍수家族風呂는 沸かし湯, 貝殻風呂는 温泉 표기.',
        footbath: '足湯処 せせらぎ은 沸かし湯, 万景の足湯는 みえ尾鷲海洋深層水 이용.',
        water_handling: '공식 source-flow 여부는 확인하지 못함. 泉質은 アルカリ性単純泉, 源泉名은 榊原温泉（七栗の湯）로 표기.',
        spring_quality: 'アルカリ性単純泉.',
        public_bath_hours: '温泉村/湯亭 24시간, 무료貸切風呂 6:00-24:00, 유료 가족탕 6:00-22:00/6:30-21:30 표기.',
        tattoo_policy: '이번 확인 범위에서 구조화하지 못함.'
      },
      review_signal_keywords: ['温泉村', '露天風呂', '野天風呂', '大浴場', '貸切風呂', '家族風呂', '無料貸切風呂', '榊原温泉', '七栗の湯', 'ツルツルしない', '塩素', '個人 욕탕'],
      caution_keywords: ['露天風呂の混在', '客室露天は沸かし湯表記', '温泉感が弱いという低評価', '塩素', '古い', '虫', '館内動線', 'バイキング混雑'],
      next_sampling: 'A등급 충족. 다음 보강은 Google-native 더보기 확장, Agoda/Hotels.com/Trip.com 직접 본문, Naver Blog 원문 발굴.'
    }
  ]
};

const manifestHeader = ['research_order','slug','name_ja','name_ko_or_en','area','track','source_tier','bath_research_axes','initial_review_pool_signal','priority_reason','status'];
const manifestRow = [
  1,
  'toba-todaya',
  '伊勢志摩国立公園 / 鳥羽温泉郷 戸田家',
  'Todaya / 토다야',
  '三重県 鳥羽温泉郷',
  'ready_lodging_deep_research',
  'Tier 1',
  'open_air_public_bath;public_bath;private_bath;family_bath;room_open_air_bath;footbath',
  `visible_minimum_mapped_7108_direct_${directTotal}_onsen_${onsenTotal}`,
  '공용 노천/대욕장, 무료 대절탕, 유료 가족탕, 일부 객실 노천탕이 섞여 욕장 단위 분리가 필요한 대형 온천호텔.',
  'ready_deep_researched_A'
];

const report = `# 鳥羽温泉郷 戸田家 / Todaya 리뷰 신호 요약

## 1. 수집 브리핑

- 이번 조사 숙소: 1곳, \`伊勢志摩国立公園 / 鳥羽温泉郷 戸田家\` / Todaya / 토다야.
- 플랫폼상 전체 리뷰풀: 표면 합계 7,108건 매핑. Rakuten 1,593건, Jalan 3,128건, Google 915건, Tripadvisor 267건, Hotels.com/Expedia 590건, Trip.com 58건, Hotelping 557건 표면을 확인했다. 이 숫자는 플랫폼 노출 수이며 직접 읽은 수와 합산하지 않는다.
- 직접 읽은 리뷰 수: ${directTotal}건.
- 온천 관련 직접 리뷰 수: ${onsenTotal}건.
- 직접 본문 플랫폼 수: 5개. Rakuten Travel, Jalan, JTB, Google Maps native, Google Maps 안의 Tripadvisor provider card.
- Google 확인: Aside Browser로 Google Maps 리뷰 탭을 확인했다. 평점 4.0, Google 리뷰 915개 노출, rating_distribution은 5성 385 / 4성 313 / 3성 113 / 2성 44 / 1성 60이다. Google-native 본문 8건과 Tripadvisor 공급자 카드 2건을 분리했다.
- Naver 확인: Aside Browser로 \`도바 도다야 호텔 후기 온천 개인탕\`, \`토다야 도바 후기\`를 확인했다. Agoda, Hotels.com/Expedia, Trip.com, Klook, Hotelping 표면은 보였지만 직접 블로그 원문은 확인되지 않아 \`snippet_only\`로 분리했다.

## 2. 공식 사실

공식 온천 페이지 기준, 戸田家温泉村/風流野天風呂棟 湯亭는 남녀 노천·야천탕을 포함한湯めぐり형 공용 온천이다. 공식 표기는 泉質 \`アルカリ性単純泉\`, 源泉名 \`榊原温泉（七栗の湯）\`, 이용 시간 24시간이다.

무료 대절탕은 \`しゃこ貝風呂\`, \`浮世風呂\`, \`瓶風呂\`, \`釜風呂\`, \`たぬき風呂\` 5종으로, 예약 없이 안에서 잠그고 이용하며 제한 시간이 없다는 공식 설명이 있다. 유료 가족탕은 45분 3,300엔의 貸切風水家族風呂 계열로 분리해야 한다. 이 중 風水家族風呂는 \`沸かし湯\`, 貝殻風呂는 \`温泉\` 표기가 있어 가족탕 내부에서도 물 성격이 갈린다.

객실 노천탕은 전 객실이 아니라 일부 객실이다. 공식 객실 정보는 총 168실 중 南館 5실, 嬉春亭 5실의 露天風呂付客室을 제시한다. 특히 南館 魚魚夢露天風呂付客室은 \`露天風呂は沸かし湯\`라고 표기되어, 후기의 객실 노천탕 만족을 온천 객실탕 만족으로 바로 환산하면 안 된다.

## 3. 리뷰 신호 요약 표

| bath_area | bath_area_confidence | signal_type | signal_direction | mention_count | source_count | platform_count | contradiction_level | review_signal_status |
|---|---|---|---|---:|---:|---:|---|---|
| open_air_public_bath | specific | public_bath_hot_spring | positive | 122 | 120+ | 4 | low | strong_signal |
| public_bath | specific | public_bath_hot_spring | mixed | 79 | 75+ | 3 | medium | moderate_signal |
| private_bath | specific | private_bath_experience | positive | 54 | 50+ | 4 | low | strong_signal |
| family_bath | specific | private_bath_experience | mixed | 16 | 15+ | 3 | medium | moderate_signal |
| room_open_air_bath | specific | room_bath_hot_spring | mixed | 70 | 65+ | 3 | high | moderate_signal |
| room_bath | probable | room_bath_hot_spring | mixed | 165 | 150+ | 3 | high | moderate_signal |
| facility_wide | facility_wide | water_texture | mixed | 136 | 130+ | 3 | medium | strong_signal |
| facility_wide | facility_wide | weak_onsen_feeling | negative | 6 | 6 | 2 | medium | weak_signal |
| facility_wide | facility_wide | chlorine_smell | negative | 3 | 3 | 1 | medium | weak_signal |
| facility_wide | facility_wide | crowding | mixed | 57 | 55+ | 3 | medium | moderate_signal |

## 4. 부정/주의 신호

| issue | bath_area | evidence_level | summary | sample_count |
|---|---|---|---|---:|
| 객실 노천탕 온천 오해 | room_open_air_bath | official+review | 일부 객실 노천탕은 공식상 沸かし湯 표기가 있어, 객실 노천 만족과 온천 수질 만족을 분리해야 한다. | 70 |
| 온천감 약함 | facility_wide | review | 저평점 표본에서 \`ツルツルしない\`, \`水道水\` 취지의 약한 온천감 불만이 소수 반복된다. | 6 |
| 염소/소독 체감 | facility_wide | review | \`塩素\`, \`カルキ\` 키워드는 소수만 확인된다. | 3 |
| 대절탕 운영 기대 | private_bath | review | 무료 대절탕은 강점으로 반복되지만, 청소/대기/이용 타이밍 불만도 일부 있다. | 54 |
| 시설 노후감 | facility_wide | review | 대형 노포 호텔 특성상 \`古い\`, \`老朽\`, \`くたびれ\` 신호가 식사 만족과 함께 반복된다. | 108 |
| 동선 혼동 | facility_wide | review | 温泉村, 대욕장, 식사장으로 가는 길이 번거롭거나 복잡하다는 신호가 일부 반복된다. | 247 |

## 5. 근거 예시

| # | paraphrase | original_keyword | source_url | language | review_date |
|---:|---|---|---|---|---|
| 1 | Rakuten 저평점 표본에서 온천의 촉감이 약하고 물만 데운 듯하다는 불만이 확인된다. | \`ツルツルしない\`, \`水道水\` | https://travel.rakuten.co.jp/HOTEL/4761/review.html | ja | 2026-04-23 |
| 2 | Rakuten 최신 표본에서 대욕장과 노천풍呂를 함께 긍정적으로 언급한다. | \`大浴場\`, \`露天風呂\` | https://travel.rakuten.co.jp/HOTEL/4761/review.html | ja | 2026-06-30 |
| 3 | Rakuten 표본에서 무료 대절탕/가족탕 만족이 가족 여행 문맥과 함께 나타난다. | \`貸切\`, \`家族風呂\` | https://travel.rakuten.co.jp/HOTEL/4761/review.html | ja | 2026-06-28 |
| 4 | Rakuten 표본에서 대절탕 청소·대기 관련 불만이 소수 확인된다. | \`貸切風呂\`, \`掃除\` | https://travel.rakuten.co.jp/HOTEL/4761/review.html | ja | 2026-06-20 |
| 5 | Jalan 최신 저평점 표본에서 온천 기대보다 약한 수질 체감이 직접 제기된다. | \`温泉\`, \`ツルツルしない\` | https://www.jalan.net/yad322346/kuchikomi/ | ja | 2026-06-27 |
| 6 | Jalan 표본에서 객실 노천탕은 온천이 아니라는 본문이 보인다. | \`露天風呂付き\`, \`温泉ではない\` | https://www.jalan.net/yad322346/kuchikomi/ | ja | 2026-06-22 |
| 7 | JTB 표본에서도 温泉村·露天·貸切風呂가 숙소의 욕장 동선 신호로 나타난다. | \`温泉村\`, \`貸切風呂\` | https://www.jtb.co.jp/kokunai-hotel/htl/6112005/review/ | ja | mixed |
| 8 | Google-native 한국어 리뷰는 작은 개인 욕탕을 언급하지만 객실탕 근거는 아니므로 대절탕/가족탕 쪽으로 분리한다. | \`작은 개인 욕탕\`, \`족탕\` | https://www.google.com/maps/search/?api=1&query=%E6%88%B8%E7%94%B0%E5%AE%B6%20%E9%B3%A5%E7%BE%BD | ko | about 10 years ago |
| 9 | Google Maps의 Tripadvisor 공급자 카드에서 온천마을까지의 경로가 번거롭다는 신호가 보인다. | \`온천마을\`, \`경로가 번거롭다\` | https://www.google.com/maps/search/?api=1&query=%E6%88%B8%E7%94%B0%E5%AE%B6%20%E9%B3%A5%E7%BE%BD | ja_to_ko_machine | 2025-10 |
| 10 | Naver 검색은 한국어 예약/후기 수요와 OTA 표면을 보여주지만 직접 리뷰 본문은 아니다. | \`토다야 후기\`, \`Trip.com 58\` | https://search.naver.com/search.naver?query=%ED%86%A0%EB%8B%A4%EC%95%BC%20%EB%8F%84%EB%B0%94%20%ED%9B%84%EA%B8%B0 | ko | snippet_only |

## 6. Bathtime 해석

직접 확인 표본 ${directTotal}건 중 온천 관련 본문은 ${onsenTotal}건이며, 戸田家는 “객실탕 숙소”보다 “온천마을형 공용 노천 + 무료 대절탕” 숙소로 보는 편이 데이터에 맞다. 공용 노천/대욕장과 무료貸切風呂 신호는 강하게 반복되지만, 일부 객실 노천탕은 공식상 沸かし湯이므로 객실 노천 만족을 온천 수질 만족으로 섞으면 안 된다.

한국어 리뷰의 \`개인 욕탕\` 표현은 객실 안 탕이 아니라 공용 대절탕·가족탕 이용 가능성으로 해석하는 것이 안전하다. Bathtime에서는 \`open_air_public_bath\`, \`public_bath\`, \`private_bath\`, \`family_bath\`, \`room_open_air_bath\`를 모두 별도 욕장 단위로 보여줘야 한다.

## 7. Gaps

- Google Maps 리뷰 탭은 Aside Browser로 열었고 Google-native 8건을 직접 확인했다. 다만 더보기 확장과 키워드 검색까지는 하지 않았다.
- Naver는 검색 결과만 확인되어 \`snippet_only\`다. 직접 Naver Blog/Cafe 원문은 확보하지 못했다.
- Agoda, Hotels.com/Expedia, Trip.com, Klook은 Naver 표면 또는 검색 표면만 확인했고 직접 본문 수에는 넣지 않았다.
- 공식 pH, 원천 온도, 문신 정책은 이번 확인 범위에서 구조화하지 못했다.
- 300건 목표는 충족했다. A급 유지 보강을 하려면 Google-native 더보기 확장과 글로벌 OTA 본문 50-100건을 추가하면 한국어/영어 표본 균형이 좋아진다.
`;

await fs.writeFile(path.join(outDir, `todaya_browser_review_tags_${date}.json`), JSON.stringify(browserTags, null, 2));
await fs.writeFile(path.join(outDir, `todaya_signal_aggregate_${date}.json`), JSON.stringify(aggregate, null, 2));
await fs.writeFile(path.join(outDir, `platform_mapping_${date}.json`), JSON.stringify(platformMapping, null, 2));
await fs.writeFile(path.join(outDir, `deep_research_manifest_${date}.csv`), `${manifestHeader.join(',')}\n${manifestRow.map(csvEscape).join(',')}\n`);
await fs.writeFile(path.join(outDir, `review_signal_summary_${date}.md`), report);

console.log(JSON.stringify({
  directTotal,
  onsenTotal,
  directBodyPlatformCount: 5,
  visibleReviewPoolMinimumMapped: 7108,
  files: [
    `todaya_browser_review_tags_${date}.json`,
    `todaya_signal_aggregate_${date}.json`,
    `platform_mapping_${date}.json`,
    `deep_research_manifest_${date}.csv`,
    `review_signal_summary_${date}.md`
  ]
}, null, 2));
