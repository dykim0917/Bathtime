import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');

const oldAggregate = JSON.parse(await fs.readFile(path.join(outDir, 'shogetsutei_signal_aggregate_2026-07-04.json'), 'utf8'));
const oldMapping = JSON.parse(await fs.readFile(path.join(outDir, 'platform_mapping_2026-07-04.json'), 'utf8'));

const reinforcement = {
  research_date: '2026-07-06',
  slug: 'kinosaki-nishimuraya-shogetsutei',
  accommodation_name: '城崎温泉 西村屋ホテル招月庭',
  purpose: 'B급 사유였던 Google/Naver/Korean strata 결핍 재점검 및 Trip.com 직접 본문 보강',
  method: [
    '기존 Rakuten/Jalan/JTB/Yahoo/Tripadvisor/Booking 직접 표본 305건은 유지했다.',
    'Trip.com review page에서 날짜·객실 타입·본문이 함께 보이는 15건을 직접 본문으로 추가했다.',
    'Tripadvisor Korea에서 한국어 원문 리뷰 1건을 직접 본문으로 추가했다.',
    'Google Hotels/Maps는 기존 Aside Browser 확인 기록을 유지하되, 2026-07-06 Aside repl은 로컬 브라우저 연결 타임아웃으로 새 Google-native 본문을 확보하지 못했다.',
    'Naver/검색 스니펫, Google 공급자 카드, OTA 요약은 직접 리뷰 수에서 제외했다.'
  ],
  platform_rechecks: {
    google_hotels_maps: {
      previous_source: 'Aside Browser 2026-07-04',
      rating: 4.5,
      visible_review_count: 1717,
      prior_direct_google_native_reviews: 0,
      updated_direct_google_native_reviews: 0,
      review_body_access: 'partial',
      recheck_2026_07_06: 'aside repl openTab timed out at localhost browser connection; web open of Google Travel redirected to unsupported-browser page.',
      provider_cards_seen_previous: [
        'Trip.com 4.6/5 81 reviews',
        'Tripadvisor 4.4/5 261 reviews'
      ],
      note: 'Google 공급자 카드는 Google-native 본문으로 세지 않는다.'
    },
    naver_search_blog: {
      review_body_access: 'snippet_only',
      direct_reviews_read: 0,
      onsen_related_direct_reviews: 0,
      note: 'Naver 직접 숙박 본문은 계속 미확보. 한국어 직접 층은 Tripadvisor Korea 원문 1건으로 별도 보강했다.'
    },
    trip_com: {
      source_url: 'https://www.trip.com/hotels/toyooka-hotel-detail-705576/kinosaki-onsen-nishimuraya-hotel-shogetsutei/review.html',
      rating: 9.3,
      visible_review_count: 82,
      review_body_access: 'partial',
      direct_reviews_read: 15,
      onsen_related_direct_reviews: 11,
      strata_seen: [
        'latest_2026',
        'low_rating_6_5',
        'onsen_keyword',
        'private_hot_spring',
        'public_hot_spring',
        'hot_spring_town'
      ],
      short_keywords_seen: [
        'onsen town',
        'public hot spring bath',
        'private hot spring baths',
        'private hot springs',
        'hotel onsen',
        'outdoor and indoor hot spring',
        'public soup',
        'great hot spring resort'
      ]
    },
    tripadvisor_korea: {
      source_url: 'https://www.tripadvisor.co.kr/ShowUserReviews-g1022822-d1165592-r437351401-Kinosaki_Onsen_Nishimuraya_Hotel_Shogetsutei-Toyooka_Hyogo_Prefecture_Kinki.html',
      review_body_access: 'direct_readable',
      direct_reviews_read: 1,
      onsen_related_direct_reviews: 1,
      language: 'ko',
      short_keywords_seen: [
        '온센 메구리',
        '호텔 내부에 있는 온천',
        '가족과 여행'
      ],
      note: 'Tripadvisor Korea property page shows Korean language count 2, but this pass opened and counted only the directly visible full Korean body.'
    }
  },
  updated_count_delta: {
    previous_total_direct_reviews_read: 305,
    previous_onsen_related_direct_reviews: 172,
    newly_counted_direct_reviews: 16,
    newly_counted_onsen_related_direct_reviews: 12,
    updated_total_direct_reviews_read: 321,
    updated_onsen_related_direct_reviews: 184,
    updated_direct_body_platform_count: 7
  },
  grade_after_recheck: {
    data_quality_grade: 'A',
    reason: '직접 확인 321건, 직접 본문 플랫폼 7개, 최신/저평점/온천 키워드/한국어 직접 리뷰 층을 보강했다. Google-native 직접 본문은 0건이지만 Google Hotels/Maps 자체는 Aside로 확인했고 공급자 카드는 분리했다.'
  }
};

const updatedAside = {
  ...oldAggregate.aside_review_summary,
  trip_com: {
    visible_review_count: 82,
    rating: 9.3,
    review_body_access: 'partial',
    directly_read_reviews: 15,
    onsen_related_direct_reviews: 11,
    notes: '2026-07-06 web review page에서 날짜·객실 타입·본문이 함께 보이는 15건 직접 확인. Google 공급자 카드와 분리.'
  },
  tripadvisor_korea: {
    visible_review_count: 2,
    rating: null,
    review_body_access: 'direct_readable',
    directly_read_reviews: 1,
    onsen_related_direct_reviews: 1,
    notes: '한국어 원문 리뷰 1건 직접 확인. Naver가 아니라 Tripadvisor Korea 층으로 기록.'
  },
  google_maps_hotels: {
    ...oldAggregate.aside_review_summary.google_maps_hotels,
    review_body_access: 'partial',
    directly_read_google_native_reviews: 0,
    onsen_related_google_native_reviews: 0,
    notes: `${oldAggregate.aside_review_summary.google_maps_hotels.notes} 2026-07-06 Aside repl 재시도는 로컬 브라우저 연결 타임아웃, Google Travel web open은 unsupported-browser 페이지로 리다이렉트되어 새 Google-native 본문을 확보하지 못했다.`
  },
  naver_search: {
    ...oldAggregate.aside_review_summary.naver_search,
    review_body_access: 'snippet_only',
    directly_read_reviews: 0,
    onsen_related_direct_reviews: 0,
    notes: `${oldAggregate.aside_review_summary.naver_search.notes} 2026-07-06 보강에서도 Naver 직접 본문은 0건이다.`
  }
};

const updatedAggregate = {
  ...oldAggregate,
  research_date: '2026-07-06',
  status: [
    'ready_deep_research_reinforced',
    'A_with_google_native_gap',
    'naver_snippet_only'
  ],
  data_quality_grade: 'A',
  grade_reason: '직접 확인 321건, 직접 본문 플랫폼 7개, 최신/저평점/온천 키워드/한국어 직접 리뷰 층을 보강했다. Google-native 직접 본문은 0건이나 Google Hotels/Maps 패널은 Aside로 확인했고 공급자 카드는 Google-native와 분리했다.',
  visible_review_pool_minimum_mapped: 3835,
  visible_review_pool_note: 'Rakuten 101 + Jalan 1,113 + Yahoo 149 + Tripadvisor 261 + Booking.com 331 + Google Maps 1,717 + Trip.com 82 + Google Trip.com 공급자 카드 81. Naver/KAYAK/Agoda 중복 표면은 최소 합계에서 제외.',
  direct_reviews_read_total: 321,
  onsen_related_direct_reviews_total: 184,
  direct_body_platforms: 7,
  direct_body_platform_names: [
    'Rakuten Travel',
    'Jalan',
    'JTB',
    'Yahoo Travel',
    'Tripadvisor',
    'Booking.com',
    'Trip.com'
  ],
  aside_review_summary: updatedAside,
  review_signal_table: [
    {
      ...oldAggregate.review_signal_table[0],
      mention_count: 104,
      source_count: 104,
      platform_count: 7
    },
    oldAggregate.review_signal_table[1],
    {
      ...oldAggregate.review_signal_table[2],
      mention_count: 23,
      source_count: 23,
      platform_count: 5
    },
    oldAggregate.review_signal_table[3],
    {
      ...oldAggregate.review_signal_table[4],
      mention_count: 27,
      source_count: 27,
      platform_count: 5
    }
  ],
  reinforcement_2026_07_06: reinforcement
};

const lodging = oldMapping.lodgings[0];
const updatedMapping = {
  ...oldMapping,
  research_date: '2026-07-06',
  method: 'Static OTA extraction plus Aside Browser verification, with 2026-07-06 Trip.com and Tripadvisor Korea direct-body reinforcement. Search snippets and Google provider cards remain excluded from direct counts.',
  direct_review_sampling_status: 'A: 321 direct reviews read, 184 onsen-related direct reviews, 7 direct-body platform surfaces. Google-native 직접 본문은 0건 gap으로 유지.',
  lodgings: [
    {
      ...lodging,
      google_maps: {
        ...lodging.google_maps,
        review_body_access: 'partial',
        direct_google_native_reviews_read: 0,
        onsen_related_direct_reviews: 0,
        access_note: 'Google Hotels/Maps는 기존 Aside Browser로 visible/rating/provider cards 확인. 2026-07-06 Aside repl은 로컬 브라우저 연결 타임아웃, Google Travel web open은 unsupported-browser 페이지로 리다이렉트되어 Google-native 본문 추가 확보 없음.'
      },
      ota_review_pool_signals: {
        ...lodging.ota_review_pool_signals,
        trip_com: {
          rating: 9.3,
          visible_review_count: 82,
          review_body_access: 'partial',
          direct_reviews_read: 15,
          onsen_related_direct_reviews: 11,
          source_url: 'https://www.trip.com/hotels/toyooka-hotel-detail-705576/kinosaki-onsen-nishimuraya-hotel-shogetsutei/review.html',
          access_note: '날짜·객실 타입·본문이 함께 보이는 15건만 직접 수로 산입. Google Trip.com 공급자 카드와 분리.'
        },
        tripadvisor_korea: {
          rating: null,
          visible_review_count: 2,
          review_body_access: 'direct_readable',
          direct_reviews_read: 1,
          onsen_related_direct_reviews: 1,
          source_url: 'https://www.tripadvisor.co.kr/ShowUserReviews-g1022822-d1165592-r437351401-Kinosaki_Onsen_Nishimuraya_Hotel_Shogetsutei-Toyooka_Hyogo_Prefecture_Kinki.html',
          access_note: '한국어 원문 직접 본문 1건 확인. Tripadvisor 전체 표면과 같은 플랫폼 계열이라 platform_count는 별도 증가시키지 않음.'
        },
        naver_search_blog: {
          ...lodging.ota_review_pool_signals.naver_search_blog,
          review_body_access: 'snippet_only',
          direct_reviews_read: 0,
          access_note: 'Naver 직접 숙박 본문 0건. 검색 결과와 OTA 스니펫은 직접 리뷰 수에서 제외.'
        }
      },
      next_sampling: '잔여 gap은 Google-native 본문과 Naver Blog/Cafe 직접 숙박글이다. A급 수량/층화는 충족했지만, Google-native 20건 이상 확보 시 Google strata가 더 안정된다.'
    }
  ]
};

const report = `# review_signal_summary_2026-07-06: 城崎温泉 西村屋ホテル招月庭

## 1. 수집 브리핑

- 이번 숙소: 1곳 \`kinosaki-nishimuraya-shogetsutei\`
- 플랫폼상 visible review pool: 최소 3,835건
  - Rakuten 101 / Jalan 1,113 / Yahoo Travel 149 / Tripadvisor 261 / Booking.com 331 / Google Maps 1,717 / Trip.com 82 / Google Trip.com 공급자 카드 81
  - Naver·KAYAK·Agoda 표면은 중복 위험 또는 \`snippet_only\`라 최소 합계에서 제외
- 직접 읽은 리뷰 수: 321건
  - 기존 직접 본문 305건: Rakuten 101, Jalan 59, JTB 65, Yahoo Travel 30, Tripadvisor 40, Booking.com 10
  - 2026-07-06 보강 직접 본문 16건: Trip.com 15, Tripadvisor Korea 한국어 원문 1
- 온천 관련 직접 리뷰 수: 184건
- 직접 본문 플랫폼 수: 7개(Rakuten Travel, Jalan, JTB, Yahoo Travel, Tripadvisor, Booking.com, Trip.com)
- Google 확인: 기존 Aside Browser로 Google Maps/Hotels rating 4.5, visible 1,717, 공급자 카드 확인. Google-native 직접 본문은 0건이다. 2026-07-06 Aside repl은 로컬 브라우저 연결 타임아웃, Google Travel web open은 unsupported-browser 페이지로 리다이렉트되어 새 Google-native 본문을 확보하지 못했다.
- Naver 확인: Naver Search는 직접 본문 없이 \`snippet_only\`. 한국어 직접 층은 Tripadvisor Korea 원문 1건으로 보강했다.
- data_quality_grade: \`A\`
  - 300건 이상, 3개 이상 플랫폼, 최신/저평점/온천 키워드/한국어 직접 리뷰 층이 충족된다.
  - 단, Google-native 직접 본문은 0건이므로 Google 층은 platform mapping의 gap으로 남긴다.

## 2. 공식 사실

- 공식명: 城崎温泉 西村屋ホテル招月庭
- 한국어/영어 표기: 기노사키 온천 니시무라야 호텔 쇼게츠테이 / Nishimuraya Hotel Shogetsutei
- 주소/온천지명: 兵庫県豊岡市城崎町湯島1016-2, 城崎温泉
- 공식 사이트: https://www.nishimuraya.ne.jp/shogetsu/
- 공식 객실 노천탕 페이지: https://www.nishimuraya.ne.jp/shogetsu/room/roten.php
- 공식 프라이빗 스파 페이지: https://www.nishimuraya.ne.jp/shogetsu/spa/private.php

공식 페이지 기준으로 객실 노천탕은 존재하지만, 城崎温泉의 외탕·온천 자원 보호 때문에 개인 점유 객실탕은 \`沸かし湯/白湯\`를 사용한다고 명시된다. 반면 대욕장과 貸切風呂는 온천 사용 축으로 분리된다. 따라서 이 숙소는 “객실 노천탕 있음”을 곧바로 “객실 온천탕”으로 번역하면 안 된다.

## 3. 리뷰 신호 요약

| bath_area | signal_type | direction | mention_count | platform_count | status | 해석 |
|---|---|---:|---:|---:|---|---|
| public_bath | public_bath_hot_spring | positive | 104 | 7 | strong_signal | 대욕장·내탕·노천탕 만족이 다중 플랫폼에서 강하게 반복된다. |
| open_air_public_bath | public_bath_hot_spring | positive | 18 | 4 | moderate_signal | 정원/숲/노천탕 맥락의 긍정 신호가 확인된다. |
| private_bath | private_bath_experience | positive | 23 | 5 | moderate_signal | 森のプライベートスパ·貸切風呂·private hot spring 만족이 반복된다. |
| room_open_air_bath | room_bath_hot_spring | mixed | 32 | 4 | conflicting | 객실 노천탕 만족은 있으나 공식상 온천이 아니라 백탕/沸かし湯이므로 Bathtime 표기는 분리해야 한다. |
| facility_wide | crowding | mixed | 27 | 5 | moderate_signal | 대욕장·조식·대형 숙소 운영 혼잡과 위치/송영 신호가 일부 반복된다. |

## 4. 근거 예시

| source | language | review_date | paraphrase | original_keyword | source_url |
|---|---|---:|---|---|---|
| Rakuten Travel | ja | mixed | 외탕 세트와 숙소 목욕 만족이 최신 표본에서 확인됐다. | \`外湯巡り\`, \`お風呂\` | https://travel.rakuten.co.jp/HOTEL/14007/review.html |
| Jalan | ja | mixed | 대절 노천과 대욕장 축이 함께 언급됐다. | \`貸切露天風呂\`, \`大浴場\` | https://www.jalan.net/yad332274/kuchikomi/ |
| JTB | ja | mixed | 숙소 온천과 외탕 접근이 같이 나타났다. | \`温泉\`, \`外湯\` | https://www.jtb.co.jp/kokunai-hotel/htl/6318001/review/ |
| Yahoo Travel | ja | mixed | 객실 노천탕 이용과 대욕장 기대치가 동시에 보였다. | \`客室露天風呂付き\`, \`大浴場\` | https://travel.yahoo.co.jp/00001014/review/ |
| Tripadvisor | ja/en | mixed | 森のプライベートスパ/대절탕 만족과 객실탕 비온천 인식이 함께 확인됐다. | \`貸切風呂\`, \`部屋の露天風呂は天然温泉ではない\` | https://www.tripadvisor.jp/Hotel_Review-g1022822-d1165592-Reviews-Kinosaki_Onsen_Nishimuraya_Hotel_Shogetsutei-Toyooka_Hyogo_Prefecture_Kinki.html |
| Booking.com | en/ko | mixed | 영어권 대표 후기에서 프라이빗/야외 온천 만족이 확인됐다. | \`private onsen\`, \`outdoor onsen\` | https://www.booking.com/hotel/jp/nishimuraya-shogetsutei.ko.html |
| Trip.com | en | 2024-05-29 | 공용 온천과 사전 예약형 프라이빗 온천이 함께 언급됐다. | \`public hot spring bath\`, \`private hot spring baths\` | https://www.trip.com/hotels/toyooka-hotel-detail-705576/kinosaki-onsen-nishimuraya-hotel-shogetsutei/review.html |
| Trip.com | en | 2026-03-09 | 실내/노천 온천이 있으나 욕장 면적은 작다는 평가가 있다. | \`outdoor and indoor hot spring\`, \`rather small\` | https://www.trip.com/hotels/toyooka-hotel-detail-705576/kinosaki-onsen-nishimuraya-hotel-shogetsutei/review.html |
| Trip.com | en | 2025-04-02 | 저평점 리뷰에서도 공용탕과 사우나는 긍정적으로 분리 언급됐다. | \`public soup\`, \`Sona\` | https://www.trip.com/hotels/toyooka-hotel-detail-705576/kinosaki-onsen-nishimuraya-hotel-shogetsutei/review.html |
| Tripadvisor Korea | ko | 2016-11-15 | 한국어 원문에서 온천마을 외탕과 호텔 내부 온천을 함께 평가했다. | \`온센 메구리\`, \`호텔 내부에 있는 온천\` | https://www.tripadvisor.co.kr/ShowUserReviews-g1022822-d1165592-r437351401-Kinosaki_Onsen_Nishimuraya_Hotel_Shogetsutei-Toyooka_Hyogo_Prefecture_Kinki.html |

## 5. Bathtime 해석

직접 확인 321건 중 온천 관련 184건에서, 쇼게츠테이는 공용 대욕장·노천탕과 외탕 접근, 그리고 프라이빗 스파가 함께 읽히는 대형 고급 온천 숙소로 해석된다. 300건 이상과 다중 플랫폼, 최신·저평점·온천 키워드·한국어 직접 리뷰 층이 확보되어 대욕장/프라이빗탕 신호는 강하게 반복된다고 볼 수 있다.

다만 공식상 객실 노천탕은 \`沸かし湯/白湯\`로 명시되므로, Bathtime에서는 “객실 노천탕 있음”과 “객실 온천탕”을 반드시 분리해야 한다. Google-native 직접 본문과 Naver 직접 본문은 여전히 약하므로, 이 둘은 플랫폼 gap으로 남겨야 한다.

## 6. Gaps

- Google Maps/Hotels: visible 1,717, rating 4.5는 기존 Aside Browser로 확인. Google-native 직접 본문은 0건이다.
- 2026-07-06 Google 재시도: Aside repl은 로컬 브라우저 연결 타임아웃, Google Travel web open은 unsupported-browser 페이지로 리다이렉트.
- Naver: 직접 숙박 본문 0건. 검색 결과와 OTA 스니펫은 직접 리뷰 수에서 제외.
- Jalan: visible 1,113건 중 정적 고유 본문 59건만 산입.
- Booking.com: visible 331건 중 대표 본문 10건만 산입.
- Trip.com: visible 82건 중 날짜·객실 타입·본문이 함께 보이는 15건만 산입.

다음 보강은 A급 유지를 위한 필수는 아니지만, Google-native 20건 이상과 Naver Blog/Cafe 직접 숙박글 3-10건을 확보하면 한국어/Google 층의 해석 안정성이 더 좋아진다.
`;

await fs.writeFile(path.join(outDir, 'shogetsutei_reinforcement_2026-07-06.json'), JSON.stringify(reinforcement, null, 2));
await fs.writeFile(path.join(outDir, 'shogetsutei_signal_aggregate_2026-07-06.json'), JSON.stringify(updatedAggregate, null, 2));
await fs.writeFile(path.join(outDir, 'platform_mapping_2026-07-06.json'), JSON.stringify(updatedMapping, null, 2));
await fs.writeFile(path.join(outDir, 'review_signal_summary_2026-07-06.md'), report);

console.log(JSON.stringify({
  written: [
    'shogetsutei_reinforcement_2026-07-06.json',
    'shogetsutei_signal_aggregate_2026-07-06.json',
    'platform_mapping_2026-07-06.json',
    'review_signal_summary_2026-07-06.md'
  ],
  direct_reviews_read: updatedAggregate.direct_reviews_read_total,
  onsen_related_direct_reviews: updatedAggregate.onsen_related_direct_reviews_total,
  direct_body_platforms: updatedAggregate.direct_body_platforms,
  data_quality_grade: updatedAggregate.data_quality_grade
}, null, 2));
