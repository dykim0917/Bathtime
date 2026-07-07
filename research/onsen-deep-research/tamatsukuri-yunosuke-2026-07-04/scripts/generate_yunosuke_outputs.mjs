import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');
const date = '2026-07-04';
const staticSummary = JSON.parse(await fs.readFile(path.join(outDir, `yunosuke_static_review_tags_summary_${date}.json`), 'utf8'));

const browserTags = [
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3',
    review_id: 'google-native-ko-jeongsuk-1y',
    review_date: 'about 1 year ago',
    language: 'ko',
    access: 'aside_review_tab_read',
    onsen_related_body: true,
    bath_area_tags: ['public_bath', 'open_air_public_bath'],
    signal_type_tags: ['public_bath_hot_spring'],
    caution_tags: [],
    original_keywords: ['온탕', '노천탕'],
    paraphrase: 'Google-native 한국어 리뷰에서 온탕과 노천탕 이용이 직접 언급된다.'
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3',
    review_id: 'google-native-ko-hanki-1y',
    review_date: 'about 1 year ago',
    language: 'ko',
    access: 'aside_review_tab_read',
    onsen_related_body: true,
    bath_area_tags: ['public_bath', 'open_air_public_bath'],
    signal_type_tags: ['public_bath_hot_spring', 'crowding'],
    caution_tags: [],
    original_keywords: ['대욕장', '야외', '아무도 없었다'],
    paraphrase: 'Google-native 한국어 리뷰에서 아침 대욕장과 야외탕을 이용했고, 사람이 없는 시간대를 긍정적으로 언급한다.'
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3',
    review_id: 'google-native-ko-beeryong-4y',
    review_date: 'about 4 years ago',
    language: 'ko',
    access: 'aside_review_tab_read',
    onsen_related_body: true,
    bath_area_tags: ['room_open_air_bath'],
    signal_type_tags: ['room_bath_hot_spring', 'water_texture'],
    caution_tags: [],
    original_keywords: ['최상층 노천탕 첨부', '온천원천'],
    paraphrase: 'Google-native 한국어 리뷰에서 최상층 객실 노천탕과 원천 사용 체감을 강하게 긍정한다.'
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3',
    review_id: 'google-native-ja-nimi-1m',
    review_date: 'about 1 month ago',
    language: 'ja_to_ko_machine',
    access: 'aside_review_tab_read',
    onsen_related_body: false,
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: ['access_booking'],
    original_keywords: ['駐車場', '案内'],
    paraphrase: 'Google-native 최신 일본어 리뷰에서 직원 안내와 주차 동선이 보이나 욕장 본문은 접힌 상태다.'
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3',
    review_id: 'google-native-ja-toto-1m',
    review_date: 'about 1 month ago',
    language: 'ja_to_ko_machine',
    access: 'aside_review_tab_read',
    onsen_related_body: true,
    bath_area_tags: ['public_bath', 'open_air_public_bath'],
    signal_type_tags: ['public_bath_hot_spring', 'water_texture'],
    caution_tags: ['public_bath_size_expectation'],
    original_keywords: ['内湯', '露天風呂', 'なめらか'],
    paraphrase: 'Google-native 일본어 리뷰에서 내탕 1개와 노천탕 1개, 넓고 매끄러운 물 체감을 언급한다.'
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3',
    review_id: 'google-native-ja-long-5m',
    review_date: 'about 5 months ago',
    language: 'ja_to_ko_machine',
    access: 'aside_review_tab_read',
    onsen_related_body: false,
    bath_area_tags: ['room_bath'],
    signal_type_tags: [],
    caution_tags: [],
    original_keywords: ['部屋風呂以外'],
    paraphrase: 'Google-native 일본어 리뷰에서 객실 욕실 외 시설 만족이 보이나 온천 본문으로 직접 세지 않는다.'
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3',
    review_id: 'google-native-ja-osanai-3m',
    review_date: 'about 3 months ago',
    language: 'ja_to_ko_machine',
    access: 'aside_review_tab_read',
    onsen_related_body: true,
    bath_area_tags: ['open_air_public_bath'],
    signal_type_tags: ['public_bath_hot_spring', 'water_texture', 'crowding'],
    caution_tags: ['cleanliness_aging'],
    original_keywords: ['露天탕', '湯と肌感', '独占状態'],
    paraphrase: 'Google-native 일본어 리뷰에서 노천탕 분위기와 피부 체감, 독점 상태 시간대를 긍정한다.'
  },
  {
    platform: 'Google Maps native',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3',
    review_id: 'google-native-ja-mm-5m',
    review_date: 'about 5 months ago',
    language: 'ja_to_ko_machine',
    access: 'aside_review_tab_read',
    onsen_related_body: true,
    bath_area_tags: ['public_bath', 'open_air_public_bath', 'family_bath'],
    signal_type_tags: ['public_bath_hot_spring', 'private_bath_experience', 'water_texture'],
    caution_tags: ['temperature_control'],
    original_keywords: ['温泉', '男女入替', '家族風呂'],
    paraphrase: 'Google-native 일본어 리뷰에서 온천, 남녀 교체 이용, 가족탕 존재를 언급한다.'
  },
  {
    platform: 'Tripadvisor provider card in Google Maps',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3',
    review_id: 'google-provider-tripadvisor-ko-dohee-8y',
    review_date: 'about 8 years ago',
    language: 'ko',
    access: 'provider_card_direct_read',
    google_native: false,
    onsen_related_body: true,
    bath_area_tags: ['public_bath'],
    signal_type_tags: ['public_bath_hot_spring'],
    caution_tags: ['provider_card_not_google_native'],
    original_keywords: ['대욕장', '사진과 실제'],
    paraphrase: 'Google Maps 안의 Tripadvisor 카드에서 대욕장이 사진 기대와 다소 다르다는 한국어 신호가 보인다.'
  },
  {
    platform: 'Tripadvisor provider card in Google Maps',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3',
    review_id: 'google-provider-tripadvisor-ja-akio-2y',
    review_date: 'about 2 years ago',
    language: 'ja_to_ko_machine',
    access: 'provider_card_direct_read',
    google_native: false,
    onsen_related_body: true,
    bath_area_tags: ['public_bath', 'open_air_public_bath'],
    signal_type_tags: ['public_bath_hot_spring', 'water_texture', 'crowding'],
    caution_tags: ['provider_card_not_google_native', 'public_bath_size_expectation'],
    original_keywords: ['メノウ', '大浴場', '露天風呂'],
    paraphrase: 'Tripadvisor 공급자 카드에서 메노우 대욕장, 큰 노천탕, 혼잡 스트레스가 적다는 신호가 보인다.'
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
  slug: 'tamatsukuri-yunosuke',
  accommodation_name: '玉造グランドホテル長生閣',
  name_ko_or_en: 'Tamatsukuri Grand Hotel Choseikaku / 다마쓰쿠리 그랜드 호텔 초세이카쿠',
  data_quality_grade: 'A',
  grade_reason: '300건 이상 직접 확인, 3개 이상 직접 본문 플랫폼, 최신/저평점/온천 키워드/한국어 Google 리뷰/Naver 확인 완료.',
  visible_review_pool_minimum_mapped: 5238,
  direct_reviews_read_total: directTotal,
  onsen_related_direct_reviews_total: onsenTotal,
  direct_body_platform_count: 5,
  direct_body_platforms: ['Rakuten Travel', 'Jalan', 'JTB', 'Google Maps native', 'Tripadvisor provider card'],
  static_summary: staticSummary,
  browser_summary: {
    direct_reviews_read: browserTags.length,
    onsen_related_direct_reviews: browserTags.filter((r) => r.onsen_related_body).length,
    google_maps_checked: true,
    google_rating: 4.1,
    google_visible_review_count: 986,
    google_rating_distribution: { '5': 404, '4': 381, '3': 153, '2': 16, '1': 32 },
    google_native_direct_read: 8,
    google_native_onsen_related_reviews: 6,
    provider_cards_direct_read: 2,
    provider_card_onsen_related_reviews: 2,
    naver_checked: true,
    naver_direct_blog_read: 0,
    naver_snippet_only: true
  },
  combined_bath_area_tags: bathAreaTags,
  combined_signal_type_tags: signalTypeTags,
  combined_caution_tags: cautionTags,
  interpretive_caution: '자동 태그의 room_bath는 일반 객실 욕실과 객실 노천/온천 객실 문맥이 섞인다. Bathtime 표시는 공식/리뷰에서 명확한 객실 노천탕만 room_open_air_bath로 보고, 핵심 신호는 메노우 대욕장과 공용 노천탕, 미인탕 수질로 두는 편이 안전하다.'
};

const platformMapping = {
  research_date: date,
  scope: 'ready lodging deep research: Kansai/Sanin/Setouchi Tier 1 lodging',
  method: 'Rakuten API, Jalan HTML, JTB HTML로 직접 본문 수집 후 Aside Browser로 Google Maps와 Naver Search를 확인. Naver 검색 스니펫과 Google 공급자 카드는 직접 리뷰 수/Google-native 리뷰와 분리.',
  direct_review_sampling_status: 'A: 300+ direct reviews, 3+ direct-body platforms, Google/Naver checked',
  lodgings: [
    {
      slug: 'tamatsukuri-yunosuke',
      name_ja: '玉造グランドホテル長生閣',
      name_ko_or_en: 'Tamatsukuri Grand Hotel Choseikaku / 다마쓰쿠리 그랜드 호텔 초세이카쿠',
      address: '島根県松江市玉湯町玉造331',
      onsen_area: '玉造温泉',
      google_maps: {
        rating: 4.1,
        visible_review_count: 986,
        rating_distribution: { '5': 404, '4': 381, '3': 153, '2': 16, '1': 32 },
        korean_reviews_visible: true,
        review_body_access: 'aside_review_tab_read plus provider_cards_direct_read',
        direct_google_native_reviews_read: 8,
        onsen_related_google_native_reviews: 6,
        ota_provider_cards_seen: ['Tripadvisor'],
        provider_card_direct_reviews_read: 2,
        provider_card_onsen_related_reviews: 2,
        caution: 'Tripadvisor 카드는 Google-native 리뷰로 세지 않았다.'
      },
      ota_review_pool_signals: {
        'Rakuten Travel': {
          visible_review_count: 1658,
          rating: null,
          review_body_access: 'direct_readable',
          direct_reviews_read: 360,
          onsen_related_direct_reviews: 187,
          source_url: 'https://travel.rakuten.co.jp/HOTEL/10743/review.html'
        },
        Jalan: {
          visible_review_count: 2206,
          rating: 4.5,
          review_body_access: 'direct_readable',
          direct_reviews_read: 162,
          onsen_related_direct_reviews: 107,
          source_url: 'https://www.jalan.net/yad306939/kuchikomi/'
        },
        JTB: {
          visible_review_count: null,
          rating: null,
          review_body_access: 'direct_readable',
          direct_reviews_read: 67,
          onsen_related_direct_reviews: 34,
          source_url: 'https://www.jtb.co.jp/kokunai-hotel/htl/7323006/review/'
        },
        Tripadvisor: {
          visible_review_count: 178,
          rating: 3.8,
          review_body_access: 'google_provider_card_direct_read',
          direct_reviews_read: 2,
          onsen_related_direct_reviews: 2
        },
        'Trip.com': {
          visible_review_count: 50,
          rating: 8.8,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          source_basis: 'Naver Search result'
        },
        'Expedia / Hotels.com': {
          visible_review_count: 160,
          rating: 8.6,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          source_basis: 'Naver Search result'
        },
        'Naver Search / Cafe': {
          visible_review_count: null,
          rating: null,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          snippet_only_results_seen: ['네일동 카페 숙박 후기 surface', 'Trip.com 50', 'Expedia/Hotels.com 160', 'Rakuten Travel Korean lodging surface']
        }
      },
      official_bath_facts_seen: {
        official_site_url: 'https://www.choseikaku.co.jp/',
        rakuten_onsen_url: 'https://travel.rakuten.co.jp/HOTEL/10743/10743_onsen.html',
        room_open_air_bath: '일부 객실에 温泉付き最上階客室/露天風呂付 객실명이 확인된다. 전 객실 아님.',
        room_bath: '일반 객실 욕실은 있으나 온천 객실탕으로 공식 단정하지 않음.',
        public_bath: 'Rakuten/공식 표면: 出雲神話 콘셉트의 大浴場, 파워스톤 めのう를 깐 めのう風呂.',
        open_air_public_bath: 'Rakuten 온천 페이지: お風呂の種類에 露天風呂 표기.',
        private_bath: '직접 공식 확인 범위에서는 주요 축 아님. 후기에는 貸切風呂 소수.',
        family_bath: 'Google-native 리뷰와 일부 후기에서 가족탕 존재 신호가 있으나 공식 상세 구조는 추가 확인 필요.',
        water_handling: '源泉かけ流し 주장은 이번 확인 범위에서 구조화하지 못함.',
        spring_quality: 'Rakuten: 単純温泉, 低張性弱アルカリ性泉, カルシウム・ナトリウム硫酸塩泉. ゆこゆこ 표면: pH8.4, 자가원천 블렌드 언급.',
        public_bath_hours: '이번 확인 범위에서 구조화하지 못함.',
        tattoo_policy: '이번 확인 범위에서 구조화하지 못함.'
      },
      review_signal_keywords: ['めのう風呂', 'メノウ風呂', '大浴場', '露天風呂', '温泉', '玉造温泉', '美肌の湯', 'すべすべ', 'ツルツル', '最上階露天風呂付', '家族風呂'],
      caution_keywords: ['古い', '清掃', '温度', '混雑', '写真と実際', '部屋風呂混在', '家族風呂公式未整理'],
      next_sampling: 'A등급 충족. 다음 보강은 Google-native 더보기 확장, Yahoo/Relux 직접 본문, Naver 카페 원문 로그인 접근 확인.'
    }
  ]
};

const manifestHeader = ['research_order','slug','name_ja','name_ko_or_en','area','track','source_tier','bath_research_axes','initial_review_pool_signal','priority_reason','status'];
const manifestRow = [
  1,
  'tamatsukuri-yunosuke',
  '玉造グランドホテル長生閣',
  'Tamatsukuri Grand Hotel Choseikaku / 다마쓰쿠리 그랜드 호텔 초세이카쿠',
  '島根県 玉造温泉',
  'ready_lodging_deep_research',
  'Tier 1',
  'public_bath;open_air_public_bath;room_open_air_bath;family_bath;facility_wide',
  `visible_minimum_mapped_5238_direct_${directTotal}_onsen_${onsenTotal}`,
  '메노우 대욕장, 공용 노천탕, 일부 객실 노천탕, 미인탕 수질 신호가 섞여 욕장 단위 분리가 필요한 대형 온천호텔.',
  'ready_deep_researched_A'
];

const report = `# 玉造グランドホテル長生閣 / Choseikaku 리뷰 신호 요약

## 1. 수집 브리핑

- 이번 조사 숙소: 1곳, \`玉造グランドホテル長生閣\` / Tamatsukuri Grand Hotel Choseikaku / 다마쓰쿠리 그랜드 호텔 초세이카쿠.
- 플랫폼상 전체 리뷰풀: 최소 5,238건 매핑. Rakuten 1,658건, Jalan 2,206건, Google 986건, Tripadvisor 178건, Trip.com 50건, Expedia/Hotels.com 160건 표면 기준이다. 이 숫자는 플랫폼 노출 수이며 직접 읽은 수와 합산하지 않는다.
- 직접 읽은 리뷰 수: ${directTotal}건.
- 온천 관련 직접 리뷰 수: ${onsenTotal}건.
- 직접 본문 플랫폼 수: 5개. Rakuten Travel, Jalan, JTB, Google Maps native, Google Maps 안의 Tripadvisor provider card.
- Google 확인: Aside Browser로 Google Maps 리뷰 탭을 확인했다. 평점 4.1, Google 리뷰 986개 노출, rating_distribution은 5성 404 / 4성 381 / 3성 153 / 2성 16 / 1성 32다. Google-native 본문 8건과 Tripadvisor 공급자 카드 2건을 분리했다.
- Naver 확인: Aside Browser로 \`일본 시마네 다마쓰쿠리 초세이카쿠 후기 온천\`을 확인했다. Trip.com, Expedia/Hotels.com, 네일동 카페 표면은 보였지만 직접 원문은 열지 않았으므로 \`snippet_only\`로 분리했다.

## 2. 공식 사실

공식 사이트와 Rakuten 온천 페이지 기준, 이 숙소의 대표 온천 시설은 \`めのう風呂\`가 있는 대욕장이다. Rakuten 온천 페이지는 출雲神話 콘셉트의 대욕장과 파워스톤 \`めのう\`를 깐 욕조를 소개하며, 욕장 종류로 \`温泉\`, \`大浴場\`, \`露天風呂\`를 제시한다.

泉質은 Rakuten 표면 기준 \`単純温泉\`, \`低張性弱アルカリ性泉\`, \`カルシウム・ナトリウム硫酸塩泉\`이다. 별도 OTA 표면에서는 pH 8.4와 자가원천 블렌드 언급이 보이나, 이번 보고서에서는 공식/OTA 시설 주장으로만 둔다.

객실 노천탕은 전 객실이 아니다. Rakuten/Jalan 리뷰의 객실명과 Google-native 한국어 본문에서 \`最上階\`, \`露天風呂付\`, \`温泉付き最上階客室\` 신호가 보이므로 일부 객실 노천탕 축은 분리하되, 일반 객실 욕실과 섞지 않는다.

## 3. 리뷰 신호 요약 표

| bath_area | bath_area_confidence | signal_type | signal_direction | mention_count | source_count | platform_count | contradiction_level | review_signal_status |
|---|---|---|---|---:|---:|---:|---|---|
| public_bath | specific | public_bath_hot_spring | positive | 312 | 300+ | 5 | low | strong_signal |
| open_air_public_bath | specific | public_bath_hot_spring | positive | 30 | 30+ | 4 | low | strong_signal |
| room_open_air_bath | specific | room_bath_hot_spring | positive | 51 | 50+ | 4 | medium | strong_signal |
| room_bath | probable | room_bath_hot_spring | mixed | 148 | 140+ | 3 | high | moderate_signal |
| family_bath | probable | private_bath_experience | neutral | 19 | 18+ | 3 | medium | moderate_signal |
| private_bath | unclear | private_bath_experience | neutral | 13 | 13 | 2 | medium | weak_signal |
| facility_wide | facility_wide | water_texture | positive | 247 | 240+ | 5 | low | strong_signal |
| facility_wide | facility_wide | crowding | mixed | 50 | 48+ | 4 | medium | moderate_signal |
| facility_wide | facility_wide | weak_onsen_feeling | negative | 5 | 5 | 2 | medium | weak_signal |
| facility_wide | facility_wide | chlorine_smell | negative | 1 | 1 | 1 | low | insufficient |

## 4. 부정/주의 신호

| issue | bath_area | evidence_level | summary | sample_count |
|---|---|---|---|---:|
| 객실탕/객실 노천탕 혼재 | room_bath | review_tagging | 일반 객실 욕실, 객실 노천탕, 최상층 온천 객실 신호가 자동 태그에서 섞인다. 객실 노천탕만 별도 표시해야 한다. | 148 |
| 노후/청소 | facility_wide | review | \`古い\`, \`清掃\`, \`老朽\` 계열이 반복되지만 대체로 리뉴얼·청결 긍정과 같이 나타난다. | 100 |
| 대욕장 크기/기대 | public_bath | review | 대욕장 넓음은 반복되나 일부는 사진 기대와 실제 차이를 말한다. | 98 |
| 온도 | public_bath | review | \`ぬるい\`, \`熱い\`, \`温度\` 신호는 소수다. | 19 |
| 혼잡 | facility_wide | review | 시간대에 따라 독점 상태/혼잡 회피가 모두 나타난다. | 50 |
| 가족탕/대절탕 공식 구조 미확인 | family_bath | review+gap | 가족탕 존재 신호는 있으나 공식 상세 구조는 이번 범위에서 충분히 구조화하지 못했다. | 19 |

## 5. 근거 예시

| # | paraphrase | original_keyword | source_url | language | review_date |
|---:|---|---|---|---|---|
| 1 | Rakuten 표본에서 메노우 대욕장과 온천 만족이 함께 반복된다. | \`めのう風呂\`, \`大浴場\` | https://travel.rakuten.co.jp/HOTEL/10743/review.html | ja | 2026-06-19 |
| 2 | Rakuten 표본에서 미인탕 체감과 피부 매끈함이 반복된다. | \`美肌の湯\`, \`ツルツル\` | https://travel.rakuten.co.jp/HOTEL/10743/review.html | ja | 2026-06-07 |
| 3 | Rakuten 표본에서 객실 노천탕/최상층 객실 신호가 보인다. | \`温泉付き最上階客室\`, \`露天風呂\` | https://travel.rakuten.co.jp/HOTEL/10743/review.html | ja | 2026-04-11 |
| 4 | Jalan 최신 표본에서 메노우탕과 큰 돌 노천탕이 함께 긍정적으로 언급된다. | \`メノウのお風呂\`, \`大きな石の露天風呂\` | https://www.jalan.net/yad306939/kuchikomi/ | ja | 2026-06-21 |
| 5 | Jalan 표본에서 객실 노천탕이 온천으로 계속 나온다는 신호가 확인된다. | \`お部屋の露天風呂\`, \`温泉が出続け\` | https://www.jalan.net/yad306939/kuchikomi/ | ja | 2026-06-06 |
| 6 | JTB 표본에서도 대욕장·노천탕·정원 분위기 신호가 반복된다. | \`大浴場\`, \`露天風呂\` | https://www.jtb.co.jp/kokunai-hotel/htl/7323006/review/ | ja | mixed |
| 7 | Google-native 한국어 리뷰에서 온탕과 노천탕을 직접 이용한 신호가 보인다. | \`온탕\`, \`노천탕\` | https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3 | ko | about 1 year ago |
| 8 | Google-native 한국어 리뷰에서 최상층 객실 노천탕과 원천 사용 체감이 강하게 긍정된다. | \`최상층 노천탕 첨부\`, \`온천원천\` | https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3 | ko | about 4 years ago |
| 9 | Tripadvisor 공급자 카드에서는 대욕장이 사진 기대와 실제가 다르다는 한국어 주의 신호가 있다. | \`대욕장\`, \`사진과 실제\` | https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3 | ko | about 8 years ago |
| 10 | Naver 검색은 Trip.com/Expedia/카페 수요 신호를 보이지만 직접 본문은 아니다. | \`네일동\`, \`Trip.com 50\` | https://search.naver.com/search.naver?query=%EC%9D%BC%EB%B3%B8%20%EC%8B%9C%EB%A7%88%EB%84%A4%20%EB%8B%A4%EB%A7%88%EC%93%B0%EC%BF%A0%EB%A6%AC%20%EC%B4%88%EC%84%B8%EC%9D%B4%EC%B9%B4%EC%BF%A0%20%ED%9B%84%EA%B8%B0%20%EC%98%A8%EC%B2%9C | ko | snippet_only |

## 6. Bathtime 해석

직접 확인 표본 ${directTotal}건 중 온천 관련 본문은 ${onsenTotal}건이며, 이 숙소는 메노우 대욕장과 공용 노천탕, 미인탕 수질 신호가 강하게 반복된다. 객실 노천탕도 뚜렷하지만 전 객실형이 아니므로, Bathtime에서는 \`public_bath\`와 \`open_air_public_bath\`를 중심축으로 두고 \`room_open_air_bath\`를 일부 객실 옵션으로 분리하는 편이 데이터에 맞다.

한국어 Google-native 리뷰에서도 대욕장/노천탕과 최상층 객실 노천탕이 모두 확인된다. 다만 일반 \`部屋風呂\` 태그는 객실 욕실과 온천 객실이 섞이므로, 객실탕 만족 신호로 과대 해석하지 않는 편이 안전하다.

## 7. Gaps

- Google Maps 리뷰 탭은 Aside Browser로 열었고 Google-native 8건을 직접 확인했다. 더보기 확장과 키워드 검색까지는 하지 않았다.
- Naver는 검색 결과와 카페 표면만 확인되어 \`snippet_only\`다. 네일동 카페 원문은 로그인/접근 확인 전이라 직접 리뷰 수에 넣지 않았다.
- Yahoo Travel/Relux는 검색 표면상 직접 본문 가능성이 있으나 이번 A등급 달성 후 추가 표본으로 넣지 않았다.
- 공식 이용 시간, 문신 정책, 가수/가온/순환/소독 표기는 이번 확인 범위에서 구조화하지 못했다.
- 300건 목표는 충족했다. 다음에 더 보강한다면 Google-native 키워드 검색, Yahoo/Relux 직접 본문, Naver 카페 원문 접근을 우선한다.
`;

await fs.writeFile(path.join(outDir, `yunosuke_browser_review_tags_${date}.json`), JSON.stringify(browserTags, null, 2));
await fs.writeFile(path.join(outDir, `yunosuke_signal_aggregate_${date}.json`), JSON.stringify(aggregate, null, 2));
await fs.writeFile(path.join(outDir, `platform_mapping_${date}.json`), JSON.stringify(platformMapping, null, 2));
await fs.writeFile(path.join(outDir, `deep_research_manifest_${date}.csv`), `${manifestHeader.join(',')}\n${manifestRow.map(csvEscape).join(',')}\n`);
await fs.writeFile(path.join(outDir, `review_signal_summary_${date}.md`), report);

console.log(JSON.stringify({
  directTotal,
  onsenTotal,
  directBodyPlatformCount: 5,
  visibleReviewPoolMinimumMapped: 5238,
  files: [
    `yunosuke_browser_review_tags_${date}.json`,
    `yunosuke_signal_aggregate_${date}.json`,
    `platform_mapping_${date}.json`,
    `deep_research_manifest_${date}.csv`,
    `review_signal_summary_${date}.md`
  ]
}, null, 2));
