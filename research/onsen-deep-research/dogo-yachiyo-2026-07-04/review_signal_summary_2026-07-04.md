# 道後温泉 八千代 온천 리뷰 신호 요약

조사일: 2026-07-04  
대상: 道後温泉 八千代 / Dogo Onsen Yachiyo / 도고온천 야치요  
지역: 愛媛県 松山市 道後温泉  
상태: ready 숙소 딥리서치 완료, `data_quality_grade=A`

## 1. 수집 브리핑

이번 숙소의 플랫폼상 전체 리뷰풀은 보수적으로 최소 2,017건 이상이다. Google Hotels 468건, Rakuten 496건, Jalan 657건, JTB 60건, Ikkyu 76건, Yahoo Travel 76건, Booking.com 75건, Hotels.com/Expedia 164건, Tripadvisor 121건, Relux 69건을 분리 확인했다.

직접 읽고 태깅한 리뷰는 총 323건이며, 이 중 온천 관련 직접 리뷰는 196건이다. 직접 본문 플랫폼은 Rakuten Travel, Jalan, JTB, Ikkyu, Yahoo Travel, Booking.com, Naver Blog의 7개다.

Google Hotels/Maps는 Aside Browser로 확인했다. 별점 4.6, Google 리뷰 468건 노출은 확인했지만, 이번 표본에서는 Google-native 본문이 접근 가능한 형태로 열리지 않아 직접 리뷰 수에는 넣지 않았다. Naver는 직접 블로그 본문 2건만 직접 리뷰로 세고, 검색 결과 스니펫과 OTA/파트너 페이지 미리보기는 `snippet_only`로 분리했다.

## 2. 공식 사실

공식 사이트 기준 일본어 공식명은 `道後温泉 八千代`, 영어 표기는 Dogo Onsen Yachiyo다. 공식 URL은 <https://www.e-yachiyo.co.jp/>이며, 주소는 愛媛県松山市道後多幸町6-34, 온천지는 道後温泉이다.

공식 객실 페이지와 Rakuten 상세의 공식 문구는 전 객실에 도고온천 원천 사용 온천 노천탕이 있다고 설명한다. 객실 타입은 55.8㎡, 67.5㎡ 계열이 확인되며, 공식 문구상 객실 노천탕은 `room_open_air_bath`로 분리해야 한다.

JTB 욕장 페이지는 대욕장과 공용 노천탕을 별도로 확인시킨다. 공용탕은 숙박자 무료, 이용 시간 15:00-24:00 / 05:30-10:30, 사우나 없음, 대욕장·노천탕 모두 대절 불가로 표기된다. JTB의 온천 처리 표기는 `天然温泉（循環ろ過式、加水加温の両方）`, 泉質 `単純温泉`, 湧出口泉温 46.7℃다. 객실 노천탕의 공식 가케나가시 주장과 공용탕의 순환·가수·가온 표기는 욕장 단위가 다르므로 섞지 않는다.

## 3. 리뷰 신호 요약 표

| bath_area | signal_type | direction | mention_count | source_count | platform_count | status |
|---|---:|---:|---:|---:|---:|---|
| room_open_air_bath | room_bath_hot_spring | positive | 168 | 168 | 7 | strong_signal |
| room_bath | room_bath_hot_spring | positive | 135 | 135 | 5 | strong_signal |
| facility_wide | water_texture | positive | 73 | 73 | 7 | moderate_signal |
| public_bath | public_bath_hot_spring | mixed | 40 | 40 | 5 | moderate_signal |
| open_air_public_bath | public_bath_hot_spring | mixed | 25 | 25 | 4 | moderate_signal |
| facility_wide | operations_note | mixed | 33 | 33 | 4 | weak_signal |
| facility_wide | temperature_control | mixed | 2 | 2 | 2 | weak_signal |

## 4. 근거 예시

1. Rakuten Travel, 최신권 표본: 객실 노천탕과 도고온천 본관 접근성이 함께 반복. `original_keyword`: `客室露天風呂`, `道後温泉本館`. <https://travel.rakuten.co.jp/HOTEL/166206/review.html>
2. Jalan, 최신권 표본: 전 객실 온천 노천탕과 방 식사 만족이 함께 나타남. `original_keyword`: `露天風呂付き`, `部屋食`. <https://www.jalan.net/yad325976/kuchikomi/>
3. JTB, 2026년권 표본: 방의 노천탕과 접객·식사를 같이 언급. `original_keyword`: `部屋にある露天風呂`, `温泉`. <https://www.jtb.co.jp/kokunai-hotel/htl/7461010/review/>
4. Ikkyu, 2025-05권 표본: 객실탕이 대욕장보다 좋고, 원천 그대로는 뜨거워 가수/방치가 필요했다는 구체 신호. `original_keyword`: `お部屋のお風呂`, `源泉`, `加水`. <https://www.ikyu.com/00030512/review/>
5. Ikkyu, 2025-05권 저평점성 표본: 객실 노천탕은 직접 물을 받아야 하며 개방감은 제한적이라는 신호. `original_keyword`: `お湯を自分でためる`, `開放感`. <https://www.ikyu.com/00030512/review/>
6. Yahoo Travel, 2021년 장문 표본: 객실 노천탕이 평가의 중심이고 대욕장은 일반적이라는 비교 신호. `original_keyword`: `部屋の露天風呂`, `大浴場はごく一般的`. <https://travel.yahoo.co.jp/00030512/review/>
7. Booking.com, 2026년권 영어 표본: 객실의 onsen bath와 위치를 긍정적으로 언급. `original_keyword`: `onsen bath`, `good location`. <https://www.booking.com/reviews/jp/hotel/yachiyo.html>
8. Booking.com, 2026년권 영어 표본: 방 욕조는 좋지만 빛/수면 환경에 불편 신호. `original_keyword`: `bath in the room`, `bright light`. <https://www.booking.com/reviews/jp/hotel/yachiyo.html>
9. Naver Blog, 2026년권 직접 본문: 객실마다 온천수 노천탕과 대욕장을 함께 언급. `original_keyword`: `객실마다 온천수 노천탕`, `대중목욕탕`. <https://blog.naver.com/yesyeess/224201620600>
10. Naver Blog, 2026년권 직접 본문: 전 객실 노천탕과 프라이빗 룸다이닝을 숙소 선택 이유로 설명. `original_keyword`: `전 객실 노천탕`, `프라이빗`. <https://blog.naver.com/annatomo/224288947088>

## 5. Bathtime 해석

직접 확인 표본 323건 중 온천 관련 본문 196건이 확인되며, 八千代는 대욕장보다 객실 노천탕 중심으로 해석하는 편이 데이터에 맞다. 특히 `객실 노천탕/방의 노천탕/온천 노천탕付 객실` 신호가 여러 OTA와 한국어 블로그에서 뚜렷하게 반복되고, 방 안에서 식사와 온천을 끝내는 체류 방식이 함께 나타난다.

다만 “가케나가시” 만족 신호는 욕장 단위로 조심해서 읽어야 한다. 공식은 객실 노천탕의 도고온천 원천 사용·가케나가시를 주장하지만, JTB는 공용 대욕장에 대해 순환여과·가수·가온을 표기한다. 리뷰에서도 객실탕은 강한 긍정 신호가 반복되는 반면, 대욕장은 “있다/일반적/비교 대상”에 가깝고 일부는 직접 물을 받거나 온도를 조절해야 한다는 운영 신호가 붙는다.

## 6. Gaps

- Google Hotels/Maps는 Aside Browser로 확인했으나 Google-native 리뷰 본문은 직접 추출하지 못했다. Google 리뷰 468건은 리뷰풀이며 직접 리뷰 수가 아니다.
- Google rating_distribution은 막대 존재만 확인했고 별점별 숫자는 추출하지 못했다.
- Hotels.com/Expedia는 164건 리뷰풀이 보였지만 리뷰 모달 본문을 안정적으로 열지 못해 직접 리뷰 수 0건으로 기록했다.
- Tripadvisor 121건, Relux 69건은 이번 회차에서 검색/페이지 스니펫만 확인해 `snippet_only`다.
- Ikkyu와 Yahoo Travel은 Aside Browser로 직접 본문을 읽었지만 같은 기업권 리뷰 생태계다. 현재는 별도 플랫폼 표면으로 기록하되, 후속 파이프라인에서 동일 문장 해시가 발견되면 중복 제거가 필요하다.
- Naver 검색 결과의 OTA, 파트너스, 블로그 미리보기는 `snippet_only`이며 직접 리뷰 수에 포함하지 않았다.

## 7. 다음 액션

이 숙소는 A등급으로 종료 가능하다. 다음 에이전트가 보강한다면 Google-native 리뷰 본문 모달, Hotels.com/Expedia 리뷰 모달, Tripadvisor/Relux 원문을 우선 다시 열어 직접 표본을 더 넓히고, Ikkyu/Yahoo 교차 중복을 해시 기준으로 재점검하면 된다.
