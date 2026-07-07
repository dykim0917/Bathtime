import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');
const date = '2026-07-04';

const staticSummary = JSON.parse(
  await fs.readFile(path.join(outDir, `hanamusubi_static_review_tags_summary_${date}.json`), 'utf8')
);

const browserTags = [
  {
    platform: 'Google Reviews',
    source_url: 'https://www.google.com/search?q=%E6%9C%89%E9%A6%AC%E6%B8%A9%E6%B3%89%20%E5%BE%A1%E5%B9%B8%E8%8D%98%20%E8%8A%B1%E7%B5%90%E3%81%B3',
    review_id: 'google-native-ko-kim-juho',
    review_date: '2025',
    language: 'ko',
    access: 'direct_readable',
    google_native: true,
    onsen_related_body: true,
    bath_area_tags: ['private_bath'],
    signal_type_tags: ['private_bath_experience'],
    caution_tags: [],
    original_keywords: ['프라이빗 온천'],
    paraphrase: '한국어 Google-native 리뷰에서 친구들과 프라이빗 온천을 이용했다는 만족 신호가 보인다.'
  },
  {
    platform: 'Google Reviews',
    source_url: 'https://www.google.com/search?q=%E6%9C%89%E9%A6%AC%E6%B8%A9%E6%B3%89%20%E5%BE%A1%E5%B9%B8%E8%8D%98%20%E8%8A%B1%E7%B5%90%E3%81%B3',
    review_id: 'google-native-ko-seok',
    review_date: '2024',
    language: 'ko',
    access: 'direct_readable',
    google_native: true,
    onsen_related_body: true,
    bath_area_tags: ['public_bath'],
    signal_type_tags: ['public_bath_hot_spring'],
    caution_tags: ['operation_photo_caution'],
    original_keywords: ['온천도 좋았고', '폰 사진'],
    paraphrase: '온천 자체는 긍정이나, 욕장 내 휴대폰 촬영 관련 운영 불안 신호가 함께 나온다.'
  },
  {
    platform: 'Google Reviews',
    source_url: 'https://www.google.com/search?q=%E6%9C%89%E9%A6%AC%E6%B8%A9%E6%B3%89%20%E5%BE%A1%E5%B9%B8%E8%8D%98%20%E8%8A%B1%E7%B5%90%E3%81%B3',
    review_id: 'google-native-ko-yorollo',
    review_date: '2025',
    language: 'ko',
    access: 'direct_readable',
    google_native: true,
    onsen_related_body: true,
    bath_area_tags: ['public_bath', 'open_air_public_bath'],
    signal_type_tags: ['public_bath_hot_spring'],
    caution_tags: [],
    original_keywords: ['온천도 깔끔', '야외온천'],
    paraphrase: 'Google-native 한국어 리뷰에서 공용 야외 온천의 청결·만족 신호가 확인된다.'
  },
  {
    platform: 'Google Reviews',
    source_url: 'https://www.google.com/search?q=%E6%9C%89%E9%A6%AC%E6%B8%A9%E6%B3%89%20%E5%BE%A1%E5%B9%B8%E8%8D%98%20%E8%8A%B1%E7%B5%90%E3%81%B3',
    review_id: 'google-native-en-jk-hit',
    review_date: '2019',
    language: 'ko',
    access: 'direct_readable',
    google_native: true,
    onsen_related_body: true,
    bath_area_tags: ['private_bath'],
    signal_type_tags: ['private_bath_experience', 'booking_confusion'],
    caution_tags: ['access_booking'],
    original_keywords: ['private bath', 'fully booked'],
    paraphrase: '늦은 체크인 후 프라이빗탕 예약이 차서 다음날 아침으로 밀린 예약 혼동 신호가 있다.'
  },
  {
    platform: 'Google Reviews',
    source_url: 'https://www.google.com/search?q=%E6%9C%89%E9%A6%AC%E6%B8%A9%E6%B3%89%20%E5%BE%A1%E5%B9%B8%E8%8D%98%20%E8%8A%B1%E7%B5%90%E3%81%B3',
    review_id: 'google-native-ko-shin',
    review_date: '2026-02',
    language: 'ko',
    access: 'partial',
    google_native: true,
    onsen_related_body: false,
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: ['lounge_operation'],
    original_keywords: ['라운지', '객실'],
    paraphrase: 'Google-native 한국어 최신 리뷰이나 Aside 화면에서는 온천 본문이 확인되지 않았다.'
  },
  {
    platform: 'Google Reviews',
    source_url: 'https://www.google.com/search?q=%E6%9C%89%E9%A6%AC%E6%B8%A9%E6%B3%89%20%E5%BE%A1%E5%B9%B8%E8%8D%98%20%E8%8A%B1%E7%B5%90%E3%81%B3',
    review_id: 'google-native-ko-cho',
    review_date: '2026-01',
    language: 'ko',
    access: 'partial',
    google_native: true,
    onsen_related_body: false,
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: ['access_booking'],
    original_keywords: ['송영', '직원'],
    paraphrase: 'Google-native 한국어 리뷰이나 확인 화면에서는 송영·응대 중심으로 온천 신호는 없다.'
  },
  {
    platform: 'Naver Blog',
    source_url: 'https://blog.naver.com/daymany/223735979971',
    review_id: 'naver-blog-daymany-2025-01-23',
    review_date: '2025-01-23',
    language: 'ko',
    access: 'direct_readable',
    onsen_related_body: true,
    bath_area_tags: ['private_bath', 'family_bath'],
    signal_type_tags: ['private_bath_experience', 'booking_confusion'],
    caution_tags: ['temperature_control'],
    original_keywords: ['개인탕(가족탕)', '금탕', '40분', '4,400엔'],
    paraphrase: 'Naver Blog 원문에서 객실탕이 아니라 예약제 개인탕/가족탕을 이용한 한국어 체험이 확인된다.'
  },
  {
    platform: 'Naver Blog',
    source_url: 'https://blog.naver.com/belief_me/223554688484',
    review_id: 'naver-blog-belief-me-2024-08-20',
    review_date: '2024-08-20',
    language: 'ko',
    access: 'direct_readable',
    onsen_related_body: true,
    bath_area_tags: ['public_bath', 'open_air_public_bath', 'private_bath'],
    signal_type_tags: ['public_bath_hot_spring', 'private_bath_experience', 'crowding', 'booking_confusion'],
    caution_tags: ['access_booking'],
    original_keywords: ['대욕탕', '금탕(노천탕)', '은탕', '개인욕탕', '패스'],
    paraphrase: 'Naver Blog 원문에서 7층 대욕장, 금탕 노천, 은탕을 구분하고 개인욕탕은 유료라 이용하지 않았다고 적는다.'
  },
  {
    platform: 'Naver Blog',
    source_url: 'https://blog.naver.com/mhj2357/223303357058',
    review_id: 'naver-blog-mhj2357-2023-12-27',
    review_date: '2023-12-27',
    language: 'ko',
    access: 'direct_readable',
    onsen_related_body: false,
    bath_area_tags: [],
    signal_type_tags: [],
    caution_tags: ['cleanliness_aging', 'insects', 'price_expectation', 'temperature_control'],
    original_keywords: ['숙박비', '머리카락', '벌레'],
    paraphrase: 'Naver Blog 원문은 식사·객실 컨디션 중심이며 욕장 체험은 직접 신호로 세지 않는다.'
  }
];

const browserDirect = browserTags.length;
const browserOnsen = browserTags.filter((r) => r.onsen_related_body).length;
const directTotal = staticSummary.total_direct_extracted_static + browserDirect;
const onsenTotal = staticSummary.onsen_related_body_static + browserOnsen;

function addCounts(base, rows, field) {
  const out = { ...base };
  for (const row of rows) {
    for (const key of row[field] || []) out[key] = (out[key] || 0) + 1;
  }
  return out;
}

const bathAreaTags = addCounts(staticSummary.bath_area_tags, browserTags, 'bath_area_tags');
const signalTypeTags = addCounts(staticSummary.signal_type_tags, browserTags, 'signal_type_tags');
const cautionTags = addCounts(staticSummary.caution_tags, browserTags, 'caution_tags');

const aggregate = {
  research_date: date,
  slug: 'arima-hanamusubi',
  accommodation_name: '有馬温泉 御幸荘 花結び',
  name_ko_or_en: 'Miyukiso Hanamusubi / Arima Hot Spring Ryokan Hanamusubi / 아리마 핫 스프링 료칸 하나무스비',
  data_quality_grade: 'A',
  grade_reason: '300건 이상 직접 확인, 5개 직접 본문 플랫폼, 최신/저평점/온천 키워드/한국어/Google/Naver 층화 완료.',
  visible_review_pool_minimum_mapped: 4246,
  direct_reviews_read_total: directTotal,
  onsen_related_direct_reviews_total: onsenTotal,
  direct_body_platform_count: 5,
  direct_body_platforms: ['Rakuten Travel', 'Jalan', 'JTB', 'Google Reviews', 'Naver Blog'],
  static_summary: staticSummary,
  browser_summary: {
    direct_reviews_read: browserDirect,
    onsen_related_direct_reviews: browserOnsen,
    google_native_direct_read: 6,
    google_native_onsen_related: 4,
    naver_blog_direct_read: 3,
    naver_blog_onsen_related: 2,
    provider_cards_excluded_from_google_native: ['Trip.com', 'Tripadvisor']
  },
  combined_bath_area_tags: bathAreaTags,
  combined_signal_type_tags: signalTypeTags,
  combined_caution_tags: cautionTags,
  interpretive_caution: '정적 태그의 room_bath는 객실명/본문 문맥 기반 탐색 태그를 포함한다. 공식 FAQ상 일반 객실 내탕은 온천이 아니며, 온천 객실탕 신호는 6층 5개 금泉 노천 객실 중심으로 해석해야 한다.'
};

const platformMapping = {
  research_date: date,
  scope: 'ready lodging deep research: Kansai/Sanin/Setouchi Tier 1 lodging',
  method: '정적 OTA 본문 수집 후 Aside Browser로 Google/Naver를 직접 확인. 검색 스니펫, OTA 요약, Google 패널 내 공급자 카드는 직접 리뷰 수에서 제외.',
  direct_review_sampling_status: 'A: 300+ direct reviews, 3+ direct-body platforms, Google/Naver checked',
  lodgings: [
    {
      slug: 'arima-hanamusubi',
      name_ja: '有馬温泉 御幸荘 花結び',
      name_ko_or_en: 'Miyukiso Hanamusubi / Arima Hot Spring Ryokan Hanamusubi',
      address: '兵庫県神戸市北区有馬町351 / 351 Arimacho, Kita Ward, Kobe, Hyogo 651-1401',
      onsen_area: '有馬温泉',
      google_maps: {
        rating: 4.1,
        visible_review_count: 1044,
        rating_distribution: null,
        korean_reviews_visible: true,
        review_body_access: 'direct_readable',
        direct_google_native_reviews_read: 6,
        onsen_related_google_native_reviews: 4,
        ota_provider_cards_seen: ['Trip.com', 'Tripadvisor'],
        caution: 'Google 검색 패널/Travel 화면의 Trip.com·Tripadvisor 카드는 Google-native 리뷰에서 제외했다.'
      },
      ota_review_pool_signals: {
        'Rakuten Travel': {
          visible_review_count: 2125,
          rating: null,
          review_body_access: 'direct_readable',
          direct_reviews_read: 360,
          onsen_related_direct_reviews: 196,
          source_url: 'https://travel.rakuten.co.jp/HOTEL/9576/review.html',
          note: 'Rakuten 숙소 화면에는 お客さまの声 2,517건 표기도 보였으나, 수집 JSON의 PRELOADED_STATE total 2,125를 보수적 리뷰풀로 사용.'
        },
        Jalan: {
          visible_review_count: 114,
          rating: null,
          review_body_access: 'direct_readable',
          direct_reviews_read: 114,
          onsen_related_direct_reviews: 76,
          source_url: 'https://www.jalan.net/yad349968/kuchikomi/'
        },
        JTB: {
          visible_review_count: 57,
          rating: null,
          review_body_access: 'direct_readable',
          direct_reviews_read: 65,
          onsen_related_direct_reviews: 28,
          source_url: 'https://www.jtb.co.jp/kokunai-hotel/htl/6435022/review/',
          note: 'JTB 화면은 全57件の評価 표기. 수집기는 페이지 중복/평가 블록 포함으로 65개 본문 블록을 추출했으나, 플랫폼 리뷰풀과 직접 본문 수는 별도 표기.'
        },
        'Booking.com': {
          visible_review_count: 470,
          rating: 8.9,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          source_basis: 'Naver Search result'
        },
        'Trip.com': {
          visible_review_count: 209,
          rating: 9.3,
          review_body_access: 'snippet_only/provider_card_only',
          direct_reviews_read: 0,
          source_basis: 'Naver Search result and Google Travel provider card'
        },
        Tripadvisor: {
          visible_review_count: 127,
          rating: 3.6,
          review_body_access: 'provider_card_only',
          direct_reviews_read: 0,
          source_basis: 'Google Travel provider card'
        },
        JAPANiCAN: {
          visible_review_count: 100,
          rating: 4.2,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          source_basis: 'Naver Search result'
        },
        'Rakuten Travel Korean': {
          visible_review_count: 717,
          rating: 4.2,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          source_basis: 'Naver Search result',
          duplicate_risk: 'Rakuten Travel 본체와 중복 가능성이 있어 visible minimum 합계에는 더하지 않음.'
        },
        'Yahoo Travel': {
          visible_review_count: null,
          rating: null,
          review_body_access: 'snippet_only/not_sampled_direct',
          direct_reviews_read: 0,
          source_url: 'https://travel.yahoo.co.jp/00030104/'
        },
        Ikkyu: {
          visible_review_count: null,
          rating: null,
          review_body_access: 'snippet_only/not_sampled_direct',
          direct_reviews_read: 0,
          source_url: 'https://www.ikyu.com/00030104/'
        },
        'Naver Search / Blog': {
          visible_review_count: null,
          rating: null,
          review_body_access: 'direct_readable plus snippet_only',
          direct_reviews_read: 3,
          onsen_related_direct_reviews: 2,
          independent_authors: 3,
          snippet_only_results_seen: ['Booking.com 470', 'Trip.com 209', 'Rakuten Travel Korean 717', 'JAPANiCAN 100', 'Naver Search blog previews']
        }
      },
      official_bath_facts_seen: {
        official_site_url: 'https://www.hanamusubi.co.jp/',
        rooms_url: 'https://www.hanamusubi.co.jp/rooms/',
        hotspa_url: 'https://www.hanamusubi.co.jp/hotspa/',
        facilities_url: 'https://www.hanamusubi.co.jp/facilities/',
        faq_url: 'https://www.hanamusubi.co.jp/faq/',
        room_open_air_bath: '공식: 6층에 5개 타입의 金泉付き露天風呂客室. 해당 객실 노천은 24시간 金泉 이용 가능.',
        room_bath: '공식 FAQ: 일반 객실의 실내 욕실은 온천이 아니며, 온천은 노천탕 객실에 한정.',
        public_bath: '공식: 7층 展望大浴場 花がすみ/花ごよみ.',
        open_air_public_bath: '공식: 공용 대욕장에 金泉露天風呂와 銀泉露天風呂 계열 표기. 성별 교체 운영.',
        private_bath: '공식: 展望金泉貸切露天風呂 花ごころ. 사전 예약, 45분, 유료.',
        family_bath: 'OTA/Rakuten/JTB에서 家族風呂 표기가 보이나 공식 명칭은 貸切露天風呂. 한국어 개인탕/가족탕 리뷰는 private_bath/family_bath로 병기.',
        water_handling: 'Rakuten: 天然温泉, 含食塩石膏泉. JTB: 温泉（循環ろ過式、加温している）. 공식 상세의 가수/소독/pH는 이번 표본에서 구조화하지 못함.',
        spring_quality: 'Rakuten: 含食塩石膏泉. JTB: 含鉄泉. 有馬特有の金泉/銀泉 표기.',
        source_temperature: 'JTB: 湧出口泉温 98.6℃.',
        public_bath_hours: '공식/JTB: 대욕장 6:00-9:30, 12:00-24:00 계열 표기. Naver 후기에는 6:30-9:30, 12:00-00:00로 인지된 신호가 있음.',
        tattoo_policy: '공식 확인 범위에서 문신 정책은 구조화하지 못함.',
        reservation_required: '貸切露天風呂 花ごころ는 사전 예약 필요.'
      },
      review_signal_keywords: [
        '金泉',
        '銀泉',
        '露天風呂',
        '客室露天風呂',
        '金泉露天',
        '大浴場',
        '貸切風呂',
        '家族風呂',
        '個人탕',
        '개인탕(가족탕)',
        '금탕',
        '은탕',
        'カルキ',
        '送迎',
        '有馬温泉街'
      ],
      caution_keywords: ['送迎', '予約', '大浴場が小さい', 'カルキ', '客室内風呂は温泉ではない', '가격대', '역에서 멀다', '촬영 운영'],
      next_sampling: 'A등급은 충족. 다음 보강은 Google rating_distribution 캡처, Ikkyu/Yahoo direct 본문, Booking.com/Trip.com 직접 본문 로그인/동적 접근 확인.'
    }
  ]
};

function csvEscape(value) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const manifestHeader = [
  'research_order',
  'slug',
  'name_ja',
  'name_ko_or_en',
  'area',
  'track',
  'source_tier',
  'bath_research_axes',
  'initial_review_pool_signal',
  'priority_reason',
  'status'
];
const manifestRow = [
  1,
  'arima-hanamusubi',
  '有馬温泉 御幸荘 花結び',
  'Miyukiso Hanamusubi / 아리마 핫 스프링 료칸 하나무스비',
  '兵庫県 神戸市 有馬温泉',
  'ready_lodging_deep_research',
  'Tier 1',
  'room_open_air_bath;public_bath;open_air_public_bath;private_bath;family_bath',
  `visible_minimum_mapped_4246_direct_${directTotal}_onsen_${onsenTotal}`,
  '金泉 객실 노천 5실과 유료 대절/가족탕, 공용 금천/은천 대욕장 신호가 섞여 있어 욕장 단위 분리가 필요한 ready 숙소.',
  'ready_deep_researched_A'
];

const report = `# 有馬温泉 御幸荘 花結び / Miyukiso Hanamusubi 리뷰 신호 요약

## 1. 수집 브리핑

- 이번 조사 숙소: 1곳, \`有馬温泉 御幸荘 花結び\` / Miyukiso Hanamusubi / 아리마 핫 스프링 료칸 하나무스비.
- 플랫폼상 전체 리뷰풀: 최소 4,246건 매핑. Rakuten 2,125건, Jalan 114건, JTB 57건, Google 1,044건, Booking.com 470건, Trip.com 209건, Tripadvisor 127건, JAPANiCAN 100건 기준이다. Rakuten Korean 717건은 Rakuten 본체와 중복 가능성이 있어 최소 합계에서 제외했다. 이 숫자는 플랫폼 노출 수이며 직접 읽은 수와 합산하지 않는다.
- 직접 읽은 리뷰 수: ${directTotal}건.
- 온천 관련 직접 리뷰 수: ${onsenTotal}건.
- 직접 본문 플랫폼 수: 5개. Rakuten Travel, Jalan, JTB, Google Reviews, Naver Blog.
- Google 확인: Aside Browser로 Google 검색 패널을 확인했다. 평점 4.1, Google 리뷰 1,044개 노출. Google-native 리뷰 6건을 직접 확인했고, 그중 온천 관련 본문은 4건이다. Google 화면 안의 Trip.com/Tripadvisor 공급자 카드는 Google-native 리뷰에서 제외했다.
- Naver 확인: Aside Browser로 Naver Search와 Blog 원문을 확인했다. 검색 결과 설명은 \`snippet_only\`로 분리했고, Naver Blog 원문 3건만 직접 리뷰로 계산했다. 그중 온천 관련 본문은 2건이다.
- 접근 실패/제한: Google rating_distribution은 확보하지 못했다. Booking.com, Trip.com, JAPANiCAN, Rakuten Travel Korean은 Naver 검색 결과 또는 Google 공급자 카드 수준으로 확인되어 직접 리뷰 수에서 제외했다. Ikkyu/Yahoo Travel은 URL과 공식/OTA 설명 표면은 확인했으나 A등급 달성 후 직접 본문 표본에는 포함하지 않았다.

## 2. 공식 사실

공식 사이트 기준으로 이 숙소의 온천 경험은 세 축으로 나뉜다. 첫째, 6층에 5개 타입의 \`金泉付き露天風呂客室\`이 있고, 해당 객실 노천은 24시간 金泉 이용 가능하다고 안내된다. 둘째, 7층에 展望大浴場 \`花がすみ\`와 \`花ごよみ\`가 있으며, 金泉/銀泉 계열의 공용 욕장으로 설명된다. 셋째, \`展望金泉貸切露天風呂 花ごころ\`는 사전 예약이 필요한 유료 45분 대절탕이다.

중요한 분리점은 객실 내탕이다. 공식 FAQ는 일반 객실의 실내 욕실은 온천이 아니며, 온천은 노천탕 객실에 한정된다고 설명한다. 따라서 후기의 \`部屋風呂\`, \`객실 욕실\`, \`개인탕\` 표현은 객실 노천탕인지, 일반 객실 내탕인지, 유료 대절/가족탕인지 문맥별로 분리해야 한다. JTB는 온천을 순환여과식·가온으로 표기하고, 湧出口泉温 98.6℃와 含鉄泉을 제시한다. Rakuten은 天然温泉, 含食塩石膏泉, 大浴場/露天風呂/家族風呂를 표기한다.

## 3. 리뷰 신호 요약 표

| bath_area | bath_area_confidence | signal_type | signal_direction | mention_count | source_count | platform_count | contradiction_level | review_signal_status |
|---|---|---|---|---:|---:|---:|---|---|
| room_open_air_bath | specific | room_bath_hot_spring | positive | 124 | 120+ | 3 | low | strong_signal |
| room_bath | probable | room_bath_hot_spring | mixed | 164 | 160+ | 3 | medium | moderate_signal |
| private_bath | specific | private_bath_experience | mixed | 33 | 33 | 5 | low | moderate_signal |
| family_bath | probable | private_bath_experience | mixed | 6 | 6 | 3 | medium | weak_signal |
| public_bath | specific | public_bath_hot_spring | mixed | 56 | 55+ | 5 | low | moderate_signal |
| open_air_public_bath | specific | public_bath_hot_spring | positive | 26 | 26 | 4 | low | moderate_signal |
| facility_wide | facility_wide | water_texture | mixed | 147 | 145+ | 3 | medium | strong_signal |
| facility_wide | facility_wide | booking_confusion | mixed | 164 | 160+ | 5 | low | strong_signal |
| facility_wide | facility_wide | weak_onsen_feeling | negative | 4 | 4 | 1 | medium | weak_signal |
| facility_wide | facility_wide | chlorine_smell | negative | 3 | 3 | 1 | medium | weak_signal |

주의: \`room_bath\` 164건은 자동 태그상 \`部屋風呂\` 및 객실명 문맥을 넓게 잡은 탐색 신호다. 공식 FAQ상 일반 객실 내탕은 온천이 아니므로, Bathtime의 핵심 객실탕 신호는 \`room_open_air_bath\` 5실 金泉 노천 객실로 해석해야 한다.

## 4. 근거 예시

| # | paraphrase | original_keyword | source_url | language | review_date |
|---:|---|---|---|---|---|
| 1 | Rakuten 최신 객실 타입 리뷰에서 金泉露天風呂付きジュニアスイート가 반복된다. | \`金泉\`, \`露天風呂付き\`, \`ひのき風呂\` | https://travel.rakuten.co.jp/HOTEL/9576/review.html | ja | 2026-06-10 |
| 2 | Rakuten 가족 여행 리뷰에서 유료 대절탕/가족탕 이용 신호가 객실 경험과 함께 나온다. | \`露天\`, \`貸切\`, \`貸切風呂\` | https://travel.rakuten.co.jp/HOTEL/9576/review.html | ja | 2026-06-26 |
| 3 | Rakuten 저평점에 가까운 표본에서 대욕장 규모와 입지 기대 차이가 함께 언급된다. | \`大浴場\`, \`温泉街\`, \`送迎\` | https://travel.rakuten.co.jp/HOTEL/9576/review.html | ja | 2026-03-15 |
| 4 | Rakuten 표본에서 銀泉 대욕장에 대해 약한 온천감/소독 냄새 신호가 소수 확인된다. | \`銀泉\`, \`大浴場\`, \`カルキ\` | https://travel.rakuten.co.jp/HOTEL/9576/review.html | ja | 2024-09-09 |
| 5 | Google-native 한국어 리뷰에서 프라이빗 온천을 친구들과 이용했다는 만족 신호가 확인된다. | \`프라이빗 온천\` | https://www.google.com/search?q=%E6%9C%89%E9%A6%AC%E6%B8%A9%E6%B3%89%20%E5%BE%A1%E5%B9%B8%E8%8D%98%20%E8%8A%B1%E7%B5%90%E3%81%B3 | ko | 2025 |
| 6 | Google-native 한국어 리뷰에서 야외 온천과 청결을 함께 긍정한다. | \`온천도 깔끔\`, \`야외온천\` | https://www.google.com/search?q=%E6%9C%89%E9%A6%AC%E6%B8%A9%E6%B3%89%20%E5%BE%A1%E5%B9%B8%E8%8D%98%20%E8%8A%B1%E7%B5%90%E3%81%B3 | ko | 2025 |
| 7 | Naver Blog 원문은 개인탕을 객실탕이 아니라 예약제 가족탕으로 설명한다. | \`개인탕(가족탕)\`, \`금탕\`, \`40분\` | https://blog.naver.com/daymany/223735979971 | ko | 2025-01-23 |
| 8 | Naver Blog 원문은 7층 대욕장, 금탕 노천, 은탕을 분리하고 유료 개인욕탕은 이용하지 않았다고 적는다. | \`대욕탕\`, \`금탕(노천탕)\`, \`은탕\`, \`개인욕탕\` | https://blog.naver.com/belief_me/223554688484 | ko | 2024-08-20 |
| 9 | Naver Blog 원문 중 일부는 식사·객실 컨디션 중심이라 온천 직접 신호로 세지 않았다. | \`숙박비\`, \`머리카락\`, \`벌레\` | https://blog.naver.com/mhj2357/223303357058 | ko | 2023-12-27 |

## 5. Bathtime 해석

직접 확인 표본 ${directTotal}건 중 온천 관련 본문은 ${onsenTotal}건이며, 金泉 객실 노천과 대욕장/대절탕 신호가 모두 반복된다. 다만 이 숙소는 “전 객실 온천탕 숙소”가 아니라, 공식상 5개 객실만 金泉 노천탕을 갖고 일반 객실 내탕은 온천이 아니므로 객실 타입 오해를 강하게 관리해야 한다.

후기 신호는 객실 金泉 노천탕의 만족, 7층 공용 금탕/은탕 대욕장, 유료 대절/가족탕 예약 경험으로 나뉜다. 한국어 리뷰의 \`개인탕\`은 객실 안의 개별탕으로 바로 번역하면 안 되고, 이번 표본에서는 주로 \`private_bath/family_bath\` 문맥으로 확인된다.

## 6. Gaps

- Google rating_distribution은 Aside Browser 화면에서 직접 확보하지 못했다.
- Booking.com, Trip.com, Agoda는 직접 본문 표본을 열지 못했고, Naver 검색 결과 또는 Google 공급자 카드 수준으로만 남겼다.
- Google Travel 안의 Trip.com/Tripadvisor 공급자 카드는 Google-native 리뷰로 세지 않았다.
- Ikkyu/Yahoo Travel은 직접 본문 표본을 추가하지 않았다. 다음 보강 시 두 플랫폼의 리뷰 본문 접근성을 확인하면 대절탕/가족탕 신호를 더 정밀하게 분리할 수 있다.
- 공식 pH, 문신 정책, 소독/가수 상세 표기는 이번 확인 범위에서 구조화하지 못했다.
`;

await fs.writeFile(path.join(outDir, `hanamusubi_browser_review_tags_${date}.json`), JSON.stringify(browserTags, null, 2));
await fs.writeFile(path.join(outDir, `hanamusubi_signal_aggregate_${date}.json`), JSON.stringify(aggregate, null, 2));
await fs.writeFile(path.join(outDir, `platform_mapping_${date}.json`), JSON.stringify(platformMapping, null, 2));
await fs.writeFile(
  path.join(outDir, `deep_research_manifest_${date}.csv`),
  `${manifestHeader.join(',')}\n${manifestRow.map(csvEscape).join(',')}\n`
);
await fs.writeFile(path.join(outDir, `review_signal_summary_${date}.md`), report);

console.log(JSON.stringify({
  directTotal,
  onsenTotal,
  directBodyPlatformCount: 5,
  visibleReviewPoolMinimumMapped: 4246,
  files: [
    `hanamusubi_browser_review_tags_${date}.json`,
    `hanamusubi_signal_aggregate_${date}.json`,
    `platform_mapping_${date}.json`,
    `deep_research_manifest_${date}.csv`,
    `review_signal_summary_${date}.md`
  ]
}, null, 2));
