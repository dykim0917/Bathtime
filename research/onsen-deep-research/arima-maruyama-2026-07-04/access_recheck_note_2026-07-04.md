# 有馬温泉 竹取亭円山 access recheck note

## Status

`operation_recheck / hold_for_deep_research / not_completed`

이 숙소는 shortlist상 `ready`였지만, 2026-07-04 재확인 기준으로 Bathtime 딥리서치 완료 처리하지 않는다. 직접 읽은 리뷰 본문이 300건 목표는 물론 150건 중간 점검선에도 도달하지 못했고, 접근 가능한 본문 플랫폼도 제한적이다.

## Count Discipline

- 플랫폼상 visible review pool과 직접 읽은 리뷰 수를 합산하지 않았다.
- Google 패널의 Trip.com/Tripadvisor 공급자 카드는 Google-native 리뷰로 세지 않았다.
- Naver 검색 결과와 블로그/카페 미리보기는 `snippet_only`로만 기록했다.
- `개인온천`, `프라이빗 온천`, `貸切風呂`는 객실탕으로 자동 병합하지 않고 `private_bath/family_bath`와 `room_bath/room_open_air_bath`를 분리한다.

## Current Evidence

| source | visible_review_count | rating | review_body_access | direct_read_reviews | onsen_related_direct_reviews | note |
|---|---:|---:|---|---:|---:|---|
| Rakuten Travel | 535-578 seen across surfaces | unknown | blocked/empty_api | 0 | 0 | 숙소 화면에는 리뷰풀 표면이 있으나 현재 리뷰 API는 `total:0, contents:[]` 반환. |
| Jalan | unknown | unknown | blocked_or_unreadable | 0 | 0 | `https://www.jalan.net/yad327145/kuchikomi/`가 `情報の準備中`으로 응답. |
| JTB/Rurubu | 30 | 4.0 | partial | 1 | 1 | 정적 페이지에는 여러 과거 리뷰가 보이나 현재 파서는 1건만 안정 추출. 수동/브라우저 파서 보강 필요. |
| Yahoo Travel | 30 combined Yahoo/Ikyu score note | unknown | aside_review_tab_read | 9 main + 10 visit snippets seen | about 15 directional, not finalized | Aside Browser에서 Yahoo 投稿レビュー와 방문자クチコミ가 직접 보임. 다만 오래된 리뷰 중심이며 수동 태깅 필요. |
| Google Maps/Hotels | 511 | 4.5 | aside_panel_partial | 0 Google-native finalized | 0 Google-native finalized | Aside Browser에서 panel 확인. Trip.com 380, Tripadvisor 209 공급자 카드가 보이나 Google-native와 분리 필요. |
| Naver Search | Trip.com 384, Agoda 2,536, Korean meta snippets | mixed | snippet_only | 0 | 0 | 블로그/카페/OTA 검색 스니펫은 많지만 본문을 직접 연 표본은 아직 없음. |

## Aside Browser Findings

### Yahoo Travel

Aside Browser URL: `https://travel.yahoo.co.jp/00001695/review/`

직접 보이는 Yahoo 投稿レビュー에서 다음 신호가 확인된다.

- `貸切風呂が8つ`
- `大浴場が無くなり、すべて貸切風呂`
- `金泉・銀泉ともに満喫`
- `お部屋の銀泉`
- `貸切露天風呂`
- `家族風呂`

이 표본은 `private_bath`, `family_bath`, `room_bath`, `room_open_air_bath`를 분리해야 하는 숙소임을 뚜렷하게 보여준다. 그러나 표본 수가 작고 Yahoo/Ikyu 합산 구조 안내가 있어 바로 B/A 등급으로 올릴 수 없다.

### Google Maps / Google Hotels

Aside Browser URL: `https://www.google.com/maps/search/?api=1&query=有馬温泉 竹取亭円山`

- Google rating: 4.5
- Google visible review count: 511
- Google Hotels 공급자 카드:
  - Trip.com: 4.7/5, 380 reviews
  - Tripadvisor: 4.4/5, 209 reviews
- 공급자 카드에 한국어 `개인온천도 좋았고` 신호가 보이나 Google-native 리뷰로 세지 않는다.

### Naver Search

Aside Browser query: `아리마 다케토리테이 마루야마 후기 온천`

- Naver 호텔/검색 표면: `9.4/10`
- Trip.com snippet: `9.4/10`, `384 참여`
- Agoda snippet: `9.2/10`, `2,536 참여`
- 한국어 블로그/카페 결과에서 `개별탕`, `프라이빗 온천`, `대욕탕 선호하심 참고`, `한국어 안내` 신호가 보인다.
- 이번 재확인에서는 본문을 열어 직접 읽은 Naver Blog/Cafe 리뷰가 없으므로 직접 리뷰 수는 0이다.

## Bath Axes To Preserve

- `private_bath`: 8개 무료 대절/전세탕 중심 신호.
- `family_bath`: 가족 단위 이용 리뷰가 존재하나, 시설명이 가족탕인지 단순 가족 이용인지 구분 필요.
- `room_bath`: 객실 은천/객실 온천 신호.
- `room_open_air_bath`: 객실 노천탕 플랜 신호는 공식 객실 타입별로 재검증 필요.
- `public_bath`: Yahoo 표본에서 “대욕장이 없어지고 전부 대절탕”이라는 운영 변화 신호가 있으므로 현행 대욕장 보유로 단정 금지.

## Why Not Completed

- 현재 직접 확정 표본은 정적 추출 1건뿐이다.
- Aside에서 Yahoo 본문 접근 가능성은 확인했지만, 수동 태깅된 확정 리뷰 수가 150건에 못 미친다.
- Rakuten/Jalan의 대형 표면 리뷰풀이 직접 본문으로 열리지 않는다.
- Google은 리뷰풀 511건이 보이나 이번 확인에서 Google-native 본문을 직접 태깅하지 않았다.
- Naver는 한국어 수요 신호가 풍부하지만 `snippet_only`다.

## Next Action

1. Yahoo Travel/Ikyu 페이지를 Aside Browser 또는 브라우저 파서로 수동 태깅해 실제 직접 본문 수를 확정한다.
2. Google 리뷰 탭을 열어 Google-native 최신/저평점/한국어 표본을 별도 태깅한다.
3. Naver Blog/Cafe 결과 중 실제 숙박 후기 본문을 열어 직접 리뷰와 snippet을 분리한다.
4. Trip.com/Agoda 본문 접근이 가능하면 한국어/영어 리뷰를 추가한다.
5. 그래도 150건 미만이면 이 숙소는 `operation_recheck` 또는 소표본 D 등급으로 유지한다.

## Current Grade

`D / insufficient`

플랫폼상 리뷰풀은 크지만 직접 읽고 태깅한 본문이 50건 미만이며, 현재 확정 직접 본문 플랫폼은 단일 플랫폼 수준이다. 이 숙소는 Bathtime에 중요한 대절탕/객실탕 분리 후보지만, 이번 상태로는 ready 딥리서치 완료가 아니다.
