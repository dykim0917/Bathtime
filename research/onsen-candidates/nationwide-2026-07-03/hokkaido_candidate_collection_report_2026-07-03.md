# 홋카이도 온천 후보 검증/정규화 리포트 (2026-07-03)

## 작업 범위

- 담당 지역: 北海道
- 입력 숙소 파일: `nationwide_accommodation_master_v0_6_2026-07-03.csv`
- 입력 시설 파일: `nationwide_facility_master_v0_6_2026-07-03.csv`
- 출력 숙소 CSV: `hokkaido_accommodation_candidate_shortlist_2026-07-03.csv`
- 출력 시설 CSV: `hokkaido_facility_candidate_shortlist_2026-07-03.csv`
- 작업 모드: 후보 검증/정규화. 딥리뷰 신호 수집 아님.

## 수집 브리핑

- 검토 숙소 후보: 32개
- 검토 온천시설 후보: 15개
- 기존 Tier 1 검증 결과와 매칭된 후보: 30개
- 이번 단계의 직접 확인 리뷰 수: 0건
- 이번 단계의 온천 관련 직접 리뷰 수: 0건
- 플랫폼상 리뷰풀: 기존 검증 파일의 `visible_review_pool_observation`만 별도 필드에 보존. 직접 확인 리뷰 수로 계산하지 않음.
- 접근 실패 플랫폼: 이번 정규화 단계에서는 신규 브라우저 샘플링을 수행하지 않아 별도 차단 판정을 내리지 않음.

## 상태 기준

- `ready`: 공식/OTA/리뷰 표면이 후보 단계에서 확인되어 다음 딥리서치로 넘길 수 있음.
- `hold`: 공식 URL, 욕장 세부, 리뷰풀 표면이 부족해 보류.
- `split_needed`: 숙소명/계열명/욕장 단위가 섞여 있어 행 분리 후 조사 필요.
- `operation_recheck`: 당일입욕, 요금, 접수마감, 예약 조건처럼 변동성이 큰 운영 정보 재확인 필요.
- `footbath_only`: 전신 입욕 시설이 아닌 족탕/스톱오버 후보.
- `merge`, `route_or_pass`: 홋카이도 입력 후보에는 이번 정규화에서 확정 적용하지 않음.

## 숙소 상태 요약

- 상태 분포: {'ready': 16, 'hold': 10, 'split_needed': 5, 'operation_recheck': 1}
- Tier 분포: {'Tier 1': 21, 'Tier 2': 9, 'Tier 3': 2}

### 숙소 Tier 1
- `ready` 全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》 (tokachigawa-seijakubou) - room_open_air_bath
- `ready` ザ・レイクスイート湖の栖 (toyako-lake-suite-konosisu) - room_open_air_bath
- `ready` 望楼NOGUCHI登別 (noboribetsu-bourou-noguchi) - room_bath;public_bath
- `ready` 定山渓第一寶亭留 翠山亭 (jozankei-suizantei) - room_bath
- `ready` 湯の川プリンスホテル渚亭 (yunokawa-nagisatei) - room_open_air_bath
- `ready` 第一滝本館 (noboribetsu-daiichi-takimotokan) - room_open_air_bath;public_bath;open_air_public_bath
- `ready` ホテルまほろば (noboribetsu-mahoroba) - room_open_air_bath;public_bath;open_air_public_bath
- `ready` 祝いの宿 登別グランドホテル (noboribetsu-grand) - room_open_air_bath;public_bath;open_air_public_bath
- `ready` 登別万世閣 (noboribetsu-manseikaku) - room_open_air_bath;public_bath;open_air_public_bath
- `ready` 登別温泉郷 滝乃家 (noboribetsu-takinoya) - room_open_air_bath;public_bath;open_air_public_bath
- `ready` 旅亭 花ゆら (noboribetsu-hanayura) - room_open_air_bath
- `hold` ぬくもりの宿 ふる川 (jozankei-furukawa) - room_open_air_bath;public_bath;open_air_public_bath
- `hold` 定山渓鶴雅リゾートスパ 森の謌 (jozankei-morino-uta) - unclear
- `ready` シャレーアイビー定山渓 (jozankei-chalet-ivy) - room_bath
- `split_needed` 翠巌 (jozankei-suigetsu) - room_bath
- `ready` グランドブリッセンホテル定山渓 (jozankei-grand-blissen) - room_bath;public_bath;private_bath_or_family_bath_unclear
- `ready` 平成館 しおさい亭 別館 花月 (yunokawa-heiseikan-hanatsuki) - room_open_air_bath
- `ready` 平成館 しおさい亭 (yunokawa-heiseikan-shiosaitei) - room_open_air_bath
- `ready` 函館・湯の川温泉 花びしホテル (yunokawa-hanabishi) - public_bath;open_air_public_bath
- `hold` Tabist 竹葉新葉亭 (yunokawa-chikuba) - unclear
- `split_needed` HAKODATE 海峡の風 / 望楼NOGUCHI函館候補 (yunokawa-bourou-noguchi) - room_bath;public_bath

### 숙소 Tier 2/3
- `hold` 登別 石水亭 (noboribetsu-sekisuitei) - public_bath
- `hold` 登別温泉 ホテルゆもと登別 (noboribetsu-yumoto) - public_bath
- `hold` 定山渓ビューホテル (jozankei-view) - public_bath;private_bath_or_family_bath_unclear
- `hold` 章月グランドホテル (jozankei-shogetsu) - public_bath
- `split_needed` 定山渓ホテル / 花もみじ候補 (jozankei-hanakaede) - room_bath;public_bath
- `hold` 湯の川観光ホテル祥苑 (yunokawa-kanko-shoen) - public_bath
- `split_needed` 湯の川温泉 竹葉新葉亭 / 一乃松候補 (yunokawa-ichinomatsu) - room_bath;public_bath
- `hold` センチュリーマリーナ函館 (yunokawa-century-marina) - public_bath
- `hold` イマジンホテル＆リゾート函館 (yunokawa-uminosora) - public_bath
- `split_needed` 滝本イン / 登別温泉周辺ホテル候補 (noboribetsu-izumi-villa) - public_bath
- `operation_recheck` エクスクラメーションホテル (jozankei-exclamation) - unclear

## 온천시설 상태 요약

- 상태 분포: {'ready': 3, 'operation_recheck': 9, 'hold': 1, 'footbath_only': 2}
- Tier 분포: {'Tier 1': 9, 'Tier 2': 6}

### 시설 Tier 1
- `ready` 登別温泉 さぎり湯 (noboribetsu-sagiriyu) - public_bath
- `operation_recheck` 第一滝本館 日帰り入浴 (noboribetsu-daiichi-dayuse) - public_bath
- `operation_recheck` 登別グランドホテル 日帰り温泉 (noboribetsu-grand-dayuse) - public_bath;sauna_addon
- `ready` 豊平峡温泉 (jozankei-hoheikyo) - open_air_public_bath
- `ready` 湯の花 定山渓殿 (jozankei-yunohana) - public_bath
- `operation_recheck` 定山渓鶴雅リゾートスパ森の謌 日帰り (jozankei-morino-uta-dayuse) - public_bath
- `footbath_only` 湯の川温泉足湯「湯巡り舞台」 (yunokawa-yumeguri-butai) - footbath
- `footbath_only` 函館市熱帯植物園足湯 (yunokawa-tropical-footbath) - footbath
- `operation_recheck` 谷地頭温泉 (hakodate-yachigashira) - public_bath

### 시설 Tier 2/3
- `operation_recheck` 登別石水亭 日帰り入浴 (noboribetsu-sekisuitei-dayuse) - public_bath
- `operation_recheck` 登別万世閣 日帰り入浴 (noboribetsu-manseikaku-dayuse) - public_bath
- `hold` カルルス温泉 鈴木旅館 (noboribetsu-suzuki-karurusu) - public_bath
- `operation_recheck` 章月グランドホテル 日帰り (jozankei-shogetsu-dayuse) - public_bath
- `operation_recheck` 鹿の湯・花もみじ 日帰り候補 (jozankei-hanakaede-dayuse) - public_bath
- `operation_recheck` ホテル函館ひろめ荘 (hakodate-hiromesou) - public_bath

## 제외/분리 기준

- 족탕은 `footbath_only`로 유지하되 숙소형 온천 비교와 분리한다.
- 호텔 당일입욕은 숙소 row와 병합하지 않고 시설 row로 유지한다. 다만 요금/운영시간 변동성이 크므로 `operation_recheck`를 우선한다.
- `HAKODATE 海峡の風 / 望楼NOGUCHI函館候補`, `定山渓ホテル / 花もみじ候補`, `湯の川温泉 竹葉新葉亭 / 一乃松候補`처럼 이름이 섞인 행은 딥리서치 전 `split_needed`로 둔다.

## 다음 딥리서치 우선순위

- 1. 全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》 (tokachigawa-seijakubou): room_open_air_bath
- 2. ザ・レイクスイート湖の栖 (toyako-lake-suite-konosisu): room_open_air_bath
- 3. 望楼NOGUCHI登別 (noboribetsu-bourou-noguchi): room_bath;public_bath
- 4. 定山渓第一寶亭留 翠山亭 (jozankei-suizantei): room_bath
- 5. 湯の川プリンスホテル渚亭 (yunokawa-nagisatei): room_open_air_bath
- 6. 第一滝本館 (noboribetsu-daiichi-takimotokan): room_open_air_bath;public_bath;open_air_public_bath
- 7. ホテルまほろば (noboribetsu-mahoroba): room_open_air_bath;public_bath;open_air_public_bath
- 8. 祝いの宿 登別グランドホテル (noboribetsu-grand): room_open_air_bath;public_bath;open_air_public_bath

## 다음 에이전트 액션

1. 숙소 CSV에서 `candidate_status=ready`와 `tier=Tier 1`을 먼저 선택한다.
2. 각 숙소마다 Google Maps/Hotels, Rakuten, Jalan, Ikkyu, Yahoo Travel, Booking/Agoda/Trip.com, Naver Blog/Cafe를 플랫폼별로 매핑한다.
3. 플랫폼상 `visible_review_count`와 실제 `direct_reviews_checked`를 별도 컬럼으로 유지한다.
4. 객실탕, 객실 노천탕, 대욕장, 공용 노천탕, 대절/가족탕을 리뷰 본문 태깅 단계에서 분리한다.
5. 시설 CSV의 `operation_recheck`는 최신 요금/접수마감/휴업 공지를 먼저 확인한 뒤 리뷰 샘플링한다.
