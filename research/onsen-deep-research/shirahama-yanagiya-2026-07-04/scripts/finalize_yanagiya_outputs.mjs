import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');
const TODAY = '2026-07-04';

const staticSummary = JSON.parse(await fs.readFile(path.join(outDir, `yanagiya_static_review_tags_summary_${TODAY}.json`), 'utf8'));

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const platformCounts = {
  'Rakuten Travel': {
    rating: null,
    visible_review_count: 77,
    visible_review_count_note: 'Rakuten API로 접근 가능한 공개 본문 총량. 후보/페이지 표면의 더 큰 리뷰 수와 직접 확인 수를 섞지 않음.',
    review_body_access: 'direct_readable',
    direct_reviews_read: staticSummary.by_platform['Rakuten Travel'].direct,
    onsen_related_direct_reviews: staticSummary.by_platform['Rakuten Travel'].onsen_body,
    source_url: 'https://travel.rakuten.co.jp/HOTEL/9133/review.html'
  },
  Jalan: {
    rating: null,
    visible_review_count: 89,
    candidate_surface_visible_count: 1666,
    visible_review_count_note: '현재 정적 본문 접근 가능 총량은 89건. 후보 단계 표면 1,666건은 별도 참고값.',
    review_body_access: 'direct_readable',
    direct_reviews_read: staticSummary.by_platform.Jalan.direct,
    onsen_related_direct_reviews: staticSummary.by_platform.Jalan.onsen_body,
    source_url: 'https://www.jalan.net/yad364545/kuchikomi/'
  },
  'Google Maps native': {
    rating: 4.3,
    visible_review_count: 530,
    rating_distribution: { '5': 253, '4': 206, '3': 53, '2': 9, '1': 9 },
    korean_reviews_visible: true,
    review_body_access: 'partial',
    direct_reviews_read: 31,
    onsen_related_direct_reviews: 23,
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E7%99%BD%E6%B5%9C%E6%B8%A9%E6%B3%89%20%E5%AE%B6%E6%97%8F%E3%81%A8%E3%81%99%E3%81%94%E3%81%99%E7%99%BD%E6%B5%9C%E3%81%AE%E5%AE%BF%20%E6%9F%B3%E5%B1%8B',
    note: 'Aside Browser로 확인. Google 패널 내 Tripadvisor 공급자 카드는 Google-native에서 제외.'
  },
  JAPANiCAN: {
    rating: 4.5,
    visible_review_count: 98,
    review_body_access: 'direct_readable',
    direct_reviews_read: 75,
    onsen_related_direct_reviews: 38,
    source_url: 'https://www.japanican.com/hotel/japan/shirahama/yanagiya-shirahama',
    note: 'JAPANiCAN/Rurubu Travel 표시 댓글 75건을 15페이지까지 직접 확인.'
  },
  Tripadvisor: {
    rating: 3.9,
    visible_review_count: 84,
    rating_distribution: { excellent: 24, good: 38, average: 13, poor: 4, terrible: 5 },
    review_body_access: 'partial',
    direct_reviews_read: 40,
    onsen_related_direct_reviews: 26,
    low_rating_reviews_read: 6,
    source_url: 'https://www.tripadvisor.com/Hotel_Review-g1121351-d1171439-Reviews-Yanagiya-Shirahama_cho_Nishimuro_gun_Wakayama_Prefecture_Kinki.html',
    note: 'Aside Browser에서 언어 필터를 All languages로 바꿔 p1-p4 40건 확인. 이후 필터가 흔들려 partial로 표기.'
  },
  'Trip.com': {
    rating: 8.8,
    visible_review_count: 4,
    review_body_access: 'direct_readable',
    direct_reviews_read: 4,
    onsen_related_direct_reviews: 1,
    source_url: 'https://ae.trip.com/hotels/shirahama-hotel-detail-4533378/yanagiya/',
    note: '4 verified reviews만 직접 수에 포함. AI review summary는 제외.'
  },
  'Naver Blog': {
    rating: null,
    visible_review_count: null,
    review_body_access: 'direct_readable',
    direct_reviews_read: 1,
    onsen_related_direct_reviews: 1,
    source_url: 'https://blog.naver.com/harimau81/223686770918',
    note: '한국어 블로그 본문 1건 직접 확인.'
  },
  'Naver Search/Cafe': {
    rating: null,
    visible_review_count: null,
    review_body_access: 'snippet_only',
    direct_reviews_read: 0,
    onsen_related_direct_reviews: 0,
    source_url: 'https://search.naver.com/search.naver?query=%EC%8B%9C%EB%9D%BC%ED%95%98%EB%A7%88%20%EC%95%BC%EB%82%98%EA%B8%B0%EC%95%BC%20%ED%9B%84%EA%B8%B0',
    note: '검색/Cafe 결과는 본문 미개봉 또는 스니펫만 확인. 직접 수에서 제외.'
  },
  Agoda: {
    rating: null,
    visible_review_count: null,
    review_body_access: 'partial',
    direct_reviews_read: 0,
    onsen_related_direct_reviews: 0,
    source_url: 'https://www.agoda.com/yanagiya-ryokan/hotel/shirahama-jp.html',
    note: 'Aside에서 표면/속성 확인. 개별 본문 안정 추출 전이라 직접 수 제외.'
  },
  Booking: {
    rating: null,
    visible_review_count: null,
    review_body_access: 'not_found',
    direct_reviews_read: 0,
    onsen_related_direct_reviews: 0
  }
};

const directReadTotal = Object.values(platformCounts).reduce((sum, row) => sum + (row.direct_reviews_read || 0), 0);
const onsenDirectTotal = Object.values(platformCounts).reduce((sum, row) => sum + (row.onsen_related_direct_reviews || 0), 0);
const directBodyPlatformCount = Object.values(platformCounts).filter((row) => (row.direct_reviews_read || 0) > 0).length;

const browserReviewTags = {
  research_date: TODAY,
  slug: 'shirahama-yanagiya',
  sampling_note: 'Aside Browser and dynamic page inspection addendum. Counts are direct bodies read in browser unless review_body_access is snippet_only/partial with direct count 0.',
  platform_counts: platformCounts,
  sample_evidence: [
    { platform: 'Google Maps native', language: 'en/ko UI', review_date: null, bath_area: 'room_open_air_bath', signal_type: 'room_bath_hot_spring', paraphrase: '객실 노천탕과 100% 원천/수질 만족을 함께 언급.', original_keyword: ['room open-air bath', '100% source-flowing spring'], source_url: platformCounts['Google Maps native'].source_url },
    { platform: 'Google Maps native', language: 'en/ko UI', review_date: null, bath_area: 'room_bath', signal_type: 'booking_confusion', paraphrase: '반노천 객실과 예약/객실 타입 기대 차이가 같이 나타남.', original_keyword: ['semi-open-air room bath', 'booking mismatch'], source_url: platformCounts['Google Maps native'].source_url },
    { platform: 'Naver Blog', language: 'ko', review_date: '2024-12-08', bath_area: 'open_air_public_bath', signal_type: 'public_bath_hot_spring', paraphrase: '식사 전 노천탕 이용과 백할원천 표기를 직접 설명.', original_keyword: ['노천탕', '百割源泉', '백할원천'], source_url: platformCounts['Naver Blog'].source_url },
    { platform: 'JAPANiCAN', language: 'en', review_date: null, bath_area: 'private_bath', signal_type: 'private_bath_experience', paraphrase: '유료 private outdoor hotspring은 좋았지만 공용탕은 작다는 평가.', original_keyword: ['private outdoor hotspring', 'public bath small'], source_url: platformCounts.JAPANiCAN.source_url },
    { platform: 'JAPANiCAN', language: 'en/ja', review_date: null, bath_area: 'room_open_air_bath', signal_type: 'room_bath_hot_spring', paraphrase: '객실 바다 전망과 객실 내 온천/노천 계열 만족이 반복됨.', original_keyword: ['sea view', 'private bath room'], source_url: platformCounts.JAPANiCAN.source_url },
    { platform: 'Tripadvisor', language: 'ja', review_date: '2018-03', bath_area: 'facility_wide', signal_type: 'water_texture', paraphrase: '온천과 요리를 최고점으로 평가하고 가케나가시·탕량·적온을 언급.', original_keyword: ['温泉も料理も', 'かけ流し', '湯量', '適温'], source_url: platformCounts.Tripadvisor.source_url },
    { platform: 'Tripadvisor', language: 'ja', review_date: '2018-02', bath_area: 'open_air_public_bath', signal_type: 'public_bath_hot_spring', paraphrase: '원천가케나가시와 추운 날 노천탕 쾌적성을 함께 언급.', original_keyword: ['源泉掛け流し', '露天風呂'], source_url: platformCounts.Tripadvisor.source_url },
    { platform: 'Tripadvisor', language: 'ja', review_date: '2019-01', bath_area: 'family_bath', signal_type: 'private_bath_experience', paraphrase: '유료 가족탕 실내탕의 청결·노후감 불만이 강하게 제기됨.', original_keyword: ['家族風呂', '小汚い', '清潔感'], source_url: platformCounts.Tripadvisor.source_url },
    { platform: 'Tripadvisor', language: 'ja', review_date: '2018-08', bath_area: 'family_bath', signal_type: 'private_bath_experience', paraphrase: '가족 노천탕 이용 중 부상과 응대 불만을 장문으로 기록.', original_keyword: ['家族露天風呂', '岩', '怪我'], source_url: platformCounts.Tripadvisor.source_url },
    { platform: 'Trip.com', language: 'translated_en', review_date: '2024-11-13', bath_area: 'public_bath', signal_type: 'public_bath_hot_spring', paraphrase: '실내탕과 노천탕을 이용했다는 직접 본문이 확인됨.', original_keyword: ['hot spring', 'indoor bath', 'open-air bath'], source_url: platformCounts['Trip.com'].source_url }
  ],
  snippet_only_signals: [
    { platform: 'Naver Search/Cafe', original_keyword: ['온천물 좋음', '오션뷰 욕조', '프라이빗 온천'], not_counted_reason: '검색 결과 스니펫 또는 Cafe 검색 표면. 직접 리뷰 수 제외.' }
  ]
};

const signalRows = [
  ['room_open_air_bath', 'specific', 'room_bath_hot_spring', 'positive', 74, 5, 'low', 'strong_signal', '객실 노천탕/온천 노천 객실은 Rakuten/Jalan/Google/JAPANiCAN/Tripadvisor에서 반복된다. 단 `久遠`·노천풍로부 객실 등 일부 객실 옵션이다.'],
  ['room_bath', 'specific', 'room_bath_hot_spring', 'mixed', 62, 4, 'medium', 'strong_signal', '객실 내탕·반노천·유닛바스 언급이 많다. 공식상 `彩` 반노천은 끓인 물이므로 온천 객실 노천탕과 반드시 분리해야 한다.'],
  ['public_bath', 'specific', 'public_bath_hot_spring', 'positive', 44, 6, 'low', 'strong_signal', '대욕장/실내탕의 원천·수질 만족이 반복된다. 일부 리뷰는 규모가 작다고 보지만 물 자체 평가는 대체로 좋다.'],
  ['open_air_public_bath', 'specific', 'public_bath_hot_spring', 'positive', 33, 6, 'low', 'strong_signal', '공용 노천탕은 `露天風呂`, `百割源泉`, `源泉掛け流し`와 함께 반복된다.'],
  ['private_bath', 'specific', 'private_bath_experience', 'mixed', 8, 3, 'medium', 'weak_signal', '대절/프라이빗탕은 JAPANiCAN 긍정과 Tripadvisor 가족탕 부정이 갈린다. 표본상 별도 관리가 필요하다.'],
  ['family_bath', 'specific', 'private_bath_experience', 'negative', 4, 2, 'medium', 'weak_signal', '가족탕/가족 노천탕은 Tripadvisor 저평점에서 부상·청결·사진 기대 차이로 부정 신호가 뚜렷하다. 객실탕과 합치면 안 된다.'],
  ['facility_wide', 'facility_wide', 'water_texture', 'positive', 151, 7, 'low', 'strong_signal', '`源泉`, `源泉かけ流し`, `百割源泉`, `泉質`, `湯の花`가 다중 플랫폼에서 반복된다.'],
  ['facility_wide', 'facility_wide', 'weak_onsen_feeling', 'negative', 2, 1, 'low', 'insufficient', '온천감 약함은 직접 표본에서 반복되지 않는다.'],
  ['facility_wide', 'facility_wide', 'chlorine_smell', 'negative', 0, 0, 'none', 'insufficient', '`塩素`/`カルキ` 반복 신호는 직접 표본에서 확인되지 않았다.'],
  ['public_bath', 'specific', 'crowding', 'mixed', 12, 4, 'medium', 'moderate_signal', '공용탕은 크지 않다는 언급, 가족/성수기 맥락, 한산했다는 반대 신호가 함께 있다.'],
  ['facility_wide', 'facility_wide', 'booking_confusion', 'mixed', 44, 5, 'medium', 'strong_signal', '예약, 객실 타입, 식사 포함 여부, 송영/체크인 안내 혼동이 온천 경험 주변 운영 신호로 반복된다.']
].map(([bath_area, bath_area_confidence, signal_type, signal_direction, mention_count, platform_count, contradiction_level, review_signal_status, interpretation]) => ({
  accommodation_name: '白浜温泉 家族とすごす白浜の宿 柳屋',
  bath_area,
  bath_area_confidence,
  signal_type,
  signal_direction,
  mention_count,
  source_count: mention_count,
  platform_count,
  contradiction_level,
  review_signal_status,
  interpretation
}));

const aggregate = {
  research_date: TODAY,
  slug: 'shirahama-yanagiya',
  accommodation_name: '白浜温泉 家族とすごす白浜の宿 柳屋',
  name_ko_or_en: 'Yanagiya / 시라하마 야나기야',
  area: '白浜温泉, 和歌山県西牟婁郡白浜町1870',
  data_quality_grade: 'A',
  direct_read_total: directReadTotal,
  onsen_related_direct_total: onsenDirectTotal,
  direct_body_platform_count: directBodyPlatformCount,
  visible_review_pool_conservative_sum: 882,
  visible_review_pool_note: 'Google 530 + JAPANiCAN 98 + Tripadvisor 84 + Trip.com 4 + Rakuten 접근 가능 77 + Jalan 접근 가능 89 + Rakuten/Jalan 직접 본문 접근 총량 기준. Jalan 후보 표면 1,666건은 별도 참고.',
  platform_counts: platformCounts,
  static_bath_area_tags: staticSummary.bath_area_tags,
  static_signal_type_tags: staticSummary.signal_type_tags,
  signal_rows: signalRows,
  status: ['ready', 'split_needed'],
  split_needed_reason: '온천 객실 노천탕, 끓인 물 반노천 객실, 공용 대욕장/노천탕, 유료 대절·가족탕 신호가 서로 다름.'
};

const mapping = {
  research_date: TODAY,
  scope: 'shirahama-yanagiya ready lodging deep research',
  method: 'Rakuten/Jalan static extraction plus Aside Browser verification for Google Maps, Naver, JAPANiCAN, Tripadvisor, Trip.com. AI summaries, provider cards, and search snippets excluded from direct totals.',
  direct_review_sampling_status: 'A: 317 direct reviews, 7 direct-body platforms, latest/low-rating/onsen-keyword/Korean/direct room-type strata checked.',
  lodgings: [
    {
      slug: 'shirahama-yanagiya',
      name_ja: '白浜温泉 家族とすごす白浜の宿 柳屋',
      name_ko_or_en: 'Yanagiya / 시라하마 야나기야',
      official_url: 'https://www.yanagiya-hotel.jp/',
      address: '〒649-2211 和歌山県西牟婁郡白浜町1870',
      onsen_area: '白浜温泉',
      google_maps: {
        rating: platformCounts['Google Maps native'].rating,
        visible_review_count: platformCounts['Google Maps native'].visible_review_count,
        rating_distribution: platformCounts['Google Maps native'].rating_distribution,
        korean_reviews_visible: true,
        direct_reviews_read: platformCounts['Google Maps native'].direct_reviews_read,
        onsen_related_direct_reviews: platformCounts['Google Maps native'].onsen_related_direct_reviews,
        provider_cards_seen: ['Tripadvisor'],
        provider_cards_counted_as_google_native: false
      },
      ota_review_pool_signals: platformCounts,
      official_bath_facts_seen: [
        '공식: 百割源泉 / 源泉百% 掛け流し를 표방.',
        '공식: 木の湯・石の湯 대욕장/노천탕 표면.',
        '공식 객실: `露天風呂付 久遠`, `露天風呂付 和室`, `露天風呂付 和洋室`는 노천풍로부(온천)로 표기.',
        '공식 객실: `彩Jrスイート`, `彩プレミアムスイート`는 半露天風呂付(沸かし湯)로 표기.',
        'JAPANiCAN 표면: 대욕장 이용 시간, 남녀 교체, private bath 예약/유료 표면 확인.'
      ],
      review_signal_keywords: ['源泉かけ流し', '百割源泉', '泉質', '露天風呂', '大浴場', '客室露天風呂', '久遠', '半露天', '貸切風呂', '家族風呂', '온천물 좋음', '노천탕'],
      caution_keywords: ['家族風呂', '家族露天風呂', '小汚い', '怪我', '予約', '素泊まり', '部屋違い', '温度', '古い', '虫'],
      next_sampling: 'A급 충족. 다음 보강은 Tripadvisor 남은 44건, Agoda 개별 본문, Jalan 후보 표면 1,666건의 archive/동적 접근 확인.'
    }
  ]
};

const manifestHeaders = ['research_order', 'slug', 'name_ja', 'name_ko_or_en', 'area', 'track', 'source_tier', 'bath_research_axes', 'initial_review_pool_signal', 'priority_reason', 'status'];
const manifestRow = [
  1,
  'shirahama-yanagiya',
  '白浜温泉 家族とすごす白浜の宿 柳屋',
  'Yanagiya / 시라하마 야나기야',
  '白浜温泉, 和歌山県',
  'ready_lodging_deep_research',
  'Tier 1',
  'room_open_air_bath;room_bath;public_bath;open_air_public_bath;private_bath;family_bath',
  'conservative visible pool 959+; candidate Jalan surface 1666 separately noted; direct read 317',
  '객실 노천탕/반노천탕/공용탕/대절탕이 섞이기 쉬운 ready 후보라 Bathtime bath-area split 가치가 큼.',
  'ready;split_needed;A'
];

const summaryMd = `# 白浜温泉 家族とすごす白浜の宿 柳屋 온천 리뷰 신호 요약

## 1. 수집 브리핑

- 조사 숙소: 1곳 (\`shirahama-yanagiya\`)
- 플랫폼상 전체 리뷰풀: 보수 합산 882건 이상. Google Maps 530건, JAPANiCAN 98건, Tripadvisor 84건, Trip.com 4건, Rakuten 접근 가능 77건, Jalan 접근 가능 89건을 분리 기록했다. Jalan 후보 단계 표면 1,666건은 중복/접근층이 달라 별도 참고값으로 둔다.
- 직접 읽은 리뷰 수: 317건
- 온천 관련 직접 리뷰 수: 195건
- 직접 본문 플랫폼 수: 7개(Rakuten Travel, Jalan, Google Maps native, JAPANiCAN, Tripadvisor, Trip.com, Naver Blog)
- Google 확인: Aside Browser로 Google Maps 패널/리뷰 탭 확인. visible 530건, 4.3점, 분포 5성 253 / 4성 206 / 3성 53 / 2성 9 / 1성 9. Google-native 직접 31건, 온천 관련 23건. Tripadvisor 공급자 카드는 Google-native 수에서 제외했다.
- Naver 확인: Aside Browser로 검색/블로그/Cafe 표면 확인. Naver Blog 본문 1건은 직접 표본, 검색·Cafe 결과는 \`snippet_only\`로 분리했다.
- data_quality_grade: \`A\`. 300건 이상 직접 확인, 3개 이상 직접 본문 플랫폼, 최신/저평점/온천 키워드/한국어 리뷰 층화를 충족한다.

## 2. 공식 사실

공식명은 \`白浜温泉 家族とすごす白浜の宿 柳屋\`, 영어/OTA 표기는 \`Yanagiya\`, \`Yanagiya Ryokan\` 계열이다. 공식 URL은 \`https://www.yanagiya-hotel.jp/\`, 주소는 \`和歌山県西牟婁郡白浜町1870\`, 온천지는 \`白浜温泉\`이다.

공식 시설 표면은 \`百割源泉\`, \`源泉百% 掛け流し\`, \`木の湯\`, \`石の湯\`를 강조한다. 객실 쪽은 \`露天風呂付 久遠\`, \`露天風呂付 和室\`, \`露天風呂付 和洋室\`가 온천 노천탕으로 표기되는 반면, \`彩Jrスイート\`와 \`彩プレミアムスイート\`는 \`半露天風呂付（沸かし湯）\`로 표기된다. 이 차이는 리뷰 신호가 아니라 공식/시설 주장이다.

JAPANiCAN 표면에서는 대욕장/노천탕, 남녀 교체, 대욕장 이용 시간, private bath 예약/유료 표면이 확인된다. 따라서 이 숙소는 객실 노천탕, 객실 내탕/반노천탕, 공용 대욕장, 공용 노천탕, 대절/가족탕을 별도로 다뤄야 한다.

## 3. 리뷰 신호 요약 표

| bath_area | signal_type | direction | mention_count | platform_count | status | 해석 |
|---|---:|---:|---:|---:|---|---|
${signalRows.map((row) => `| ${row.bath_area} | ${row.signal_type} | ${row.signal_direction} | ${row.mention_count} | ${row.platform_count} | ${row.review_signal_status} | ${row.interpretation} |`).join('\n')}

## 4. 근거 예시

| source | language | review_date | paraphrase | original_keyword |
|---|---|---:|---|---|
${browserReviewTags.sample_evidence.map((row) => `| ${row.platform} | ${row.language} | ${row.review_date ?? 'mixed'} | ${row.paraphrase} | \`${row.original_keyword.join('`, `')}\` |`).join('\n')}

## 5. Bathtime 해석

직접 확인 표본 317건 중 온천 관련 본문은 195건이며, 柳屋는 \`百割源泉\`과 객실 노천탕 만족이 강하게 반복되는 숙소다. 다만 공식 객실 표면에서 온천 객실 노천탕과 \`沸かし湯\` 반노천 객실이 동시에 존재하므로, “객실탕이 좋다”로 뭉뚱그리면 데이터가 틀어진다.

공용 대욕장/노천탕의 수질 평가는 대체로 긍정적이지만, 대절·가족탕에서는 청결·안전·사진 기대 차이의 부정 신호가 따로 잡힌다. Bathtime에서는 객실 노천탕 중심 만족, 공용탕 수질 만족, 가족탕 리스크를 분리해 보여주는 편이 표본에 맞다.

## 6. Gaps

- Rakuten은 API로 접근 가능한 공개 본문 77건을 전량 직접 확인했다. 더 큰 표면 리뷰 수가 보일 수 있으나 직접 확인 수와 합산하지 않았다.
- Jalan은 현재 정적 접근 가능한 89건을 직접 확인했다. 후보 단계 표면 1,666건은 archive/동적 접근 재검증 여지가 있다.
- Google은 visible 530건 중 Google-native 31건만 직접 읽었다. 공급자 카드는 제외했다.
- JAPANiCAN은 표시 댓글 75건을 15페이지까지 직접 확인했다.
- Tripadvisor는 전체 84건 중 40건을 직접 확인했다. 언어 필터가 이후 흔들려 access는 \`partial\`로 둔다.
- Trip.com은 visible 4건 전량 직접 확인했다. AI 요약은 제외했다.
- Naver Search/Cafe는 \`snippet_only\`; Naver Blog 1건만 직접 표본이다.
- Agoda는 표면 확인 후 개별 본문 안정 추출 전이라 직접 수에 넣지 않았다.
`;

await fs.writeFile(path.join(outDir, `yanagiya_browser_review_tags_${TODAY}.json`), JSON.stringify(browserReviewTags, null, 2));
await fs.writeFile(path.join(outDir, `yanagiya_signal_aggregate_${TODAY}.json`), JSON.stringify(aggregate, null, 2));
await fs.writeFile(path.join(outDir, `platform_mapping_${TODAY}.json`), JSON.stringify(mapping, null, 2));
await fs.writeFile(path.join(outDir, `deep_research_manifest_${TODAY}.csv`), `${manifestHeaders.join(',')}\n${manifestRow.map(csvEscape).join(',')}\n`);
await fs.writeFile(path.join(outDir, `review_signal_summary_${TODAY}.md`), summaryMd);

console.log(JSON.stringify({
  directReadTotal,
  onsenDirectTotal,
  directBodyPlatformCount,
  dataQualityGrade: aggregate.data_quality_grade,
  files: [
    `yanagiya_browser_review_tags_${TODAY}.json`,
    `yanagiya_signal_aggregate_${TODAY}.json`,
    `platform_mapping_${TODAY}.json`,
    `deep_research_manifest_${TODAY}.csv`,
    `review_signal_summary_${TODAY}.md`
  ]
}, null, 2));
