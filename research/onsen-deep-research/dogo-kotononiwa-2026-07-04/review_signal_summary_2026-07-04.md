# 道後温泉 葛城 琴の庭 온천 리뷰 신호 요약

조사일: 2026-07-04  
대상: 道後温泉 葛城 琴の庭 / Kotononiwa / 카츠라기 코토노니와  
지역: 愛媛県 松山市 道後温泉  
상태: ready 숙소 딥리서치 완료, `data_quality_grade=B`

## 1. 수집 브리핑

이번 숙소의 플랫폼상 전체 리뷰풀은 보수적으로 최소 350건 이상이다. Google Hotels 93건, Rakuten 18건, Jalan 71건, Ikkyu 84건, Yahoo Travel 84건, JTB 0건을 분리 확인했다. Naver는 관련 스니펫은 확인했지만 정량 리뷰풀로 합산하지 않았다.

직접 읽고 태깅한 리뷰는 총 184건이며, 이 중 온천 관련 직접 리뷰는 136건이다. 직접 본문 플랫폼은 Rakuten Travel, Jalan, Jalan Archive, Ikkyu, Yahoo Travel의 5개 표면이다. Jalan latest/archive를 하나의 OTA 계열로 보면 독립 플랫폼은 4개다.

300건 목표에는 도달하지 못했다. 종료 사유는 접근 가능한 주요 본문 표면을 끝까지 확인했기 때문이다. Rakuten은 18건, Jalan은 Aside Browser로 archive까지 열어 최신/과거 합계 71건권을 확인했고, Ikkyu는 84건 노출 중 70건, Yahoo Travel은 84건 노출 중 25건만 렌더링 본문으로 확보됐다. Google-native 93건은 Aside에서 리뷰풀만 확인되고 개별 본문은 읽히지 않았으며, Naver는 대부분 OTA/대행사/무관 포스트 스니펫이었다.

## 2. 공식 사실

공식 사이트 기준 일본어 공식명은 `道後温泉 葛城 琴の庭`이며, 공식 URL은 <https://kotononiwa.jp/>다. 주소는 愛媛県松山市道後湯月町4-16, 온천지는 道後温泉이다.

공식 사이트와 OTA 공식 표면은 전 객실에서 도고온천의 `生湯`과 `源泉かけ流し`를 즐길 수 있다고 설명한다. 객실 페이지에는 `石庭露天風呂`, `天空露天風呂`, `露天風呂付スイート` 등 객실별 노천/반노천 구조가 확인된다. 이 축은 `room_open_air_bath`와 `room_bath`로 분리한다.

JTB 욕장 페이지는 `全室道後温泉かけ流し`, `大浴場なし`, `温泉あり`, `露天風呂なし`, `家族風呂あり`, `貸切可`, 泉質 `単純温泉`으로 표기한다. 따라서 리뷰의 `大浴場`, `ホテルお風呂`, `姉妹館` 언급은 숙소 자체 공용대욕장으로 단정하지 않고, 자매관/외부 동선 또는 불명확 공용탕 신호로 분리한다.

## 3. 리뷰 신호 요약 표

| bath_area | signal_type | direction | mention_count | source_count | platform_count | status |
|---|---:|---:|---:|---:|---:|---|
| room_bath | room_bath_hot_spring | positive | 87 | 87 | 5 | strong_signal |
| room_open_air_bath | room_bath_hot_spring | positive | 80 | 80 | 5 | strong_signal |
| facility_wide | water_texture | positive | 71 | 71 | 5 | strong_signal |
| facility_wide | booking_confusion | mixed | 51 | 51 | 5 | strong_signal |
| facility_wide | operations_note | mixed | 35 | 35 | 4 | moderate_signal |
| public_bath | public_bath_hot_spring | mixed | 16 | 16 | 4 | conflicting |
| open_air_public_bath | public_bath_hot_spring | mixed | 9 | 9 | 3 | weak_signal |
| facility_wide | temperature_control | mixed | 11 | 11 | 3 | moderate_signal |

## 4. 근거 예시

1. Jalan, 2026년 최신 표본: 객실 욕조가 매우 크고 설계 만족이 높다는 신호. `original_keyword`: `お風呂が広く`, `客室についているお風呂`. <https://www.jalan.net/yad339801/kuchikomi/>
2. Jalan, 2026년 저평점 표본: 객실 동선·샤워룸·식사장 이동이 불편하다는 신호. `original_keyword`: `使いづらい`, `シャワールーム`. <https://www.jalan.net/yad339801/kuchikomi/>
3. Jalan, 2025년 표본: 객실 노천탕은 좋지만 호텔 목욕탕까지 멀다는 신호. `original_keyword`: `部屋露天風呂最高`, `ホテルお風呂遠い`. <https://www.jalan.net/yad339801/kuchikomi/>
4. Jalan Archive, 2025년 표본: 객실 원천탕은 좋지만 야간에 온천이 멈춘 경험. `original_keyword`: `温泉が出なくなりました`, `案内不足`. <https://www.jalan.net/yad339801/kuchikomi/archive/>
5. Jalan Archive, 2023년 표본: 객실 노천탕이 대욕장 노천만큼 크고 독점감이 있다는 신호. `original_keyword`: `各部屋についた露天風呂`, `独り占め`. <https://www.jalan.net/yad339801/kuchikomi/archive/>
6. Rakuten Travel, 최신권 표본: 도고온천 본관 접근성과 객실탕을 함께 언급. `original_keyword`: `道後温泉本館`, `露天風呂付`. <https://travel.rakuten.co.jp/HOTEL/178753/review.html>
7. Ikkyu, 2026년권 표본: 객실湯殿의 생湯/원천가케나가시가 숙박 목적의 중심. `original_keyword`: `生湯`, `源泉掛け流し`. <https://www.ikyu.com/00002798/review/>
8. Ikkyu, 2025년권 표본: 방탕 만족과 라운지/프리드링크가 함께 나타남. `original_keyword`: `お部屋のお風呂`, `ラウンジ`. <https://www.ikyu.com/00002798/review/>
9. Yahoo Travel, 표본: 객실탕/반노천탕과 도고온천 접근성을 긍정적으로 언급. `original_keyword`: `半露天`, `道後温泉`. <https://travel.yahoo.co.jp/00002798/review/>
10. Naver Search, snippet_only: 한국어 검색 표면은 `전용 온천시설`, `객실수 10개` 같은 대행사 설명 위주이며 직접 리뷰 본문으로 세지 않았다. `original_keyword`: `전용 온천시설`, `객실수 10개`.

## 5. Bathtime 해석

직접 확인 표본 184건 중 온천 관련 본문 136건이 확인되며, 琴の庭는 “공용 대욕장 좋은 숙소”가 아니라 `전 객실 도고온천 생湯 객실탕/객실 노천탕 중심형`으로 읽는 편이 데이터에 맞다. 객실탕 만족은 뚜렷하게 확인되지만, 공용탕 신호는 숙소 자체 대욕장이 아니라 자매관·외부 동선 또는 이용 안내 혼동과 얽혀 있어 `public_bath`를 보조/주의 축으로만 다루는 편이 정확하다.

주의할 점은 운영 동선과 설명이다. 저평점 표본에서는 객실 구조의 사용성, 샤워룸-욕실 이동, 야간 온천 중단 안내, 식사장/자매관 동선이 반복적으로 문제화된다. Bathtime에서는 `room_open_air_bath`의 수질·프라이빗 장점과 `booking_confusion/access_booking`을 함께 노출해야 한다.

## 6. Gaps

- 300건 목표에는 도달하지 못했다. 직접 확인 184건에서 종료한 이유는 주요 접근 가능 본문 표면을 Aside 포함으로 확인했기 때문이다.
- Google Hotels/Maps는 Aside Browser로 확인했으나 Google-native 리뷰 본문은 직접 추출하지 못했다. Google 리뷰 93건은 리뷰풀이며 직접 리뷰 수가 아니다.
- Google rating_distribution은 추출하지 못했다.
- JTB는 욕장 공식 정보는 확인됐지만 리뷰 본문은 0건이다.
- 4travel과 Agoda는 이번 회차에서 정확한 직접 본문 페이지를 찾지 못했다.
- Naver 검색 결과는 대부분 OTA/대행사/무관 포스트 스니펫이라 `snippet_only`로 기록했고 직접 리뷰 수에 넣지 않았다.
- A급으로 올리려면 Google-native 본문, Trip.com/Agoda/Expedia 계열 실제 본문, 4travel 정확한 숙소 URL, 일본 개인 블로그 원문에서 최소 116건 이상의 추가 직접 본문이 필요하다.

## 7. 다음 액션

이 숙소는 현재 B등급으로 종료한다. 다음 에이전트가 보강한다면 Google 리뷰 모달을 다시 열고, `葛城 琴の庭 宿泊記`, `琴の庭 ブログ`, `Kotononiwa review` 키워드로 일본 개인 블로그/4travel 정확 URL을 찾아야 한다.
