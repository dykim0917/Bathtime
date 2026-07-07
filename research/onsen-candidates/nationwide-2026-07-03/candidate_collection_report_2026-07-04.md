# Hakone / Kanagawa / Yamanashi Candidate Collection Report

Date: 2026-07-04

## Scope

- 담당 지역: 하코네·가나가와·야마나시.
- 입력 마스터: `nationwide_accommodation_master_v0_6_2026-07-03.csv`, `nationwide_facility_master_v0_6_2026-07-03.csv`.
- 처리 prefecture: `神奈川県`, `山梨県`.
- 이번 단계는 딥리뷰 신호 수집이 아니라 후보 검증/정규화 단계다.
- 숙소와 온천시설은 `kind`와 기존 분리 상태 파일 기준으로 분리했다.
- 다른 지역 후보는 확장하지 않았다.

## Collection Briefing

- 이번에 본 후보: 총 80건. 숙소 53건, 온천시설 27건.
- Tier 1 우선 후보: 숙소 35건, 온천시설 14건.
- 플랫폼상 전체 리뷰풀: 후보별 `visible_review_or_rating_signal`에 표면 관찰값만 보존했다. 합산하지 않았다.
- 직접 확인 리뷰 수: 0건. 후보 검증/정규화 단계이므로 리뷰 본문 태깅을 수행하지 않았다.
- 온천 관련 직접 리뷰 수: 0건.
- 접근 실패 플랫폼: 신규 동적 페이지 검증을 하지 않아 새 blocked 판정은 만들지 않았다.

## 지역 특성

하코네·유가와라는 객실 노천탕, 공용 대욕장, 공용 노천, 대절탕/가족탕, 원천 공급 주장이 한 후보 안에서 섞이기 쉽다. 야마나시·가와구치코권은 후지산/호수 전망 가치와 실제 온천수 경험이 혼재하므로, 전망 신호와 수질/욕장 신호를 분리해 다음 단계로 넘기는 것이 맞다. 수도권형 대형 온욕시설은 숙박 숙소와 별도 kind로 유지했다.

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

## Tier 1 Ready Queue

아래 후보는 다음 리뷰풀 고정 또는 딥리서치로 넘길 수 있다. `split_needed`가 함께 붙은 후보는 욕장/객실 타입 분리를 먼저 끝내야 한다.

| kind | queue_rank | slug | name_ja | candidate_status | visible_review_or_rating_signal |
| --- | --- | --- | --- | --- | --- |
| accommodation | 28 | hakone-byakudan | 箱根強羅 白檀 | ready | Rakuten visible 77 reviews in search surface |
| accommodation | 29 | hakone-fontainebleau | オーベルジュ 箱根フォンテーヌ・ブロー仙石亭 | ready | review count not locked |
| accommodation | 30 | hakone-gen-gora | 玄 箱根強羅 | ready | review count not locked |
| accommodation | 31 | hakone-ginyu | 箱根吟遊 | ready | review count not locked |
| accommodation | 32 | hakone-gora-kadan | 強羅花壇 | ready|split_needed | review count not locked |
| accommodation | 33 | hakone-gora-karaku | 箱根・強羅 佳ら久 | ready | Ikkyu visible 362 reviews |
| accommodation | 34 | hakone-kanaya-resort | KANAYA RESORT HAKONE | ready | review count not locked |
| accommodation | 35 | hakone-kowakien-tenyu | 箱根小涌園 天悠 | ready | review count not locked |
| accommodation | 36 | hakone-matsuzakaya | 箱根の名湯 松坂屋本店 | ready | review count not locked |
| accommodation | 37 | hakone-suisyoen | 箱根・翠松園 | ready | review count not locked |
| accommodation | 38 | hakone-yama-no-chaya | 山の茶屋 | ready | review count not locked |
| accommodation | 39 | hakone-yuyado-zen | 箱根湯宿 然-ZEN- | ready | review count not locked |
| accommodation | 80 | hakone-kai | 星野リゾート 界 箱根 | ready | Jalan shows 37 reviews; Tripadvisor/Yahoo/Expedia surfaces exist |
| accommodation | 196 | isawa-fujinoya | シャトレーゼホテル 旅館 富士野屋 | ready | Rakuten surfaces mention room open-air source-flow, shower also onsen, suitable temperature, smooth skin, but weak water pressure and large-bath time allocation issues |
| accommodation | 197 | isawa-itoyanagi | 石和名湯館 糸柳 | ready | Rakuten/Oyutabi surfaces mention medicinal stone bath, large/public baths, room with onsen/open-air options and high food/service satisfaction |
| accommodation | 198 | isawa-itoyanagi-yuwa | 糸柳こやど ゆわ | ready | Rakuten surfaces mention room bath use, lounge service, older building/low water pressure notes; guest may skip public bath if room bath satisfies |
| accommodation | 199 | isawa-kagetsu | 銘石の宿 かげつ | ready | Rakuten/Jalan surfaces mention room semi-open-air bath, large stone public bath, alkaline smooth skin, garden/koi atmosphere; pet-luxury annex exists as separate product |
| accommodation | 200 | isawa-keizan | 石和温泉 華やぎの章 慶山 | ready | Rakuten shows 1,922 review marker; visible reviews mention room open-air, self-source flow, soft water, high food/service and Taiko show; large active review pool |
| accommodation | 201 | isawa-koshien | 銘庭の宿 ホテル甲子園 | ready | Rakuten review surface mentions tablet-reservable private open-air, suna/ganbanyoku, and public open-air bath temperature nuance |
| accommodation | 202 | isawa-wajoen | 糸柳別館 離れの邸 和穣苑 | ready | Rakuten surface shows high rating/review pool marker; elderly guest use, bath/washroom ease, food/service strength are visible |
| accommodation | 203 | fujiyoshida-kaneyamaen | 庭園と感動の宿 富士山温泉 ホテル鐘山苑 | ready | Rakuten surface includes room open-air usefulness for elderly parent, comfortable hot spring water, Fuji/garden view weather dependency |
| accommodation | 204 | kawaguchiko-fufu | ふふ 河口湖 | ready | Ikkyu/Yahoo surfaces show room open-air/Fuji view strength; some review surface mentions room bath too hot and public bath size expectation gap |
| accommodation | 206 | kawaguchiko-konanso | 富士河口湖温泉 湖南荘 | ready | Rakuten shows large visible pool marker; Yahoo surface mentions room open-air booking difficulty and renovated public bath/sauna comfort |
| accommodation | 207 | kawaguchiko-sunnide | Sunnide Resort ＜ホテル＆湖畔別邸 千一景＞ | ready|split_needed | Jalan surface explicitly says room open-air is not onsen while public bath is onsen; Yahoo surface supports room view/open-air satisfaction |
| accommodation | 208 | kawaguchiko-yumedono | 河口湖温泉寺 露天風呂の宿 夢殿 | ready | Booking review surface shows large global pool marker and room open-air/relaxation/service mentions; Ikkyu has smaller readable surface |
| accommodation | 226 | yugawara-ashikari | 懐石旅庵 阿しか里 | ready | Ikkyu/Jalan/Rakudaclub surfaces mention soft water, room open-air satisfaction, elderly mobility/stairs and baby-friendly lodging signals |
| accommodation | 227 | yugawara-miwa | 三輪 湯河原 | ready | Ikkyu/4travel surfaces mention large white room open-air, repeated bathing, heat retention, quiet design, food/bar service and anniversary use |
| accommodation | 228 | yugawara-okuyugawara-yui | 奥湯河原 結唯 | ready | Ikkyu/Rakuten surfaces mention room open-air by river, fireflies/stream sound, lukewarm indoor/open-air water, multi-level detached room access and privacy/eye-screen concern |
| accommodation | 229 | yugawara-tsubaki | 海石榴 つばき | ready|split_needed | Official/Rakuten review surface includes room open-air and room meal privacy satisfaction; OTA surfaces emphasize soft water and old-ryokan hospitality |
| accommodation | 262 | isawa-hotel-fuji | ホテルふじ | ready|split_needed | Rakuten surfaces mention clean open-air bath, huge rock bath, buffet, check-in waiting and older rooms; bath proposition is large public bath more than room bath |
| accommodation | 263 | kawaguchiko-fuji-lake | FUJI LAKE HOTEL / 富士レークホテル | ready|split_needed | Rakuten surfaces mention relaxed uncrowded baths, accessible bath lift, room/open-air view but one review says public open-air view could be better |
| accommodation | 264 | kawaguchiko-kukuna | THE KUKUNA | ready|split_needed | Ikkyu/Gpoint surfaces mention Fuji-view room open-air, terrace/jacuzzi, panoramic public bath, strong view and food satisfaction; water character signal is weaker than view signal |
| accommodation | 265 | kawaguchiko-ooya | 富士河口湖温泉 花水庭 おおや | ready|split_needed | Rakuten surfaces mention room attached open-air, public/top-floor view bath satisfaction, but also weak shower pressure in room open-air area |
| accommodation | 273 | yugawara-sansuirou | 山翠楼SANSUIROU | ready|split_needed | Rakuten/JTB surfaces mention room open-air and view, rooftop open-air seasonal/weather dependency, but building is spread across 4 wings with stairs and about 20 steps to view bath |
| facility | 21 | hakone-yunessun-morinoyu | 箱根小涌園ユネッサン 森の湯 | ready | review count not locked |
| facility | 30 | hakone-tenzan | 天山湯治郷 | ready|split_needed | review count not locked |
| facility | 31 | hakone-yuryo | 箱根湯寮 | ready | review count not locked |
| facility | 109 | shonan-ryusenji | 湘南RESORT SPA 竜泉寺の湯 | ready | Nifty/Asoview/local news surfaces exist; high-volume day-use spa candidate |
| facility | 110 | manten-no-yu | 天然温泉 満天の湯 | ready | Nifty/Sauna-ikitai/Lemon8 surfaces exist; black hot spring,炭酸泉, elderly local-use friction signals visible |
| facility | 111 | yokohama-aoba-kirari | 横浜青葉温泉 喜楽里 別邸 | ready | Nifty review surface has 2026 reviews; PR/official surfaces note high Nifty ranking |
| facility | 112 | yokohama-manyoclub | 横浜みなとみらい 万葉倶楽部 | ready | Rakuten shows 336 marker; Jalan review surface includes crowding, family bath, chlorine-smell negative signal |
| facility | 113 | yokohama-spa-hills-ryusenji | 横濱スパヒルズ 竜泉寺の湯 | ready | Nifty review surface has 2026 review praising clean facility, ganbanyoku, carbonated bath |
| facility | 114 | yugawara-soyu | 湯河原惣湯 Books and Retreat | ready|operation_recheck | 4travel surface mentions reservation, no amenities, clocks absent, outdoor movement, private bath wait; official notes 2026 reopening notice |
| facility | 130 | kawaguchiko-fujiyama-onsen | ふじやま温泉 | ready | Jalan shows 153 reviews; Nifty has 2026 review praising vanadium water smoothness and sauna |
| facility | 131 | kawaguchiko-yurari | 富士眺望の湯 ゆらり | ready | Nifty/Jalan/iko-yo surfaces mention bath variety and Fuji view, but also crowding, lukewarm water, stairs/child safety signals |
| facility | 133 | yugawara-kogomenoyu | こごめの湯 | ready | Nifty/Jalan/Tripadvisor surfaces mention old-style/simple day-use bath, tourist facility feel, outdoor flow vs indoor circulation comments, towel expectation |

## Exclusion / Hold 기준

- `hold`: Tier 2/3이거나 공식 URL·천연온천 주장·운영 정보가 다음 라운드 확인 대상인 후보.
- `merge`: 동일 숙소/시설 중복 후보. 사용자-facing 목록에서는 기준 slug로 병합한다.
- `split_needed`: 객실탕, 객실 노천탕, 공용 대욕장, 공용 노천탕, 대절탕/가족탕이 섞여 있어 욕장 단위 분리가 필요한 후보.
- `operation_recheck`: 영업시간, 예약 방식, 휴무, 재개장 여부가 변동 가능한 후보.
- `footbath_only`, `route_or_pass`: 이번 대상 상태 파일에는 새로 부여된 후보가 없었다.

## Cleanup / Hold Notes

| kind | slug | name_ja | candidate_status | note |
| --- | --- | --- | --- | --- |
| accommodation | hakone-gora-kadan | 強羅花壇 | ready|split_needed | 일부 객실형으로 보이며 전실로 오해하면 안 됨. / 욕장/객실 타입 단위 분리 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | kawaguchiko-kaneyamaen | 庭園と感動の宿 富士山温泉 ホテル鐘山苑 | merge | 日本語名、公式サイト、住所情報から203と同一。河口湖エリア候補として入った重複を統合する / 동일 숙소/시설 후보로 병합 필요. 원본 행을 사용자-facing 데이터로 중복 노출하지 말 것. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | kawaguchiko-sunnide | Sunnide Resort ＜ホテル＆湖畔別邸 千一景＞ | ready|split_needed | 客室露天は眺望価値が強いが温泉ではない可能性が高い。room_bath_hot_spring候補にせず public_bath_hot_spring と分離 / 욕장/객실 타입 단위 분리 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | yugawara-tsubaki | 海石榴 つばき | ready|split_needed | 老舗高級料亭旅館。客室専用露天、大浴場弱塩泉、部屋食/プライバシー、老舗感と清掃を分ける / 욕장/객실 타입 단위 분리 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | isawa-hotel-fuji | ホテルふじ | ready|split_needed | 大型大浴場ホテル。大岩風呂、大庭園風呂、露天、貸切展望風呂、客室古さ、チェックイン混雑を分ける / 욕장/객실 타입 단위 분리 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | kawaguchiko-fuji-lake | FUJI LAKE HOTEL / 富士レークホテル | ready|split_needed | 富士/河口湖ビューとアクセシビリティが強い。大浴場、客室露天、入浴介助リフト、眺望不足、湖/富士側部屋を分ける / 욕장/객실 타입 단위 분리 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | kawaguchiko-kukuna | THE KUKUNA | ready|split_needed | 富士山/河口湖ビューリゾート。客室露天・ジャグジー、展望大浴場、富士ビュー、ハーフビュッフェを分け、水質感は別途確認 / 욕장/객실 타입 단위 분리 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | kawaguchiko-ooya | 富士河口湖温泉 花水庭 おおや | ready|split_needed | 最上階展望風呂と客室露天を分ける。部屋付き露天のシャワー水圧、観光地感、食事/若手接客信号も確認 / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | yugawara-sansuirou | 山翠楼SANSUIROU | ready|split_needed | 展望露天と客室露天が強いが段差/階段が重要。屋上露天、室内露天、4棟移動、食事/眺望/リニューアル差を分ける / 욕장/객실 타입 단위 분리 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-airu | 箱根藍瑠 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-hotel-okada | 箱根湯本温泉 ホテルおかだ | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-mikawaya | 箱根小涌園 三河屋旅館 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-nanpuso | 箱根湯本温泉 ホテル南風荘 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-oukyuan | 源泉かけ流しの宿 櫻休庵 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-oukyuan-rin | 源泉かけ流しの宿 櫻休庵 別亭 凛 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-pax-yoshino | 箱根パークス吉野 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-setsugetsuka | 季の湯 雪月花 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | hakone-tenseien | 箱根湯本温泉 天成園 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | isawa-hanaisawa | 石和温泉 ホテル花いさわ | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | isawa-kimiyoshi | 石和温泉 ホテル君佳 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | kawaguchiko-hotel-koryu | 河口湖温泉 ホテル湖龍 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | kawaguchiko-ufuji-no-yado-oike | 富士河口湖温泉 若草の宿 丸栄 / 湖楽おんやど富士吟景候補 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | yugawara-fuga | ゆがわら風雅 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | yugawara-greenpal | 湯河原温泉 グリーンパル湯河原 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | yugawara-manyoso | 湯河原温泉 万葉の里 白雲荘 / 万葉荘候補 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | yugawara-yugawara-retreat-goenno-mori | 湯河原リトリート ご縁の杜 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | yugawara-zuisyo | 御宿瑞鷹 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | hakone-tenzan | 天山湯治郷 | ready|split_needed | 施設構成 하위ページ 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | mizonokuchi-kirari | 溝口温泉 喜楽里 | hold | 公式URLは推定なので次回確認。大人向け静かな都市温浴として混雑/休憩席/炭酸泉人気を分ける / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | yugawara-soyu | 湯河原惣湯 Books and Retreat | ready|operation_recheck | 普通の日帰り温泉ではなく高価格リトリート型。予約/待ち/アメニティなし/再開情報が重要 / 운영시간/예약/휴무 등 변동 정보는 사용자 노출 전 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | isawa-spaland | スパランドホテル内藤 | hold | 温泉宿名だが公式はナノ水訴求。天然温泉データではなく wellness_spa として扱う / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | hakone-kappa-tengoku | かっぱ天国 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | hakone-no-yu | 箱根の湯 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | isawa-nadeshiko | 石和温泉駅前公園あしゆ | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | isawa-yamanami | やまなしフルーツ温泉ぷくぷく / ほったらかし温泉候補 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | isawa-yamanashi-kotsu | 石和健康ランド | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | kawaguchiko-kaiun | 河口湖温泉 寺露天風呂の宿 夢殿 日帰り候補 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | kawaguchiko-tensui | 野天風呂天水 / 河口湖日帰り温泉候補 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | miurayu | 黒湯天然温泉みうら湯 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | raku-spa-tsurumi | RAKU SPA 鶴見 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | yokosuka-yurari | 横須賀温泉 湯楽の里 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | yorimichi-no-yu | 山梨泊まれる温泉 より道の湯 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | yugawara-izuminoyu | ニューウェルシティ湯河原 いずみの湯 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | yugawara-mamane | 湯河原温泉 ままねの湯 | hold | Tier 2/3 후보는 이번 Tier 1 우선 검증 패스에서 hold. 다음 라운드에서 공식 URL/리뷰풀 재확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |

## 다음 조사 제안

1. Tier 1 `ready` 숙소부터 Google Maps/Google Hotels, Rakuten, Jalan, Ikkyu/Yahoo, Booking/Agoda/Trip.com, Naver Blog/Cafe의 플랫폼상 리뷰풀을 플랫폼별로 고정한다.
2. `split_needed` 후보는 객실탕, 객실 노천탕, 공용 대욕장, 공용 노천탕, 대절탕/가족탕을 먼저 분리한다.
3. `merge` 후보는 기준 slug 하나만 user-facing 후보로 남기고 중복 원본은 notes에 보존한다.
4. 딥리뷰 단계로 넘어갈 때만 직접 읽은 리뷰 수와 온천 관련 직접 리뷰 수를 새로 집계한다. 후보 단계의 표면 리뷰풀과 합산하지 않는다.
