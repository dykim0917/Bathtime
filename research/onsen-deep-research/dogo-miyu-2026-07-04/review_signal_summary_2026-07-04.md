# 道後御湯 온천 리뷰 신호 요약

조사일: 2026-07-04  
대상: 道後御湯 / Dogo Miyu / 도고미유  
지역: 愛媛県 松山市 道後温泉  
상태: ready 숙소 딥리서치 완료, `data_quality_grade=A`

## 1. 수집 브리핑

이번 숙소의 플랫폼상 전체 리뷰풀은 보수적으로 최소 1,296건 이상이다. Google Hotels 428건, Rakuten 297건, Jalan 직접 노출 34건, JTB 28건권 표면, Ikkyu 210건, Yahoo Travel 210건, 4travel 46건을 분리 확인했다. Naver는 정량 리뷰풀로 합산하지 않고 한국어 검색 표면과 직접 블로그 본문만 별도 기록했다.

직접 읽고 태깅한 리뷰는 총 344건이며, 이 중 온천 관련 직접 리뷰는 239건이다. 직접 본문 플랫폼은 Rakuten Travel, Jalan, JTB, Ikkyu, Yahoo Travel, Naver Blog의 6개다.

Google Hotels/Maps는 Aside Browser로 확인했다. 별점 4.7, Google 리뷰 428건 노출은 확인했지만, 이번 표본에서는 Google-native 개별 본문이 접근 가능한 형태로 열리지 않아 직접 리뷰 수에는 넣지 않았다. Naver는 직접 블로그 본문 4건만 직접 리뷰로 세고, 검색 결과 스니펫과 OTA/파트너 페이지 미리보기는 `snippet_only`로 분리했다.

## 2. 공식 사실

공식 사이트 기준 일본어 공식명은 `道後御湯`, 영어 표기는 Dogo Miyu다. 공식 URL은 <https://www.dogomiyu.jp/>이며, 주소는 愛媛県松山市道後鷺谷町2-20, 온천지는 道後温泉이다.

공식 사이트는 전 객실에 노천탕과 松山城을 바라보는 뷰 테라스가 있다고 설명한다. Google/공식 검색 표면은 모든 객실에 도고온천 인입수를 이용한 객실 노천탕이 있다고 표시한다. 이 축은 `room_open_air_bath`로 분리한다.

공용탕은 최상층 전망욕장과 노천탕으로 분리된다. JTB 욕장 페이지는 숙박자 무료 대욕장·노천탕, 사우나 없음, 암반욕 없음, 전망욕장 있음, 이용 시간 15:00-24:00 / 06:00-10:00으로 표기한다. 온천 처리 방식은 공용탕 기준 `温泉（放流・循環併用式、加温している）`, 泉質 `単純温泉`, 湧出口泉温 43℃다. 객실 노천탕 공식 주장과 공용 전망욕장 처리 표기는 욕장 단위가 다르므로 섞지 않는다.

## 3. 리뷰 신호 요약 표

| bath_area | signal_type | direction | mention_count | source_count | platform_count | status |
|---|---:|---:|---:|---:|---:|---|
| room_open_air_bath | room_bath_hot_spring | positive | 146 | 146 | 6 | strong_signal |
| room_bath | room_bath_hot_spring | positive | 134 | 134 | 5 | strong_signal |
| facility_wide | water_texture | positive | 96 | 96 | 6 | strong_signal |
| public_bath | public_bath_hot_spring | mixed | 60 | 60 | 6 | strong_signal |
| open_air_public_bath | public_bath_hot_spring | mixed | 40 | 40 | 5 | moderate_signal |
| facility_wide | operations_note | mixed | 44 | 44 | 4 | moderate_signal |
| facility_wide | crowding | mixed | 19 | 19 | 4 | moderate_signal |
| facility_wide | temperature_control | mixed | 15 | 15 | 4 | moderate_signal |

## 4. 근거 예시

1. Rakuten Travel, 2026년권 표본: 객실 노천탕과 스카이라운지 이용이 함께 언급. `original_keyword`: `露天風呂付客室`, `ラウンジ`. <https://travel.rakuten.co.jp/HOTEL/165194/review.html>
2. Rakuten Travel, 저평점성 표본: 온천수/염소 표현이 소수 등장. `original_keyword`: `塩素`. <https://travel.rakuten.co.jp/HOTEL/165194/review.html>
3. Jalan, 2026년권 표본: 대욕장은 작지만 타월 완비·혼잡 적음, 객실탕 온도는 낮아 편하다는 신호. `original_keyword`: `大浴場は小さかった`, `部屋のお風呂`, `温度`. <https://www.jalan.net/yad381624/kuchikomi/>
4. JTB, 표본: 객실 노천탕과 객실 설비 만족이 함께 나타남. `original_keyword`: `部屋の露天`. <https://www.jtb.co.jp/kokunai-hotel/htl/7461004/review/>
5. Ikkyu, 2026년권 표본: 객실 노천탕과 전망 라운지의 가치가 반복. `original_keyword`: `温泉露天風呂付`, `展望ラウンジ`. <https://www.ikyu.com/00002500/review/>
6. Ikkyu, 2025년권 표본: 방 온천과 고령 가족 이용 편의가 함께 언급. `original_keyword`: `部屋も温泉`, `高齢`. <https://www.ikyu.com/00002500/review/>
7. Yahoo Travel, 장문 표본: 객실 노천탕은 2명이 여유롭고 온도 조절이 좋으며, 옥상 대욕장은 컴팩트하지만 전망/청결이 좋다는 비교 신호. `original_keyword`: `部屋の露天風呂`, `大浴場は少しコンパクト`. <https://travel.yahoo.co.jp/00002500/review/>
8. Yahoo Travel, 온천 관련 표본: 객실탕 반복 이용과 라운지 아이스/음료 신호. `original_keyword`: `温泉後のアイス`, `ラウンジ`. <https://travel.yahoo.co.jp/00002500/review/>
9. Naver Blog, 2026년권 직접 본문: 전 객실 노천탕과 8층 전망탕을 함께 설명. `original_keyword`: `전 객실 노천탕`, `전망탕`. <https://blog.naver.com/annatomo/224169050041>
10. Naver Blog, 2025년권 직접 본문: 개인 노천탕과 현대적 숙소 분위기를 숙소 선택 이유로 언급. `original_keyword`: `개인 노천탕`, `도고미유`. <https://blog.naver.com/bearchew/224092452730>

## 5. Bathtime 해석

직접 확인 표본 344건 중 온천 관련 본문 239건이 확인되며, 道後御湯는 객실 노천탕 중심형으로 분류하는 것이 데이터에 맞다. `객실 노천탕/방 온천/온천露天風呂付 객실` 신호가 6개 직접 본문 플랫폼에서 강하게 반복되고, 도고온천의 부드러운 물감과 방 안에서 반복 입욕하는 체류 방식이 함께 나타난다.

공용탕은 “전망이 좋은 최상층 욕장”으로 의미가 있지만, 객실탕보다 크기 기대차가 붙는다. 일부 표본에서는 대욕장을 작거나 컴팩트하다고 표현하므로, Bathtime에서는 `room_open_air_bath`를 핵심 축으로 두고 `public_bath/open_air_public_bath`는 전망·라운지 동선과 함께 보조 축으로 표시하는 편이 정확하다.

## 6. Gaps

- Google Hotels/Maps는 Aside Browser로 확인했으나 Google-native 리뷰 본문은 직접 추출하지 못했다. Google 리뷰 428건은 리뷰풀이며 직접 리뷰 수가 아니다.
- Google rating_distribution은 막대/요약 표면만 확인했고 별점별 숫자는 추출하지 못했다.
- 4travel 46건은 검색/페이지 스니펫만 확인해 `snippet_only`다.
- Agoda는 평점/소개 스니펫만 확인했고 직접 리뷰 본문은 확보하지 못했다.
- Booking.com은 이번 회차에서 독립 리뷰 페이지를 확인하지 못해 `not_found`로 기록했다.
- Ikkyu와 Yahoo Travel은 Aside Browser로 직접 본문을 읽었지만 같은 기업권 리뷰 생태계다. 현재는 별도 플랫폼 표면으로 기록하되, 후속 파이프라인에서 동일 문장 해시가 발견되면 중복 제거가 필요하다.
- Naver 검색 결과의 OTA, 파트너스, 관련 없는 도고/야치요/오쿠도고 결과는 `snippet_only`이며 직접 리뷰 수에 포함하지 않았다.

## 7. 다음 액션

이 숙소는 A등급으로 종료 가능하다. 다음 에이전트가 보강한다면 Google-native 리뷰 본문 모달, 4travel 원문, Agoda 직접 본문을 우선 다시 열어 직접 표본을 더 넓히고, Ikkyu/Yahoo 교차 중복을 해시 기준으로 재점검하면 된다.
