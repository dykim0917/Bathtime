import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');
const date = '2026-07-04';
const staticSummary = JSON.parse(await fs.readFile(path.join(outDir, `sanrakuso_static_review_tags_summary_${date}.json`), 'utf8'));

const browserTags = [
  {
    platform: 'Trip.com provider card in Google Maps',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E3%83%9B%E3%83%86%E3%83%AB%E4%B8%89%E6%A5%BD%E8%8D%98%20%E7%99%BD%E6%B5%9C',
    review_id: 'google-maps-provider-tripcom-ko-2025',
    review_date: '2025',
    language: 'ko',
    access: 'provider_card_seen_not_counted',
    google_native: false,
    excluded_from_direct_total: true,
    onsen_related_body: true,
    bath_area_tags: ['room_bath', 'public_bath'],
    signal_type_tags: ['room_bath_hot_spring', 'public_bath_hot_spring', 'weak_onsen_feeling'],
    caution_tags: ['provider_card_not_google_native'],
    original_keywords: ['창가에 욕조있는 방', '공용 온천', '물의 차이'],
    paraphrase: 'Google Maps 안의 Trip.com 카드에서 객실 창가 욕조와 공용 온천을 비교하는 한국어 본문이 보인다.'
  },
  {
    platform: 'Tripadvisor provider card in Google Maps',
    source_url: 'https://www.google.com/maps/search/?api=1&query=%E3%83%9B%E3%83%86%E3%83%AB%E4%B8%89%E6%A5%BD%E8%8D%98%20%E7%99%BD%E6%B5%9C',
    review_id: 'google-maps-provider-tripadvisor-ko-2017',
    review_date: '2017',
    language: 'ko',
    access: 'provider_card_seen_not_counted',
    google_native: false,
    excluded_from_direct_total: true,
    onsen_related_body: true,
    bath_area_tags: ['public_bath'],
    signal_type_tags: ['public_bath_hot_spring'],
    caution_tags: ['provider_card_not_google_native'],
    original_keywords: ['대욕장', '해변 앞'],
    paraphrase: 'Google Maps 안의 Tripadvisor 카드에서 해변 접근성과 대욕장 만족 신호가 확인된다.'
  }
];

function addCounts(base, rows, field) {
  const out = { ...base };
  for (const row of rows) for (const key of row[field] || []) out[key] = (out[key] || 0) + 1;
  return out;
}

const directTotal = staticSummary.total_direct_extracted_static;
const onsenTotal = staticSummary.onsen_related_body_static;
const bathAreaTags = addCounts(staticSummary.bath_area_tags, browserTags, 'bath_area_tags');
const signalTypeTags = addCounts(staticSummary.signal_type_tags, browserTags, 'signal_type_tags');
const cautionTags = addCounts(staticSummary.caution_tags, browserTags, 'caution_tags');

const aggregate = {
  research_date: date,
  slug: 'shirahama-sanrakuso',
  accommodation_name: '白浜温泉 ホテル三楽荘',
  name_ko_or_en: 'Hotel Sanrakuso / 호텔 산라쿠소',
  data_quality_grade: 'A',
  grade_reason: '300건 이상 직접 확인, 3개 직접 본문 플랫폼, 최신/저평점/온천 키워드/Google/Naver 확인 완료. Google 공급자 카드는 직접 총량에서 제외.',
  visible_review_pool_minimum_mapped: 7827,
  direct_reviews_read_total: directTotal,
  onsen_related_direct_reviews_total: onsenTotal,
  direct_body_platform_count: 3,
  direct_body_platforms: ['Rakuten Travel', 'Jalan', 'JTB'],
  static_summary: staticSummary,
  browser_summary: {
    direct_reviews_read: 0,
    onsen_related_direct_reviews: 0,
    google_maps_checked: true,
    google_rating: 4.2,
    google_visible_review_count: 938,
    google_rating_distribution: { '5': 401, '4': 366, '3': 120, '2': 24, '1': 27 },
    google_native_direct_read: 0,
    provider_cards_seen_not_counted: 2,
    naver_checked: true,
    naver_direct_blog_read: 0,
    naver_snippet_only: true
  },
  combined_bath_area_tags: bathAreaTags,
  combined_signal_type_tags: signalTypeTags,
  combined_caution_tags: cautionTags,
  interpretive_caution: '공식상 공용 대욕장에는露天風呂がない. 자동 태그의 open_air_public_bath는 본문 내 露天 단어가 객실 노천과 대욕장 문맥에 함께 등장한 혼입을 포함하므로, 공용 노천 신호로 해석하지 않는다. 또한 ミラバス 객실은 온천 객실탕이 아니라 객실 내 욕조/뷰 경험으로 분리한다.'
};

const platformMapping = {
  research_date: date,
  scope: 'ready lodging deep research: Kansai/Sanin/Setouchi Tier 1 lodging',
  method: 'Rakuten API, Jalan HTML, JTB HTML로 직접 본문 수집 후 Aside Browser로 Google Maps와 Naver Search를 확인. Naver 검색 스니펫과 Google 공급자 카드는 직접 리뷰 수/Google-native 리뷰와 분리.',
  direct_review_sampling_status: 'A: 300+ direct reviews, 3 direct-body platforms, Google/Naver checked; Google provider cards excluded from direct totals',
  lodgings: [
    {
      slug: 'shirahama-sanrakuso',
      name_ja: '白浜温泉 ホテル三楽荘',
      name_ko_or_en: 'Hotel Sanrakuso / 호텔 산라쿠소',
      address: '和歌山県西牟婁郡白浜町3078',
      onsen_area: '南紀白浜温泉 / 白浜温泉',
      google_maps: {
        rating: 4.2,
        visible_review_count: 938,
        rating_distribution: { '5': 401, '4': 366, '3': 120, '2': 24, '1': 27 },
        korean_reviews_visible: true,
        review_body_access: 'partial/provider_cards_direct_read',
        direct_google_native_reviews_read: 0,
        onsen_related_google_native_reviews: 0,
        ota_provider_cards_seen: ['Trip.com', 'Tripadvisor'],
        provider_card_reviews_seen_not_counted: 2,
        provider_card_onsen_related_reviews_not_counted: 2,
        caution: 'Google Maps의 Trip.com/Tripadvisor 카드는 Google-native 리뷰로 세지 않았다.'
      },
      ota_review_pool_signals: {
        'Rakuten Travel': {
          visible_review_count: 2109,
          page_badge_review_count: 2531,
          rating: 4.53,
          review_body_access: 'direct_readable',
          direct_reviews_read: 360,
          onsen_related_direct_reviews: 195,
          source_url: 'https://travel.rakuten.co.jp/HOTEL/8226/review.html'
        },
        Jalan: {
          visible_review_count: 3533,
          rating: 4.5,
          review_body_access: 'direct_readable',
          direct_reviews_read: 155,
          onsen_related_direct_reviews: 120,
          source_url: 'https://www.jalan.net/yad316623/kuchikomi/'
        },
        JTB: {
          visible_review_count: null,
          rating: null,
          review_body_access: 'direct_readable',
          direct_reviews_read: 20,
          onsen_related_direct_reviews: 11,
          source_url: 'https://www.jtb.co.jp/kokunai-hotel/htl/6506008/review/'
        },
        'Trip.com': {
          visible_review_count: 358,
          rating: 9.3,
          review_body_access: 'snippet_only plus google_provider_card_seen_not_counted',
          direct_reviews_read: 0,
          onsen_related_direct_reviews: 0,
          source_basis: 'Naver Search snippet and Google Maps provider card'
        },
        Tripadvisor: {
          visible_review_count: 187,
          rating: 4.1,
          review_body_access: 'snippet_only plus google_provider_card_seen_not_counted',
          direct_reviews_read: 0,
          onsen_related_direct_reviews: 0,
          source_basis: 'Naver Search snippet and Google Maps provider card'
        },
        'Booking.com': {
          visible_review_count: 345,
          rating: 8.8,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          source_basis: 'Naver Search result'
        },
        Agoda: {
          visible_review_count: null,
          rating: null,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          source_basis: 'Naver Search result'
        },
        'Rakuten Travel Korean': {
          visible_review_count: 769,
          rating: 4.5,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          duplicate_risk: 'Rakuten 본체와 중복 가능성이 있어 visible minimum 합계에는 더하지 않음.'
        },
        Traveloka: {
          visible_review_count: 357,
          rating: 8.6,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          source_basis: 'Naver Search result'
        },
        'Naver Search / Blog': {
          visible_review_count: null,
          rating: null,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          snippet_only_results_seen: ['Trip.com 358', 'Booking.com 345', 'Rakuten Travel Korean 769', 'Tripadvisor 187', 'Traveloka 357']
        }
      },
      official_bath_facts_seen: {
        official_site_url: 'https://sanrakuso.co.jp/',
        rooms_url: 'https://sanrakuso.co.jp/rooms/',
        hotsprings_url: 'https://sanrakuso.co.jp/hotsprings/',
        room_open_air_bath: '공식: 9Fましらの·8F浜水晶에 全22室の源泉かけ流し露天風呂付客室. 山の温泉「藤の湯」を 객실 노천에서 이용.',
        room_bath: '공식: 6F波の綾에는 海側ミラバス付客室이 있으나, 온천 객실탕으로 단정하지 않는다.',
        public_bath: '공식: 大浴場「夕月」「宵待」. 藤の湯와 衝幹の湯 두 원천을 즐기는 공용 내탕.',
        open_air_public_bath: '공식: 대욕장에 露天風呂はございません. 근처 공중 노천 崎の湯를 별도 안내.',
        private_bath: '공식 확인 없음.',
        family_bath: '공식 확인 없음.',
        water_handling: '공식: 2種の源泉を100%かけ流し. 다만 대욕장 안내에는 위생관리상 塩素系薬剤 사용 표기가 있다.',
        spring_quality: '藤の湯: ナトリウム-塩化物・炭酸水素塩泉. 衝幹の湯: ナトリウム-塩化物強塩温泉.',
        public_bath_hours: '15:00-24:00 / 5:00-9:30, 男女入替制.',
        tattoo_policy: '문신/타투 입욕은 원칙 제한. 시판 커버실로 완전히 가릴 수 있는 경우 대욕장 이용 가능.',
        structural_note: '대욕장 탈의장은 2층, 욕장은 1층 구조이며 약 15단 계단 안내.'
      },
      review_signal_keywords: ['源泉かけ流し', '露天風呂付客室', '客室露天風呂', '白良浜', 'オーシャンビュー', '大浴場', '藤の湯', '衝幹の湯', 'ミラバス', '温度', '湯の花'],
      caution_keywords: ['公用大浴場に露天なし', 'ミラバスは温泉と分리', '塩素系薬剤', '15段ほどの階段', '温度', '古い', '子連れ混雑'],
      next_sampling: 'A등급은 충족. 다음 보강은 Google-native 개별 리뷰 본문 확장, Naver Blog 원문 발굴, Yahoo/Ikkyu 직접 본문 확인.'
    }
  ]
};

function csvEscape(value) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const manifestHeader = ['research_order','slug','name_ja','name_ko_or_en','area','track','source_tier','bath_research_axes','initial_review_pool_signal','priority_reason','status'];
const manifestRow = [
  1,
  'shirahama-sanrakuso',
  '白浜温泉 ホテル三楽荘',
  'Hotel Sanrakuso / 호텔 산라쿠소',
  '和歌山県 西牟婁郡 白浜温泉',
  'ready_lodging_deep_research',
  'Tier 1',
  'room_open_air_bath;room_bath;public_bath;facility_wide',
  `visible_minimum_mapped_7827_direct_${directTotal}_onsen_${onsenTotal}`,
  '22실 원천가케나가시 객실 노천탕과 공용 2원천 대욕장, 미라버스 객실 신호가 섞여 있어 욕장 단위 분리가 필요한 숙소.',
  'ready_deep_researched_A'
];

const report = `# 白浜温泉 ホテル三楽荘 / Hotel Sanrakuso 리뷰 신호 요약

## 1. 수집 브리핑

- 이번 조사 숙소: 1곳, \`白浜温泉 ホテル三楽荘\` / Hotel Sanrakuso / 호텔 산라쿠소.
- 플랫폼상 전체 리뷰풀: 최소 7,827건 매핑. Rakuten API 2,109건, Jalan 3,533건, Google 938건, Trip.com 358건, Tripadvisor 187건, Booking.com 345건, Traveloka 357건 기준이다. Rakuten Korean 769건은 Rakuten 본체와 중복 가능성이 있어 최소 합계에서 제외했다. 이 숫자는 플랫폼 노출 수이며 직접 읽은 수와 합산하지 않는다.
- 직접 읽은 리뷰 수: ${directTotal}건.
- 온천 관련 직접 리뷰 수: ${onsenTotal}건.
- 직접 본문 플랫폼 수: 3개. Rakuten Travel, Jalan, JTB.
- Google 확인: Aside Browser로 Google Search/Maps를 확인했다. 평점 4.2, Google 리뷰 938개 노출, rating_distribution은 5성 401 / 4성 366 / 3성 120 / 2성 24 / 1성 27이다. 개별 Google-native 리뷰 본문은 확보하지 못했고, Trip.com/Tripadvisor 공급자 카드는 Google-native 리뷰로 세지 않았다.
- Naver 확인: Aside Browser로 Naver Search를 확인했다. Trip.com, Booking.com, Agoda, Rakuten Travel Korean, Tripadvisor, Traveloka 표면은 확인했지만 검색 결과 설명은 \`snippet_only\`로 분리했고 직접 리뷰 수에는 넣지 않았다.
- 접근 실패/제한: Google-native 개별 리뷰 본문은 이번 snapshot에서 직접 확보하지 못했다. Google Maps 안의 Trip.com/Tripadvisor 공급자 카드 2건은 짧게 확인했지만 직접 총량과 직접 플랫폼 수에서 제외했다. Naver Blog 원문은 검색 1면에서 확인되지 않았다. Yahoo Travel/Ikkyu는 이번 A등급 달성 후 직접 본문 표본에는 포함하지 않았다.

## 2. 공식 사실

공식 사이트 기준으로 이 숙소는 전 객실 오션뷰이며, 9F \`ましらの\`과 8F \`浜水晶\`에 총 22실의 \`源泉かけ流し露天風呂付客室\`을 둔다. 이 객실 노천탕은 산쪽 원천인 \`藤の湯\`를 사용하는 객실 노천탕으로 정리해야 한다.

공용 온천은 대욕장 \`夕月\`과 \`宵待\`가 중심이며, \`藤の湯\`와 \`衝幹の湯\` 두 원천을 즐기는 구조다. 공식 안내는 대욕장에 \`露天風呂はございません\`이라고 명시하므로, 후기의 \`露天風呂\` 반복은 대부분 객실 노천탕 문맥으로 분리해야 한다. 6F \`波の綾\`의 \`ミラバス付客室\`은 바다 조망 객실 내 욕조 신호로 보되, 온천 객실탕으로 단정하지 않는다. 공식은 2종 원천 100%かけ流し를 강조하지만, 대욕장 안내에는 위생관리상 塩素系薬剤 사용 표기도 함께 있다.

## 3. 리뷰 신호 요약 표

| bath_area | bath_area_confidence | signal_type | signal_direction | mention_count | source_count | platform_count | contradiction_level | review_signal_status |
|---|---|---|---|---:|---:|---:|---|---|
| room_open_air_bath | specific | room_bath_hot_spring | positive | 266 | 260+ | 4 | low | strong_signal |
| room_bath | probable | room_bath_hot_spring | mixed | 269 | 260+ | 5 | medium | moderate_signal |
| public_bath | specific | public_bath_hot_spring | mixed | 121 | 120+ | 5 | low | strong_signal |
| open_air_public_bath | unclear | public_bath_hot_spring | neutral | 67 | 60+ | 2 | high | insufficient |
| facility_wide | facility_wide | water_texture | positive | 128 | 125+ | 3 | low | strong_signal |
| facility_wide | facility_wide | crowding | mixed | 134 | 130+ | 3 | medium | moderate_signal |
| facility_wide | facility_wide | weak_onsen_feeling | negative | 3 | 3 | 2 | medium | weak_signal |
| private_bath | unclear | private_bath_experience | neutral | 4 | 4 | 1 | high | insufficient |

주의: \`open_air_public_bath\`는 공식 사실과 충돌한다. 공용 대욕장에는 공식상 노천탕이 없으므로, 이 태그는 본문 안에서 객실 노천탕과 대욕장 표현이 함께 등장한 자동 태그 혼입으로 보고 Bathtime 표시에는 사용하지 않는 편이 안전하다.

## 4. 근거 예시

| # | paraphrase | original_keyword | source_url | language | review_date |
|---:|---|---|---|---|---|
| 1 | Rakuten 최신 리뷰에서 온천 노천 객실과 대욕장이 함께 언급되며, 객실 노천 쪽 만족이 중심이다. | \`温泉露天風呂付\`, \`大浴場\` | https://travel.rakuten.co.jp/HOTEL/8226/review.html | ja | 2026-06-28 |
| 2 | Rakuten 표본에서 露天風呂付き客室과 白良浜 조망이 반복된다. | \`客室露天風呂\`, \`景色\` | https://travel.rakuten.co.jp/HOTEL/8226/review.html | ja | 2026-05-31 |
| 3 | Rakuten 저평점 쪽 표본에서도 객실 노천탕은 언급되지만 시설·블라인드 등 운영 기대 차이가 같이 나타난다. | \`露天風呂付客室\`, \`古い\` | https://travel.rakuten.co.jp/HOTEL/8226/review.html | ja | 2026-05-16 |
| 4 | Jalan 최신 리뷰는 객실 노천탕의 원천가케나가시와 대욕장을 동시에 언급한다. | \`源泉掛け流し\`, \`大浴場\` | https://www.jalan.net/yad316623/kuchikomi/ | ja | 2026-06-27 |
| 5 | Jalan 리뷰에서 6F 미라버스 객실은 온천보다 객실 욕조/조망 경험으로 나타난다. | \`ミラバス\`, \`白良浜\` | https://www.jalan.net/yad316623/kuchikomi/ | ja | 2026-06-27 |
| 6 | JTB 표본에서도 객실 노천탕과 白良浜 전망이 함께 언급된다. | \`客室露天風呂\`, \`白良浜\` | https://www.jtb.co.jp/kokunai-hotel/htl/6506008/review/ | ja | 2020-01-07 |

## 5. Bathtime 해석

직접 확인 표본 ${directTotal}건 중 온천 관련 본문은 ${onsenTotal}건이며, 객실 노천탕과 白良浜 조망의 결합이 강하게 반복된다. 이 숙소는 “대욕장 노천이 좋은 숙소”가 아니라, 22실의 원천가케나가시 객실 노천탕과 공용 2원천 내탕 대욕장을 분리해 보여줘야 데이터에 맞다.

미라버스 객실은 조망형 객실 욕조 경험으로는 반복되지만, 온천 객실탕으로 섞으면 안 된다. Bathtime에서는 \`room_open_air_bath\`를 핵심 신호로, \`public_bath\`는 두 원천·대욕장 경험으로, \`room_bath\`는 미라버스/일반 객실 욕조가 섞인 보조 신호로 표시하는 편이 적절하다.

## 6. Gaps

- Google-native 개별 리뷰 본문은 확보하지 못했다. Google Maps에서 rating, visible count, rating distribution, 공급자 카드 본문은 확인했다.
- Naver Blog 원문은 검색 1면에서 직접 확인되지 않았다. Naver 검색 결과는 \`snippet_only\`로 분리했다.
- Yahoo Travel/Ikkyu는 직접 본문 표본을 추가하지 않았다.
- JTB visible_review_count는 정적 페이지에서 안정적으로 구조화하지 못했다.
- 공식 원천 온도와 pH는 이번 확인 범위에서 구조화하지 못했다.
`;

await fs.writeFile(path.join(outDir, `sanrakuso_browser_review_tags_${date}.json`), JSON.stringify(browserTags, null, 2));
await fs.writeFile(path.join(outDir, `sanrakuso_signal_aggregate_${date}.json`), JSON.stringify(aggregate, null, 2));
await fs.writeFile(path.join(outDir, `platform_mapping_${date}.json`), JSON.stringify(platformMapping, null, 2));
await fs.writeFile(path.join(outDir, `deep_research_manifest_${date}.csv`), `${manifestHeader.join(',')}\n${manifestRow.map(csvEscape).join(',')}\n`);
await fs.writeFile(path.join(outDir, `review_signal_summary_${date}.md`), report);

console.log(JSON.stringify({
  directTotal,
  onsenTotal,
  directBodyPlatformCount: 3,
  visibleReviewPoolMinimumMapped: 7827,
  files: [
    `sanrakuso_browser_review_tags_${date}.json`,
    `sanrakuso_signal_aggregate_${date}.json`,
    `platform_mapping_${date}.json`,
    `deep_research_manifest_${date}.csv`,
    `review_signal_summary_${date}.md`
  ]
}, null, 2));
