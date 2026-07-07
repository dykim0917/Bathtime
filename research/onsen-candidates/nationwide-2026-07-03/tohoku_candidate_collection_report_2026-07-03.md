# 도호쿠 온천 후보 검증/정규화 리포트 (2026-07-03)

## 작업 범위

- 담당 지역: 青森県, 岩手県, 宮城県, 秋田県, 山形県, 福島県
- 입력 숙소 파일: `nationwide_accommodation_master_v0_6_2026-07-03.csv`
- 입력 시설 파일: `nationwide_facility_master_v0_6_2026-07-03.csv`
- 출력 숙소 CSV: `tohoku_accommodation_candidate_shortlist_2026-07-03.csv`
- 출력 시설 CSV: `tohoku_facility_candidate_shortlist_2026-07-03.csv`
- 작업 모드: 후보 검증/정규화. 딥리뷰 신호 수집 아님.

## 수집 브리핑

- 검토 숙소 후보: 38개
- 검토 온천시설 후보: 26개
- 기존 Tier 1 검증 결과와 매칭된 후보: 45개
- 이번 단계의 직접 확인 리뷰 수: 0건
- 이번 단계의 온천 관련 직접 리뷰 수: 0건
- 플랫폼상 리뷰풀: 기존 검증 파일의 `visible_review_pool_observation`을 `visible_review_or_rating_signal`에 별도 보존. 직접 확인 리뷰 수로 계산하지 않음.
- 접근 실패 플랫폼: 이번 정규화 단계에서는 신규 브라우저 샘플링을 수행하지 않아 별도 차단 판정을 내리지 않음.

## 상태 기준

- `ready`: 공식/OTA/리뷰 표면이 후보 단계에서 확인되어 다음 딥리서치로 넘길 수 있음.
- `hold`: 공식 URL, 욕장 세부, 리뷰풀 표면이 부족해 보류.
- `merge`: 이번 도호쿠 정규화에서는 확정 적용 없음. 숙소/시설 병합 대신 별도 row 유지.
- `split_needed`: 숙소명/계열명/욕장 단위가 섞여 있어 행 또는 태깅 축 분리 후 조사 필요.
- `route_or_pass`: 개별 온천시설이 아니라 탕순례 패스/동선 상품이거나 지역 경계 확인 대상.
- `footbath_only`: 전신 입욕 시설이 아닌 족탕/스톱오버 후보.
- `operation_recheck`: 당일입욕, 요금, 접수마감, 휴업, 계절 운영처럼 변동성이 큰 운영 정보 재확인 필요.

## 숙소 상태 요약

- 상태 분포: {'split_needed': 5, 'ready': 27, 'operation_recheck': 1, 'hold': 11, 'route_or_pass': 1}
- Tier 분포: {'Tier 1': 27, 'Tier 2': 10, 'Tier 3': 1}

### 숙소 Tier 1
- `split_needed;ready` 仙台 秋保温泉 ホテル瑞鳳 (akiu-hotel-zuiho) - room_open_air_bath;public_bath;open_air_public_bath
- `ready` 仙台 秋保温泉 篝火の湯 緑水亭 (akiu-ryokusuitei) - room_open_air_bath;room_bath;public_bath;open_air_public_bath
- `split_needed;ready` 仙台 秋保温泉 迎賓館 櫻離宮 (akiu-sakurareikyu) - room_open_air_bath;public_bath;open_air_public_bath
- `ready` 茶寮宗園 (akiu-saryo-soen) - room_open_air_bath;room_bath;public_bath;open_air_public_bath
- `ready` 温泉山荘 だいこんの花 (zao-daikon-no-hana) - room_open_air_bath;room_bath;public_bath;open_air_public_bath;private_bath_or_family_bath_unclear
- `ready` 銀山温泉 藤屋 (ginzan-fujiya) - room_bath;public_bath;private_bath_or_family_bath_unclear
- `ready` 銀山温泉 古勢起屋別館 (ginzan-kosekiya) - public_bath
- `ready` 銀山温泉 能登屋旅館 (ginzan-notoya) - unclear
- `ready` かみのやま温泉 日本の宿 古窯 (kaminoyama-koyo) - room_open_air_bath;public_bath;open_air_public_bath
- `ready` かみのやま温泉 名月荘 (kaminoyama-meigetsuso) - room_open_air_bath;public_bath;open_air_public_bath;private_bath_or_family_bath_unclear
- `ready` 蔵王温泉 蔵王国際ホテル (zao-lucent) - public_bath;open_air_public_bath
- `ready` 蔵王温泉 深山荘高見屋 (zao-miyagiya) - unclear
- `ready` 花巻温泉 佳松園 (hanamaki-kashoen) - room_open_air_bath;public_bath;open_air_public_bath
- `ready` 大沢温泉 山水閣 (hanamaki-osawa-onsen) - public_bath;open_air_public_bath;private_bath_or_family_bath_unclear
- `ready` 志戸平温泉 游泉志だて (hanamaki-yusen-shidate) - room_open_air_bath;room_bath;public_bath;open_air_public_bath
- `ready` つなぎ温泉 四季亭 (tsunagi-shikitei) - room_open_air_bath;public_bath;open_air_public_bath
- `split_needed;ready` 会津東山温泉 向瀧 (higashiyama-mukaitaki) - private_bath_or_family_bath_unclear
- `ready` 会津東山温泉 庄助の宿 瀧の湯 (higashiyama-shosuke) - public_bath;open_air_public_bath;private_bath_or_family_bath_unclear
- `ready` 飯坂温泉 摺上亭大鳥 (iizaka-yoshikawaya) - public_bath;open_air_public_bath
- `ready` 乳頭温泉郷 蟹場温泉 (nyuto-ganiba) - public_bath;open_air_public_bath
- `operation_recheck;ready` 乳頭温泉郷 黒湯温泉 (nyuto-kuroyu) - open_air_public_bath
- `ready` 休暇村 乳頭温泉郷 (nyuto-kyukamura) - open_air_public_bath
- `ready` 乳頭温泉郷 妙乃湯 (nyuto-taenoyu) - open_air_public_bath
- `ready` 乳頭温泉郷 鶴の湯温泉 (nyuto-tsurunoyu) - open_air_public_bath
- `split_needed;ready` 鶴の湯別館 山の宿 (nyuto-tsurunoyu-yamanoyado) - open_air_public_bath
- `ready` 浅虫温泉 南部屋・海扇閣 (asamushi-kaisenkaku) - public_bath;open_air_public_bath
- `split_needed;ready` 酸ヶ湯温泉旅館 (sukayu-onsen) - public_bath

### 숙소 Tier 2
- `hold` 仙台・秋保温泉 ホテル華乃湯 (akiu-hananoyu) - room_open_air_bath
- `route_or_pass;hold` 仙台・作並温泉 ゆづくしSalon一の坊 (akiu-ichinobo) - unclear
- `hold` 秋保温泉 岩沼屋 (akiu-iwanumaya) - room_bath;public_bath
- `hold` 仙台 秋保温泉 蘭亭 (akiu-rantei) - public_bath
- `hold` 蔵王温泉 堺屋森のホテルヴァルトベルク (zao-wakamatsuya) - unclear
- `hold` 飯坂温泉 祭屋湯左衛門 (iizaka-horikiri) - public_bath
- `hold` 駒ヶ岳グランドホテル (nyuto-komagatake-grand-hotel) - unclear
- `hold` 乳頭温泉郷 孫六温泉 (nyuto-magoroku) - unclear
- `hold` 乳頭温泉郷 大釜温泉 (nyuto-ogama) - unclear
- `hold` 浅虫温泉 椿館 (asamushi-tatsumikan) - public_bath

### 숙소 Tier 3
- `hold` ロッジアイリス (nyuto-lodge-iris) - unclear

## 온천시설 상태 요약

- 상태 분포: {'operation_recheck': 15, 'ready': 6, 'footbath_only': 4, 'hold': 2, 'route_or_pass': 1}
- Tier 분포: {'Tier 1': 18, 'Tier 2': 8}

### 시설 Tier 1
- `operation_recheck;ready` ホテル華乃湯 日帰り温泉 (akiu-hananoyu-dayuse) - open_air_public_bath;private_bath_or_family_bath_unclear;public_bath
- `operation_recheck` ホテル瑞鳳 日帰り温泉 (akiu-zuiho-dayuse) - open_air_public_bath;public_bath
- `operation_recheck` 銀山温泉 しろがね湯 (ginzan-shirogane-yu) - public_bath
- `footbath_only` 銀山温泉 和楽足湯 (ginzan-warashiyu) - footbath
- `ready` かみのやま温泉 下大湯 (kaminoyama-shimo-oyu) - public_bath
- `hold` 蔵王温泉 大露天風呂 (zao-dai-rotenburo) - public_bath
- `operation_recheck` 蔵王温泉 新左衛門の湯 (zao-shinzaemon-no-yu) - open_air_public_bath;public_bath
- `operation_recheck;ready` 大沢温泉 湯治屋 (osawa-onsen-tojiya) - open_air_public_bath;public_bath
- `ready` 飯坂温泉 波来湯 (iizaka-horikiri-yu) - public_bath
- `ready` 飯坂温泉 鯖湖湯 (iizaka-sabako-yu) - public_bath
- `operation_recheck` 蟹場温泉 日帰り入浴 (nyuto-ganiba-dayuse) - open_air_public_bath;public_bath
- `operation_recheck` 黒湯温泉 日帰り入浴 (nyuto-kuroyu-dayuse) - open_air_public_bath
- `operation_recheck` 休暇村乳頭温泉郷 日帰り入浴 (nyuto-kyukamura-dayuse) - public_bath
- `operation_recheck` 妙乃湯 日帰り入浴 (nyuto-taenoyu-dayuse) - public_bath
- `operation_recheck` 鶴の湯温泉 日帰り入浴 (nyuto-tsurunoyu-dayuse) - open_air_public_bath;public_bath
- `route_or_pass` 乳頭温泉郷 湯めぐり帖 (nyuto-yumeguri-cho) - route_or_pass
- `operation_recheck` 道の駅 ゆ～さ浅虫 (asamushi-yu-sa-asamushi) - public_bath
- `ready` 酸ヶ湯温泉 ヒバ千人風呂 (sukayu-hiba-sennin-buro) - public_bath

### 시설 Tier 2
- `operation_recheck` 篝火の湯 緑水亭 日帰り (akiu-ryokusuitei-dayuse) - public_bath
- `footbath_only` 秋保・里センター 足湯 (akiu-sato-center) - footbath
- `footbath_only` かみのやま温泉 足湯めぐり (kaminoyama-yumachi-footbath) - footbath
- `hold` 花巻温泉 精霊の湯 (hanamaki-seirei-no-yu) - public_bath
- `operation_recheck` つなぎ温泉 愛真館 日帰り入浴 (tsunagi-aishinkan-dayuse) - public_bath
- `footbath_only` 会津東山温泉 足湯処 (higashiyama-sarusuberi-no-yu) - footbath
- `operation_recheck` 孫六温泉 日帰り入浴 (nyuto-magoroku-dayuse) - public_bath
- `operation_recheck` 大釜温泉 日帰り入浴 (nyuto-ogama-dayuse) - public_bath

## 제외/분리 기준

- 숙소와 온천시설은 병합하지 않았다. 예를 들어 `酸ヶ湯温泉旅館`과 `酸ヶ湯温泉 ヒバ千人風呂`, `大沢温泉 山水閣`과 `大沢温泉 湯治屋`, 뉴토 숙박 row와 당일입욕 row는 별도 데이터로 유지한다.
- 족탕은 `footbath_only`로 유지하되 숙소형 온천 비교와 분리한다.
- `乳頭温泉郷 湯めぐり帖`는 개별 욕장이 아니라 탕순례 패스/루트 상품이므로 `route_or_pass`로 분리한다.
- 호텔 당일입욕과 공동탕은 시설 row로 유지하되, 요금/운영시간/휴업 변동성이 큰 경우 `operation_recheck`를 부여했다.
- 다른 지역 후보는 추가 확장하지 않았다. 마스터 파일 내 도호쿠 6현 후보만 처리했다.

## 다음 딥리서치 우선순위

1. 仙台 秋保温泉 ホテル瑞鳳 (akiu-hotel-zuiho): room_open_air_bath;public_bath;open_air_public_bath
2. 仙台 秋保温泉 篝火の湯 緑水亭 (akiu-ryokusuitei): room_open_air_bath;room_bath;public_bath;open_air_public_bath
3. 仙台 秋保温泉 迎賓館 櫻離宮 (akiu-sakurareikyu): room_open_air_bath;public_bath;open_air_public_bath
4. 茶寮宗園 (akiu-saryo-soen): room_open_air_bath;room_bath;public_bath;open_air_public_bath
5. 温泉山荘 だいこんの花 (zao-daikon-no-hana): room_open_air_bath;room_bath;public_bath;open_air_public_bath;private_bath_or_family_bath_unclear
6. 銀山温泉 藤屋 (ginzan-fujiya): room_bath;public_bath;private_bath_or_family_bath_unclear
7. 銀山温泉 古勢起屋別館 (ginzan-kosekiya): public_bath
8. 銀山温泉 能登屋旅館 (ginzan-notoya): unclear
9. かみのやま温泉 日本の宿 古窯 (kaminoyama-koyo): room_open_air_bath;public_bath;open_air_public_bath
10. かみのやま温泉 名月荘 (kaminoyama-meigetsuso): room_open_air_bath;public_bath;open_air_public_bath;private_bath_or_family_bath_unclear

## 다음 에이전트 액션

1. 숙소 CSV에서 `candidate_status`에 `ready`가 포함되고 `tier=Tier 1`인 후보를 먼저 선택한다.
2. `split_needed`가 붙은 후보는 본관/별관/시설급 욕장/숙박 row를 먼저 분리한 뒤 리뷰풀 매핑을 시작한다.
3. 시설 CSV의 `operation_recheck` 후보는 최신 공식 운영일, 요금, 접수마감, 휴업 공지를 먼저 확인한다.
4. 각 숙소마다 Google Maps/Hotels, Rakuten, Jalan, Ikkyu, Yahoo Travel, Booking/Agoda/Trip.com, Tripadvisor, Naver Blog/Cafe를 플랫폼별로 매핑한다.
5. 플랫폼상 `visible_review_count`와 실제 `direct_reviews_checked`를 별도 컬럼으로 유지한다.
6. 객실탕, 객실 노천탕, 대욕장, 공용 노천탕, 대절/가족탕은 리뷰 본문 태깅 단계에서 별도 bath_area로 분리한다.
