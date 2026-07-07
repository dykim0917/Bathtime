# 홋카이도 ready 숙소 딥리서치 확장 결과 (2026-07-03)

## 1. 수집 브리핑

- 범위: `hokkaido_accommodation_candidate_shortlist_2026-07-03.csv` 중 `candidate_status=ready` 숙소 16개.
- Rakuten Travel `hotel/voice` 페이지네이션을 확장했고, 기존 검증 파일 및 URL 검색으로 확인된 Jalan/JTB 정적 표면을 추가 확인했다.
- 플랫폼상 전체 리뷰풀과 직접 읽은 리뷰 수는 분리했다. 표시 리뷰 수는 리뷰풀 관찰값이고, 직접 읽은 리뷰 수는 본문을 파싱한 개별 리뷰 수다.
- Google Maps, Naver, Ikkyu/Yahoo/Jalan archive 등 동적 리뷰 탭은 최초 정적 패스에서 확정 차단 판정을 내리지 않았고, 이후 Aside Browser 보강으로 일부 D급 숙소를 순차 재판정했다.
- Rakuten+Jalan 또는 Aside/web 보강으로 모든 ready 숙소가 2개 이상 직접 본문 플랫폼과 150건 이상 직접 표본을 확보했다. 2026-07-04 A 보강에서 第一滝本館, 定山渓第一寶亭留 翠山亭, 平成館 しおさい亭, 湯の川プリンスホテル渚亭, 登別万世閣, ホテルまほろば, 祝いの宿 登別グランドホテル, 函館・湯の川温泉 花びしホテル, 登別温泉郷 滝乃家, グランドブリッセンホテル定山渓, ザ・レイクスイート湖の栖, 旅亭 花ゆら, シャレーアイビー定山渓, 望楼NOGUCHI登別, 全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》, 平成館 しおさい亭 別館 花月까지 ready 16개 전부 300건 이상에 도달해 `A`로 승급했다.

| 숙소 | 플랫폼상 리뷰풀 관찰 | 직접 확인 리뷰 | 온천 관련 직접 리뷰 | 직접 본문 플랫폼 | volume | 엄격 등급 | 상태 |
|---|---:|---:|---:|---:|---|---|---|
| 全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》 | Jalan 123; Google Maps 266; Ikkyu/Yahoo combined score 342 but Ikkyu parsed body pages counted separately; Hotels.com 32; Booking 88; Trip.com 42 | 380 | 300 | 8 (Booking.com, Google Maps, Hotels.com, Ikkyu, Jalan, Rakuten Travel, Trip.com, Yahoo Travel) | A_volume_300plus | A | a_grade_ikkyu_full_pagination_reinforced |
| ザ・レイクスイート湖の栖 | Rakuten 866 prior / current reviewList exhausted after p4; Google Maps 1169; Jalan 119; Ikkyu/Yahoo 190; Trip.com 67; Expedia/Hotels 79 | 308 | 255 | 7 (Google Maps, Hotels.com, Ikkyu, Jalan, Rakuten Travel, Trip.com, Yahoo Travel) | A_volume_300plus | A | a_grade_ikkyu_yahoo_p1_p5_reinforced |
| 望楼NOGUCHI登別 | Google Maps/Hotels 750; Jalan 31; Ikkyu/Yahoo combined score 147-148 but parsed body pages counted separately; Trip.com 85; Relux 39; JTB 36 comments | 368 | 247 | 11 (Booking.com, Expedia, Google Maps/Hotels, Ikkyu, Jalan, JTB, Rakuten Travel, Relux, Tripadvisor, Trip.com, Yahoo Travel) | A_volume_300plus | A | a_grade_ikkyu_yahoo_relux_jtb_reinforced |
| 定山渓第一寶亭留 翠山亭 | Rakuten Travel 1380 prior / 1106 current reviewList; Google Maps 1375; Jalan 3311; Ikkyu 107; Yahoo Maps 205; Trip.com 305; Agoda 3558 aggregate; Booking.com via Agoda 305 | 313 | 199 | 9 (Agoda, Booking.com via Agoda, Google Maps, Ikkyu, Jalan, Naver Blog, Rakuten Travel, Trip.com, Yahoo Maps) | A_volume_300plus | A | a_grade_rakuten_pages8_11_reinforced |
| 湯の川プリンスホテル渚亭 | Rakuten Travel 2265 prior / 1849 current reviewList; JTB 118; Google Maps/Hotels 1746; Yahoo Travel 167; Trip.com 146; Booking.com 522; Expedia 210 | 333 | 251 | 7 (Booking.com, Google Hotels, JTB, Naver Blog, Rakuten Travel, Trip.com, Yahoo Travel) | A_volume_300plus | A | a_grade_rakuten_pages8_14_reinforced |
| 第一滝本館 | Rakuten Travel 3556; Google Maps/Hotels 6227; Jalan 7241; Yahoo/Ikkyu 215; JTB 140; Rurubu 436; Booking.com 3590; Trip.com via Google 3047; Naver Place 2 | 300 | 189 | 8 (Booking.com, Google Maps/Hotels, Ikkyu, Jalan, JTB/Rurubu, Naver, Rakuten Travel, Yahoo Travel) | A_volume_300plus | A | a_grade_rakuten_page8_reinforced |
| ホテルまほろば | Rakuten Travel 2661 prior / 2070 current reviewList; Google Maps 4680; Booking.com 1050; Trip.com 728; Tripadvisor 740; Yahoo/Ikkyu/Hotels.com direct pages | 330 | 216 | 8 (Booking.com, Google Maps, Hotels.com, Ikkyu, Rakuten Travel, Tripadvisor, Trip.com, Yahoo Travel) | A_volume_300plus | A | a_grade_rakuten_pages8_14_reinforced |
| 祝いの宿 登別グランドホテル | Rakuten Travel 2984 prior / 2327 current reviewList; Google Maps 2751; Booking.com 150/473 surface; Yahoo Travel 160; Ikkyu 169; Trip.com 487; Yahoo Map 90 | 324 | 200 | 8 (Booking.com, Google Maps, Hotelpass Korean review, Ikkyu, Rakuten Travel, Tripadvisor, Trip.com, Yahoo Travel) | A_volume_300plus | A | a_grade_rakuten_pages8_14_reinforced |
| 登別万世閣 | Rakuten Travel 1201 prior / 923 current reviewList; Google Maps 2775; Booking.com 520; Yahoo Travel 54; Trip.com 232; Naver/Hotels/Agoda search surfaces | 351 | 228 | 7 (Booking.com, Google Maps, Jalan, Naver Blog, Rakuten Travel, Trip.com, Yahoo Travel) | A_volume_300plus | A | a_grade_rakuten_pages8_15_reinforced |
| 登別温泉郷 滝乃家 | Google Maps/Hotels 730; Rakuten Travel 335 prior / 269 current reviewList; Jalan 746; Ikkyu 103 | 312 | 184 | 4 (Google Maps/Hotels, Ikkyu, Jalan, Rakuten Travel) | A_volume_300plus | A | a_grade_rakuten_pages8_14_ikkyu_reinforced |
| 旅亭 花ゆら | Google Maps/Hotels 657; Rakuten Travel 168; Jalan 500; Ikkyu 41; JTB 132 questionnaire / 20 RRB; Relux 42; Yahoo Maps 14; Tripadvisor 163 | 306 | 211 | 8 (Google Maps/Hotels, Ikkyu, Jalan, JTB, Rakuten Travel, Relux, Tripadvisor, Yahoo Maps) | A_volume_300plus | A | a_grade_multi_platform_web_reinforced |
| シャレーアイビー定山渓 | Google Maps/Hotels 125; Rakuten 9; Ikkyu/Yahoo 30; Booking 164; Trip.com 167; Expedia/Hotels 101; Relux 11; Tripadvisor 12 | 312 | 103 | 12 (Booking.com, Expedia, Google Maps/Hotels, Hotels.com, Ikkyu, Jalan archive, JTB, Rakuten Travel, Relux, Tripadvisor, Trip.com, Yahoo Travel) | A_volume_300plus | A | a_grade_conservative_aside_recount_reinforced |
| グランドブリッセンホテル定山渓 | Rakuten Travel 375 prior / 270 current reviewList; Jalan 473; Ikkyu/Yahoo direct pages | 305 | 216 | 3 (Ikkyu/Yahoo Travel, Jalan, Rakuten Travel) | A_volume_300plus | A | a_grade_rakuten_pages8_14_ikkyu_yahoo_reinforced |
| 平成館 しおさい亭 別館 花月 | Rakuten Travel 155; Jalan 421 including 397 archive reviews; Booking 17 body reviews; Yahoo 10; Trip.com/Ikkyu direct body sample | 300 | 246 | 6 (Booking.com, Ikkyu, Jalan, Rakuten Travel, Trip.com, Yahoo Travel) | A_volume_300plus | A | a_grade_jalan_archive_reinforced_google_mixed_not_counted |
| 平成館 しおさい亭 | Rakuten Travel 659 prior / 486 current reviewList; Google Maps 1627; Jalan 1469; Yahoo Travel 55; Booking.com 124-228 surface; Trip.com 208; Hotels.com 225 | 318 | 199 | 6 (Booking.com, Google Maps, Jalan, Rakuten Travel, Trip.com, Yahoo Travel) | A_volume_300plus | A | a_grade_rakuten_pages8_12_reinforced |
| 函館・湯の川温泉 花びしホテル | Rakuten Travel 1713 prior / 1300 current reviewList; Ikkyu 134; Jalan direct sample | 310 | 168 | 3 (Ikkyu, Jalan, Rakuten Travel) | A_volume_300plus | A | a_grade_rakuten_pages8_14_ikkyu_reinforced |

## 2. 공식 사실과 후보 축

| 숙소 | 공식/후보 욕장 축 | 공식 URL | 메모 |
|---|---|---|---|
| 望楼NOGUCHI登別 | `room_bath` | `room_bath_hot_spring` | positive | 176 | 11 | strong_signal |
| 望楼NOGUCHI登別 | `room_bath` | `water_texture` | positive | 104 | 10 | strong_signal |
| 望楼NOGUCHI登別 | `public_bath` | `public_bath_hot_spring` | mixed | 70 | 9 | strong_signal |
| 望楼NOGUCHI登別 | `room_open_air_bath` | `room_bath_hot_spring` | mixed | 39 | 7 | strong_signal |
| 望楼NOGUCHI登別 | `public_bath` | `water_texture` | positive | 48 | 8 | strong_signal |
| 望楼NOGUCHI登別 | `room_bath` | `crowding` | negative | 13 | 5 | moderate_signal |
| 望楼NOGUCHI登別 | `room_bath` | `booking_confusion` | negative | 12 | 5 | moderate_signal |
| 望楼NOGUCHI登別 | `room_bath` | `weak_onsen_feeling` | negative | 9 | 4 | weak_signal |
| 望楼NOGUCHI登別 | `room_bath` | `cleanliness_maintenance` | negative | 12 | 5 | moderate_signal |
| 定山渓第一寶亭留 翠山亭 | `room_bath` | `room_bath_hot_spring` | positive | 112 | 6 | strong_signal |
| 定山渓第一寶亭留 翠山亭 | `public_bath` | `public_bath_hot_spring` | positive | 68 | 6 | strong_signal |
| 定山渓第一寶亭留 翠山亭 | `room_open_air_bath` | `room_bath_hot_spring` | mixed | 39 | 5 | strong_signal |
| 定山渓第一寶亭留 翠山亭 | `private_bath` | `private_bath_experience` | mixed | 21 | 3 | moderate_signal |
| 定山渓第一寶亭留 翠山亭 | `room_bath` | `weak_onsen_feeling` | negative | 11 | 3 | weak_signal |
| 定山渓第一寶亭留 翠山亭 | `room_bath` | `crowding` | mixed | 18 | 4 | moderate_signal |
| 定山渓第一寶亭留 翠山亭 | `room_bath` | `booking_confusion` | negative | 17 | 4 | moderate_signal |
| 定山渓第一寶亭留 翠山亭 | `room_bath` | `water_texture` | positive | 28 | 4 | moderate_signal |
| 湯の川プリンスホテル渚亭 | `room_open_air_bath` | https://nagisatei.info/ | 客室露天数が非常に強い候補。機械化/ビジネスホテル化 기대차와 온천 평가를 분리 |
| 第一滝本館 | `room_open_air_bath;public_bath;open_air_public_bath` | https://takimotokan.co.jp/ja/spa/ | 登別の代表的な多泉質大型宿。泉質別浴槽・大浴場規模・混雑/動線を分けて深掘り |
| ホテルまほろば | `room_open_air_bath;public_bath;open_air_public_bath` | https://h-mahoroba.jp/ | 宿泊施設だが温泉施設級の大浴場候補。31湯/複数泉質/家族・大型ホテル混雑/源泉露天客室を分ける |
| 祝いの宿 登別グランドホテル | `room_open_air_bath;public_bath;open_air_public_bath;family_bath` | https://www.nobogura.co.jp/hotspring/ | 鬼サウナと多泉質大浴場が主要価値。公式で温泉家族風呂は予約制50分・源泉かけ流し食塩泉、客室露天は天然温泉ではなくラジウム鉱泉利用の人工温泉と分離 |
| 登別万世閣 | `room_bath;room_open_air_bath;public_bath;open_air_public_bath;private_bath` | https://www.noboribetsu-manseikaku.jp/spa/ | 大浴場温泉・セルフロウリュ・貸切温泉サウナを分ける。通常客室風呂は温泉ではなく、11階特別室系のみ源泉かけ流し温泉として分離 |
| 登別温泉郷 滝乃家 | `room_open_air_bath;public_bath;open_air_public_bath` | https://www.takinoya.co.jp/ | 高級老舗。客室展望風呂・館内浴場・4泉質を分ける。レビュー量は中規模 |
| 旅亭 花ゆら | `room_open_air_bath` | https://hanayura.com/ | 客室温泉付き部屋と大浴場を分ける。高級小規模宿として混雑少なめ 신호 확인 가치 |
| シャレーアイビー定山渓 | `room_bath` | `room_bath_hot_spring` | positive | 92 | 12 | strong_signal |
| シャレーアイビー定山渓 | `room_open_air_bath` | `room_bath_hot_spring` | mixed | 34 | 9 | strong_signal |
| シャレーアイビー定山渓 | `public_bath` | `public_bath_hot_spring` | mixed | 32 | 9 | strong_signal |
| シャレーアイビー定山渓 | `room_bath` | `water_texture` | positive | 34 | 9 | strong_signal |
| シャレーアイビー定山渓 | `room_bath` | `booking_confusion` | mixed | 20 | 8 | moderate_signal |
| シャレーアイビー定山渓 | `room_bath` | `weak_onsen_feeling` | negative | 12 | 6 | weak_signal |
| シャレーアイビー定山渓 | `room_bath` | `privacy_or_glass_bath` | negative | 18 | 8 | moderate_signal |
| グランドブリッセンホテル定山渓 | `room_bath;public_bath;private_bath_or_family_bath_unclear` | https://www.grandblissen.jp/ | 定山渓の客室温泉展望風呂候補。全室か多数かの部屋タイプ確認と大浴場/客室風呂分離が必要 |
| 平成館 しおさい亭 別館 花月 | `room_open_air_bath` | https://www.hanatuki.com/ | 客室露天眺望が主価値。大浴場より客室露天重視レビュー가 많아 room_open_air_bath 중심 태깅 |
| 函館・湯の川温泉 花びしホテル | `public_bath;open_air_public_bath` | https://www.hanabishihotel.com/ | 高レビュー量。1階/7階浴場・循環/一部源泉かけ流し表現・眺望差を浴場別に確認 |

## 3. 리뷰 신호 요약

| 숙소 | bath_area | signal_type | direction | mention_count | platform_count | status |
|---|---|---|---:|---:|---:|---|
| 湯の川プリンスホテル渚亭 | `room_open_air_bath` | `room_bath_hot_spring` | mixed | 198 | 7 | strong_signal |
| 湯の川プリンスホテル渚亭 | `public_bath` | `public_bath_hot_spring` | mixed | 30 | 6 | strong_signal |
| 湯の川プリンスホテル渚亭 | `room_open_air_bath` | `water_texture` | mixed | 74 | 5 | strong_signal |
| 湯の川プリンスホテル渚亭 | `room_open_air_bath` | `booking_confusion` | negative | 45 | 5 | strong_signal |
| 湯の川プリンスホテル渚亭 | `room_open_air_bath` | `crowding` | mixed | 18 | 3 | moderate_signal |
| 湯の川プリンスホテル渚亭 | `public_bath` | `crowding` | positive | 8 | 3 | weak_signal |
| 湯の川プリンスホテル渚亭 | `public_bath` | `weak_onsen_feeling` | negative | 8 | 3 | weak_signal |
| 湯の川プリンスホテル渚亭 | `room_open_air_bath` | `weak_onsen_feeling` | negative | 8 | 3 | weak_signal |
| 湯の川プリンスホテル渚亭 | `room_bath` | `room_bath_hot_spring` | positive | 4 | 2 | weak_signal |
| 第一滝本館 | `public_bath` | `public_bath_hot_spring` | mixed | 138 | 8 | strong_signal |
| 第一滝本館 | `open_air_public_bath` | `public_bath_hot_spring` | positive | 63 | 7 | strong_signal |
| 第一滝本館 | `facility_wide` | `water_texture` | positive | 53 | 7 | strong_signal |
| 第一滝本館 | `public_bath` | `water_texture` | positive | 45 | 7 | strong_signal |
| 第一滝本館 | `public_bath` | `crowding` | mixed | 32 | 6 | moderate_signal |
| 第一滝本館 | `facility_wide` | `booking_confusion` | negative | 14 | 5 | moderate_signal |
| 第一滝本館 | `room_open_air_bath` | `room_bath_hot_spring` | positive | 8 | 3 | weak_signal |
| 第一滝本館 | `room_bath` | `room_bath_hot_spring` | mixed | 8 | 1 | weak_signal |
| 第一滝本館 | `facility_wide` | `weak_onsen_feeling` | negative | 11 | 5 | weak_signal |
| ホテルまほろば | `public_bath` | `public_bath_hot_spring` | mixed | 138 | 8 | strong_signal |
| ホテルまほろば | `open_air_public_bath` | `public_bath_hot_spring` | positive | 43 | 8 | strong_signal |
| ホテルまほろば | `facility_wide` | `water_texture` | mixed | 72 | 8 | strong_signal |
| ホテルまほろば | `public_bath` | `crowding` | mixed | 51 | 6 | strong_signal |
| ホテルまほろば | `room_open_air_bath` | `room_bath_hot_spring` | positive | 29 | 4 | moderate_signal |
| ホテルまほろば | `facility_wide` | `weak_onsen_feeling` | negative | 6 | 3 | weak_signal |
| ホテルまほろば | `facility_wide` | `booking_confusion` | neutral | 28 | 4 | moderate_signal |
| 祝いの宿 登別グランドホテル | `public_bath` | `public_bath_hot_spring` | mixed | 157 | 8 | strong_signal |
| 祝いの宿 登別グランドホテル | `open_air_public_bath` | `public_bath_hot_spring` | positive | 29 | 7 | moderate_signal |
| 祝いの宿 登別グランドホテル | `facility_wide` | `water_texture` | mixed | 69 | 8 | strong_signal |
| 祝いの宿 登別グランドホテル | `public_bath` | `crowding` | mixed | 27 | 6 | moderate_signal |
| 祝いの宿 登別グランドホテル | `family_bath` | `private_bath_experience` | mixed | 5 | 2 | weak_signal |
| 祝いの宿 登別グランドホテル | `room_open_air_bath` | `booking_confusion` | negative | 34 | 4 | strong_signal |
| 祝いの宿 登別グランドホテル | `facility_wide` | `weak_onsen_feeling` | negative | 6 | 3 | weak_signal |
| 登別万世閣 | `public_bath` | `public_bath_hot_spring` | mixed | 148 | 7 | strong_signal |
| 登別万世閣 | `open_air_public_bath` | `public_bath_hot_spring` | mixed | 47 | 6 | strong_signal |
| 登別万世閣 | `facility_wide` | `water_texture` | mixed | 88 | 7 | strong_signal |
| 登別万世閣 | `public_bath` | `crowding` | mixed | 43 | 5 | strong_signal |
| 登別万世閣 | `private_bath` | `private_bath_experience` | neutral | 2 | 1 | insufficient |
| 登別万世閣 | `room_open_air_bath` | `room_bath_hot_spring` | positive | 5 | 2 | weak_signal |
| 登別万世閣 | `room_bath` | `booking_confusion` | negative | 8 | 3 | weak_signal |
| 登別万世閣 | `facility_wide` | `weak_onsen_feeling` | negative | 14 | 4 | moderate_signal |
| 登別温泉郷 滝乃家 | `room_open_air_bath` | `room_bath_hot_spring` | mixed | 92 | 4 | strong_signal |
| 登別温泉郷 滝乃家 | `room_bath` | `room_bath_hot_spring` | mixed | 124 | 4 | strong_signal |
| 登別温泉郷 滝乃家 | `public_bath` | `public_bath_hot_spring` | mixed | 46 | 4 | strong_signal |
| 登別温泉郷 滝乃家 | `open_air_public_bath` | `public_bath_hot_spring` | positive | 20 | 4 | moderate_signal |
| 登別温泉郷 滝乃家 | `facility_wide` | `water_texture` | positive | 62 | 4 | strong_signal |
| 登別温泉郷 滝乃家 | `public_bath` | `crowding` | positive | 32 | 4 | strong_signal |
| 登別温泉郷 滝乃家 | `room_bath` | `booking_confusion` | negative | 87 | 4 | strong_signal |
| 登別温泉郷 滝乃家 | `room_bath` | `weak_onsen_feeling` | negative | 8 | 4 | weak_signal |
| 登別温泉郷 滝乃家 | `open_air_public_bath` | `insects` | negative | 3 | 2 | insufficient |
| 旅亭 花ゆら | `room_open_air_bath` | `room_bath_hot_spring` | positive | 151 | 8 | strong_signal |
| 旅亭 花ゆら | `room_bath` | `room_bath_hot_spring` | positive | 60 | 8 | strong_signal |
| 旅亭 花ゆら | `public_bath` | `public_bath_hot_spring` | mixed | 49 | 8 | strong_signal |
| 旅亭 花ゆら | `open_air_public_bath` | `public_bath_hot_spring` | positive | 46 | 7 | strong_signal |
| 旅亭 花ゆら | `facility_wide` | `water_texture` | positive | 57 | 8 | strong_signal |
| 旅亭 花ゆら | `room_open_air_bath` | `booking_confusion` | negative | 18 | 6 | moderate_signal |
| 旅亭 花ゆら | `room_open_air_bath` | `crowding` | mixed | 15 | 6 | moderate_signal |
| 旅亭 花ゆら | `room_open_air_bath` | `temperature_control` | mixed | 13 | 5 | weak_signal |
| 旅亭 花ゆら | `room_open_air_bath` | `insects` | negative | 7 | 3 | weak_signal |
| グランドブリッセンホテル定山渓 | `room_bath` | `room_bath_hot_spring` | mixed | 216 | 3 | strong_signal |
| グランドブリッセンホテル定山渓 | `room_bath` | `public_bath_hot_spring` | mixed | 114 | 3 | strong_signal |
| グランドブリッセンホテル定山渓 | `room_open_air_bath` | `room_bath_hot_spring` | mixed | 95 | 3 | strong_signal |
| グランドブリッセンホテル定山渓 | `room_open_air_bath` | `public_bath_hot_spring` | mixed | 18 | 2 | moderate_signal |
| グランドブリッセンホテル定山渓 | `facility_wide` | `water_texture` | positive | 28 | 3 | moderate_signal |
| グランドブリッセンホテル定山渓 | `public_bath` | `public_bath_hot_spring` | mixed | 43 | 3 | strong_signal |
| グランドブリッセンホテル定山渓 | `public_bath` | `water_texture` | mixed | 3 | 1 | weak_signal |
| グランドブリッセンホテル定山渓 | `public_bath` | `crowding` | negative | 32 | 3 | strong_signal |
| グランドブリッセンホテル定山渓 | `room_bath` | `booking_confusion` | negative | 88 | 3 | strong_signal |
| グランドブリッセンホテル定山渓 | `room_bath` | `crowding` | negative | 4 | 1 | weak_signal |
| グランドブリッセンホテル定山渓 | `room_bath` | `water_texture` | mixed | 6 | 1 | weak_signal |
| グランドブリッセンホテル定山渓 | `room_open_air_bath` | `booking_confusion` | negative | 2 | 2 | moderate_signal |
| グランドブリッセンホテル定山渓 | `room_open_air_bath` | `water_texture` | mixed | 2 | 1 | weak_signal |
| グランドブリッセンホテル定山渓 | `unclear` | `booking_confusion` | negative | 2 | 2 | moderate_signal |
| グランドブリッセンホテル定山渓 | `room_open_air_bath` | `crowding` | negative | 3 | 2 | moderate_signal |
| グランドブリッセンホテル定山渓 | `room_bath` | `weak_onsen_feeling` | negative | 6 | 2 | weak_signal |
| グランドブリッセンホテル定山渓 | `facility_wide` | `weak_onsen_feeling` | negative | 1 | 1 | insufficient |
| 平成館 しおさい亭 別館 花月 | `room_open_air_bath` | `room_bath_hot_spring` | positive | 206 | 6 | strong_signal |
| 平成館 しおさい亭 別館 花月 | `room_open_air_bath` | `public_bath_hot_spring` | mixed | 22 | 5 | moderate_signal |
| 平成館 しおさい亭 別館 花月 | `room_open_air_bath` | `water_texture` | mixed | 31 | 6 | strong_signal |
| 平成館 しおさい亭 別館 花月 | `room_open_air_bath` | `booking_confusion` | negative | 15 | 4 | moderate_signal |
| 平成館 しおさい亭 別館 花月 | `public_bath` | `public_bath_hot_spring` | mixed | 37 | 5 | strong_signal |
| 平成館 しおさい亭 別館 花月 | `room_open_air_bath` | `temperature_control` | mixed | 34 | 5 | strong_signal |
| 平成館 しおさい亭 別館 花月 | `facility_wide` | `aged_facility` | negative | 17 | 3 | moderate_signal |
| 函館・湯の川温泉 花びしホテル | `room_open_air_bath` | `room_bath_hot_spring` | mixed | 38 | 3 | strong_signal |
| 函館・湯の川温泉 花びしホテル | `public_bath` | `public_bath_hot_spring` | mixed | 105 | 3 | strong_signal |
| 函館・湯の川温泉 花びしホテル | `room_bath` | `room_bath_hot_spring` | mixed | 35 | 3 | strong_signal |
| 函館・湯の川温泉 花びしホテル | `room_bath` | `public_bath_hot_spring` | mixed | 4 | 2 | moderate_signal |
| 函館・湯の川温泉 花びしホテル | `room_bath` | `water_texture` | mixed | 3 | 2 | moderate_signal |
| 函館・湯の川温泉 花びしホテル | `unclear` | `booking_confusion` | negative | 7 | 1 | weak_signal |
| 函館・湯の川温泉 花びしホテル | `room_open_air_bath` | `booking_confusion` | neutral | 2 | 1 | weak_signal |
| 函館・湯の川温泉 花びしホテル | `room_open_air_bath` | `public_bath_hot_spring` | mixed | 6 | 2 | moderate_signal |
| 函館・湯の川温泉 花びしホテル | `facility_wide` | `booking_confusion` | negative | 24 | 3 | moderate_signal |
| 函館・湯の川温泉 花びしホテル | `public_bath` | `water_texture` | mixed | 2 | 1 | weak_signal |
| 函館・湯の川温泉 花びしホテル | `public_bath` | `crowding` | negative | 1 | 1 | insufficient |
| 函館・湯の川温泉 花びしホテル | `facility_wide` | `water_texture` | mixed | 3 | 1 | weak_signal |
| 函館・湯の川温泉 花びしホテル | `room_bath` | `booking_confusion` | negative | 5 | 2 | moderate_signal |
| 函館・湯の川温泉 花びしホテル | `room_open_air_bath` | `water_texture` | mixed | 2 | 1 | weak_signal |
| 函館・湯の川温泉 花びしホテル | `unclear` | `weak_onsen_feeling` | negative | 1 | 1 | insufficient |
| 函館・湯の川温泉 花びしホテル | `facility_wide` | `crowding` | negative | 16 | 2 | moderate_signal |

## 4. 부정/주의 신호

| 숙소 | issue | bath_area | evidence_level | summary | sample_count |
|---|---|---|---|---|---:|
| 湯の川プリンスホテル渚亭 | `temperature_control` | `room_open_air_bath` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 6 |
| 湯の川プリンスホテル渚亭 | `crowding` | `room_open_air_bath` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 5 |
| 湯の川プリンスホテル渚亭 | `aged_facility` | `room_open_air_bath` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 湯の川プリンスホテル渚亭 | `temperature_cold` | `facility_wide` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 湯の川プリンスホテル渚亭 | `temperature_hot` | `facility_wide` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 湯の川プリンスホテル渚亭 | `access_or_flow_distance` | `room_open_air_bath` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 2 |
| 湯の川プリンスホテル渚亭 | `insects` | `room_open_air_bath` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 第一滝本館 | `temperature_hot` | `facility_wide` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 第一滝本館 | `temperature_control` | `facility_wide` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 4 |
| 第一滝本館 | `access_or_flow_distance` | `public_bath` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 3 |
| 第一滝本館 | `insects` | `facility_wide` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 第一滝本館 | `room_bath_size_or_expectation` | `facility_wide` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 第一滝本館 | `aged_facility` | `facility_wide` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 第一滝本館 | `crowding` | `public_bath` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| ホテルまほろば | `crowding` | `public_bath` | moderate_signal | Aside 보강에서 Google/Yahoo/Booking/Trip.com 표본까지 확장되며 대형 호텔·식사장·욕장 이용 시간대 혼잡 신호가 반복됨. | 14 |
| ホテルまほろば | `aged_facility` | `facility_wide` | weak_signal | Google/Trip.com/Booking/Hotels.com 표본에서 객실 노후감, 다다미방 냄새, 설비 낡음이 소량 반복됨. | 6 |
| ホテルまほろば | `room_bath_size_or_expectation` | `room_open_air_bath` | weak_signal | 객실 노천탕은 일부 객실 타입 축으로만 확인되며, 일반 객실/대욕장 만족과 섞지 않는 메모가 필요함. | 3 |
| ホテルまほろば | `temperature_control` | `public_bath` | weak_signal | Booking/Yahoo 표본에서 탕 온도 폭과 시간대/남녀 교대에 따른 체감 차이가 확인됨. | 6 |
| ホテルまほろば | `insects` | `facility_wide` | exploratory | Hotels.com 한국어 검증 후기에 벌레/다다미방 꿉꿉함이 단건 확인됨. 객실 관리 메모로만 둠. | 1 |
| ホテルまほろば | `weak_onsen_feeling` | `facility_wide` | weak_signal | Ikkyu/Trip.com 저평가 표본에서 대형 온천호텔 대비 고급감·온천장 정취가 약하다는 반대 신호가 소량 확인됨. | 5 |
| 祝いの宿 登別グランドホテル | `temperature_control` | `public_bath` | weak_signal | Booking/Yahoo 표본에서 탕 온도 조절·더 뜨거웠으면 좋겠다는 언급과 수풍로/사우나 온도 신호가 함께 확인됨. | 7 |
| 祝いの宿 登別グランドホテル | `crowding` | `public_bath` | moderate_signal | Booking/Yahoo/Ikkyu 표본에서 혼잡 적음과 외국인 관광객 이용 매너 불편이 함께 나타나 mixed 관리 신호로 둠. | 13 |
| 祝いの宿 登別グランドホテル | `insects` | `unclear` | exploratory | Rakuten 기존 단건 신호로 유지. 이번 보강에서는 반복 확인되지 않아 운영 메모로만 둠. | 1 |
| 祝いの宿 登別グランドホテル | `aged_facility` | `facility_wide` | weak_signal | Yahoo/Booking에서 객실·열쇠·탈의실 로커 노후감이 확인됨. 대욕장 수질 신호와 분리한다. | 11 |
| 祝いの宿 登別グランドホテル | `temperature_cold` | `open_air_public_bath` | exploratory | 수풍로/노천 수온 관련 소량 신호. 사우나 맥락으로 별도 메모한다. | 2 |
| 祝いの宿 登別グランドホテル | `temperature_hot` | `public_bath` | exploratory | 더 뜨거웠으면 좋겠다는 반대 신호도 있어 온도 평가는 mixed로 본다. | 2 |
| 登別万世閣 | `public_bath` | weak_signal | Google/Yahoo/Jalan 표본에서 온천이 열겁다, 온도 조절, 源泉水風呂/수풍로 신호가 함께 확인됨. | 6 |
| 登別万世閣 | `crowding` | `public_bath` | moderate_signal | Google/Yahoo/Jalan/Trip.com 표본에서 혼잡이 적다는 긍정과 단체·외국인 매너·대욕장 도난 우려가 함께 나타남. | 18 |
| 登別万世閣 | `room_bath_size_or_expectation` | `room_bath` | weak_signal | 공식 FAQ상 일반 객실 욕실은 온천이 아니며, 11층 특수 객실만 원천가케나가시 온천으로 분리 필요. | 6 |
| 登別万世閣 | `insects` | `facility_wide` | weak_signal | Booking/Naver/Rakuten 계열 표본에서 객실 벌레·안내문·청소 관련 신호가 소량 반복됨. | 4 |
| 登別万世閣 | `aged_facility` | `facility_wide` | moderate_signal | Google/Booking/Yahoo/Naver에서 오래된 시설이지만 관리됨, 싱글룸/객실 일부 노후, 곰팡이·먼지 신호가 함께 확인됨. | 15 |
| 登別万世閣 | `temperature_cold` | `public_bath` | exploratory | 공식/후기에서 源泉水風呂와 사우나 맥락으로 확인되는 신호. 일반 온천탕 불만으로 일반화하지 않음. | 2 |
| 登別万世閣 | `weak_onsen_feeling` | `public_bath` | weak_signal | 탕 종류가 많지 않음, 대욕장 1槽, 전망 아쉬움 같은 반대 신호가 Google/Yahoo/Trip.com에서 소량 확인됨. | 6 |
| 登別温泉郷 滝乃家 | `temperature_control` | `facility_wide` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 4 |
| 登別温泉郷 滝乃家 | `crowding` | `room_bath` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 2 |
| 登別温泉郷 滝乃家 | `temperature_hot` | `room_bath` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 登別温泉郷 滝乃家 | `steps` | `facility_wide` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 登別温泉郷 滝乃家 | `room_bath_size_or_expectation` | `public_bath` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 登別温泉郷 滝乃家 | `insects` | `facility_wide` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 2 |
| 登別温泉郷 滝乃家 | `access_or_flow_distance` | `facility_wide` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 登別温泉郷 滝乃家 | `aged_facility` | `room_bath` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 旅亭 花ゆら | `temperature_hot` | `facility_wide` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 2 |
| 旅亭 花ゆら | `temperature_control` | `room_open_air_bath` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 4 |
| 旅亭 花ゆら | `insects` | `room_open_air_bath` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 2 |
| 旅亭 花ゆら | `access_or_flow_distance` | `public_bath` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 旅亭 花ゆら | `room_bath_size_or_expectation` | `facility_wide` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 旅亭 花ゆら | `crowding` | `room_open_air_bath` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 2 |
| 旅亭 花ゆら | `temperature_cold` | `room_open_air_bath` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| シャレーアイビー定山渓 | `privacy_or_glass_bath` | `room_bath` | weak_signal | 보강 표본에서 객실탕 유리/프라이버시·창 개방 제한 신호가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 4 |
| シャレーアイビー定山渓 | `public_bath_missing_cold_bath` | `public_bath` | exploratory | 사우나 이용 맥락에서 물풍로 부재 언급이 보이나 표본은 작음. | 1 |
| シャレーアイビー定山渓 | `service_language_or_tone` | `facility_wide` | exploratory | 일부 응대 표현 불만이 보이나 온천 경험과 분리해 운영 메모로 둠. | 1 |
| グランドブリッセンホテル定山渓 | `access_or_flow_distance` | `room_bath` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 2 |
| グランドブリッセンホテル定山渓 | `crowding` | `room_open_air_bath` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 9 |
| グランドブリッセンホテル定山渓 | `temperature_control` | `room_open_air_bath` | moderate_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 13 |
| グランドブリッセンホテル定山渓 | `weak_onsen_feeling` | `facility_wide` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 2 |
| グランドブリッセンホテル定山渓 | `steps` | `room_open_air_bath` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| グランドブリッセンホテル定山渓 | `insects` | `room_bath` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 平成館 しおさい亭 別館 花月 | `temperature_cold` | `room_open_air_bath` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 平成館 しおさい亭 別館 花月 | `temperature_control` | `room_open_air_bath` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 7 |
| 平成館 しおさい亭 別館 花月 | `access_or_flow_distance` | `room_open_air_bath` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 2 |
| 平成館 しおさい亭 別館 花月 | `crowding` | `room_open_air_bath` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 平成館 しおさい亭 別館 花月 | `insects` | `room_open_air_bath` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 平成館 しおさい亭 別館 花月 | `aged_facility` | `public_bath` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 函館・湯の川温泉 花びしホテル | `room_bath_size_or_expectation` | `room_bath` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 函館・湯の川温泉 花びしホテル | `temperature_hot` | `facility_wide` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 2 |
| 函館・湯の川温泉 花びしホテル | `crowding` | `facility_wide` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 3 |
| 函館・湯の川温泉 花びしホテル | `steps` | `facility_wide` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 函館・湯の川温泉 花びしホテル | `temperature_control` | `room_open_air_bath` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 3 |
| 函館・湯の川温泉 花びしホテル | `aged_facility` | `facility_wide` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 2 |
| 函館・湯の川温泉 花びしホテル | `weak_onsen_feeling` | `unclear` | exploratory | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 1 |
| 函館・湯の川温泉 花びしホテル | `access_or_flow_distance` | `room_bath` | weak_signal | 직접 표본에서 관련 키워드가 확인됨. Google/Naver 반복 여부는 후속 확인 필요. | 2 |

## 5. 근거 예시

| 숙소 | signal_type | source_type | short_paraphrase | original_keyword | review_date | source_url |
|---|---|---|---|---|---|---|
| 湯の川プリンスホテル渚亭 | `room_bath_hot_spring` | Rakuten Travel | 객실 안 온천/객실 노천탕 이용 편의와 체류 만족을 언급함. | `露天風呂;温泉` | 2026年4月8日 | https://review.travel.rakuten.co.jp/hotel/voice/5842 |
| 第一滝本館 | `water_texture` | Rakuten Travel | 온천 수질 또는 원천감에 대한 체감 언급이 있음. | `露天風呂` | 2026年5月26日 | https://review.travel.rakuten.co.jp/hotel/voice/30109 |
| ホテルまほろば | `public_bath_hot_spring` | Google Maps | 지하 1층/2층 대욕장과 다양한 탕, B2 노천탕 선호가 한국어 리뷰에서 반복됨. | `지하2층; 대욕장; 노천탕` | 2026년 1~6월 표면 | https://www.google.com/maps/search/Hotel%20Mahoroba%20Noboribetsu%20Onsen |
| ホテルまほろば | `water_texture` | Rakuten Travel | 여러 종류의 온천과 유황/탕 수 다양성 체감이 직접 표본에서 확인됨. | `硫黄;温泉` | 2026年7月2日 | https://review.travel.rakuten.co.jp/hotel/voice/12568 |
| 祝いの宿 登別グランドホテル | `public_bath_hot_spring` | Booking.com | 대욕장·노천탕·여러泉質·사우나 긍정이 확인되며, 일부 표본은 타투/외국인 이용 매너도 함께 언급함. | `露天風呂;各種泉質;タトゥー` | 2026年1月~6月 | https://www.booking.com/reviews/jp/hotel/noboribetsu-grand.ja.html |
| 登別万世閣 | `public_bath_hot_spring` | Google Maps | 한국어 Google 본문에서 대욕장·노천탕·유황온천물·샴푸바·수건 지참 신호가 직접 확인됨. | `온천대욕탕; 노천탕; 유황온천물` | 2025~2026년 표면 | https://www.google.com/maps/search/%E7%99%BB%E5%88%A5%E4%B8%87%E4%B8%96%E9%96%A3%20Noboribetsu%20Manseikaku |
| 登別温泉郷 滝乃家 | `room_bath_hot_spring` | Rakuten Travel | 온천 또는 욕장 관련 언급이 확인됨. | `露天風呂` | 2026年4月2日 | https://review.travel.rakuten.co.jp/hotel/voice/72815 |

## 6. Bathtime 해석

- 全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》는 A 보강 후 직접 확인 380건 중 온천 관련 300건을 읽었다. 직접 본문 플랫폼은 Jalan, Google Maps, Ikkyu, Yahoo Travel, Hotels.com, Rakuten Travel, Booking.com, Trip.com 8개이며 등급은 `A`다. 객실 모어온천 노천탕과 茶褐色/黒っぽい 물색, 피부감·보온감 신호는 강하게 반복된다. Ikkyu/Yahoo 합산 표시 리뷰 수, 시설 답변, 방 이름만의 욕장 정보는 직접 리뷰 수와 분리했다.
- ザ・レイクスイート湖の栖는 A 보강 후 직접 확인 308건 중 온천 관련 255건을 읽었다. 직접 본문 플랫폼은 Rakuten Travel, Google Maps, Jalan, Yahoo Travel, Trip.com, Ikkyu, Hotels.com 7개이며 등급은 `A`다. 객실 온천露天風呂와 공용 인피니티/대욕장 전망 신호는 강하게 반복되며, 저층 객실 뷰 배정, 식사회장/サンパレス 이동, 대욕장 세면부 추위·미끄럼/입욕 매너는 운영 메모로 분리한다.
- 望楼NOGUCHI登別는 A 보강 후 직접 확인 368건 중 온천 관련 247건을 읽었다. 직접 본문 플랫폼은 Jalan, Ikkyu, Yahoo Travel, Tripadvisor, Trip.com, Expedia, Google Maps/Hotels, Rakuten Travel, Booking.com, Relux, JTB 11개이며 등급은 `A`다. 객실 온천전망탕의 넓이와 대욕장 백탁/とろとろ 계열 수질은 강하게 반복되며, Ikkyu/Yahoo의 합산 표시 리뷰 수는 직접 수와 분리했다. 객실탕 온도·단차·물때/배수·대욕장 낙엽/경년감은 온천 수질 만족과 별도 주의 신호로 둔다.
- 定山渓第一寶亭留 翠山亭는 A 보강 후 직접 확인 313건 중 온천 관련 199건을 읽었다. 직접 본문 플랫폼은 Rakuten Travel, Google Maps, Jalan, Ikkyu, Yahoo Maps, Trip.com, Agoda, Booking.com via Agoda, Naver Blog 9개이며 등급은 `A`다. 객실탕/객실 노천탕과 대욕장 만족은 강하게 반복되며, 유료 전세탕 예약 선점, 객실 욕장 온도/샤워 불안정, 벌레·시선/커튼 요구, 일부 노후·청결감은 함께 표시해야 한다.
- 湯の川プリンスホテル渚亭는 A 보강 후 직접 확인 333건 중 온천 관련 251건을 읽었다. 직접 본문 플랫폼은 Rakuten Travel, Google Hotels, JTB, Yahoo Travel, Trip.com, Booking.com, Naver Blog 7개이며 등급은 `A`다. 객실 노천탕/개인탕과 바다 전망 만족은 강하게 반복되며, 대욕장은 규모와 전망 긍정이 있으나 한국어/Naver 표본과 Rakuten 추가 표본에서는 노후감·시선 부담·온도 조절·배수/매트/타월 이슈가 함께 나타난다.
- 第一滝本館는 A 보강 후 직접 확인 300건 중 온천 관련 189건을 읽었다. 직접 본문 플랫폼은 Rakuten Travel, Google Maps/Hotels, Yahoo Travel, Ikkyu, JTB/Rurubu, Jalan, Booking.com, Naver 8개이며 등급은 `A`다. 1500坪 대욕장, 35개 욕조, 5泉質, 지옥계곡 조망, 노천탕, 유황/부드러운 수질은 강하게 반복되며, 남관/본관/동관에서 대욕장까지의 거리, 외국인 관광객 혼잡·매너, 일부 노후·미끄럼/청결 이슈를 함께 표시해야 한다.
- ホテルまほろば는 A 보강 후 직접 확인 330건 중 온천 관련 216건을 읽었다. 직접 본문 플랫폼은 Rakuten Travel, Google Maps, Yahoo Travel, Booking.com, Ikkyu, Trip.com, Hotels.com, Tripadvisor 8개이며 등급은 `A`다. 대욕장/공용 노천탕의 규모, 31湯 계열 탕 다양성, 유황/濁り湯 수질, 지하 2층/B2 선호는 강하게 반복되며, 객실 노천탕은 일부 객실 타입 축으로만 분리하고 가족탕/대절탕으로 합치면 안 된다.
- 祝いの宿 登別グランドホテル는 A 보강 후 직접 확인 324건 중 온천 관련 200건을 읽었다. 직접 본문 플랫폼은 Rakuten Travel, Google Maps, Booking.com, Yahoo Travel, Ikkyu, Trip.com, Tripadvisor, Hotelpass Korean review 8개이며 등급은 `A`다. 대욕장, 鬼サウナ, 공용 노천/폭포탕, 여러 泉質과 피부감 신호는 강하게 반복되지만, 객실 노천탕은 공식상 천연온천이 아닌 라ジウム鉱泉 계열 인공온천으로 표기되므로 room_open_air_bath 만족과 천연 온천 수질 신호를 섞지 않아야 한다.
- 登別万世閣는 A 보강 후 직접 확인 351건 중 온천 관련 228건을 읽었다. 직접 본문 플랫폼은 Rakuten Travel, Google Maps, Booking.com, Yahoo Travel, Jalan, Trip.com, Naver Blog 7개이며 등급은 `A`다. 대욕장/노천탕, 유황 수질, 샴푸바, 로ウリュウサウナ/源泉水風呂 신호는 강하게 반복되며, 일반 객실 욕실은 공식상 온천이 아니므로 11층 특수 객실탕과 분리해야 한다.
- 登別温泉郷 滝乃家는 A 보강 후 직접 확인 312건 중 온천 관련 184건을 읽었다. 직접 본문 플랫폼은 Rakuten Travel, Jalan, Google Maps/Hotels, Ikkyu 4개이며 등급은 `A`다. 객실 노천탕/전망풍呂와 대욕장·공용 노천탕, 白濁 계열 수질 신호는 강하게 반복되며, 일부 Ikkyu 저평점에서 대욕장 청결/노후감 반대 신호가 확인되어 운영 메모로 분리한다.
- 旅亭 花ゆら는 A 보강 후 직접 확인 306건 중 온천 관련 211건을 읽었다. 직접 본문 플랫폼은 Jalan, Rakuten Travel, Google Maps/Hotels, Ikkyu, JTB, Relux, Yahoo Maps, Tripadvisor 8개이며 등급은 `A`다. 객실 노천탕/객실 온천과 유황·백탁 계열 수질, 공용 대욕장/노천탕, 혼잡이 덜한 소규모 숙소 신호가 강하게 반복된다. Ikkyu/Yahoo Travel 숙박 리뷰 미러는 중복 위험이 있어 Ikkyu만 직접 수에 넣고, 객실 누수·전망 기대차·벌레·식사/예약 운영 이슈는 온천 수질 만족과 분리한다.
- シャレーアイビー定山渓는 보수 재계산 후 직접 확인 312건 중 온천 관련 103건을 읽었다. 직접 본문 플랫폼은 Rakuten Travel, Ikkyu, Yahoo Travel, Booking.com, Trip.com, Expedia, Hotels.com, Jalan archive, JTB, Google Maps/Hotels, Tripadvisor, Relux 12개이며 등급은 `A`다. 객실 내 온천/개인온천과 계곡뷰, 조용한 소규모 숙소 신호가 강하게 반복되며, 공용 대욕장은 규모·개방감 기대차가 함께 보인다. Booking 무본문/중복 카드, Trip.com 테마칩, Relux 중복 섹션은 직접 수에서 제외했다.
- グランドブリッセンホテル定山渓는 A 보강 후 직접 확인 305건 중 온천 관련 216건을 읽었다. 직접 본문 플랫폼은 Rakuten Travel, Jalan, Ikkyu/Yahoo Travel 3개이며 등급은 `A`다. 객실 온천전망풍呂와 객실탕 만족은 강하게 반복되며, 공용 대욕장/노천탕은 보조 축으로 확인된다. Yahoo 저평점 표면의 대욕장 塩素臭 신호는 객실탕 만족과 분리한다.
- 平成館 しおさい亭 別館 花月는 A 보강 후 직접 확인 300건 중 온천 관련 246건을 읽었다. 직접 본문 플랫폼은 Jalan, Rakuten Travel, Booking.com, Trip.com, Ikkyu, Yahoo Travel 6개이며 등급은 `A`다. Jalan archive 1-5페이지에서 추가 본문 150건을 확인하면서 객실 노천탕과 오션뷰, 객실탕 온도 조절, 대욕장 보조 이용 신호가 강하게 반복된다. Google Maps/Hotels는 본관 平成館しおさい亭와 별관 花月 신호가 섞일 위험이 있어 직접 카운트에는 넣지 않았다.
- 平成館 しおさい亭는 A 보강 후 직접 확인 318건 중 온천 관련 199건을 읽었다. 현재 직접 본문 플랫폼은 Rakuten Travel, Google Maps, Jalan, Yahoo Travel, Booking.com, Trip.com 6개이며 등급은 `A`다. 객실 노천탕/오션뷰, 7층·4층 욕장, 전망욕장, 湯加減 신호는 강하게 반복되지만, Google 표면은 본관/別館花月 명칭 혼합 위험이 있어 본관 표본만 보수적으로 해석한다.
- 函館・湯の川温泉 花びしホテル는 A 보강 후 직접 확인 310건 중 온천 관련 168건을 읽었다. 직접 본문 플랫폼은 Rakuten Travel, Jalan, Ikkyu 3개이며 등급은 `A`다. 1층/7층 대욕장, 공용 노천탕, 객실 노천탕, 넓은 욕장 신호는 강하게 반복되며, 수학여행/단체 이용에 따른 욕장 제한·혼잡과 욕장까지의 거리/동선은 운영 메모로 분리한다.

## 7. Gaps / 다음 액션

- 16개 ready 숙소는 모두 300건 이상 직접 확인과 3개 이상 직접 본문 플랫폼을 확보해 `A` 기준에 도달했다. 마지막 남은 `平成館 しおさい亭 別館 花月`는 Jalan archive 1-5페이지 보강으로 직접 확인 300건, 온천 관련 직접 리뷰 246건까지 올라갔다.
- 지정 보강 대상은 모두 300건 이상 직접 확인을 넘겼고, ready 전체 기준에서 Rakuten Travel+Jalan 2개 플랫폼에만 머무르는 숙소도 해소됐다. 남은 B/C/D 숙소는 없다.
- 지정 보강 대상 11곳은 모두 Google Maps/Hotels 또는 Google Maps 직접 본문 플랫폼을 확보했다. Naver 직접 본문 플랫폼은 `jozankei-suizantei`, `yunokawa-nagisatei`, `noboribetsu-daiichi-takimotokan`, `noboribetsu-manseikaku` 4곳에서만 확보됐고, 나머지는 미확인 또는 snippet/검색 표면 수준으로 남긴다.
- 검색/URL 표면으로 확인한 추가 후보 페이지 15건은 `hokkaido_ready_accommodation_snippet_surface_addendum_2026-07-03.csv`에 별도 분리했다. 이 값은 `source_preview_snippet_only`이며, 직접 확인 리뷰 수나 온천 관련 직접 리뷰 수에는 포함하지 않았다.
- 이번 정규화로 지정 보강 대상 중 platform mapping 기준 D 또는 단일 플랫폼으로 남아 있던 숙소는 모두 B급 이상으로 맞췄고, `第一滝本館`, `定山渓第一寶亭留 翠山亭`, `平成館 しおさい亭`, `湯の川プリンスホテル渚亭`, `登別万世閣`은 A급까지 올렸다. 다음 단계는 남은 B급 숙소를 300건 이상 직접 표본으로 순차 확장하고 Google/Naver author-level 중복 제거를 추가하는 것이다.

## 8. Aside 보강 패스 1: jozankei-suizantei

- 대상: `jozankei-suizantei` / 定山渓第一寶亭留 翠山亭. 기존에는 Rakuten Travel 133건 직접 확인, 온천 관련 66건, 단일 플랫폼이라 `D`였다.
- 보강 후: 추가 직접 확인 100건, 추가 온천 관련 직접 리뷰 71건. 누적 직접 확인은 233건, 온천 관련 직접 리뷰는 137건이다.
- 추가 직접 본문 플랫폼: Google Maps, Jalan, Ikkyu, Yahoo Maps, Trip.com, Agoda, Booking.com via Agoda, Naver Blog. Yahoo Maps는 Yahoo Travel/Ikkyu 등 원천 혼합 표면이라 중복 가능성을 메모했다.
- Google Maps: 4.2점, 리뷰 1,375개, 별점 분포 5점 742 / 4점 406 / 3점 119 / 2점 33 / 1점 75. Google-native 한국어 본문 5건을 직접 읽었고, Trip.com/Tripadvisor 파트너 표면은 스니펫으로 분리했다.
- Naver: 블로그 본문 2건을 직접 읽었다. `방마다 개인욕탕`, `대욕장`, `전세탕 예약`, `기본 객실은 전망개인온천 없음`은 한국어 이용자에게 중요한 예약/객실 타입 해석 신호다.
- 재판정: `data_quality_grade=A`. Rakuten Travel pages 8-11 직접 본문 80건을 추가해 누적 직접 확인 313건이 됐고, 직접 본문 플랫폼 9개로 A 기준을 충족했다.
- 세부 출처별 보강 행은 `hokkaido_ready_accommodation_aside_reinforcement_2026-07-03.csv`에 분리했다.

## 9. Aside 보강 패스 2: yunokawa-nagisatei

- 대상: `yunokawa-nagisatei` / 湯の川プリンスホテル渚亭. 기존에는 Rakuten Travel 132건 직접 확인, 온천 관련 99건, 단일 플랫폼이라 `D`였다.
- 보강 후: 추가 직접 확인 61건, 추가 온천 관련 직접 리뷰 45건. 누적 직접 확인은 193건, 온천 관련 직접 리뷰는 144건이다.
- 추가 직접 본문 플랫폼: Google Hotels, JTB, Yahoo Travel, Trip.com, Booking.com, Naver Blog. Google Maps는 Google Hotels와 같은 1,746건 리뷰풀로 보이는 표면이라 스니펫/중복 노출은 직접 수에 넣지 않았다.
- Google Maps/Hotels: 4.2점, 리뷰 1,746개, 별점 분포 5점 896 / 4점 548 / 3점 180 / 2점 47 / 1점 75. 한국어 본문에서는 `객실 노천탕`, `개인온천`, `대욕장`, `바다뷰`, `물 온도`, `오래된 느낌`이 반복된다.
- Trip.com: 9.1/10, 리뷰 146개, `온천 추천(65)` 키워드 풀이 보이며, 직접 본문에서는 전용 노천탕과 바다 전망 긍정, 온도/서비스 불만이 함께 확인됐다.
- Naver: 블로그 본문 1건을 직접 읽었다. `개인욕장`, `바다뷰`, `대욕장`, `오래된 목욕탕 느낌`, `민망함`은 한국어 이용자에게 객실탕과 대욕장을 분리해 보여줘야 하는 신호다. 검색결과 스니펫은 별도로 두고 직접 수에 넣지 않았다.
- 재판정: `data_quality_grade=A`. Rakuten Travel pages 8-14 직접 본문 140건을 추가해 누적 직접 확인 333건이 됐고, 직접 본문 플랫폼 7개로 A 기준을 충족했다. Expedia 직접 본문은 여전히 후속 보강 대상이다.
- 세부 출처별 보강 행은 `hokkaido_ready_accommodation_aside_reinforcement_2026-07-03.csv`에 추가했다.

## 10. Aside 보강 패스 3: noboribetsu-daiichi-takimotokan

- 대상: `noboribetsu-daiichi-takimotokan` / 第一滝本館. 기존에는 Rakuten Travel 127건 직접 확인, 온천 관련 43건, 단일 플랫폼이라 `D`였다.
- 보강 후: 추가 직접 확인 153건, 추가 온천 관련 직접 리뷰 126건. 누적 직접 확인은 280건, 온천 관련 직접 리뷰는 169건이다.
- 추가 직접 본문 플랫폼: Google Maps/Hotels, Yahoo Travel, Ikkyu, JTB/Rurubu, Jalan, Booking.com, Naver. Trip.com은 네이티브 URL이 다른 숙소로 오접속되어 Google 표면에서 보인 1건만 별도 행으로 보수 계산했다.
- Google Maps/Hotels: 4.3점, 리뷰 6,227개, 별점 분포 5점 3,388 / 4점 1,916 / 3점 558 / 2점 157 / 1점 208. 한국어 본문에서는 `대욕장`, `노천탕`, `유황냄새`, `지옥계곡 뷰`, `대형 목욕탕 느낌`, `노후/청결`이 함께 나타난다.
- Yahoo/Ikkyu/JTB/Jalan: 일본어 본문에서 `5つの泉質`, `源泉掛け流し`, `地獄谷`, `大浴場まで遠い`, `外国人客`, `入れ墨`, `滑りやすい`, `タオル` 신호가 반복된다. 단, Yahoo/Ikkyu의 215건 표시는 합산 점수/리뷰풀로 보이며 각 페이지 본문은 분리 계산했다.
- Booking.com: 리뷰 3,590개 표면 중 확장 모달로 한국어 본문 4건만 직접 계산했다. 나머지 캐러셀 발췌는 스니펫으로 남겼다.
- Naver: 검색결과와 플레이스/카페를 확인했다. Place 리뷰 1건과 Cafe 본문 1건만 직접 계산하고, 블로그/카페 검색결과와 댓글은 스니펫/보조 신호로 분리했다.
- 공식 사실 보강: 공식 객실 페이지에서 서관 프리미엄 일부 객실의 `源泉かけ流し` 객실 노천탕은 확인됐지만, 전 객실 객실탕으로 일반화하면 안 된다. 공식 대욕장 축은 1500坪, 35개 욕조, 5泉質, 남녀 대욕장/공용 노천탕 중심이다. private_bath/family_bath는 이번 보강에서도 미확인이다.
- 재판정: `data_quality_grade=A`. 직접 본문 플랫폼 8개, 누적 직접 확인 300건으로 A 기준인 300건 이상에 도달했다.
- 세부 출처별 보강 행은 `hokkaido_ready_accommodation_aside_reinforcement_2026-07-03.csv`에 추가했다.

## 11. Aside 보강 패스 4: noboribetsu-mahoroba

- 대상: `noboribetsu-mahoroba` / ホテルまほろば. 기존에는 Rakuten Travel 128건 직접 확인, 온천 관련 45건, 단일 플랫폼이라 `D`였다.
- 보강 후: 추가 직접 확인 62건, 추가 온천 관련 직접 리뷰 47건. 누적 직접 확인은 190건, 온천 관련 직접 리뷰는 92건이다.
- 추가 직접 본문 플랫폼: Google Maps, Yahoo Travel, Booking.com, Ikkyu, Trip.com, Hotels.com, Tripadvisor. Naver 검색/블로그 탭은 열었지만 본문 fetch가 비어 있어 직접 수에는 넣지 않았다.
- Google Maps: 4.1점, 리뷰 4,680개, 별점 분포 5점 2,000 / 4점 1,768 / 3점 583 / 2점 165 / 1점 164. Google 소스 선택 상태에서 한국어 본문 10건을 직접 확장했고, 10건 모두 온천/대욕장 관련 신호를 포함했다.
- Yahoo/Booking/Ikkyu: 일본어 본문에서 `大浴場`, `露天風呂`, `地下2階`, `泉質`, `湯温`, `滑り台`, `脱衣所`, `入れ墨`, `子どもが泳ぐ` 신호가 보인다. 특히 B1/B2 욕장 차이와 B2 노천탕 선호는 한국어 Google·Trip.com 표본에서도 겹친다.
- Hotels.com/Tripadvisor: 한국어 본문은 소량이지만 `깨끗한 대욕장`, `노천온천`, `몇가지 온천`, `벌레/다다미방 꿉꿉함`을 확인했다. 이는 대욕장 긍정과 운영/객실 관리 메모를 분리해야 하는 신호다.
- 공식 사실 보강: 객실 노천탕은 스위트/특별 객실 타입 축으로만 보며, 공용 대욕장/공용 노천탕과 분리한다. 이번 보강에서도 private_bath/family_bath는 확인하지 못했다.
- 재판정: `data_quality_grade=B`. 직접 본문 플랫폼은 8개로 충분하지만 누적 직접 확인 190건으로 A 기준인 300건 이상에 아직 110건 부족하고, Naver 직접 본문이 막혀 A는 아니다.
- 세부 출처별 보강 행은 `hokkaido_ready_accommodation_aside_reinforcement_2026-07-03.csv`에 추가했다.

## 12. Web 보강 패스 5: noboribetsu-grand

- 대상: `noboribetsu-grand` / 祝いの宿 登別グランドホテル. 기존에는 Rakuten Travel 132건 직접 확인, 온천 관련 52건, 단일 플랫폼이라 `D`였다.
- 보강 후: OTA/한국어 웹 보강 44건에 Google Maps 8건을 추가해 누적 직접 확인은 184건, 온천 관련 직접 리뷰는 91건이다.
- 추가 직접 본문 플랫폼: Booking.com, Yahoo Travel, Ikkyu, Trip.com, Tripadvisor, Hotelpass Korean review, Google Maps. Naver는 검색 스니펫만 확인되어 직접 수에 넣지 않았다.
- 공식 사실 보강: 공식 온천 페이지에서 예약제 `温泉家族風呂`를 확인했다. 50분 4,400엔, 식塩泉 원천가케나가시, 최대 4명, 예약 필요로 기록한다.
- 공식 사실 보강: 공식 객실 노천탕 페이지는 객실 노천탕 객실이 2실이며, 객실 노천탕은 천연온천이 아니라 ラジウム鉱泉 이용 인공온천이라고 명시한다. 따라서 room_open_air_bath를 온천 수질 만족 신호로 일반화하지 않는다.
- Booking/Yahoo/Ikkyu: `露天風呂`, `各種泉質`, `鬼サウナ`, `タオル常備`, `家族風呂`, `50分`, `硫黄薄い`, `外国人観光客マナー`, `脱衣所ロッカー古い`가 함께 확인됐다.
- 재판정: `data_quality_grade=B`. 직접 본문 플랫폼은 8개지만 누적 직접 확인 184건으로 A 기준인 300건 이상에 아직 116건 부족하고, Naver 직접 본문이 빠져 A는 아니다.
- 세부 출처별 보강 행은 `hokkaido_ready_accommodation_aside_reinforcement_2026-07-03.csv`에 추가했다.

## 13. Aside/Web 보강 패스 6: noboribetsu-manseikaku

- 대상: `noboribetsu-manseikaku` / 登別万世閣. 기존에는 Rakuten Travel 113건 직접 확인, 온천 관련 44건, 단일 플랫폼이라 `D`였다.
- 보강 후: 추가 직접 확인 78건, 추가 온천 관련 직접 리뷰 57건. 누적 직접 확인은 191건, 온천 관련 직접 리뷰는 101건이다.
- 추가 직접 본문 플랫폼: Google Maps, Booking.com, Yahoo Travel, Jalan, Trip.com, Naver Blog. Naver 카페/검색결과 댓글과 검색 스니펫은 직접 수에 넣지 않았다.
- Google Maps: 3.8점, 리뷰 2,775개, 별점 분포 5점 874 / 4점 990 / 3점 598 / 2점 176 / 1점 137. Google-native 한국어 본문 12건을 직접 확장했고, Trip.com/Tripadvisor 혼합 카드는 Google 직접 수에 합치지 않았다.
- Booking/Yahoo/Jalan/Trip.com: `露天風呂`, `大浴場`, `源泉の香り`, `源泉水風呂`, `サウナ`, `シャンプーバー`, `温泉種類少ない`, `大浴場1槽`, `階段`, `混雑`, `노후`가 반복된다.
- Naver: 블로그 본문 1건을 직접 읽었다. 한국어 이용자에게는 `수건 객실 지참`, `샴푸/린스 선택`, `개인물품 보관`, `작은 비밀번호 보관함`, `객실 벌레 안내`가 운영 메모로 중요하다.
- 공식 사실 보강: 공식 FAQ 기준 일반 객실 욕실은 데운 물이며 온천이 아니다. 11층 `露天風呂付客室`/`展望風呂付客室`만 원천가케나가시 온천으로 분리한다.
- 공식 사실 보강: 공식 floor guide 기준 `貸切温泉＆サウナ`는 완전 예약제, 1일 3팀, 정원 6명, 90분, 성인 3,300엔/인이다. 이는 private_bath 축으로 별도 기록한다.
- 재판정: `data_quality_grade=A`. Rakuten Travel pages 8-15 직접 본문 160건을 추가해 누적 직접 확인 351건이 됐고, 직접 본문 플랫폼 7개로 A 기준을 충족했다.
- 세부 출처별 보강 행은 `hokkaido_ready_accommodation_aside_reinforcement_2026-07-03.csv`에 추가했다.

| 平成館 しおさい亭 | `room_open_air_bath` | `room_bath_hot_spring` | mixed | 101 | 6 | strong_signal |
| 平成館 しおさい亭 | `public_bath` | `public_bath_hot_spring` | mixed | 47 | 6 | strong_signal |
| 平成館 しおさい亭 | `open_air_public_bath` | `public_bath_hot_spring` | mixed | 22 | 5 | moderate_signal |
| 平成館 しおさい亭 | `room_open_air_bath` | `water_texture` | mixed | 42 | 5 | strong_signal |
| 平成館 しおさい亭 | `public_bath` | `water_texture` | mixed | 19 | 5 | moderate_signal |
| 平成館 しおさい亭 | `room_open_air_bath` | `booking_confusion` | negative | 19 | 4 | moderate_signal |
| 平成館 しおさい亭 | `facility_wide` | `crowding` | negative | 16 | 4 | moderate_signal |
| 平成館 しおさい亭 | `facility_wide` | `booking_confusion` | negative | 16 | 4 | moderate_signal |
| 平成館 しおさい亭 | `room_bath` | `room_bath_hot_spring` | mixed | 5 | 1 | weak_signal |
| 平成館 しおさい亭 | `unclear` | `weak_onsen_feeling` | negative | 8 | 2 | weak_signal |

| 全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》 | `room_open_air_bath` | `room_bath_hot_spring` | positive | 250 | 8 | strong_signal |
| 全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》 | `room_open_air_bath` | `water_texture` | positive | 210 | 8 | strong_signal |
| 全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》 | `public_bath` | `public_bath_hot_spring` | mixed | 55 | 6 | strong_signal |
| 全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》 | `room_bath` | `room_bath_hot_spring` | positive | 38 | 6 | strong_signal |
| 全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》 | `room_open_air_bath` | `booking_confusion` | negative | 18 | 6 | moderate_signal |
| 全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》 | `room_open_air_bath` | `weak_onsen_feeling` | negative | 8 | 4 | weak_signal |
| ザ・レイクスイート湖の栖 | `room_open_air_bath` | `room_bath_hot_spring` | mixed | 205 | 7 | strong_signal |
| ザ・レイクスイート湖の栖 | `open_air_public_bath` | `public_bath_hot_spring` | positive | 102 | 7 | strong_signal |
| ザ・レイクスイート湖の栖 | `public_bath` | `public_bath_hot_spring` | mixed | 81 | 7 | strong_signal |
| ザ・レイクスイート湖の栖 | `room_open_air_bath` | `water_texture` | mixed | 52 | 7 | strong_signal |
| ザ・レイクスイート湖の栖 | `room_open_air_bath` | `booking_confusion` | negative | 56 | 7 | strong_signal |
| ザ・レイクスイート湖の栖 | `facility_wide` | `crowding` | negative | 34 | 6 | strong_signal |
| ザ・レイクスイート湖の栖 | `room_open_air_bath` | `weak_onsen_feeling` | negative | 11 | 4 | weak_signal |
| ザ・レイクスイート湖の栖 | `facility_wide` | `booking_confusion` | negative | 45 | 6 | strong_signal |

## 14. Aside/Web 보강 패스 7: yunokawa-heiseikan-shiosaitei

- 대상: `yunokawa-heiseikan-shiosaitei` / 平成館 しおさい亭. 기존에는 Rakuten Travel 128건 직접 확인, 온천 관련 71건, 단일 플랫폼이라 `D`였다.
- 보강 후: 추가 직접 확인 90건, 추가 온천 관련 직접 리뷰 50건. 누적 직접 확인은 218건, 온천 관련 직접 리뷰는 121건이다.
- 추가 직접 본문 플랫폼: Google Maps, Jalan, Yahoo Travel, Booking.com, Trip.com. Hotels.com은 리뷰풀/객실 표면만 확인되어 직접 본문 플랫폼에서 제외했다. Naver/한국어 웹 검색은 스니펫만 확인되어 직접 수에 넣지 않았다.
- Google Maps: 4.2점, 리뷰 1,627개, 별점 분포 5점 784 / 4점 576 / 3점 172 / 2점 41 / 1점 54. 다만 표면 제목은 한국어로 `시오사이테이 아넥스 하나츠키`가 뜨고 일본어 heading/address/site는 본관 `平成館 しおさい亭`와 맞아, Google 본문은 정체성 혼합 위험으로 보수 계산했다.
- Jalan/Yahoo/Booking: `客室露天風呂`, `7階大浴場`, `大浴場`, `海が見える内風呂`, `浴槽小さい`, `風呂数少ない`, `お湯の温度が低い`가 함께 확인됐다. 객실 노천탕 만족과 대욕장 전망/종류 불만을 분리해야 한다.
- Trip.com: 한국어 표면에서 `대욕장 바다 전망`, `방에 딸린 온천`, `온천 서비스` 신호가 확인됐다. Hotels.com은 `프라이빗 오션 뷰룸 노천탕` 객실 표면을 보조 사실로만 남겼다. AI 요약과 객실 시설 설명은 직접 리뷰 수에 넣지 않았다.
- 공식 사실 보강: 공식 사이트는 `展望風呂から露天風呂まで`와 `露天風呂付和室` 축을 보여준다. 단, 전 객실 객실 노천탕으로 일반화하지 않고, 일반 객실/객실 노천탕/공용 대욕장을 분리한다.
- 재판정: `data_quality_grade=A`. Rakuten Travel pages 8-12 직접 본문 100건을 추가해 누적 직접 확인 318건이 됐고, 직접 본문 플랫폼 6개로 A 기준을 충족했다. Naver/Hotels.com 직접 본문은 여전히 후속 보강 대상이다.
- 세부 출처별 보강 행은 `hokkaido_ready_accommodation_aside_reinforcement_2026-07-03.csv`에 추가했다.

## 15. Aside/Web 보강 패스 8: toyako-lake-suite-konosisu

- 대상: `toyako-lake-suite-konosisu` / ザ・レイクスイート湖の栖. 기존에는 Rakuten Travel 67건 직접 확인, 온천 관련 67건, 단일 플랫폼이라 `D`였다.
- 보강 후: 추가 직접 확인 68건, 추가 온천 관련 직접 리뷰 50건. 누적 직접 확인은 135건, 온천 관련 직접 리뷰는 117건이다.
- 추가 직접 본문 플랫폼: Google Maps, Jalan, Yahoo Travel, Trip.com. Naver/한국어 웹 검색은 스니펫만 확인되어 직접 수에 넣지 않았다.
- Google Maps: 4.5점, 리뷰 1,169개, 별점 분포 5점 809 / 4점 227 / 3점 79 / 2점 25 / 1점 29. 리뷰 토픽 풀로 `일본의 온천 184`, `대욕장 110`이 보였지만, 이 숫자는 직접 본문 수와 합치지 않았다.
- Jalan/Yahoo: `客室露天風呂`, `部屋付露天風呂`, `大浴場露天風呂`, `インフィニティ露天風呂`, `温度調節`, `部屋風呂狭い`, `虫`, `サンパレス移動`이 반복된다. 객실 노천탕과 공용 노천탕은 별도 축으로 유지한다.
- Trip.com: 한국어 표면에서 `객실에서 즐기는 온천`, `파노라마 온천`, `본관 식당까지 멂`, `온천 편안함`이 확인됐다. Trip.com의 `온천 추천 26`은 토픽 풀로만 두고 직접 수에 넣지 않았다.
- 공식 사실 보강: 공식 사이트는 전 객실 레이크뷰, 객실 온천 노천탕 부착, 공용 `空に浮かぶ露天風呂 湖上の湯`를 보여준다. `水のテラスダイニング`과 본관 `洞爺サンパレス` 식사 동선은 운영/동선 메모로 분리한다.
- 재판정: `data_quality_grade=B`. 직접 본문 플랫폼은 5개지만 누적 직접 확인 135건으로 A 기준인 300건 이상에 아직 165건 부족하고, Naver/Booking/Agoda 직접 본문이 없어 A는 아니다.
- 세부 출처별 보강 행은 `hokkaido_ready_accommodation_aside_reinforcement_2026-07-03.csv`에 추가했다.

## 16. Aside/Web 보강 패스 9: tokachigawa-seijakubou

- 대상: `tokachigawa-seijakubou` / 全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》. 기존에는 Jalan 30건 직접 확인, 온천 관련 28건, 단일 플랫폼이라 `D`였다.
- 보강 후: 추가 직접 확인 72건, 추가 온천 관련 직접 리뷰 59건. 누적 직접 확인은 102건, 온천 관련 직접 리뷰는 87건이다.
- 추가 직접 본문 플랫폼: Google Maps, Ikkyu, Yahoo Travel, Hotels.com. Naver/한국어 웹 검색은 스니펫만 확인되어 직접 수에 넣지 않았다.
- Google Maps: 4.5점, 리뷰 266개, 별점 분포 5점 196 / 4점 41 / 3점 9 / 2점 8 / 1점 12. Google 패널의 Trip.com 파트너 카드는 Google 직접 본문으로 합산하지 않았다.
- Ikkyu/Yahoo/Hotels.com: `部屋のモール温泉`, `客室露天風呂`, `茶褐色`, `ポカポカ`, `肌すべすべ`, `浴槽深い`, `大浴場閉塞感`, `内湯異臭`이 확인됐다. 객실탕 수질 긍정과 일부 설비/대욕장 불만을 분리한다.
- 재판정: `data_quality_grade=B`. 직접 본문 플랫폼은 5개지만 누적 직접 확인 102건으로 A 기준인 300건 이상에 아직 198건 부족하고, Naver/Booking/Rakuten global 직접 본문이 없어 A는 아니다.
- 세부 출처별 보강 행은 `hokkaido_ready_accommodation_aside_reinforcement_2026-07-03.csv`에 추가했다.

## 17. Aside/Web 보강 패스 10: noboribetsu-bourou-noguchi

- 대상: `noboribetsu-bourou-noguchi` / 望楼NOGUCHI登別. 기존에는 Jalan 30건 직접 확인, 온천 관련 16건, 단일 플랫폼이라 `D`였다.
- 추가 직접 확인: Ikkyu 35건/온천 30건, Yahoo Travel 25건/온천 20건, Tripadvisor 12건/온천 10건, Trip.com 8건/온천 4건, Expedia 4건/온천 3건. Naver/Search Korean web은 4건 스니펫만 확인해 직접 리뷰 수에 넣지 않았다.
- 보강 후 합계: 직접 확인 114건, 온천 관련 직접 확인 83건, 직접 본문 플랫폼 6개. 등급은 `B`로 상향한다.
- 욕장 해석: 객실 `温泉展望風呂`는 `room_bath`가 기본 축이다. 일부 리뷰의 `露天風呂`/창 개방 표현은 `room_open_air_bath`로 확정하지 않고 `probable`로 둔다. 대욕장/공용 노천탕의 백탁·とろとろ 수질 신호는 별도 `public_bath` 축으로 분리한다.
- 주의 신호: 객실탕 온도 조절, 단차, 대욕장 낙엽/경년감, 샤워룸 동선, 도착 안내 혼선, 외국어 응대/예약 취소 이슈가 보인다. 다만 온천 만족 축과 운영 리스크 축은 섞지 않는다.

## 18. Aside/Web 보강 패스 11: jozankei-chalet-ivy

- 대상: `jozankei-chalet-ivy` / シャレーアイビー定山渓. 기존에는 Rakuten Travel 8건 직접 확인, 온천 관련 0건, 단일 플랫폼이라 `D`였다.
- 추가 직접 확인: Ikkyu 20건/온천 8건, Yahoo Travel 20건/온천 7건, Booking.com 25건/온천 5건, Trip.com 20건/온천 8건, Expedia 15건/온천 5건, Hotels.com 8건/온천 2건, Jalan archive 2건/온천 1건, JTB 5건/온천 2건. Naver/Search Korean web은 4건 스니펫만 확인해 직접 리뷰 수에 넣지 않았다.
- 보강 후 합계: 직접 확인 123건, 온천 관련 직접 확인 38건, 직접 본문 플랫폼 9개. 전체 데이터 등급은 `B`로 상향하지만, 온천 관련 표본은 50건 미만이라 개별 온천 신호는 `weak_signal` 중심으로 둔다.
- 욕장 해석: 핵심 축은 전 객실 `room_bath`/객실 전망탕이다. 반노천 또는 창 개방형 표현은 리뷰상 유리창·개방 폭·프라이버시 신호와 함께 나타나므로 `room_open_air_bath`는 `probable`로 둔다. 대욕장은 존재하나 리뷰상 주축은 객실탕이다.
- 주의 신호: 유리/프라이버시, 창 개방 제한, 물풍로 부재, 일부 응대 표현, 식사 제공 페이스, 조망 기대차가 보인다. 한국어 직접 본문은 아직 확보하지 못했다.

## 19. Aside/Web 보강 패스 12: jozankei-suizantei

- 대상: `jozankei-suizantei` / 定山渓第一寶亭留 翠山亭. 기존에는 Rakuten Travel 133건 직접 확인, 온천 관련 66건, 단일 플랫폼이라 `D`였다.
- 추가 확인: Google Maps 5건/온천 4건, Jalan 30건/온천 19건, Ikkyu/Yahoo 계열 추가 표본, Trip.com, Agoda, Booking.com via Agoda, Naver Blog 표본을 교차 확인했다. Naver/Search Korean web의 일반 검색 결과는 8건 스니펫만 확인해 직접 리뷰 수에 넣지 않았다.
- 이 패스의 보수적 합계는 직접 확인 233건, 온천 관련 직접 확인 137건, 직접 본문 플랫폼 9개였고 당시 등급은 `B`였다. 이후 A 보강 패스에서 Rakuten pages 8-11 직접 본문 80건을 추가해 최종 합계는 직접 확인 313건, 온천 관련 199건, 등급 `A`로 갱신됐다. Yahoo/Ikkyu/Yahoo Maps 계열 표면은 중복 가능성이 있어, 근거 행이 있더라도 총계를 무조건 가산하지 않는다.
- Google Maps: 평점 4.2, 리뷰풀 1,375건, 분포 5성 742 / 4성 406 / 3성 119 / 2성 33 / 1성 75. Google-native 한국어 본문만 직접 수에 넣고, 같은 패널의 Trip.com/Tripadvisor 카드는 파트너 스니펫으로 분리했다.
- 욕장 해석: 객실탕(`room_bath`)과 대욕장(`public_bath`) 만족이 뚜렷하게 확인된다. 반노천/전망탕은 `room_open_air_bath`, 별탕/전세탕은 `private_bath`로 분리하고, 한국어 `개인탕`은 문맥상 객실탕인지 전세탕인지 재확인한다.
- 주의 신호: 객실탕 온도 조절, 원천가케나가시 기대차, 벌레/창곰팡이, 노천탕 동선, 체크인/식사시간 안내 혼선, 식사 기대차가 보인다. Naver 결과는 `スイザンテイクラブ定山渓` 혼입이 있어 다음 패스에서 정체성 필터링이 필요하다.

## 20. Web 보강 패스 13: tokachigawa-seijakubou 150+ 정규화

- 대상: `tokachigawa-seijakubou` / 全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》. 기존 보강 합계는 직접 확인 102건, 온천 관련 87건이었다.
- 추가 직접 확인: Rakuten Travel 12건/온천 9건, Booking.com 20건/온천 14건, Trip.com 8건/온천 3건, Booking.com via Planet of Hotels 10건/온천 8건. Planet of Hotels는 Booking.com 여행자 평점/후기 미러이므로 독립 플랫폼으로 부풀리지 않는다.
- 보강 후 합계: 직접 확인 152건, 온천 관련 직접 확인 121건, 직접 본문 플랫폼 8개. 등급은 `B` 유지, 150건 기준을 충족한다.
- 욕장 해석: 전 객실 원천가케나가시 객실 노천탕이 핵심 축이며, 모어온천의 검은/갈색 물·부드러움·보온감이 여러 플랫폼에서 반복된다. 대욕장은 보조 축으로 유지한다.
- 주의 신호: 가격 기대차, 일부 식사 코스 아쉬움, 외부 공사/조경 소음, Booking 미러 중복 가능성은 별도 메모로 둔다.

## 21. Web 보강 패스 14: toyako-lake-suite-konosisu 150+ 정규화

- 대상: `toyako-lake-suite-konosisu` / ザ・レイクスイート湖の栖. 기존 보강 합계는 직접 확인 135건, 온천 관련 117건이었다.
- 추가 직접 확인: Ikkyu 15건/온천 11건, Hotels.com 8건/온천 7건, Rakuten Travel second wave 10건/온천 8건. Expedia/Hotels 및 Ikkyu/Yahoo 계열은 중복 가능성을 표시하고 작성자 단위 확장 전에는 보수적으로만 가산한다.
- 보강 후 합계: 직접 확인 168건, 온천 관련 직접 확인 143건, 직접 본문 플랫폼 7개. 등급은 `B` 유지, 150건 기준을 충족한다.
- 욕장 해석: 객실 노천탕과 공용 인피니티 노천탕이 모두 강한 축이다. 대욕장 전망/꽃불 관람 긍정은 반복되지만, 식사장 이동·객실 층/뷰 기대차·벌레/청소 신호는 운영 메모로 분리한다.

## 22. Aside/Web 보강 패스 15: noboribetsu-bourou-noguchi 150+ 정규화

- 대상: `noboribetsu-bourou-noguchi` / 望楼NOGUCHI登別. 기존 보강 합계는 직접 확인 114건, 온천 관련 83건이었다.
- 추가 직접 확인: Google Maps/Hotels 25건 중 온천 관련 16건, Rakuten Travel 10건 중 8건, Booking.com 5건 중 3건. Google 패널의 전체 리뷰풀 750건은 visible pool로만 기록했고 직접 확인 수에 넣지 않았다.
- 정규화 후 합계: 직접 확인 154건, 온천 관련 110건, 직접 본문 플랫폼 9개, 등급 `B`. 객실 온천전망탕/개별 온천 언급은 뚜렷하지만, Google 패널의 Trip.com/Tripadvisor 공급자 카드 중복 가능성은 `notes`에 남겨 소스 해석에서 보수적으로 처리한다.

## 23. Aside 보강 패스 16: jozankei-chalet-ivy 150+ / 온천 50+ 정규화

- 대상: `jozankei-chalet-ivy` / シャレーアイビー定山渓. 기존 보강 합계는 직접 확인 123건, 온천 관련 38건이었다.
- 추가 직접 확인: Google Maps/Hotels 리뷰 패널에서 Google 게시 본문 33건, 온천 관련 14건. Google 패널에 Trip.com 29건, Tripadvisor 8건 공급자 카드도 보였지만, 기존 OTA 표본과 겹칠 수 있어 이번 직접 추가 카운트에서는 제외했다.
- 정규화 후 합계: 직접 확인 156건, 온천 관련 52건, 직접 본문 플랫폼 10개, 등급 `B`. 객실탕과 반노천 기대차, 공용 온천 개방감 기대차는 초기 반복 신호로 상향하되, A등급을 위해서는 Google 최신/저평점 필터와 Naver Blog/Cafe 직접 본문이 더 필요하다.

## 24. Aside 보강 패스 17: noboribetsu-takinoya 150+ 정규화

- 대상: `noboribetsu-takinoya` / 登別温泉郷 滝乃家. 기존 합계는 직접 확인 115건, 온천 관련 67건, 직접 본문 플랫폼 2개였다.
- 추가 직접 확인: Google Maps/Hotels 리뷰 패널에서 Google 게시 본문 48건, 온천 관련 22건. Google 리뷰풀 730건은 visible pool로만 기록했고 직접 확인 수에 넣지 않았다. Google 패널에 Trip.com 11건, Tripadvisor 11건 공급자 카드도 보였지만 기존/후속 OTA 표본과 겹칠 수 있어 이번 추가 카운트에서는 제외했다.
- 정규화 후 합계: 직접 확인 163건, 온천 관련 89건, 직접 본문 플랫폼 3개, 등급 `B`. 한국어 Google 리뷰에서 5층 인피니티탕, 목욕탕 규모, 욕장 전세감, 객실 온천과 대중 온천의 구분 신호가 추가됐다.

## 25. Aside 보강 패스 18: noboribetsu-hanayura 150+ 정규화

- 대상: `noboribetsu-hanayura` / 旅亭 花ゆら. 기존 합계는 직접 확인 103건, 온천 관련 78건, 직접 본문 플랫폼 2개였다.
- 추가 직접 확인: Google Maps/Hotels 리뷰 패널에서 Google 게시 본문 54건, 온천 관련 38건. Google 리뷰풀 657건은 visible pool로만 기록했고 직접 확인 수에 넣지 않았다. Google 패널에 Trip.com 31건, Tripadvisor 5건 공급자 카드도 보였지만 기존/후속 OTA 표본과 겹칠 수 있어 이번 추가 카운트에서는 제외했다.
- 정규화 후 합계: 직접 확인 157건, 온천 관련 116건, 직접 본문 플랫폼 3개, 등급 `B`. 한국어 Google 리뷰에서 개인탕/개인 온천/개인노천탕/객실 안 개인 욕탕/유황 온천수 표현이 반복되어 객실탕 용어 정규화 가치가 높다.

## 26. Web 보강 패스 19: yunokawa-heiseikan-hanatsuki 150+ 정규화

- 대상: `yunokawa-heiseikan-hanatsuki` / 平成館 しおさい亭 別館 花月. 기존 합계는 직접 확인 112건, 온천 관련 100건, 직접 본문 플랫폼 2개였다.
- 추가 직접 확인: Booking.com 17건 중 온천 관련 8건, Trip.com 10건 중 9건, Ikkyu 5건 중 5건, Yahoo Travel 6건 중 6건. Google Maps/Hotels는 본관 平成館しおさい亭와 別館 花月 신호가 섞일 위험이 있어 이번 직접 카운트에서는 제외했다.
- 정규화 후 합계: 직접 확인 150건, 온천 관련 128건, 직접 본문 플랫폼 6개, 등급 `B`. 객실 노천탕/오션뷰가 주 신호이며, 대욕장보다 객실탕 중심으로 읽는 편이 데이터에 맞다.
## 27. Aside 보강 패스 20: noboribetsu-grand Google Maps 보강

- 대상: `noboribetsu-grand` / 祝いの宿 登別グランドホテル. 기존 합계는 직접 확인 176건, 온천 관련 87건, 직접 본문 플랫폼 7개였고 Google Maps는 미확인이었다.
- 추가 직접 확인: Google Maps 리뷰 탭에서 Google-native 한국어 본문 8건, 온천 관련 4건. Google 리뷰풀 2,751건과 별점 분포 5성 1,079 / 4성 1,071 / 3성 409 / 2성 87 / 1성 105는 visible pool로만 기록했다. 같은 패널의 Trip.com/Tripadvisor 공급자 카드는 직접 Google 본문 수에서 제외했다.
- 정규화 후 합계: 직접 확인 184건, 온천 관련 91건, 직접 본문 플랫폼 8개, 등급 `B`. Google 표본에서는 온천 수질, 눈쌓인 야외 온천, 작은 노천탕, 노천탕 폭포, 남녀교차 표현이 확인된다.
## 28. A 보강 패스 1: noboribetsu-daiichi-takimotokan 300건 도달

- 대상: `noboribetsu-daiichi-takimotokan` / 第一滝本館. 기존 합계는 직접 확인 280건, 온천 관련 169건, 직접 본문 플랫폼 8개, 등급 `B`였다.
- 추가 직접 확인: Rakuten Travel `hotel/voice/30109?page=8` 구조화 리뷰 본문 20건. 20건 모두 온천/욕장 관련 본문을 포함했다. Rakuten visible pool 3,556건은 리뷰풀로만 기록하고 직접 수에 합산하지 않았다.
- 추가 신호: `温泉`, `大浴場`, `露天風呂`, `湯質`, `お湯の量`, `泉質`, `ぬるい`, `混雑を感じず`, `南館/東館から浴場距離`. 대욕장 규모와 다양한 욕조/泉質 긍정이 강하게 반복되고, 일부 탕 온도 낮음과 건물별 욕장 거리 신호가 함께 보인다.
- 정규화 후 합계: 직접 확인 300건, 온천 관련 189건, 직접 본문 플랫폼 8개, 등급 `A`. 이 숙소는 대욕장/공용 노천탕/수질 축을 강하게 반복되는 신호로 해석할 수 있다.
## 29. A 보강 패스 2: jozankei-suizantei 300건 도달

- 대상: `jozankei-suizantei` / 定山渓第一寶亭留 翠山亭. 기존 합계는 직접 확인 233건, 온천 관련 137건, 직접 본문 플랫폼 9개, 등급 `B`였다.
- 추가 직접 확인: Rakuten Travel `hotel/voice/875?page=8-11` 구조화 리뷰 본문 80건. 이 중 온천/욕장 관련 직접 본문은 62건이다. 기존 Rakuten visible pool 1,380건과 현재 reviewList total 1,106건은 리뷰풀 관찰값으로만 기록하고 직접 수에 합산하지 않았다.
- 추가 신호: `部屋温泉`, `展望風呂`, `檜内風呂`, `離れの湯`, `貸切露天`, `泉質`, `源泉掛け流し`, `虫`, `丸見え/カーテン要望`. 객실탕과 대욕장/전세탕 신호가 더 두꺼워졌고, 일부 객실 욕장 프라이버시·벌레·예약/식사 시간 이슈는 운영 메모로 분리한다.
- 정규화 후 합계: 직접 확인 313건, 온천 관련 199건, 직접 본문 플랫폼 9개, 등급 `A`. 이 숙소는 객실탕/객실 노천탕과 대욕장 만족을 강하게 반복되는 신호로 해석할 수 있다.
## 30. A 보강 패스 3: yunokawa-heiseikan-shiosaitei 300건 도달

- 대상: `yunokawa-heiseikan-shiosaitei` / 平成館 しおさい亭. 기존 합계는 직접 확인 218건, 온천 관련 121건, 직접 본문 플랫폼 6개, 등급 `B`였다.
- 추가 직접 확인: Rakuten Travel `hotel/voice/37513?page=8-12` 구조화 리뷰 본문 100건. 이 중 온천/욕장 관련 직접 본문은 78건이다. 기존 Rakuten visible pool 659건과 현재 reviewList total 486건은 리뷰풀 관찰값으로만 기록하고 직접 수에 합산하지 않았다.
- 추가 신호: `客室露天風呂`, `海側眺望`, `7階/4階浴場`, `展望風呂`, `湯加減`, `貸切状態`, `プランと違う部屋`, `温度確認`, `脱衣場/アメニティ`. 객실 노천탕과 오션뷰 욕장 신호가 두꺼워졌고, 객실 배정/준비 흐름과 탈의장 편의 이슈는 운영 메모로 분리한다.
- 정규화 후 합계: 직접 확인 318건, 온천 관련 199건, 직접 본문 플랫폼 6개, 등급 `A`. 본관 平成館 しおさい亭 기준 표본이며, 別館 花月 혼합 위험이 있는 Google 표면은 계속 보수적으로 해석한다.
## 31. A 보강 패스 4: yunokawa-nagisatei 300건 도달

- 대상: `yunokawa-nagisatei` / 湯の川プリンスホテル渚亭. 기존 합계는 직접 확인 193건, 온천 관련 144건, 직접 본문 플랫폼 7개, 등급 `B`였다.
- 추가 직접 확인: Rakuten Travel `hotel/voice/5842?page=8-14` 구조화 리뷰 본문 140건. 이 중 온천/욕장 관련 직접 본문은 107건이다. 기존 Rakuten visible pool 2,265건과 현재 reviewList total 1,849건은 리뷰풀 관찰값으로만 기록하고 직접 수에 합산하지 않았다.
- 추가 신호: `客室露天風呂`, `オーシャンビュー`, `海`, `函館山`, `漁火`, `大浴場`, `好きな時`, `何度も入る`, `温度設定`, `排水口`, `タオル/マット`. 객실 노천탕과 바다 전망 욕장 신호가 압도적으로 반복되며, 배수·샤워실 추위·타월/매트 부족·설명 부족은 운영 메모로 분리한다.
- 정규화 후 합계: 직접 확인 333건, 온천 관련 251건, 직접 본문 플랫폼 7개, 등급 `A`. 이 숙소는 대욕장보다 객실 노천탕/오션뷰 만족을 중심으로 해석하는 편이 데이터에 맞다.
## 32. A 보강 패스 5: noboribetsu-manseikaku 300건 도달

- 대상: `noboribetsu-manseikaku` / 登別万世閣. 기존 합계는 직접 확인 191건, 온천 관련 101건, 직접 본문 플랫폼 7개, 등급 `B`였다.
- 추가 직접 확인: Rakuten Travel `hotel/voice/28637?page=8-15` 구조화 리뷰 본문 160건. 이 중 온천/욕장 관련 직접 본문은 127건이다. 기존 Rakuten visible pool 1,201건과 현재 reviewList total 923건은 리뷰풀 관찰값으로만 기록하고 직접 수에 합산하지 않았다.
- 추가 신호: `温泉`, `大浴場`, `露天風呂`, `サウナ`, `源泉水風呂`, `シャンプーバイキング`, `肌ツルツル`, `ポカポカ`, `脱衣所`, `タオル/籠`. 대욕장·사우나·源泉水風呂 신호가 강하게 반복되며, 탈의소/타월/바구니/계단·세탁기 이슈는 운영 메모로 분리한다.
- 정규화 후 합계: 직접 확인 351건, 온천 관련 228건, 직접 본문 플랫폼 7개, 등급 `A`. 일반 객실 욕실은 온천 신호로 일반화하지 않고, 공용 대욕장 중심 숙소로 해석한다.
## 33. A 보강 패스 6: noboribetsu-mahoroba 300건 도달

- 대상: `noboribetsu-mahoroba` / ホテルまほろば. 기존 합계는 직접 확인 190건, 온천 관련 92건, 직접 본문 플랫폼 8개, 등급 `B`였다.
- 추가 직접 확인: Rakuten Travel `hotel/voice/12568?page=8-14` 구조화 리뷰 본문 140건. 이 중 온천/욕장 관련 직접 본문은 124건이다. 기존 Rakuten visible pool 2,661건과 현재 reviewList total 2,070건은 리뷰풀 관찰값으로만 기록하고 직접 수에 합산하지 않았다.
- 추가 신호: `温泉`, `大浴場`, `露天風呂`, `31湯`, `硫黄`, `濁り湯`, `広い浴場`, `滑り台`, `混雑`, `表示/入替`. 대욕장·공용 노천탕·탕 다양성 신호가 강하게 반복되며, 어린이/단체 혼잡, 탕 표시·입替 이해, 미끄럼/탈의장 동선은 운영 메모로 분리한다.
- 정규화 후 합계: 직접 확인 330건, 온천 관련 216건, 직접 본문 플랫폼 8개, 등급 `A`. 이 숙소는 객실탕보다 대형 대욕장/공용 노천탕과 다종 욕조 경험을 중심으로 해석하는 편이 데이터에 맞다.
## 34. A 보강 패스 7: noboribetsu-grand 300건 도달

- 대상: `noboribetsu-grand` / 祝いの宿 登別グランドホテル. 기존 합계는 직접 확인 184건, 온천 관련 91건, 직접 본문 플랫폼 8개, 등급 `B`였다.
- 추가 직접 확인: Rakuten Travel `hotel/voice/39175?page=8-14` 구조화 리뷰 본문 140건. 이 중 온천/욕장 관련 직접 본문은 109건이다. 기존 Rakuten visible pool 2,984건과 현재 reviewList total 2,327건은 리뷰풀 관찰값으로만 기록하고 직접 수에 합산하지 않았다.
- 추가 신호: `温泉`, `大浴場`, `鬼サウナ`, `露天風呂`, `滝`, `泉質`, `肌つや`, `家族風呂`, `入替/時間`, `混雑`. 대욕장·사우나·공용 노천탕 신호가 강하게 반복되며, 입替/시간 이해와 객실 노천탕의 공식 인공온천 표기는 별도 주의 신호로 둔다.
- 정규화 후 합계: 직접 확인 324건, 온천 관련 200건, 직접 본문 플랫폼 8개, 등급 `A`. 이 숙소는 객실 노천탕보다 대욕장/鬼サウナ/공용 노천탕 중심으로 해석하고, 가족탕은 예약제 공용탕으로 객실탕과 분리한다.
## 35. A 보강 패스 8: yunokawa-hanabishi 300건 도달

- 대상: `yunokawa-hanabishi` / 函館・湯の川温泉 花びしホテル. 기존 합계는 직접 확인 160건, 온천 관련 74건, 직접 본문 플랫폼 2개, 등급 `B`였다.
- 추가 직접 확인: Rakuten Travel `hotel/voice/29275?page=8-14` 구조화 리뷰 본문 140건과 Ikkyu 첫 리뷰 페이지 직접 본문 10건. 이 중 온천/욕장 관련 직접 본문은 Rakuten 87건, Ikkyu 7건이다. 기존 Rakuten visible pool 1,713건, 현재 reviewList total 1,300건, Ikkyu visible pool 134건은 리뷰풀 관찰값으로만 기록하고 직접 수에 합산하지 않았다.
- 추가 신호: `温泉`, `大浴場`, `露天風呂`, `客室露天風呂`, `湯の川`, `オートロウリュ`, `修学旅行/団体`, `制限`, `遠い/乗り継ぎ`. 대욕장/공용 노천탕과 객실 노천탕 신호가 두꺼워졌고, 단체 이용 시 욕장 제한·혼잡·동선 문제는 운영 메모로 분리한다.
- 정규화 후 합계: 직접 확인 310건, 온천 관련 168건, 직접 본문 플랫폼 3개, 등급 `A`. 이 숙소는 대욕장과 객실 노천탕이 함께 읽히는 유형이며, 공용 욕장 혼잡/제한 신호를 숙소 전체 온천 만족과 분리해 표시해야 한다.
## 36. A 보강 패스 9: noboribetsu-takinoya 300건 도달

- 대상: `noboribetsu-takinoya` / 登別温泉郷 滝乃家. 기존 합계는 직접 확인 163건, 온천 관련 89건, 직접 본문 플랫폼 3개, 등급 `B`였다.
- 추가 직접 확인: Rakuten Travel `hotel/voice/72815?page=8-14` 구조화 리뷰 본문 129건과 Ikkyu 첫 리뷰 페이지 직접 본문 20건. 이 중 온천/욕장 관련 직접 본문은 Rakuten 79건, Ikkyu 16건이다. 기존 Rakuten visible pool 335건, 현재 reviewList total 269건, Ikkyu visible pool 103건은 리뷰풀 관찰값으로만 기록하고 직접 수에 합산하지 않았다.
- 추가 신호: `温泉`, `露天風呂`, `展望風呂`, `客室風呂`, `白濁温泉`, `泉質`, `源泉かけ流し`, `貸切感`, `大浴場清掃`. 객실탕/객실 노천탕과 대욕장·공용 노천탕 신호가 두꺼워졌고, 대욕장 청결/노후감 반대 신호는 운영 메모로 분리한다.
- 정규화 후 합계: 직접 확인 312건, 온천 관련 185건, 직접 본문 플랫폼 4개, 등급 `A`. 이 숙소는 객실 욕장과 공용 욕장이 모두 강하게 반복되지만, 객실 온천 만족과 대욕장 청결 이슈를 같은 신호로 합치지 않는다.
## 37. A 보강 패스 10: jozankei-grand-blissen 300건 도달

- 대상: `jozankei-grand-blissen` / グランドブリッセンホテル定山渓. 기존 합계는 직접 확인 165건, 온천 관련 126건, 직접 본문 플랫폼 2개, 등급 `B`였다.
- 추가 직접 확인: Rakuten Travel `hotel/voice/182458?page=8-14` 구조화 리뷰 본문 130건과 Ikkyu/Yahoo 직접 본문 10건. 이 중 온천/욕장 관련 직접 본문은 Rakuten 82건, Ikkyu/Yahoo 8건이다. 기존 Rakuten visible pool 375건과 현재 reviewList total 270건은 리뷰풀 관찰값으로만 기록하고 직접 수에 합산하지 않았다.
- 추가 신호: `温泉展望風呂`, `部屋風呂`, `大浴場`, `露天風呂`, `泉質`, `さらり`, `サウナ`, `混雑少ない`, `塩素臭`. 객실 온천전망풍呂 신호가 압도적으로 두꺼워졌고, 대욕장 염소 냄새/약한 온천감 반대 신호는 공용탕 축으로 분리한다.
- 정규화 후 합계: 직접 확인 305건, 온천 관련 216건, 직접 본문 플랫폼 3개, 등급 `A`. 이 숙소는 객실 온천전망탕 중심으로 해석하는 편이 데이터에 맞고, 대욕장/노천탕은 보조 경험축으로 둔다.
## 38. A 보강 패스 11: toyako-lake-suite-konosisu 300건 도달

- 대상: `toyako-lake-suite-konosisu` / ザ・レイクスイート湖の栖. 기존 합계는 직접 확인 168건, 온천 관련 143건, 직접 본문 플랫폼 7개, 등급 `B`였다.
- 추가 직접 확인: Ikkyu/Yahoo Travel `review/p1-p5` 직접 본문 140건. 이 중 온천/욕장 관련 직접 본문은 112건이다. Ikkyu/Yahoo visible pool 190건은 리뷰풀 관찰값으로만 기록하고 직접 수에 합산하지 않았고, 두 표면은 공유 리뷰 원천 가능성이 있어 플랫폼 수를 새로 부풀리지 않았다.
- 추가 신호: `温泉露天風呂付`, `部屋のお風呂`, `客室露天風呂`, `大浴場`, `インフィニティ露天`, `ぬるめ深湯`, `サウナ`, `低層階眺望`, `食事会場移動`, `入浴マナー`. 객실 노천탕과 공용 대욕장/인피니티 노천탕 신호가 강하게 반복되며, 저층 배정·식사회장 이동·세면부 추위/미끄럼/입욕매너는 운영 메모로 분리한다.
- 정규화 후 합계: 직접 확인 308건, 온천 관련 255건, 직접 본문 플랫폼 7개, 등급 `A`. 이 숙소는 객실 노천탕과 공용 인피니티 대욕장을 함께 읽되, 객실 뷰 기대차와 식사장 이동 이슈를 온천 수질 만족과 섞지 않는다.

## 39. A 보강 패스 12: noboribetsu-hanayura 300건 도달

- 대상: `noboribetsu-hanayura` / 旅亭 花ゆら. 기존 합계는 직접 확인 157건, 온천 관련 116건, 직접 본문 플랫폼 3개, 등급 `B`였다.
- 추가 직접 확인: Ikkyu 41건, JTB 60건, Relux 24건, Yahoo Maps 14건, Tripadvisor 10건으로 총 149건을 더 읽었다. 이 중 온천/욕장 관련 직접 본문은 95건이다. JTB의 132건/Relux 42건/Tripadvisor 163건 등은 리뷰풀 관찰값으로만 기록하고 직접 수와 섞지 않았다.
- 추가 신호: `客室露天風呂`, `お部屋の温泉`, `源泉掛け流し`, `硫黄`, `白いお湯`, `大浴場`, `露天風呂`, `混み合わない`, `水漏れ`, `羽根アリ`, `予約/食事混乱`. 객실 노천탕과 공용 대욕장/노천탕 만족이 강하게 반복되며, 객실 누수·전망 기대차·벌레·식사/예약 혼동은 운영 메모로 분리한다.
- 정규화 후 합계: 직접 확인 306건, 온천 관련 211건, 직접 본문 플랫폼 8개, 등급 `A`. Ikkyu/Yahoo Travel 숙박 리뷰는 같은 00001501 표면의 미러 가능성이 있어 Yahoo Travel 숙박 리뷰 본문은 추가 수에 넣지 않고, Yahoo Maps 방문자 리뷰만 별도 표면으로 계산했다.

## 40. A 보강 패스 13: jozankei-chalet-ivy 300건 도달

- 대상: `jozankei-chalet-ivy` / シャレーアイビー定山渓. 기존 합계는 직접 확인 156건, 온천 관련 52건, 직접 본문 플랫폼 10개, 등급 `B`였다.
- 추가 직접 확인: Aside Browser 재확인 결과 Booking.com 필터링 본문 48건, Trip.com load-more 추가 본문 55건, Hotels.com 모달 추가 본문 37건, Tripadvisor 7건, Relux 고유 본문 9건으로 총 156건을 더 읽었다. 이 중 온천/욕장 관련 직접 본문은 51건이다. Booking 164건, Trip.com 167건, Hotels.com 101건, Relux 11건, Tripadvisor 12건은 리뷰풀 관찰값으로만 기록하고 직접 수와 섞지 않았다.
- 추가 신호: `개인온천`, `온센`, `in-room onsen`, `private onsen`, `室内の温泉`, `専用温泉`, `大浴場`, `完全な屋外ではない`, `プライバシー不足`, `お部屋のお風呂`. 객실 내 온천과 조용한 계곡뷰 체류 신호는 강하게 반복되며, 대욕장 협소/개방감 기대차와 식사·서비스 가격 기대차는 운영 메모로 분리한다.
- 정규화 후 합계: 직접 확인 312건, 온천 관련 103건, 직접 본문 플랫폼 12개, 등급 `A`. Booking 무본문/평점전용/중복 카드, Trip.com AI 요약/테마칩, Relux 중복 섹션, visible review pool은 직접 수에서 제외했다.

## 41. A 보강 패스 14: noboribetsu-bourou-noguchi 300건 도달

- 대상: `noboribetsu-bourou-noguchi` / 望楼NOGUCHI登別. 기존 합계는 직접 확인 154건, 온천 관련 110건, 직접 본문 플랫폼 9개, 등급 `B`였다.
- 추가 직접 확인: Aside Browser 구조 파싱으로 Ikkyu p1-p4 고유 reviewBody 94건 중 기존 35건을 제외한 59건, Yahoo Travel p1-p4 고유 reviewBody 115건 중 기존 25건을 제외한 90건, Relux 고유 remarks 29건, JTB 직접 댓글 36건을 더했다. 추가 직접 본문은 총 214건이고, 이 중 온천/욕장 관련 직접 본문은 137건이다.
- 추가 신호: `部屋の温泉`, `客室露天風呂`, `部屋風呂`, `大浴場`, `泉質`, `トロトロ`, `濁り湯`, `乳白色`, `硫黄泉`, `源泉掛け流し`, `段差`, `メンテナンス`. 객실 온천전망탕과 대욕장 수질 신호는 강하게 반복되며, 노후/단차/청소·온천성분 고착 신호는 운영 메모로 분리한다.
- 정규화 후 합계: 직접 확인 368건, 온천 관련 247건, 직접 본문 플랫폼 11개, 등급 `A`. Ikkyu/Yahoo의 합산 visible score, 시설 답변, Relux 중복 표면, JTB 시설 설명은 직접 수에서 제외했다.

## 42. A 보강 패스 15: tokachigawa-seijakubou 300건 도달

- 대상: `tokachigawa-seijakubou` / 全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》. 기존 합계는 직접 확인 152건, 온천 관련 121건, 직접 본문 플랫폼 8개, 등급 `B`였다.
- 추가 직접 확인: Aside Browser 구조 파싱으로 Ikkyu p1-p9 고유 reviewBody 263건, 온천 관련 211건을 확인했고, 기존 Ikkyu 35건/온천 32건을 제외한 추가 228건/온천 179건만 더했다. Yahoo Travel 추가 페이지도 보였지만 A 도달에는 불필요하고 Ikkyu/Yahoo 합산 표시와 혼동될 수 있어 직접 수에 넣지 않았다.
- 추가 신호: `部屋のモール温泉`, `客室露天風呂`, `茶褐色`, `黒っぽい`, `ポカポカ`, `源泉かけ流し`, `大浴場`, `浴槽深い`, `段差`, `大浴場閉塞感`. 객실 노천탕과 모어온천 수질/보온감 신호는 강하게 반복되며, 욕조 깊이·단차·대욕장 폐쇄감은 운영 메모로 분리한다.
- 정규화 후 합계: 직접 확인 380건, 온천 관련 300건, 직접 본문 플랫폼 8개, 등급 `A`. Ikkyu/Yahoo 합산 visible score, 시설 답변, room-name-only 정보는 직접 수에서 제외했다.

## 43. A 보강 패스 16: yunokawa-heiseikan-hanatsuki 300건 도달

- 대상: `yunokawa-heiseikan-hanatsuki` / 平成館 しおさい亭 別館 花月. 기존 합계는 직접 확인 150건, 온천 관련 128건, 직접 본문 플랫폼 6개, 등급 `B`였다.
- 추가 직접 확인: Jalan archive `kuchikomi/archive/` 및 `archive/2.HTML`-`archive/5.HTML`에서 고유 리뷰 본문 150건을 더 읽었다. 이 중 실제 제목/본문 기준 온천·욕장 관련 직접 본문은 118건이다. Jalan 표시 리뷰풀 421건과 archive pool 397건은 리뷰풀 관찰값으로만 기록하고 직접 수에 합산하지 않았다.
- 추가 신호: `部屋の露天風呂`, `客室露天風呂`, `部屋風呂`, `厳選かけながし`, `源泉/掛け流し`, `大浴場`, `サウナ`, `湯温調節`, `ぬるめ`, `洗い場`. 객실 노천탕과 바다 전망 만족이 강하게 반복되고, 대욕장·사우나·탕 온도 신호는 보조 축으로 분리된다.
- 정규화 후 합계: 직접 확인 300건, 온천 관련 246건, 직접 본문 플랫폼 6개, 등급 `A`. Google Maps/Hotels는 본관 平成館 しおさい亭와 별관 花月 신호가 섞일 위험이 있어 계속 직접 수에서 제외했다.

