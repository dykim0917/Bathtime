import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');
const BASE_DATE = '2026-07-04';
const TODAY = '2026-07-06';

const aggregate = JSON.parse(await fs.readFile(path.join(outDir, `kachofugetsu_signal_aggregate_${BASE_DATE}.json`), 'utf8'));
const baseMapping = JSON.parse(await fs.readFile(path.join(outDir, `platform_mapping_${BASE_DATE}.json`), 'utf8'));

const reinforcement = {
  research_date: TODAY,
  slug: 'shirahama-kachofugetsu',
  objective: 'B-grade reinforcement check for Google-native and Korean direct-body strata',
  google_maps: {
    source_url: 'https://www.google.com/maps/search/%E5%8D%97%E7%B4%80%E7%99%BD%E6%B5%9C+%E5%92%8C%E3%81%BF%E3%81%AE%E6%B9%AF+%E8%8A%B1%E9%B3%A5%E9%A2%A8%E6%9C%88',
    review_body_access: 'direct_readable',
    rating: 4.7,
    visible_review_count: 297,
    rating_distribution: { '5': 243, '4': 37, '3': 7, '2': 3, '1': 7 },
    direct_google_native_reviews_read_added: 25,
    onsen_related_google_native_reviews_added: 17,
    low_rating_direct_google_native_read: { '1': 4, '2': 1, '3': 1 },
    excluded_from_direct_count: ['Tripadvisor card inside Google feed', 'Trip.com card inside Google feed', 'owner replies', 'Google/provider summaries']
  },
  naver: {
    review_body_access: 'snippet_only/not_found_exact_blog_cafe',
    requested_queries: [
      '카초후게츠 시라하마 후기',
      '花鳥風月 시라하마 객실 노천탕',
      '난키 시라하마 카초후게츠 온천'
    ],
    variant_queries_tried: ['가초후게쓰 시라하마 후기'],
    blog_direct_bodies_read: 0,
    cafe_direct_bodies_read: 0,
    exact_property_visible_in_search: true,
    direct_korean_personal_stay_reviews: 0,
    snippet_only_signals: [
      'Korean media/Rakuten-ranking articles mention the exact property as a popular ryokan.',
      'Some Korean snippets mention 대욕장/varied baths, but this conflicts with official facts and direct reviews.',
      'Trip.com result shows 9.6/10 and 23 participants; this is visible pool, not direct-read count.'
    ]
  },
  tripcom_kr: {
    source_url: 'https://kr.trip.com/hotels/shirahama-hotel-detail-86051528/nanki-shirahama-nagomi-no-yu-kacho-fugetsu/',
    review_body_access: 'partial',
    visible_review_count: 23,
    rating: 9.6,
    partial_review_cards_seen: 3,
    counted_in_direct_total: false,
    note: 'Exact Korean Trip.com page opened; visible user-review card text was partial/truncated, so it is recorded as partial Korean OTA evidence rather than full direct-body sampling.'
  },
  sample_evidence: [
    { platform: 'Google Maps native', language: 'ja via Korean UI', review_date: '3주 전', original_keyword: ['온천 첨부', 'いつでもお風呂'], paraphrase: '온천이 딸린 객실을 예약했고 언제든 욕실을 쓸 수 있는 점을 긍정적으로 평가.' },
    { platform: 'Google Maps native', language: 'ja via Korean UI', review_date: '6개월 전', original_keyword: ['全室に温泉', '黒カビ'], paraphrase: '전실 온천과 따뜻한 객실탕은 긍정, 습기로 인한 곰팡이류 청결 메모가 함께 나타남.' },
    { platform: 'Google Maps native', language: 'ja via Korean UI', review_date: '2개월 전 수정', original_keyword: ['大浴場も貸切風呂もない'], paraphrase: '저평점 리뷰에서 대욕장과 대절탕이 없다는 기대 차이를 명확히 언급.' },
    { platform: 'Google Maps native', language: 'ja via Korean UI', review_date: '6개월 전', original_keyword: ['客室の露天風呂'], paraphrase: '저평점 안에서도 객실 노천탕 자체는 강점으로 언급됨.' },
    { platform: 'Google Maps native', language: 'ja via Korean UI', review_date: '3개월 전 수정', original_keyword: ['室内温泉', '湯船'], paraphrase: '실내 온천의 알칼리성 체감과 욕조에서의 체류 경험을 언급.' },
    { platform: 'Trip.com KR', language: 'ko UI', review_date: '2025-10-29', original_keyword: ['객실 내 온천'], paraphrase: '한국어 UI 카드에서 객실 내 온천, 청결, 식사, 서비스를 긍정적으로 언급했으나 카드 본문은 partial로 처리.' }
  ],
  upgrade_decision: {
    recommended_grade: 'B',
    a_upgrade_justified: false,
    reason: 'Google-native 직접 표본은 25건 추가되어 충분해졌지만, Naver Blog/Cafe 개인 숙박 본문은 0건이고 한국어 Trip.com 카드는 partial이라 A의 한국어 직접 본문 층화 완료로 보기 어렵다.'
  }
};

const reinforcedAggregate = {
  ...aggregate,
  research_date: TODAY,
  previous_research_date: BASE_DATE,
  data_quality_grade: 'B',
  grade_reason: 'Direct review volume exceeds 300 and Google-native review-tab sampling was reinforced, but A remains withheld because Naver Blog/Cafe Korean personal-stay direct bodies were not found and Korean OTA text was only partial.',
  direct_read_reviews_total: 545,
  onsen_related_direct_reviews_total: 285,
  direct_body_platform_count: 4,
  direct_body_platforms_counted: ['Rakuten Travel', 'Jalan', 'Yahoo Travel', 'Google Maps native'],
  visible_review_pool_minimum: 1124,
  google_maps_checked_via_aside: true,
  naver_checked_via_aside: true,
  reinforcement_2026_07_06: reinforcement
};

const mapping = {
  ...baseMapping,
  research_date: TODAY,
  previous_research_date: BASE_DATE,
  method: `${baseMapping.method} Reinforcement on 2026-07-06 added direct Google Maps native review-tab sampling and repeated Naver Blog/Cafe checks.`,
  direct_review_sampling_status: 'B: 545 directly read reviews and 4 direct-body platforms after Google-native reinforcement. A withheld because Naver Blog/Cafe Korean direct personal-stay bodies remain 0 and Trip.com KR is partial only.',
  lodgings: [
    {
      ...baseMapping.lodgings[0],
      google_maps: {
        rating: reinforcement.google_maps.rating,
        visible_review_count: reinforcement.google_maps.visible_review_count,
        rating_distribution: reinforcement.google_maps.rating_distribution,
        korean_reviews_visible: 'not confirmed as Korean-authored; Korean UI translations visible',
        review_body_access: 'direct_readable',
        direct_google_native_reviews_read: 25,
        onsen_related_google_native_reviews_read: 17,
        low_rating_direct_google_native_read: reinforcement.google_maps.low_rating_direct_google_native_read,
        provider_cards_excluded_from_direct_count: reinforcement.google_maps.excluded_from_direct_count
      },
      ota_review_pool_signals: {
        ...baseMapping.lodgings[0].ota_review_pool_signals,
        google_maps_native: {
          visible_review_count: 297,
          rating: 4.7,
          review_body_access: 'direct_readable',
          direct_read_reviews: 25,
          onsen_related_direct_reviews: 17,
          source_url: reinforcement.google_maps.source_url
        },
        tripcom_kr: {
          visible_review_count: 23,
          rating: 9.6,
          review_body_access: 'partial',
          direct_read_reviews: 0,
          onsen_related_direct_reviews: 0,
          partial_review_cards_seen: 3,
          source_url: reinforcement.tripcom_kr.source_url,
          note: reinforcement.tripcom_kr.note
        },
        naver_search: {
          ...baseMapping.lodgings[0].ota_review_pool_signals.naver_search,
          review_body_access: 'snippet_only/not_found_exact_blog_cafe',
          direct_read_reviews: 0,
          onsen_related_direct_reviews: 0,
          requested_queries: reinforcement.naver.requested_queries,
          variant_queries_tried: reinforcement.naver.variant_queries_tried,
          notes: 'Exact property surfaced in Korean search, but Naver Blog/Cafe personal stay bodies were not found. Search snippets and media/OTA snippets are not direct reviews.'
        }
      },
      next_sampling: 'A로 올리려면 Naver Blog/Cafe 개인 숙박 본문 또는 한국어 OTA의 전체 리뷰 본문을 추가 확보해야 한다. Google-native 층화는 25건으로 보강 완료.'
    }
  ]
};

const report = `# review_signal_summary_${TODAY}: 南紀白浜 和みの湯 花鳥風月 보강

## 1. 수집 브리핑

- 이번 보강 숙소: 1곳 \`shirahama-kachofugetsu\`
- 플랫폼상 visible review pool: 최소 1,124건 유지. Rakuten 415 / Jalan 367 / Yahoo Travel 45 / Google Maps 297 기준이며, Trip.com KR 23건은 partial 보강 표면으로 별도 기록한다.
- 직접 읽은 리뷰 수: 545건. 기존 Rakuten/Jalan/Yahoo 520건에 Google-native 25건을 추가했다.
- 온천 관련 직접 리뷰 수: 285건. Google-native 온천 관련 17건을 추가했다.
- 직접 본문 플랫폼 수: 4개(Rakuten Travel, Jalan, Yahoo Travel, Google Maps native)
- Google 확인: Aside Browser로 Google Maps 리뷰 탭 직접 확인. rating 4.7, visible 297, 분포 5성 243 / 4성 37 / 3성 7 / 2성 3 / 1성 7. Google-native 직접 25건, 온천 관련 17건, 저평점 1-3성 6건을 확인했다. Google 내 Trip.com/Tripadvisor/소유자 답변/요약은 직접 수에서 제외했다.
- Naver 확인: Aside Browser로 요청 쿼리 3개와 변형 표기 \`가초후게쓰 시라하마 후기\`를 확인. 정확 숙소는 검색에 나오지만 Blog/Cafe 개인 숙박 본문은 0건이다. 검색/언론/OTA 스니펫은 \`snippet_only\`로 분리했다.
- data_quality_grade: \`B\` 유지. 300건 이상과 Google-native 보강은 충족했지만, 한국어 직접 본문 층화가 아직 충분하지 않다.

## 2. 공식 사실

공식/OTA 시설 사실은 기존 2026-07-04 산출을 유지한다. 이 숙소는 전 24실에 천연온천 반노천탕을 둔 객실탕 중심 숙소이며, 공용 대욕장은 두지 않는다고 안내된다. 따라서 \`public_bath\`는 만족 신호가 아니라 “대욕장 없음” 기대 조정 신호로 다루어야 한다.

## 3. 리뷰 신호 보강 요약

| bath_area | signal_type | direction | 추가 확인 | 해석 |
|---|---|---:|---:|---|
| room_open_air_bath | room_bath_hot_spring | positive | Google-native 17건 온천 관련 중 다수 | 객실 온천/객실 노천탕 중심 만족은 Google-native에서도 반복된다. |
| room_bath | room_bath_hot_spring | mixed | 저평점 포함 확인 | 객실탕은 강점으로 반복되지만, 청결·가성비·서비스 불만과 함께 등장하는 저평점도 있다. |
| public_bath | booking_confusion | neutral/mixed | 저평점 직접 확인 | \`大浴場も貸切風呂もない\`가 직접 확인되어, 대욕장 부재는 명확한 기대 조정 항목이다. |
| facility_wide | water_texture | positive | Google-native에서 보강 | \`室内温泉\`, 알칼리성 체감, 피부/욕조 체류 경험이 보강됐다. |

## 4. 근거 예시

| source | language | review_date | paraphrase | original_keyword |
|---|---|---:|---|---|
${reinforcement.sample_evidence.map((row) => `| ${row.platform} | ${row.language} | ${row.review_date} | ${row.paraphrase} | \`${row.original_keyword.join('`, `')}\` |`).join('\n')}

## 5. Bathtime 해석

직접 확인 표본은 545건까지 늘었고, 온천 관련 직접 본문도 285건으로 보강됐다. Google-native에서도 객실 온천/객실 노천탕 만족은 반복되며, 저평점에서도 “객실탕은 강점이지만 대욕장·대절탕이 없다”는 기대 차이가 확인된다.

다만 Naver Blog/Cafe 개인 숙박 본문은 0건이고, 한국어 Trip.com 페이지는 일부 카드만 읽혀 \`partial\`이다. 따라서 이번 보강 후에도 A가 아니라 B로 두는 것이 Bathtime 품질 기준에 더 맞다.

## 6. Gaps

- Naver Blog/Cafe 직접 본문: 0건.
- Trip.com KR: visible 23건, rating 9.6 표면 확인. 직접 본문은 일부 카드만 보여 \`partial\`, 직접 총량에는 넣지 않았다.
- Google-native는 25건 보강 완료. 다음 병목은 한국어 직접 본문이다.
- A로 올리려면 한국어 OTA 전체 리뷰 모달 또는 Naver Blog/Cafe 개인 숙박 본문을 추가 확보해야 한다.
`;

await fs.writeFile(path.join(outDir, `kachofugetsu_reinforcement_${TODAY}.json`), JSON.stringify(reinforcement, null, 2));
await fs.writeFile(path.join(outDir, `kachofugetsu_signal_aggregate_${TODAY}.json`), JSON.stringify(reinforcedAggregate, null, 2));
await fs.writeFile(path.join(outDir, `platform_mapping_${TODAY}.json`), JSON.stringify(mapping, null, 2));
await fs.writeFile(path.join(outDir, `review_signal_summary_${TODAY}.md`), report);

console.log(JSON.stringify({
  slug: reinforcedAggregate.slug,
  data_quality_grade: reinforcedAggregate.data_quality_grade,
  direct_read_reviews_total: reinforcedAggregate.direct_read_reviews_total,
  onsen_related_direct_reviews_total: reinforcedAggregate.onsen_related_direct_reviews_total,
  direct_body_platform_count: reinforcedAggregate.direct_body_platform_count,
  a_upgrade_justified: reinforcement.upgrade_decision.a_upgrade_justified
}, null, 2));
