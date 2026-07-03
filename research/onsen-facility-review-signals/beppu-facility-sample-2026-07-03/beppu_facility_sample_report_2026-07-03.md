# 벳푸 온천시설형 3유형 샘플 리서치

작성일: 2026-07-03

## 1. 조사 목적

숙소형 온천 데이터와 별도로, 당일치기 온천시설을 서비스 데이터로 다룰 수 있는지 보기 위한 샘플 조사다. 이번 회차는 대량 태깅이 아니라 모델 검증용이므로, 플랫폼상 리뷰 풀과 직접 확인한 대표 표본을 분리한다.

선정한 3유형은 다음과 같다.

| 유형 | 샘플 | 선정 이유 |
|---|---|---|
| 대형 종합 온천시설 | ひょうたん温泉 | 탕 종류, 가족탕, 모래탕, 증기탕, 식음 체험이 결합된 시설형 대표 |
| 역사/공중탕/모래탕 | 竹瓦温泉 | 벳푸 상징시설이며 기대치 불일치와 모래탕 대기 신호가 강한 유형 |
| 가족탕 전문시설 | 別府桜湯 | 객실탕과 혼동되기 쉬운 시간제 가족탕 상품을 분리 검증하기 적합 |

## 2. 수집 브리핑

| facility | visible_review_pool_min | checked_sources | 직접 확인 수준 | data_quality_grade | 비고 |
|---|---:|---|---|---|---|
| ひょうたん温泉 | 7,049+ | 공식, Google Maps, Jalan, Tripadvisor, 4travel, Naver 노출 결과 | 대표 후기/스니펫 11건 이상 | D | 모델 검증용. 리뷰 풀은 크지만 직접 태깅은 제한적 |
| 竹瓦温泉 | 6,655+ | 벳푸시 공식, Google Maps, Jalan, Tripadvisor, 4travel, Naver 노출 결과 | 대표 후기/스니펫 11건 이상 | D | 예약/대기/어메니티 신호가 빠르게 드러남 |
| 別府桜湯 | 1,092+ | 공식, Google Maps, Jalan, Tripadvisor, 4travel, Yahoo/Naver 노출 결과 | 대표 후기/스니펫 10건 이상 | D | 가족탕 전문시설 모델 검증에 적합 |

이번 샘플은 “서비스화할 수 있는 데이터 축이 있는가”를 보는 단계다. 세 시설의 합산 노출 리뷰 풀은 최소 14,700건 이상으로 충분히 크지만, 직접 판독은 30여 개 대표 노출 표본 수준이다. 따라서 신호의 존재와 모델 필요성은 말할 수 있으나, 시설별 강도 점수화나 랭킹에는 아직 부족하다.

## 3. Official Facts

### ひょうたん温泉

- 공식 사이트: https://www.hyotan-onsen.com/
- 공식 정보 기준으로 `源泉十割®かけ流し`를 내세우는 벳푸 칸나와의 당일치기 온천시설이다.
- 대욕장, 노천탕, 가족탕, 모래탕, 무시유, 족탕, 온천흡입, 음천, 지옥찜/식당 기능이 함께 확인된다.

### 竹瓦温泉

- 벳푸시 공식 페이지: https://www.city.beppu.oita.jp/sisetu/shieionsen/detail4.html
- 보통욕과 모래탕이 있는 시영 온천시설이다.
- 공식 정보 기준으로 1879년 창설, 1938년 현 건물, 보통욕 성인 300엔, 모래탕 1,500엔, 시영 모래탕 전화/인터넷 예약 불가, 주차장 없음이 확인된다.

### 別府桜湯

- 공식 사이트: https://www.sakurayu.net/
- 공식 정보 기준으로 20종 가족탕과 남녀별 대욕장이 있다.
- 가족탕은 코인타이머 방식으로 매 이용마다 온천수를 새로 받는 구조를 내세운다.

## 4. Review Signal Summary

| facility | facility_area | signal_type | signal_direction | platform_count | contradiction_level | review_signal_status |
|---|---|---|---|---:|---|---|
| ひょうたん温泉 | facility_wide | bath_variety | positive | 3+ | low | moderate_signal |
| ひょうたん温泉 | facility_wide | crowding_or_wait | mixed | 2+ | medium | weak_signal |
| ひょうたん温泉 | sand_bath | sand_or_steam_experience | mixed | 2+ | medium | weak_signal |
| ひょうたん温泉 | facility_wide | price_payment_value | mixed | 2+ | medium | weak_signal |
| 竹瓦温泉 | facility_wide | tourist_expectation_gap | mixed | 3+ | medium | moderate_signal |
| 竹瓦温泉 | public_bath | cleanliness_amenities | negative | 2+ | low | moderate_signal |
| 竹瓦温泉 | sand_bath | reservation_or_queue_confusion | negative | 2+ | medium | weak_signal |
| 竹瓦温泉 | public_bath | distinctive_spring_character | positive | 2+ | low | weak_signal |
| 別府桜湯 | family_bath | family_private_bath_experience | positive | 3+ | low | moderate_signal |
| 別府桜湯 | family_bath | crowding_or_wait | mixed | 2+ | medium | weak_signal |
| 別府桜湯 | public_bath | price_payment_value | positive | 2+ | low | weak_signal |
| 別府桜湯 | facility_wide | accessibility | mixed | 2+ | medium | weak_signal |

## 5. Evidence Examples

| signal_type | source_type | source_url | language | short_paraphrase | original_keyword | review_date |
|---|---|---|---|---|---|---|
| bath_variety | official | https://www.hyotan-onsen.com/ | ja | 대욕장, 가족탕, 모래탕, 무시유, 족탕, 음천 등 시설 구성이 넓다. | 源泉十割®かけ流し, 家族風呂, 砂湯 | - |
| crowding_or_wait | Jalan review | https://www.jalan.net/kankou/spt_guide000000179813/kuchikomi/ | ja | 외국인 관광객과 이용객이 많아 노천탕 이용이 답답했다는 불만이 보인다. | 混んでいた, 外国人 | visible |
| price_payment_value | Google Maps snippet | Google Maps | ko | 입장료와 식당 결제가 현금 중심이라는 준비 정보가 보인다. | 현금결제 | visible |
| sand_or_steam_experience | Jalan review | https://www.jalan.net/kankou/spt_guide000000179813/kuchikomi/ | ja | 모래탕과 무시유를 핵심 체험으로 높게 평가한 표본이 있다. | 砂湯, むし湯 | visible |
| tourist_expectation_gap | Google Maps snippet | Google Maps | ko | 한국식 찜질방/스파를 기대하면 다르게 느낄 수 있고, 샤워시설이 없다는 지적이 보인다. | 샤워시설 없음 | visible |
| cleanliness_amenities | Jalan review | https://www.jalan.net/kankou/spt_guide000000153849/kuchikomi/ | ja | 오래된 공중탕 분위기와 세면/샤워 공간 부족이 함께 언급된다. | 洗い場なし, 昔ながら | visible |
| reservation_or_queue_confusion | official | https://www.city.beppu.oita.jp/sisetu/shieionsen/detail4.html | ja | 시영 모래탕은 전화·인터넷 예약을 받지 않고 현장 접수 방식이다. | 電話予約・インターネット予約不可 | - |
| distinctive_spring_character | Jalan review | https://www.jalan.net/kankou/spt_guide000000153849/kuchikomi/ | ja | 보통욕은 뜨겁고 몸이 잘 데워진다는 온천감 신호가 있다. | 熱い, 温まる | visible |
| family_private_bath_experience | official | https://www.sakurayu.net/ | ja | 20종 가족탕과 매회 온천수 교체 구조를 공식적으로 내세운다. | 家族風呂, コインタイマー | - |
| crowding_or_wait | Jalan review | https://www.jalan.net/kankou/spt_guide000000191274/kuchikomi/ | ja | 연말에는 가족탕 대기가 길었다는 표본과 예약 가능성 언급이 함께 보인다. | 3時間待ち, 予約 | visible |

## 6. Bathtime Interpretation

이번 3유형 샘플만 봐도 온천시설은 숙소형 모델과 분리하는 편이 맞다. 숙소에서는 객실탕과 대욕장 보유 여부가 중심이지만, 시설형에서는 대기시간, 예약/현장접수, 샤워·수건·비누, 현금 결제, 가족탕 회전, 체험상품 추가요금이 만족도를 크게 가른다.

특히 竹瓦温泉처럼 평점만 보면 인기 관광지지만, 한국인 사용자에게는 “샤워시설 없는 역사형 공중탕”이라는 기대치 보정 정보가 더 중요하다. 반대로 別府桜湯는 숙박 없는 가족탕 수요를 잡아낼 수 있어, 객실탕 숙소와는 완전히 다른 비교 카테고리로 다뤄야 한다.

## 7. 모델 관점 결론

별도 모델 생성은 타당하다. `온천 숙소`와 `온천시설`은 같은 온천 데이터를 쓰더라도 사용자의 의사결정 질문이 다르다.

숙소형 질문은 “내 방에서 온천을 할 수 있는가”, “객실탕이 진짜 온천인가”, “대욕장이 좋은가”에 가깝다. 시설형 질문은 “오늘 가도 되는가”, “얼마나 기다리는가”, “샤워/수건이 있는가”, “가족끼리 따로 쓸 수 있는가”, “관광객이 기대한 온천 경험과 실제가 맞는가”에 가깝다.

## 8. 다음 샘플 제안

시설형 모델을 더 단단하게 만들려면 다음 3종을 추가로 보는 것이 좋다.

| 추가 유형 | 목적 |
|---|---|
| 노천탕 조망형 대형시설 | 바다/산 조망, 휴게, 사우나, 식음 결합 모델 검증 |
| 로컬 공동탕 소형시설 | 낮은 가격, 매너, 어메니티 부족, 관광객 진입장벽 검증 |
| 족탕/무료 온천시설 | 무료·짧은 체류·관광 동선형 데이터 모델 검증 |

## 9. Gaps

- 이번 회차는 300건 직접 판독 기준을 충족하지 않았다.
- Google Maps는 리뷰 수와 일부 노출 스니펫 중심으로 확인했으며, 전체 본문 대량 판독은 하지 않았다.
- Naver Cafe 본문형 후기는 확보하지 못했다.
- Sakura-yu의 가족탕 예약 가능 조건은 계절/휴일 운영 예외가 있어 실제 서비스 반영 전 최신 재확인이 필요하다.
- 시설형 데이터는 날짜·시간대별 혼잡 편차가 커서, 향후 `방문 시간대`, `요일`, `성수기`, `접수 마감` 필드를 추가하는 것이 좋다.
