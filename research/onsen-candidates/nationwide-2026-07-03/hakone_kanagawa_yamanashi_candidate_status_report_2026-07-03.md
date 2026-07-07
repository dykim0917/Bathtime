# Hakone / Kanagawa / Yamanashi Candidate Verification / Normalization Report

Date: 2026-07-03

## Scope

- 담당 지역: 하코네·가나가와·야마나시.
- 입력 마스터: `nationwide_accommodation_master_v0_6_2026-07-03.csv`, `nationwide_facility_master_v0_6_2026-07-03.csv`.
- 처리 prefecture: `神奈川県`, `山梨県`.
- 이번 단계는 딥리뷰 신호 수집이 아니라 후보 검증/정규화 단계다.
- 숙소와 온천시설은 별도 CSV 및 `kind` 필드로 분리했다.
- 다른 지역 후보는 확장하지 않았다. 대상 prefecture 밖 후보는 이번 결과에 포함하지 않았다.

## Collection Briefing

- 이번에 본 후보: 총 80건. 숙소 53건, 온천시설 27건.
- Tier 1 우선 처리: 숙소 35건, 온천시설 14건, 총 49건.
- Tier 2/3 현 후보: 숙소 18건, 온천시설 13건. 이번 패스에서는 원칙적으로 `hold`로 둔다.
- 플랫폼상 전체 리뷰풀: 이번 산출물에서는 합산하지 않았다. 기존 Tier 1 검증 배치의 `visible_review_pool_observation`에 보이는 표면 수치와 리뷰 표면 존재만 후보별로 보존했다.
- 직접 확인 리뷰 수: 0건. 리뷰 본문 태깅 단계가 아니므로 플랫폼 리뷰 수와 직접 읽은 리뷰 수를 섞지 않았다.
- 온천 관련 직접 리뷰 수: 0건.
- 접근 실패 플랫폼: 이번 패스에서는 신규 브라우저/동적 페이지 검증을 하지 않았으므로 blocked 판정을 새로 만들지 않았다.

## Regional Character

하코네·유가와라는 객실 노천탕, 대욕장, 대절탕, 원천 공급 주장의 분리가 핵심이다. 야마나시는 후지산·가와구치코 전망 가치와 실제 온천수/대욕장 경험이 섞이기 쉬워, 전망 신호와 수질 신호를 분리해야 한다. 비숙박 시설은 수도권형 대형 온욕시설, 하코네 당일온천, 유가와라 공공시설, 후지산 관광 동선 시설이 섞여 있어 숙소형 욕장 모델과 별도 모델로 유지했다.

## Prefecture Counts

| kind | prefecture | count |
| --- | --- | --- |
| accommodation | 山梨県 | 21 |
| accommodation | 神奈川県 | 32 |
| facility | 山梨県 | 9 |
| facility | 神奈川県 | 18 |

## Tier Counts

| kind | tier | count |
| --- | --- | --- |
| accommodation | Tier 1 | 35 |
| accommodation | Tier 2 | 16 |
| accommodation | Tier 3 | 2 |
| facility | Tier 1 | 14 |
| facility | Tier 2 | 12 |
| facility | Tier 3 | 1 |

## Status Counts

| kind | status | count |
| --- | --- | --- |
| accommodation | hold | 18 |
| accommodation | merge | 1 |
| accommodation | ready | 34 |
| accommodation | split_needed | 8 |
| facility | hold | 15 |
| facility | operation_recheck | 1 |
| facility | ready | 12 |
| facility | split_needed | 1 |

## Priority Ready Queue

아래 후보는 Tier 1 중 후보 정체성과 공식/리뷰 표면이 비교적 정리되어 다음 딥리서치 또는 리뷰풀 카운트 고정으로 넘기기 좋다. 단, 여기의 리뷰풀은 플랫폼상 표면 관찰이며 직접 읽은 리뷰 수가 아니다.

| kind | queue_rank | slug | name_ja | candidate_status | visible_review_pool_observation |
| --- | --- | --- | --- | --- | --- |
| accommodation | 28 | hakone-byakudan | 箱根強羅 白檀 | ready | Rakuten visible 77 reviews in search surface |
| accommodation | 29 | hakone-fontainebleau | オーベルジュ 箱根フォンテーヌ・ブロー仙石亭 | ready | review count not locked |
| accommodation | 30 | hakone-gen-gora | 玄 箱根強羅 | ready | review count not locked |
| accommodation | 31 | hakone-ginyu | 箱根吟遊 | ready | review count not locked |
| accommodation | 32 | hakone-gora-kadan | 強羅花壇 | ready\|split_needed | review count not locked |
| accommodation | 33 | hakone-gora-karaku | 箱根・強羅 佳ら久 | ready | Ikkyu visible 362 reviews |
| accommodation | 34 | hakone-kanaya-resort | KANAYA RESORT HAKONE | ready | review count not locked |
| accommodation | 35 | hakone-kowakien-tenyu | 箱根小涌園 天悠 | ready | review count not locked |
| accommodation | 36 | hakone-matsuzakaya | 箱根の名湯 松坂屋本店 | ready | review count not locked |
| accommodation | 37 | hakone-suisyoen | 箱根・翠松園 | ready | review count not locked |
| accommodation | 38 | hakone-yama-no-chaya | 山の茶屋 | ready | review count not locked |
| accommodation | 39 | hakone-yuyado-zen | 箱根湯宿 然-ZEN- | ready | review count not locked |

## Cleanup / Hold Notes

`merge`, `split_needed`, `operation_recheck`, `hold`가 붙은 후보는 사용자-facing 데이터로 넘기기 전에 정규화가 더 필요하다.

| kind | slug | name_ja | candidate_status | raw_next_or_tier | note |
| --- | --- | --- | --- | --- | --- |
| facility | mizonokuchi-kirari | 溝口温泉 喜楽里 | hold | needs_operator_url_crosscheck | 公式URLは推定なので次回確認。大人向け静かな都市温浴として混雑/休憩席/炭酸泉人気を分ける / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | isawa-spaland | スパランドホテル内藤 | hold | wellness_spa_keep_but_not_true_onsen_claim | 温泉宿名だが公式はナノ水訴求。天然温泉データではなく wellness_spa として扱う / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | kawaguchiko-kaneyamaen | 庭園と感動の宿 富士山温泉 ホテル鐘山苑 | merge | merge_with_fujiyoshida-kaneyamaen | 日本語名、公式サイト、住所情報から203と同一。河口湖エリア候補として入った重複を統合する / 동일 숙소/시설 후보로 병합 필요. 원본 행을 사용자-facing 데이터로 중복 노출하지 말 것. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | yugawara-soyu | 湯河原惣湯 Books and Retreat | ready\|operation_recheck | needs_current_operation_and_reservation_rule_check | 普通の日帰り温泉ではなく高価格リトリート型。予約/待ち/アメニティなし/再開情報が重要 / 운영시간/예약/휴무 등 변동 정보는 사용자 노출 전 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | hakone-tenzan | 天山湯治郷 | ready\|split_needed | needs_product_detail_and_review_pool_count | 施設構成 하위ページ 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-gora-kadan | 強羅花壇 | ready\|split_needed | needs_room_type_bath_detail_check | 일부 객실형으로 보이며 전실로 오해하면 안 됨. / 욕장/객실 타입 단위 분리 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | kawaguchiko-sunnide | Sunnide Resort ＜ホテル＆湖畔別邸 千一景＞ | ready\|split_needed | room_open_air_not_onsen_public_bath_check | 客室露天は眺望価値が強いが温泉ではない可能性が高い。room_bath_hot_spring候補にせず public_bath_hot_spring と分離 / 욕장/객실 타입 단위 분리 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | yugawara-tsubaki | 海石榴 つばき | ready\|split_needed | ready_for_deep_review_with_room_meal_privacy_split | 老舗高級料亭旅館。客室専用露天、大浴場弱塩泉、部屋食/プライバシー、老舗感と清掃を分ける / 욕장/객실 타입 단위 분리 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | isawa-hotel-fuji | ホテルふじ | ready\|split_needed | ready_for_deep_review_with_large_public_bath_split | 大型大浴場ホテル。大岩風呂、大庭園風呂、露天、貸切展望風呂、客室古さ、チェックイン混雑を分ける / 욕장/객실 타입 단위 분리 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | kawaguchiko-fuji-lake | FUJI LAKE HOTEL / 富士レークホテル | ready\|split_needed | ready_for_deep_review_with_accessibility_and_view_split | 富士/河口湖ビューとアクセシビリティが強い。大浴場、客室露天、入浴介助リフト、眺望不足、湖/富士側部屋を分ける / 욕장/객실 타입 단위 분리 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | kawaguchiko-kukuna | THE KUKUNA | ready\|split_needed | ready_for_deep_review_with_view_vs_water_texture_split | 富士山/河口湖ビューリゾート。客室露天・ジャグジー、展望大浴場、富士ビュー、ハーフビュッフェを分け、水質感は別途確認 / 욕장/객실 타입 단위 분리 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | kawaguchiko-ooya | 富士河口湖温泉 花水庭 おおや | ready\|split_needed | ready_for_deep_review_with_room_shower_pressure_check | 最上階展望風呂と客室露天を分ける。部屋付き露天のシャワー水圧、観光地感、食事/若手接客信号も確認 / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | yugawara-sansuirou | 山翠楼SANSUIROU | ready\|split_needed | ready_for_deep_review_with_stairs_and_view_bath_split | 展望露天と客室露天が強いが段差/階段が重要。屋上露天、室内露天、4棟移動、食事/眺望/リニューアル差を分ける / 욕장/객실 타입 단위 분리 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-airu | 箱根藍瑠 | hold | Tier 2 | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-hotel-okada | 箱根湯本温泉 ホテルおかだ | hold | Tier 2 | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | hakone-kappa-tengoku | かっぱ天国 | hold | Tier 2 | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-mikawaya | 箱根小涌園 三河屋旅館 | hold | Tier 2 | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-nanpuso | 箱根湯本温泉 ホテル南風荘 | hold | Tier 2 | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | hakone-no-yu | 箱根の湯 | hold | Tier 2 | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-oukyuan | 源泉かけ流しの宿 櫻休庵 | hold | Tier 2 | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-oukyuan-rin | 源泉かけ流しの宿 櫻休庵 別亭 凛 | hold | Tier 2 | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-pax-yoshino | 箱根パークス吉野 | hold | Tier 2 | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-setsugetsuka | 季の湯 雪月花 | hold | Tier 2 | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-tenseien | 箱根湯本温泉 天成園 | hold | Tier 2 | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |

## Output Files

- `hakone_kanagawa_yamanashi_accommodation_candidate_status_2026-07-03.csv`: 숙소 후보 상태. 53건.
- `hakone_kanagawa_yamanashi_facility_candidate_status_2026-07-03.csv`: 온천시설 후보 상태. 27건.
- `hakone_kanagawa_yamanashi_candidate_status_manifest_2026-07-03.csv`: 숙소+시설 통합 매니페스트. 80건.

## Next Agent Actions

1. `ready` Tier 1부터 Google Maps/Google Hotels, Jalan/Rakuten/Ikkyu, Booking/Agoda/Trip.com, Naver Blog/Cafe의 visible review pool을 플랫폼별로 고정한다.
2. `split_needed` 후보는 객실탕, 객실 노천탕, 공용 대욕장, 공용 노천탕, 대절탕/가족탕을 먼저 분리한 뒤 리뷰 샘플링한다.
3. `merge` 후보는 병합 대상 slug를 기준점으로 잡고 중복 후보를 user-facing 목록에서 제외한다.
4. `operation_recheck` 시설은 영업시간, 예약 방식, 휴무/운영 변경 공지를 공식 페이지에서 재확인한다.
5. 딥리뷰 단계에서는 직접 읽은 리뷰 수와 온천 관련 직접 리뷰 수를 새 컬럼으로 별도 집계하고, 이번 후보 검증의 표면 리뷰풀 수와 합산하지 않는다.
