import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');

const oldAggregate = JSON.parse(await fs.readFile(path.join(outDir, 'xyz_speciale_signal_aggregate_2026-07-04.json'), 'utf8'));
const oldMapping = JSON.parse(await fs.readFile(path.join(outDir, 'platform_mapping_2026-07-04.json'), 'utf8'));

const reinforcement = {
  research_date: '2026-07-06',
  slug: 'shirahama-xyz-speciale',
  accommodation_name: '海絶景とギネス認定の宿 全室露天風呂付離れ XYZスペチアーレ',
  purpose: 'B급 종료 사유 보강 및 300건 도달 가능성 재점검',
  method: [
    '기존 Rakuten/Jalan/Ikkyu/Google/초기 Yahoo 표본은 유지했다.',
    'Yahoo Travel 개별 리뷰 페이지 p1-p2를 재확인해 Yahoo-native 본문 수를 보강했다.',
    'Trip.com review page와 Expedia.jp/en property page에서 날짜·작성자 단위 본문이 보이는 항목만 직접 본문으로 산입했다.',
    'Hotels.com의 대형 리뷰풀은 XYZ Private spa and Seaside Resort 표면으로, 이번 숙소 XYZ Speciale 본문 수에서 제외했다.',
    '검색 결과 스니펫과 AI/요약 문구는 직접 리뷰 수에서 제외했다.'
  ],
  aside_browser_recheck: {
    attempted: true,
    result: '2026-07-06 broad/narrow Aside exec 재시도는 빈 출력으로 종료되어 새 증거로 산입하지 않았다.',
    google_native_change: 'none',
    naver_change: 'none'
  },
  platform_rechecks: {
    yahoo_travel: {
      source_url: 'https://travel.yahoo.co.jp/00002920/review/',
      page_urls_checked: [
        'https://travel.yahoo.co.jp/00002920/review/',
        'https://travel.yahoo.co.jp/00002920/review/p2/'
      ],
      visible_review_count: 176,
      rating: 4.63,
      prior_direct_reviews_read: 6,
      updated_direct_reviews_read: 37,
      newly_counted_direct_reviews: 31,
      updated_onsen_related_direct_reviews: 27,
      review_body_access: 'direct_readable',
      overlap_caution: 'Yahoo Travel 표면은 Ikkyu와 평점/리뷰풀 176건을 공유하지만, Yahoo 페이지는 Yahoo投稿のみ 표시라고 명시한다. 독립 플랫폼 표면으로는 세되 source_count 과대해석은 피한다.',
      short_keywords_seen: [
        '露天風呂の壁と屋根が可動式',
        '温泉は文句なし',
        'トロトロ温泉',
        '客室露天風呂',
        '開閉式の露天風呂',
        '椿温泉',
        '温度調節',
        '送迎の予約'
      ],
      note: 'p1/p2에서 개별 제목·작성자·投稿日·客室名·評点이 붙은 본문을 확인했다. 방문자口コミ/지도 성격 블록은 숙박 예약 리뷰로 보지 않고 제외했다.'
    },
    trip_com: {
      source_url: 'https://in.trip.com/hotels/shirahama-hotel-detail-79030461/xyz-speciale/review.html',
      visible_review_count: 18,
      prior_direct_reviews_read: 0,
      updated_direct_reviews_read: 8,
      newly_counted_direct_reviews: 8,
      updated_onsen_related_direct_reviews: 3,
      review_body_access: 'partial',
      access_note: '18건 표면 중 페이지에서 직접 읽힌 개별 본문은 8건으로 제한했다. 번역 UI 문구와 이미지 카드는 제외했다.',
      short_keywords_seen: [
        'Double with Bath',
        'Open-Air Hot Spring',
        'hot springs',
        'stars',
        'hotel car',
        'laser show'
      ]
    },
    expedia: {
      source_url: 'https://www.expedia.co.jp/en/Tanabe-Hotels-XYZ-Speciale.h67621525.Hotel-Information',
      visible_review_count: 35,
      rating: 9.8,
      prior_direct_reviews_read: 0,
      updated_direct_reviews_read: 16,
      newly_counted_direct_reviews: 16,
      updated_onsen_related_direct_reviews: 9,
      review_body_access: 'partial',
      access_note: '35건 표면 중 작성자·날짜·본문이 함께 보이는 항목만 직접 본문으로 산입했다. 평점만 있고 본문이 없는 항목은 제외했다.',
      short_keywords_seen: [
        'Onsen',
        'star view',
        '露天風呂',
        '温泉good',
        '内風呂',
        '絶景露天風呂',
        'かけ流し',
        '椿温泉',
        '虫'
      ]
    },
    hotels_com_private_spa: {
      source_url: 'https://www.hotels.com/ho636650912/xyz-private-spa-and-seaside-resort-shirahama-japan/',
      visible_review_count_seen: 263,
      review_body_access: 'direct_readable_but_excluded',
      status: 'not_counted',
      reason: '표면 숙소명이 XYZ Private spa and Seaside Resort로, 이번 대상인 XYZ Speciale와 다른 관련/자매 숙소로 판단되어 직접 리뷰 수에 합산하지 않았다.'
    },
    tripadvisor: {
      source_url: 'https://www.tripadvisor.jp/Hotel_Review-g1121351-d23965059-Reviews-XYZ_speciale-Shirahama_cho_Nishimuro_gun_Wakayama_Prefecture_Kinki.html',
      visible_review_count: 1,
      direct_reviews_read: 0,
      review_body_access: 'partial',
      note: '숙소 프로필과 공식성 설명은 보이나 개별 리뷰 본문은 안정적으로 노출되지 않아 직접 수 제외.'
    },
    naver_search_blog: {
      review_body_access: 'snippet_only',
      direct_reviews_read: 0,
      note: '한국어 직접 숙박 본문은 이번 보강에서도 확보하지 못했다. 검색 결과/OTA 스니펫은 직접 리뷰 수에서 제외한다.'
    }
  },
  updated_count_delta: {
    previous_total_direct_reviews_read: 191,
    previous_onsen_related_direct_reviews: 135,
    newly_counted_direct_reviews: 55,
    newly_counted_onsen_related_direct_reviews: 34,
    updated_total_direct_reviews_read: 246,
    updated_onsen_related_direct_reviews: 169,
    remaining_to_300: 54
  },
  grade_after_recheck: {
    data_quality_grade: 'B',
    reason: '직접 확인 246건, 직접 본문 플랫폼 7개 표면으로 보강됐지만 300건 미만이다. 150-299건 종료 구간이므로 접근 실패·부분 접근 사유를 유지한다.'
  }
};

const updatedPlatformCounts = {
  ...oldAggregate.platform_direct_counts,
  'Yahoo Travel': {
    visible_review_count: 176,
    direct_reviews_read: 37,
    onsen_related_direct_reviews: 27,
    review_body_access: 'direct_readable',
    notes: '2026-07-06 p1-p2 재확인으로 Yahoo-native 직접 본문을 37건까지 보강. Ikkyu 공유 리뷰풀 가능성은 계속 주의.'
  },
  'Trip.com': {
    visible_review_count: 18,
    direct_reviews_read: 8,
    onsen_related_direct_reviews: 3,
    review_body_access: 'partial'
  },
  Expedia: {
    visible_review_count: 35,
    direct_reviews_read: 16,
    onsen_related_direct_reviews: 9,
    review_body_access: 'partial'
  },
  Tripadvisor: {
    visible_review_count: 1,
    direct_reviews_read: 0,
    onsen_related_direct_reviews: 0,
    review_body_access: 'partial'
  },
  'Hotels.com / XYZ Private spa': {
    visible_review_count: 263,
    direct_reviews_read: 0,
    onsen_related_direct_reviews: 0,
    review_body_access: 'direct_readable_but_excluded',
    notes: '숙소 정체성 불일치로 XYZ Speciale 직접 수에서 제외.'
  }
};

const directPlatforms = Object.entries(updatedPlatformCounts)
  .filter(([, v]) => v.direct_reviews_read > 0)
  .map(([k]) => k);

const updatedAggregate = {
  ...oldAggregate,
  research_date: '2026-07-06',
  data_quality_grade: 'B',
  grade_reason: '직접 확인 246건, 직접 본문 플랫폼 7개 표면을 확보했으나 300건 미만이다. 2026-07-06 재확인으로 Yahoo/Trip.com/Expedia 본문을 보강했지만 A급 기준에는 54건이 더 필요하다.',
  visible_review_pool_raw_platform_sum: 770,
  visible_review_pool_dedup_caution: 'Ikkyu/Yahoo 176건은 같은 총 리뷰풀 표면이다. Trip.com 18건, Expedia 35건은 일부 본문만 직접 확인했다. Hotels.com의 263건 표면은 XYZ Private spa and Seaside Resort로 숙소 정체성이 달라 직접 수와 리뷰풀 합산에서 제외해야 한다.',
  direct_review_counts: {
    total_direct_reviews_read: 246,
    onsen_related_direct_reviews: 169,
    direct_body_platform_count: directPlatforms.length,
    direct_body_platforms: directPlatforms
  },
  platform_direct_counts: updatedPlatformCounts,
  review_signal_tags: [
    {
      ...oldAggregate.review_signal_tags[0],
      mention_count: 116,
      source_count: 116,
      platform_count: 7,
      note: '객실 노천탕, 해전망, 별하늘, 프라이빗 이용이 반복된다. Yahoo/Trip.com/Expedia 보강 후에도 대욕장보다 객실 노천탕 중심으로 해석하는 편이 맞다.'
    },
    {
      ...oldAggregate.review_signal_tags[1],
      mention_count: 38,
      source_count: 38,
      platform_count: 5
    },
    {
      ...oldAggregate.review_signal_tags[2],
      mention_count: 58,
      source_count: 58,
      platform_count: 7,
      note: 'トロトロ, すべすべ, 化粧水, 温泉good, かけ流し 같은 수질·피부감 표현이 반복된다.'
    },
    oldAggregate.review_signal_tags[3],
    {
      ...oldAggregate.review_signal_tags[4],
      mention_count: 34,
      source_count: 34,
      platform_count: 6,
      note: '전동 지붕·벽, 레이저 연출, 송영/예약, 객실식 같은 숙박 운영 신호가 온천 신호와 함께 자주 등장한다. 온천 품질과 고가/연출 만족은 분리해야 한다.'
    }
  ],
  management_notes: [
    ...oldAggregate.management_notes,
    '2026-07-06 보강에서 Expedia/Trip.com 본문을 일부 추가했지만 한국어 직접 본문은 여전히 0건이다.',
    'Hotels.com의 큰 리뷰풀은 XYZ Private spa and Seaside Resort 표면으로 확인되어 XYZ Speciale 직접 수에서 제외했다.'
  ],
  termination_reason_150_299: {
    ended_below_300: true,
    reason: '2026-07-06 재확인으로 Yahoo Travel, Trip.com, Expedia의 직접 본문을 보강해 246건까지 올렸지만 300건에는 도달하지 못했다. Google Maps native는 이전 Aside 확인에서 10건 이후 추가 로딩 실패, Naver는 직접 숙박 본문 미확보, Jalan은 중복 페이지, Ikkyu 남은 페이지 렌더링 실패가 유지된다. Hotels.com 263건 표면은 XYZ Private spa and Seaside Resort로 숙소 정체성이 달라 제외했다.',
    aside_browser_used: true,
    next_to_reach_A: 'A급까지 최소 54건의 추가 직접 본문이 필요하다. 우선 Ikkyu p6 이후 렌더링, Google Maps native 60건 중 미확보 50건, Expedia 35건 중 본문 미노출 19건, Trip.com 18건 중 미확보 10건, Naver Blog/Cafe 직접 본문을 재확인해야 한다.'
  },
  reinforcement_2026_07_06: reinforcement
};

const lodging = oldMapping.lodgings[0];
const updatedMapping = {
  ...oldMapping,
  research_date: '2026-07-06',
  method: 'Static collection plus 2026-07-06 web/Aside recheck. Yahoo Travel p1-p2, Trip.com review page, Expedia property page were added as direct-body partial/direct surfaces. Hotels.com XYZ Private spa was excluded as a different related lodging.',
  direct_review_sampling_status: 'B: 246 direct reviews read, 169 onsen-related direct reviews, 7 direct-body platform surfaces. 300건 미만 종료 사유 갱신.',
  lodgings: [
    {
      ...lodging,
      google_maps: {
        ...lodging.google_maps,
        access_note: `${lodging.google_maps.access_note} 2026-07-06 Aside exec 재시도는 빈 출력으로 종료되어 새 Google-native 본문으로 산입하지 않았다.`
      },
      ota_review_pool_signals: {
        ...lodging.ota_review_pool_signals,
        yahoo_travel: {
          ...lodging.ota_review_pool_signals.yahoo_travel,
          direct_reviews_read: 37,
          onsen_related_direct_reviews: 27,
          review_body_access: 'direct_readable',
          access_note: '2026-07-06 p1-p2 재확인으로 Yahoo-native 직접 본문 37건까지 보강. Ikkyu 공유 리뷰풀 가능성은 계속 주의.'
        },
        trip_com: {
          rating: null,
          visible_review_count: 18,
          review_body_access: 'partial',
          direct_reviews_read: 8,
          onsen_related_direct_reviews: 3,
          source_url: 'https://in.trip.com/hotels/shirahama-hotel-detail-79030461/xyz-speciale/review.html',
          access_note: '18건 표면 중 날짜·객실 타입·본문이 보이는 8건만 직접 수로 산입.'
        },
        expedia: {
          ...lodging.ota_review_pool_signals.expedia,
          review_body_access: 'partial',
          direct_reviews_read: 16,
          onsen_related_direct_reviews: 9,
          source_url: 'https://www.expedia.co.jp/en/Tanabe-Hotels-XYZ-Speciale.h67621525.Hotel-Information',
          access_note: '35건 표면 중 작성자·날짜·본문이 함께 보이는 16건만 직접 수로 산입.'
        },
        tripadvisor: {
          rating: 5.0,
          visible_review_count: 1,
          review_body_access: 'partial',
          direct_reviews_read: 0,
          source_url: 'https://www.tripadvisor.jp/Hotel_Review-g1121351-d23965059-Reviews-XYZ_speciale-Shirahama_cho_Nishimuro_gun_Wakayama_Prefecture_Kinki.html',
          access_note: '개별 리뷰 본문 미노출로 직접 수 제외.'
        },
        hotels_com_private_spa_excluded: {
          rating: null,
          visible_review_count: 263,
          review_body_access: 'direct_readable_but_excluded',
          direct_reviews_read: 0,
          source_url: 'https://www.hotels.com/ho636650912/xyz-private-spa-and-seaside-resort-shirahama-japan/',
          access_note: 'XYZ Private spa and Seaside Resort 표면으로, XYZ Speciale와 숙소 정체성이 달라 제외.'
        }
      },
      next_sampling: 'A급까지 최소 54건 추가 직접 본문 필요. Ikkyu p6 이후, Google Maps native 미확보 50건, Expedia/Trip.com 잔여 본문, Naver Blog/Cafe 직접 숙박 글을 우선 재확인.'
    }
  ]
};

const report = `# XYZ Speciale 온천 리뷰 신호 요약

## 1. 수집 브리핑

- 조사 숙소: 1곳 (\`shirahama-xyz-speciale\`)
- 플랫폼상 전체 리뷰풀: 원시 표면 기준 약 770건. 단, Ikkyu/Yahoo 176건은 공유 리뷰풀 표면이고, Hotels.com 263건은 \`XYZ Private spa and Seaside Resort\`라 이번 숙소 직접 수에서 제외했다.
- 직접 읽은 리뷰 수: 246건
- 온천 관련 직접 리뷰 수: 169건
- 직접 본문 플랫폼 수: 7개 표면(Rakuten Travel, Jalan, Ikkyu, Yahoo Travel, Google Maps native, Trip.com, Expedia)
- Google 확인: 기존 Aside Browser 확인에서 Google Maps visible 60건, Google-native 직접 10건, 온천 관련 5건. 2026-07-06 Aside exec 재시도는 빈 출력이라 새 증거로 산입하지 않았다.
- Naver 확인: 한국어 직접 숙박 본문 0건. 검색/OTA 스니펫은 \`snippet_only\`로 분리하고 직접 리뷰 수에서 제외했다.
- 보강 플랫폼: Yahoo Travel p1-p2, Trip.com review page, Expedia property page.
- 접근 실패/제한: Google은 10건 이후 추가 로딩 실패가 유지된다. Ikkyu는 p1-p5 138건 뒤 p6 이후 렌더링 실패. Jalan은 중복 페이지. Agoda/Booking/JTB/Naver/Tripadvisor는 직접 본문 산입 불가 또는 미확보.
- data_quality_grade: \`B\`. 직접 246건과 다중 플랫폼 조건은 충족하지만 300건 미만이다.

## 2. 공식 사실

공식/시설 주장은 전실 분리형 객실에 원천가케나가시 노천탕이 붙은 숙소라는 점이다. Rakuten/OTA 표면에서는 객실 노천탕의 지붕과 전면 벽이 전동 개폐되어 날씨와 시선에 맞춰 조절 가능하다는 시설 정보도 확인된다.

이번 조사에서 대욕장, 공용 노천탕, 예약제 대절탕, 가족탕은 핵심 시설축으로 확인되지 않았다. 이 숙소는 \`public_bath\`형 숙소가 아니라 \`room_open_air_bath\`와 \`room_bath\` 중심으로 해석해야 한다.

## 3. 리뷰 신호 요약 표

| bath_area | signal_type | direction | mention_count | platform_count | status | 해석 |
|---|---:|---:|---:|---:|---|---|
| room_open_air_bath | room_bath_hot_spring | positive | 116 | 7 | moderate_signal | 객실 노천탕, 해전망, 별하늘, 프라이빗 이용이 뚜렷하게 확인된다. |
| room_bath | room_bath_hot_spring | positive | 38 | 5 | moderate_signal | 내탕/ミラバス/蛇口から温泉 신호가 노천탕보다 작지만 반복된다. |
| facility_wide | water_texture | positive | 58 | 7 | moderate_signal | \`トロトロ\`, \`すべすべ\`, \`椿温泉\`, \`かけ流し\` 계열 수질·피부감 표현이 반복된다. |
| public_bath | public_bath_hot_spring | neutral | 3 | 2 | weak_signal | 대욕장 만족 신호가 아니라 객실탕 중심 구조를 확인하는 보조 신호다. |
| room_open_air_bath | booking_confusion | mixed | 34 | 6 | moderate_signal | 전동 개폐, 레이저, 송영/예약, 객실식 신호가 온천 신호와 섞인다. |

## 4. 근거 예시

| source | language | review_date | paraphrase | original_keyword | source_url |
|---|---|---:|---|---|---|
| Rakuten Travel | ja | 2026-05-25 | 객실 노천탕의 개폐·시선 조절과 온천 이용을 함께 언급했다. | \`客室露天風呂\`, \`開閉\`, \`目隠し\` | https://travel.rakuten.co.jp/HOTEL/182811/review.html |
| Ikkyu | ja | 2026-06-19 | 미라블/미라바스와 전천후 객실 노천탕을 온천 경험으로 평가했다. | \`ミラブル\`, \`ミラバス\`, \`全天候型露天風呂\` | https://www.ikyu.com/00002920/review/ |
| Yahoo Travel | ja | 2026-06-28 | 객실 노천탕의 벽과 지붕이 움직이는 구조가 구체적으로 나타났다. | \`露天風呂の壁と屋根が可動式\` | https://travel.yahoo.co.jp/00002920/review/ |
| Yahoo Travel | ja | 2025-03-29 | 바다와 파도 소리를 배경으로 객실 온천을 쓰는 경험이 반복됐다. | \`海を見ながらの温泉\`, \`波の音\` | https://travel.yahoo.co.jp/00002920/review/p2/ |
| Yahoo Travel | ja | 2025-01-14 | 전동 개폐식 노천탕과 밤 시간대 수질·별하늘 조합이 드러났다. | \`電動開閉式\`, \`トロトロ温泉\`, \`月と星空\` | https://travel.yahoo.co.jp/00002920/review/p2/ |
| Yahoo Travel | ja | 2024-08-11 | 낮은 평점에서도 온천·객실탕 점수는 높고, 객실 온도·수압·송영 문제가 분리되어 나타났다. | \`部屋の中のお風呂\`, \`水圧\`, \`送迎\` | https://travel.yahoo.co.jp/00002920/review/p2/ |
| Trip.com | en/translated | 2024-01-08 | 식사와 함께 온천·별하늘 만족이 짧게 확인됐다. | \`hot springs\`, \`stars\` | https://in.trip.com/hotels/shirahama-hotel-detail-79030461/xyz-speciale/review.html |
| Expedia | en | 2024-06-07 | 객실 안에서 온천·식사·밤하늘을 함께 기억하는 신호가 있다. | \`Onsen\`, \`star view\`, \`within the room\` | https://www.expedia.co.jp/en/Tanabe-Hotels-XYZ-Speciale.h67621525.Hotel-Information |
| Expedia | ja | 2022-09-01 | 내탕과 객실 노천탕이 모두 온천으로 언급되고 pH/椿温泉 표현이 붙었다. | \`内風呂\`, \`絶景露天風呂\`, \`かけ流し\`, \`椿温泉\` | https://www.expedia.co.jp/en/Tanabe-Hotels-XYZ-Speciale.h67621525.Hotel-Information |
| Google Maps native | ja | unknown | 객실 노천탕과 온천 만족을 짧게 남긴 Google-native 리뷰가 확인됐다. | \`部屋の露天\`, \`温泉最高\` | Google Maps panel via Aside Browser |

## 5. Bathtime 해석

직접 확인 표본 246건 중 온천 관련 본문은 169건이며, 신호는 대욕장보다 객실 노천탕과 객실 내탕에 집중된다. \`客室露天風呂\`, \`内湯\`, \`ミラバス\`, \`トロトロ\`, \`椿温泉\`이 여러 플랫폼에서 반복되어, 이 숙소는 “대욕장 품질”이 아니라 “객실 안에서 완결되는 원천가케나가시·해전망 온천 경험”으로 분류하는 편이 데이터에 맞다.

다만 레이저 연출, 롤스로이스/송영, 고가 기대치, 전동 지붕·벽 조작 신호가 온천 만족과 자주 붙어 나온다. Bathtime에서는 온천 수질·객실탕 구조와 숙박 연출/가격 기대치를 분리해 보여줘야 과대해석을 줄일 수 있다.

## 6. Gaps

- 300건 미달 종료 사유: 보강 후 직접 246건으로, A급까지 54건이 부족하다.
- Ikkyu: visible 176건 중 p1-p5 138건 직접 본문화. p6 이후 렌더링 실패가 유지된다.
- Yahoo Travel: 2026-07-06 p1-p2로 37건까지 보강했지만, Ikkyu와 리뷰풀 공유 가능성이 있어 source_count 과대해석에 주의한다.
- Google Maps: visible 60건이나 리뷰 탭에서 10건 이후 추가 본문 로딩 실패. 2026-07-06 Aside exec 재시도는 빈 출력.
- Jalan: visible 77건이나 static p1-p4가 동일한 17건 고유 본문을 반복했다.
- Trip.com: visible 18건 중 8건만 직접 본문화.
- Expedia: visible 35건 중 16건만 직접 본문화. 평점만 있고 본문이 없는 항목은 제외했다.
- Hotels.com: 263건 표면은 \`XYZ Private spa and Seaside Resort\`라 숙소 정체성 불일치로 제외했다.
- Agoda/Booking/JTB/Tripadvisor/Naver: 직접 본문 수 0건. Naver 검색 결과와 OTA 스니펫은 직접 리뷰 수에서 제외.

다음에 A급으로 올리려면 최소 54건 이상의 추가 직접 본문이 필요하다. 우선 Google Maps native 미확보 50건, Ikkyu p6 이후, Expedia/Trip.com 잔여 본문, Naver Blog/Cafe 직접 숙박 글을 재확인해야 한다.
`;

await fs.writeFile(path.join(outDir, 'xyz_speciale_reinforcement_2026-07-06.json'), JSON.stringify(reinforcement, null, 2));
await fs.writeFile(path.join(outDir, 'xyz_speciale_signal_aggregate_2026-07-06.json'), JSON.stringify(updatedAggregate, null, 2));
await fs.writeFile(path.join(outDir, 'platform_mapping_2026-07-06.json'), JSON.stringify(updatedMapping, null, 2));
await fs.writeFile(path.join(outDir, 'review_signal_summary_2026-07-06.md'), report);

console.log(JSON.stringify({
  written: [
    'xyz_speciale_reinforcement_2026-07-06.json',
    'xyz_speciale_signal_aggregate_2026-07-06.json',
    'platform_mapping_2026-07-06.json',
    'review_signal_summary_2026-07-06.md'
  ],
  direct_reviews_read: updatedAggregate.direct_review_counts.total_direct_reviews_read,
  onsen_related_direct_reviews: updatedAggregate.direct_review_counts.onsen_related_direct_reviews,
  direct_body_platform_count: updatedAggregate.direct_review_counts.direct_body_platform_count,
  data_quality_grade: updatedAggregate.data_quality_grade
}, null, 2));
