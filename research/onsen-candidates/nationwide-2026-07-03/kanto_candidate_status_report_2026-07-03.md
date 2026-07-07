# Kanto / 수도권 Candidate Verification / Normalization Report

Date: 2026-07-03

## Scope

- 담당 지역: 간토·수도권 중 `東京都`, `埼玉県`, `千葉県`, `茨城県`, `栃木県`, `群馬県`.
- 입력 마스터: `nationwide_accommodation_master_v0_6_2026-07-03.csv`, `nationwide_facility_master_v0_6_2026-07-03.csv`.
- 이번 단계는 딥리뷰 신호 수집이 아니라 후보 검증/정규화 단계다.
- 숙소와 온천시설은 별도 CSV 및 `kind` 필드로 분리했다.
- 다른 지역 후보는 확장하지 않았다. 대상 prefecture 밖 후보는 이번 결과에 포함하지 않았다.

## Collection Briefing

- 이번에 본 후보: 총 80건. 숙소 48건, 온천시설 32건.
- Tier 1 우선 처리: 숙소 30건, 온천시설 15건, 총 45건.
- Tier 2/3 대상 현 후보: 숙소 18건, 온천시설 17건. 이번 패스에서는 원칙적으로 `hold`로 둔다.
- 플랫폼상 전체 리뷰풀: 이번 산출물에서는 합산하지 않았다. 기존 Tier 1 검증 배치의 `visible_review_pool_observation`에 보이는 표면 수치만 후보별로 보존했다.
- 직접 확인 리뷰 수: 0건. 리뷰 본문 태깅 단계가 아니므로 플랫폼 리뷰 수와 직접 읽은 리뷰 수를 섞지 않았다.
- 온천 관련 직접 리뷰 수: 0건.
- 접근 실패 플랫폼: 이번 패스에서는 신규 브라우저/동적 페이지 검증을 하지 않았으므로 blocked 판정을 새로 만들지 않았다.

## Regional Character

간토·수도권 후보는 두 축으로 갈린다. 하나는 구사쓰·이카호·나스·기누가와처럼 온천지 자체가 강한 숙박형 클러스터이고, 다른 하나는 도쿄·사이타마·치바·이바라키의 대형 당일온천/웰니스 스파 클러스터다. 숙소형 후보는 객실 노천탕, 대욕장, 대절탕, 원천명 분리가 중요하고, 시설형 후보는 온천감보다 사우나·암반욕·휴게·혼잡·요금 운영 신호가 섞이기 쉬워 별도 모델로 봐야 한다.

## Prefecture Counts

| kind | prefecture | count |
|---|---:|---:|
| accommodation | 栃木県 | 23 |
| accommodation | 群馬県 | 25 |
| facility | 東京都 | 3 |
| facility | 埼玉県 | 5 |
| facility | 千葉県 | 2 |
| facility | 茨城県 | 2 |
| facility | 栃木県 | 9 |
| facility | 群馬県 | 11 |

## Tier Counts

| kind | tier | count |
|---|---:|---:|
| accommodation | Tier 1 | 30 |
| accommodation | Tier 2 | 15 |
| accommodation | Tier 3 | 3 |
| facility | Tier 1 | 15 |
| facility | Tier 2 | 16 |
| facility | Tier 3 | 1 |

## Status Counts

| kind | status | count |
|---|---:|---:|
| accommodation | ready | 29 |
| accommodation | hold | 18 |
| accommodation | merge | 1 |
| accommodation | split_needed | 2 |
| accommodation | route_or_pass | 0 |
| accommodation | footbath_only | 0 |
| accommodation | operation_recheck | 3 |
| facility | ready | 14 |
| facility | hold | 17 |
| facility | merge | 1 |
| facility | split_needed | 2 |
| facility | route_or_pass | 0 |
| facility | footbath_only | 1 |
| facility | operation_recheck | 2 |

## Status Rules Used

- `ready`: 기존 Tier 1 검증 배치에서 공식/OTA/리뷰 표면 검증이 있어 다음 단계의 리뷰풀 계수화 또는 딥리서치로 넘길 수 있는 후보.
- `hold`: Tier 1 외 후보 또는 공식 상세/운영자 공식/정체성 검증이 더 필요한 후보.
- `merge`: 같은 숙소·시설이 다른 slug로 중복된 후보.
- `split_needed`: 후보 하나에 복수 정체성, 리브랜딩명, 숙박/당일입욕 상품이 섞여 있어 분리 후 조사해야 하는 후보.
- `route_or_pass`: 단일 입욕시설이 아니라 탕순례·이용권·동선 상품인 후보. 이번 간토 패스에서는 주요 route/pass 후보가 별도로 발생하지 않았다.
- `footbath_only`: 입욕시설이 아니라 족욕/음천 중심인 후보.
- `operation_recheck`: 휴관, 시즌, 운영시간, 최신 명칭 같은 운영 정보를 딥리서치 전 재확인해야 하는 후보.

## Normalization Notes

- `kusatsu-ichii`는 `kusatsu-hotel-ichii`와 같은 `草津温泉 ホテル一井`로 판단되어 `merge` 처리했다.
- `kusatsu-otakinoyu`는 `kusatsu-ohtakinoyu`와 같은 `大滝乃湯`로 판단되어 `merge` 처리했다.
- `nasu-epon`, `nasu-kitamoyu`, `kusatsu-eidaya`는 후보명 안에 복수 정체성 또는 후보 표현이 남아 있어 `split_needed`로 표시했다.
- `ikaho-ikaho-onsen-drink`는 입욕시설이 아니라 음천/족탕 후보이므로 `footbath_only`로 분리했다.
- `kinugawa-nikko-yumoto-onsenji`는 사찰 온천/시즌 운영 가능성이 있어 `operation_recheck`를 붙였다.

## Next Deep Research Priority

| order | kind | prefecture | slug | name_ja | status | reason |
|---:|---|---|---|---|---|---|
| 1 | accommodation | 群馬県 | kusatsu-tokino-niwa | 湯宿 季の庭 | ready | Jalan visible 3421 reviews in search surface |
| 2 | accommodation | 群馬県 | kusatsu-lavista-hills | ラビスタ草津ヒルズ | ready | review count not locked |
| 3 | accommodation | 群馬県 | ikaho-kogure | ホテル木暮 | ready | Rakuten/Oyutabi surfaces mention public bath source-flow, cleanliness and amenities, room open-air satisfaction, but family checkout pressure and room-service/later ch... |
| 4 | accommodation | 群馬県 | ikaho-kanouya | 伊香保温泉 かのうや | ready | Rakuten surface mentions cable-car access, quiet forest setting, white-silver water, source-flow wording in review, large review pool and food/staff strength |
| 5 | accommodation | 栃木県 | kinugawa-asaya | 鬼怒川温泉 あさや | ready | Rakuten/Yukoyuko/blog surfaces repeatedly mention rooftop open-air view, large bright baths, cleanliness, buffet scale;貸切温泉風呂も人気 |
| 6 | accommodation | 栃木県 | nasu-sunvalley | ホテルサンバレー那須 | ready;operation_recheck | Rakuten/Jalan surfaces mention sulfur spring satisfaction, multiple buildings, pool/night illumination, but separate-building distance, stairs and limited bath operati... |
| 7 | accommodation | 栃木県 | nasu-omaru | 那須温泉 大丸温泉旅館 | ready | Rakuten/Oyutabi surfaces mention river-like open-air bath, private bath, room hinoki bath, secluded forest atmosphere, but elderly handrail/accessibility requests appear |
| 8 | accommodation | 栃木県 | nasu-sanraku | 那須温泉 山楽 | ready | Ikkyu/JTB/Agoda surfaces mention smooth soft water, garden open-air atmosphere, public bath spaciousness and quiet premium ryokan stay |
| 9 | accommodation | 栃木県 | nasu-hoshino-akari | ぬくもりに心なごむ湯宿 星のあかり | ready;operation_recheck | Rakuten surface mentions repeated room open-air bathing, night view/star-view deck, food satisfaction, and occasional insects/ants in room |
| 10 | accommodation | 群馬県 | kusatsu-hotel-ichii | 草津温泉 ホテル一井 | ready | Rakuten/Jalan review surfaces exist; high-volume legacy hotel candidate |
| 11 | accommodation | 栃木県 | nasu-key-highland | THE KEY HIGHLAND NASU | ready | Ikkyu/Relux/Jalan surfaces mention suite room open-air, good water temperature, family/all-inclusive satisfaction, but winter room-bath temperature concern appears |
| 12 | accommodation | 群馬県 | ikaho-kaichoro | 奥伊香保 旅邸 諧暢楼 | ready | Ikkyu/JTB/Agoda surfaces mention room open-air comfort, terrace after-bath, privacy, almost no encounter with other guests, high cleanliness |
| 13 | facility | 栃木県 | nasu-shikanoyu | 那須温泉 鹿の湯 | ready | Nifty/blog surfaces strongly mention acidic sulfur, white turbidity, sulfur smell, temperature-step baths, very hot tubs, crowding avoidance |
| 14 | facility | 群馬県 | kusatsu-ohtakinoyu | 大滝乃湯 | ready | review count not locked |
| 15 | facility | 群馬県 | ikaho-rotenburo | 伊香保露天風呂 | ready | Jalan/Nifty surfaces mention no washing area, direct source enjoyment, iron smell, small bath so crowding changes impression |
| 16 | facility | 埼玉県 | spa-herbs | 美楽温泉 SPA-HERBS | ready | Nifty/4travel/Sauna-ikitai surfaces exist |
| 17 | facility | 埼玉県 | sugito-utano-yu | 杉戸天然温泉 雅楽の湯 | ready | Nifty/Jalan/Sauna-ikitai surfaces exist |
| 18 | facility | 東京都 | tokyo-toyosu-manyoclub | 東京豊洲 万葉倶楽部 | ready | Jalan shows 92; Rakuten review surface has 2026 review. low-rated review mentions no bath access/crowding possibility |

## Gaps / Next Agent Actions

1. Tier 1 `ready` 후보부터 Google Maps, Jalan, Rakuten, Ikkyu, Nifty, Yahoo Travel 등 플랫폼별 visible review count를 별도 필드로 잠근다.
2. 직접 리뷰 본문을 읽는 단계에서만 `direct_read_review_count`와 `onsen_related_direct_review_count`를 올린다. 이번 파일의 직접 확인 리뷰 수는 전부 0이다.
3. 숙소형 후보는 `room_bath`, `room_open_air_bath`, `public_bath`, `open_air_public_bath`, `private_bath`, `family_bath`를 분리해 샘플링한다.
4. 시설형 후보는 숙박 리뷰 큐에 합치지 말고, 대욕장/노천/사우나/암반욕/휴게/요금/혼잡 운영 신호로 별도 태깅한다.
5. `merge`, `split_needed`, `footbath_only`, `operation_recheck` 후보는 딥리뷰 전에 정체성 또는 운영 상태를 먼저 잠근다.

## Output Files

- `kanto_accommodation_candidate_status_2026-07-03.csv`
- `kanto_facility_candidate_status_2026-07-03.csv`
- `kanto_candidate_status_manifest_2026-07-03.csv`
- `kanto_candidate_status_report_2026-07-03.md`
