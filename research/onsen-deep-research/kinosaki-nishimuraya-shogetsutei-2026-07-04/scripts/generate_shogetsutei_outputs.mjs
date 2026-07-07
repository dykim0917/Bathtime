import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');
const TODAY = '2026-07-04';
const slug = 'kinosaki-nishimuraya-shogetsutei';

const staticRows = JSON.parse(await fs.readFile(path.join(outDir, `shogetsutei_static_review_tags_${TODAY}.json`), 'utf8'));
const staticSummary = JSON.parse(await fs.readFile(path.join(outDir, `shogetsutei_static_review_tags_summary_${TODAY}.json`), 'utf8'));

const sources = {
  official: 'https://www.nishimuraya.ne.jp/shogetsu/',
  officialRoomOpenAir: 'https://www.nishimuraya.ne.jp/shogetsu/room/roten.php',
  officialPrivateSpa: 'https://www.nishimuraya.ne.jp/shogetsu/spa/private.php',
  rakuten: 'https://travel.rakuten.co.jp/HOTEL/14007/review.html',
  jalan: 'https://www.jalan.net/yad332274/kuchikomi/',
  jtb: 'https://www.jtb.co.jp/kokunai-hotel/htl/6318001/review/',
  yahoo: 'https://travel.yahoo.co.jp/00001014/review/',
  tripadvisor: 'https://www.tripadvisor.jp/Hotel_Review-g1022822-d1165592-Reviews-Kinosaki_Onsen_Nishimuraya_Hotel_Shogetsutei-Toyooka_Hyogo_Prefecture_Kinki.html',
  booking: 'https://www.booking.com/hotel/jp/nishimuraya-shogetsutei.ko.html',
  googleMaps: 'https://www.google.com/maps/search/?api=1&query=%E8%A5%BF%E6%9D%91%E5%B1%8B%E3%83%9B%E3%83%86%E3%83%AB%E6%8B%9B%E6%9C%88%E5%BA%AD',
  naver: 'https://search.naver.com/search.naver?query=%EB%8B%88%EC%8B%9C%EB%AC%B4%EB%9D%BC%EC%95%BC%20%EC%87%BC%EA%B2%8C%EC%B8%A0%ED%85%8C%EC%9D%B4%20%ED%9B%84%EA%B8%B0%20%EC%98%A8%EC%B2%9C'
};

const asideReviewSummary = {
  yahoo_travel: {
    visible_review_count: 149,
    rating: 4.70,
    review_body_access: 'direct_readable',
    directly_read_reviews: 30,
    onsen_related_direct_reviews: 16,
    notes: 'Aside Browser page exposed latest Yahoo Travel review bodies plus visitor review block. URL page parameter repeated page 1, so only first page counted.'
  },
  tripadvisor: {
    visible_review_count: 261,
    rating: 4.4,
    review_body_access: 'direct_readable',
    directly_read_reviews: 40,
    onsen_related_direct_reviews: 25,
    notes: 'Aside Browser opened recent review pages or0/or10/or20/or30. Static curl was JS blocked.'
  },
  booking: {
    visible_review_count: 331,
    rating: 9.3,
    review_body_access: 'partial',
    directly_read_reviews: 10,
    onsen_related_direct_reviews: 6,
    notes: 'Booking Korean page exposed representative review quotes and keyword filters. Treated as partial, not full pool.'
  },
  google_maps_hotels: {
    visible_review_count: 1717,
    rating: 4.5,
    rating_distribution: null,
    review_body_access: 'partial',
    directly_read_google_native_reviews: 0,
    onsen_related_google_native_reviews: 0,
    provider_cards_seen: [
      { provider: 'Trip.com', rating: '4.6/5', visible_review_count: 81, snippet_keyword: '폭설/저녁 게 코스' },
      { provider: 'Tripadvisor', rating: '4.4/5', visible_review_count: 261, snippet_keyword: '온센 메구리' }
    ],
    notes: 'Aside Browser confirmed Google panel, rating, visible count, supplier cards. Supplier snippets are not counted as Google-native direct reviews.'
  },
  naver_search: {
    review_body_access: 'snippet_only',
    directly_read_reviews: 0,
    onsen_related_direct_reviews: 0,
    snippets_seen: [
      'Trip.com 9.3/10, 82 참여',
      'Booking.com 9.3/10, 330 참여',
      'Korean blog snippets mentioning 대욕장/정원뷰 노천탕/온천마을 거리'
    ],
    notes: 'Naver Blog/Search showed Korean demand signals, but no opened full lodging-review body was counted.'
  }
};

const asideDirect = asideReviewSummary.yahoo_travel.directly_read_reviews + asideReviewSummary.tripadvisor.directly_read_reviews + asideReviewSummary.booking.directly_read_reviews;
const asideOnsen = asideReviewSummary.yahoo_travel.onsen_related_direct_reviews + asideReviewSummary.tripadvisor.onsen_related_direct_reviews + asideReviewSummary.booking.onsen_related_direct_reviews;
const directTotal = staticSummary.total_direct_extracted_static + asideDirect;
const onsenTotal = staticSummary.onsen_related_body_static + asideOnsen;

const visiblePoolMinimum = 101 + 1113 + 149 + 261 + 331 + 1717 + 81;

const aggregate = {
  research_date: TODAY,
  slug,
  status: ['ready_deep_research_sampled', 'needs_korean_direct_body_for_A'],
  data_quality_grade: 'B',
  grade_reason: '직접 확인 305건, 직접 본문 플랫폼 6개로 300건 목표는 넘겼으나, Google-native 직접 본문과 Naver/한국어 직접 본문 층화가 충분하지 않아 A가 아니라 B로 둔다.',
  identity: {
    name_ja: '城崎温泉 西村屋ホテル招月庭',
    name_ko_or_en: '기노사키 온천 니시무라야 호텔 쇼게츠테이 / Nishimuraya Hotel Shogetsutei',
    aliases: ['西村屋ホテル招月庭', 'Kinosaki Onsen Nishimuraya Hotel Shogetsutei', '쇼게츠테이'],
    area: '城崎温泉, 兵庫県豊岡市',
    address: '兵庫県豊岡市城崎町湯島1016-2',
    official_url: sources.official
  },
  visible_review_pool_minimum_mapped: visiblePoolMinimum,
  visible_review_pool_note: 'Rakuten 101 + Jalan 1,113 + Yahoo 149 + Tripadvisor 261 + Booking 331 + Google 1,717 + Google Trip.com card 81. 중복 가능성이 있는 Naver/KAYAK/Agoda 표면은 최소 합계에서 제외.',
  direct_reviews_read_total: directTotal,
  onsen_related_direct_reviews_total: onsenTotal,
  direct_body_platforms: 6,
  direct_body_platform_names: ['Rakuten Travel', 'Jalan', 'JTB', 'Yahoo Travel', 'Tripadvisor', 'Booking.com'],
  official_bath_facts_seen: {
    room_open_air_bath: 'official_seen',
    room_open_air_bath_hot_spring_status: 'not_hot_spring_for_guest-room_private_occupancy',
    public_bath: 'official_seen',
    open_air_public_bath: 'official_seen',
    private_bath: 'official_seen',
    source_note: 'Official room-open-air page states guest-room private baths use 沸かし湯/白湯 to protect Kinosaki hot spring resources, while large baths and private baths use hot spring water.',
    official_sources: [sources.officialRoomOpenAir, sources.officialPrivateSpa]
  },
  static_summary: staticSummary,
  aside_review_summary: asideReviewSummary,
  review_signal_table: [
    {
      accommodation_name: '城崎温泉 西村屋ホテル招月庭',
      bath_area: 'public_bath',
      bath_area_confidence: 'specific',
      signal_type: 'public_bath_hot_spring',
      signal_direction: 'positive',
      mention_count: staticSummary.bath_area_tags.public_bath + 28,
      source_count: staticSummary.bath_area_tags.public_bath + 28,
      platform_count: 6,
      contradiction_level: 'low',
      review_signal_status: 'strong_signal'
    },
    {
      accommodation_name: '城崎温泉 西村屋ホテル招月庭',
      bath_area: 'open_air_public_bath',
      bath_area_confidence: 'specific',
      signal_type: 'public_bath_hot_spring',
      signal_direction: 'positive',
      mention_count: staticSummary.bath_area_tags.open_air_public_bath + 12,
      source_count: staticSummary.bath_area_tags.open_air_public_bath + 12,
      platform_count: 4,
      contradiction_level: 'low',
      review_signal_status: 'moderate_signal'
    },
    {
      accommodation_name: '城崎温泉 西村屋ホテル招月庭',
      bath_area: 'private_bath',
      bath_area_confidence: 'specific',
      signal_type: 'private_bath_experience',
      signal_direction: 'positive',
      mention_count: staticSummary.bath_area_tags.private_bath + 7,
      source_count: staticSummary.bath_area_tags.private_bath + 7,
      platform_count: 4,
      contradiction_level: 'low',
      review_signal_status: 'moderate_signal'
    },
    {
      accommodation_name: '城崎温泉 西村屋ホテル招月庭',
      bath_area: 'room_open_air_bath',
      bath_area_confidence: 'specific',
      signal_type: 'room_bath_hot_spring',
      signal_direction: 'mixed',
      mention_count: staticSummary.bath_area_tags.room_open_air_bath + 4,
      source_count: staticSummary.bath_area_tags.room_open_air_bath + 4,
      platform_count: 4,
      contradiction_level: 'high',
      review_signal_status: 'conflicting'
    },
    {
      accommodation_name: '城崎温泉 西村屋ホテル招月庭',
      bath_area: 'facility_wide',
      bath_area_confidence: 'facility_wide',
      signal_type: 'crowding',
      signal_direction: 'mixed',
      mention_count: staticSummary.signal_type_tags.crowding + 8,
      source_count: staticSummary.signal_type_tags.crowding + 8,
      platform_count: 4,
      contradiction_level: 'medium',
      review_signal_status: 'moderate_signal'
    }
  ]
};

const platformMapping = {
  research_date: TODAY,
  scope: 'ready lodging deep research: Kansai/Sanin/Setouchi Tier 1',
  method: 'Static OTA extraction plus Aside Browser verification for Yahoo, Google, Naver, Tripadvisor, Booking.',
  direct_review_sampling_status: 'B: 300+ direct reviews and 6 platforms, but A withheld because Korean/Naver direct body and Google-native review-tab sampling are insufficient.',
  lodgings: [
    {
      slug,
      name_ja: aggregate.identity.name_ja,
      google_maps: {
        rating: 4.5,
        visible_review_count: 1717,
        rating_distribution: null,
        korean_reviews_visible: 'supplier snippets only in this pass',
        direct_google_native_reviews_read: 0,
        onsen_related_google_native_reviews_read: 0,
        provider_cards_seen: asideReviewSummary.google_maps_hotels.provider_cards_seen
      },
      ota_review_pool_signals: {
        rakuten: { visible_review_count: 101, review_body_access: 'direct_readable', direct_read_reviews: staticSummary.by_platform['Rakuten Travel'].direct, onsen_related_direct_reviews: staticSummary.by_platform['Rakuten Travel'].onsen_body, source_url: sources.rakuten },
        jalan: { visible_review_count: 1113, review_body_access: 'direct_readable', direct_read_reviews: staticSummary.by_platform.Jalan.direct, onsen_related_direct_reviews: staticSummary.by_platform.Jalan.onsen_body, source_url: sources.jalan },
        jtb: { visible_review_count: null, review_body_access: 'direct_readable', direct_read_reviews: staticSummary.by_platform.JTB.direct, onsen_related_direct_reviews: staticSummary.by_platform.JTB.onsen_body, source_url: sources.jtb },
        yahoo_travel: { visible_review_count: 149, review_body_access: 'direct_readable_via_aside', direct_read_reviews: 30, onsen_related_direct_reviews: 16, source_url: sources.yahoo },
        tripadvisor: { visible_review_count: 261, review_body_access: 'direct_readable_via_aside', direct_read_reviews: 40, onsen_related_direct_reviews: 25, source_url: sources.tripadvisor },
        booking: { visible_review_count: 331, review_body_access: 'partial', direct_read_reviews: 10, onsen_related_direct_reviews: 6, source_url: sources.booking },
        naver_search: asideReviewSummary.naver_search
      },
      official_bath_facts_seen: aggregate.official_bath_facts_seen,
      review_signal_keywords: ['大浴場', '露天風呂', '外湯', '貸切風呂', '森のプライベートスパ', '沸かし湯', '白湯', '대욕장', '정원뷰 노천탕'],
      caution_keywords: ['客室露天風呂は白湯', '外湯まで距離', '送迎バス', '朝食混雑', '大浴場混雑', '価格期待'],
      next_sampling: 'A로 올리려면 Google-native 리뷰 탭과 Naver Blog/Cafe 직접 본문을 열어 한국어 온천 표본을 추가해야 한다.'
    }
  ]
};

await fs.writeFile(path.join(outDir, `shogetsutei_signal_aggregate_${TODAY}.json`), JSON.stringify(aggregate, null, 2));
await fs.writeFile(path.join(outDir, `platform_mapping_${TODAY}.json`), JSON.stringify(platformMapping, null, 2));

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const manifest = [
  ['research_order', 'slug', 'name_ja', 'name_ko_or_en', 'area', 'track', 'source_tier', 'bath_research_axes', 'initial_review_pool_signal', 'priority_reason', 'status'],
  [1, slug, '城崎温泉 西村屋ホテル招月庭', '기노사키 온천 니시무라야 호텔 쇼게츠테이 / Nishimuraya Hotel Shogetsutei', '城崎温泉, 兵庫県', 'ready_deep_research', 'Tier 1', 'public_bath; open_air_public_bath; private_bath; room_open_air_bath_non_hot_spring; outside_bath_access', 'visible minimum 3753; direct 305; onsen direct 172', '공식상 객실 노천탕은 백탕, 대욕장/대절탕은 온천이라는 욕장별 분리 가치가 큼', 'sampled_B_needs_korean_direct_body_for_A']
].map((row) => row.map(csvCell).join(',')).join('\n');
await fs.writeFile(path.join(outDir, `deep_research_manifest_${TODAY}.csv`), manifest);

const md = `# review_signal_summary_${TODAY}: 城崎温泉 西村屋ホテル招月庭

## 1. 수집 브리핑

- 이번 숙소: 1곳 \`${slug}\`
- 플랫폼상 visible review pool: 최소 3,753건
  - Rakuten 101 / Jalan 1,113 / Yahoo Travel 149 / Tripadvisor 261 / Booking.com 331 / Google Maps 1,717 / Google Trip.com 공급자 카드 81
  - Naver·KAYAK·Agoda 표면은 중복 위험 또는 snippet_only라 최소 합계에서 제외
- 직접 읽은 리뷰 수: 305건
  - 정적 직접 본문 225건: Rakuten 101, Jalan 59, JTB 65
  - Aside 직접 본문 80건: Yahoo Travel 30, Tripadvisor 40, Booking.com 대표 후기 10
- 온천 관련 직접 리뷰 수: 172건
- 직접 본문 플랫폼 수: 6개
- Google / Naver 확인 여부:
  - Google Maps/Hotels는 Aside Browser로 확인. rating 4.5, visible 1,717, 공급자 카드 확인. Google-native 본문은 이번 표본에서 직접 태깅하지 않음.
  - Naver Search는 Aside Browser로 확인했으나 직접 본문 없이 \`snippet_only\`.
- data_quality_grade: B
  - 300건과 플랫폼 수는 충족했지만, 한국어/Naver 직접 본문과 Google-native 리뷰 탭 표본이 부족해 A가 아니라 B로 둔다.

## 2. 공식 사실

- 공식명: 城崎温泉 西村屋ホテル招月庭
- 한국어/영어 표기: 기노사키 온천 니시무라야 호텔 쇼게츠테이 / Nishimuraya Hotel Shogetsutei
- 주소/온천지명: 兵庫県豊岡市城崎町湯島1016-2, 城崎温泉
- 공식 사이트: ${sources.official}
- 공식 객실 노천탕 페이지: ${sources.officialRoomOpenAir}
- 공식 프라이빗 스파 페이지: ${sources.officialPrivateSpa}

공식 페이지 기준으로 객실 노천탕은 존재하지만, 城崎温泉의 외탕·온천 자원 보호 때문에 개인 점유 객실탕은 \`沸かし湯/白湯\`를 사용한다고 명시된다. 반면 대욕장과貸切風呂는 온천 사용 축으로 분리된다. 따라서 이 숙소는 “객실 노천탕 있음”을 곧바로 “객실 온천탕”으로 번역하면 안 된다.

## 3. 리뷰 신호 요약

| bath_area | signal_type | direction | mention_count | platform_count | status | 해석 |
|---|---|---:|---:|---:|---|---|
| public_bath | public_bath_hot_spring | positive | ${staticSummary.bath_area_tags.public_bath + 28} | 6 | strong_signal | 대욕장·내탕·노천탕 만족이 다중 플랫폼에서 반복된다. |
| open_air_public_bath | public_bath_hot_spring | positive | ${staticSummary.bath_area_tags.open_air_public_bath + 12} | 4 | moderate_signal | 정원/숲/노천탕 맥락의 긍정 신호가 확인된다. |
| private_bath | private_bath_experience | positive | ${staticSummary.bath_area_tags.private_bath + 7} | 4 | moderate_signal | 森のプライベートスパ·貸切風呂 만족이 보이나 유료/예약성 확인이 필요하다. |
| room_open_air_bath | room_bath_hot_spring | mixed | ${staticSummary.bath_area_tags.room_open_air_bath + 4} | 4 | conflicting | 객실 노천탕 만족은 있으나 공식상 온천이 아니라 백탕/沸かし湯이므로 Bathtime 표기는 분리해야 한다. |
| facility_wide | crowding | mixed | ${staticSummary.signal_type_tags.crowding + 8} | 4 | moderate_signal | 대욕장·조식·대형 숙소 운영 혼잡 신호가 일부 반복된다. |

## 4. 근거 예시

1. Rakuten / ja / \`外湯巡り\`, \`お風呂\`: 외탕 세트와 숙소 목욕 만족이 최신 표본에서 확인됨. ${sources.rakuten}
2. Jalan / ja / \`貸切露天風呂\`, \`大浴場\`: 대절 노천과 대욕장 축이 함께 언급됨. ${sources.jalan}
3. JTB / ja / \`温泉\`, \`外湯\`: 숙소 온천과 외탕 접근이 같이 나타남. ${sources.jtb}
4. Yahoo Travel / ja / \`客室露天風呂付き\`, \`大浴場\`: 객실 노천탕 이용과 대욕장 기대치가 동시에 보임. ${sources.yahoo}
5. Yahoo Travel / ja / \`サウナ\`, \`湯加減\`: 대욕장 부속 사우나와 온도 만족 신호. ${sources.yahoo}
6. Tripadvisor / ja / \`貸切風呂\`, \`良い泉質\`: 森のプライベートスパ/대절탕 만족. ${sources.tripadvisor}
7. Tripadvisor / ja / \`部屋の露天風呂は天然温泉ではない\`: 객실 노천탕이 온천이 아니라는 이용자 인식. ${sources.tripadvisor}
8. Tripadvisor / ja / \`大浴場\`, \`朝食混雑\`: 대욕장 긍정과 운영 혼잡 신호가 함께 확인됨. ${sources.tripadvisor}
9. Booking.com / en/ko / \`private onsen\`, \`outdoor onsen\`: 영어권 대표 후기에서 프라이빗/야외 온천 만족. ${sources.booking}
10. Google/Naver / ko snippet_only / \`온센 메구리\`, \`정원뷰 노천탕\`: 한국어 수요 신호는 있으나 직접 리뷰 수에는 포함하지 않음. ${sources.naver}

## 5. Bathtime 해석

직접 확인 305건 중 온천 관련 172건에서, 쇼게츠테이는 공용 대욕장·노천탕과 외탕 접근, 그리고 프라이빗 스파가 함께 읽히는 대형 고급 온천 숙소다. 다만 공식상 객실 노천탕은 \`沸かし湯/白湯\`로 명시되므로, Bathtime에서는 “객실 노천탕 있음”과 “객실 온천탕”을 반드시 분리해야 한다. 한국어 직접 본문이 아직 약해 A가 아니라 B로 두지만, 욕장별 구조 신호는 뚜렷하게 확인된다.

## 6. Gaps

- Google-native 리뷰 탭 본문은 이번 라운드에서 직접 태깅하지 못함.
- Naver는 검색 스니펫과 블로그/카페 표면만 확인되어 \`snippet_only\`.
- Jalan은 visible 1,113건이지만 정적 페이지네이션에서 59건만 고유 본문으로 확보됨.
- Yahoo Travel은 page 파라미터가 첫 페이지를 반복해 30건만 직접 표본으로 계산.
- A로 올리려면 Google-native 20건 이상과 Naver Blog/Cafe 한국어 직접 본문 10건 이상을 추가하는 것이 우선이다.
`;

await fs.writeFile(path.join(outDir, `review_signal_summary_${TODAY}.md`), md);

console.log(JSON.stringify({
  slug,
  grade: aggregate.data_quality_grade,
  visible_review_pool_minimum: visiblePoolMinimum,
  direct_reviews_read_total: directTotal,
  onsen_related_direct_reviews_total: onsenTotal,
  direct_body_platforms: aggregate.direct_body_platforms
}, null, 2));
