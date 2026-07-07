# 중부·호쿠리쿠·고신 후보 검증/정규화 리포트 (2026-07-03)

## 1. 범위와 기준

- 대상 현: 長野県, 新潟県, 富山県, 石川県, 福井県, 岐阜県
- 대상 파일: `nationwide_accommodation_master_v0_6_2026-07-03.csv`, `nationwide_facility_master_v0_6_2026-07-03.csv`
- 이번 산출물은 딥리뷰 신호 수집이 아니라 Tier 1 후보 검증/정규화 결과다.
- 숙소와 온천시설은 분리 기록했다. 발탕, 외탕 루트, 문화 스폿은 숙소/입욕시설과 합치지 않았다.
- 직접 리뷰 본문 태깅은 수행하지 않았으므로 `directly_read_reviews=0`, `onsen_related_direct_reviews=0`으로 고정했다. 기존 배치의 리뷰풀 관찰 문장은 플랫폼 표면 관찰이며 직접 확인 리뷰 수가 아니다.

## 2. 처리량

| 구분 | Tier 1 처리 | Tier 2/3 미처리 |
|---|---:|---:|
| 숙소 | 54 | 22 |
| 온천시설 | 28 | 6 |
| 합계 | 82 | 28 |

현별 Tier 1 처리량: 長野県 27건, 新潟県 16건, 富山県 4건, 石川県 16건, 福井県 8건, 岐阜県 11건

## 3. 상태값 요약

| status | 전체 | 숙소 | 시설 | 해석 |
|---|---:|---:|---:|---|
| `ready` | 75 | 52 | 23 | 공식 정체성/온천 표면이 확인되어 다음 리뷰풀 카운트 또는 딥리서치로 이동 가능 |
| `hold` | 2 | 2 | 0 | 폐업/휴업/재개장 전 등으로 현재 후보 확정 보류 |
| `merge` | 0 | 0 | 0 | 중복 병합 필요. 이번 Tier 1 정규화에서는 확정 병합 없음 |
| `split_needed` | 13 | 13 | 0 | 객실탕/객실 노천탕/대욕장/대절탕/시설 루트/명칭을 분리해야 함 |
| `route_or_pass` | 4 | 0 | 4 | 외탕 순회 루트, 비입욕 문화 스폿, 또는 단일 입욕시설과 다른 취급 필요 |
| `footbath_only` | 3 | 0 | 3 | 발탕 전용 후보 |
| `operation_recheck` | 9 | 2 | 7 | 영업일/요금/재개장/휴지 공지를 최신 재확인해야 함 |

## 4. 다음 딥리서치 우선순위

우선순위는 평점순이 아니라, 공식 온천 사실이 뚜렷하고 리뷰풀/온천 축 분리가 데이터 가치로 이어지는 후보를 앞에 둔다.

| 우선 | kind | prefecture | slug | name_ja | status | 이유 |
|---:|---|---|---|---|---|---|
| 1 | accommodation | 岐阜県 | `gero-kawakamiya` | 下呂温泉 川上屋花水亭 | `ready` | official and ota bath surface confirmed |
| 2 | accommodation | 岐阜県 | `gero-miyako` | 下呂温泉 こころをなでる静寂 みやこ | `ready` | official and review surface confirmed |
| 3 | accommodation | 岐阜県 | `gero-shogetsu` | 下呂温泉 今宵 天空に遊ぶ しょうげつ | `ready` | official and review surface confirmed |
| 4 | accommodation | 岐阜県 | `gero-yunoshimakan` | 下呂温泉 湯之島館 | `split_needed|ready` | official identity confirmed |
| 5 | accommodation | 岐阜県 | `gero-ogawaya` | 下呂温泉 小川屋 | `ready` | official and review surface confirmed |
| 6 | accommodation | 岐阜県 | `gero-suimeikan` | 下呂温泉 水明館 | `ready` | official and multi ota bath surface confirmed |
| 7 | accommodation | 新潟県 | `echigo-yuzawa-nakaya` | 越後湯沢温泉 一望千里 御湯宿 中屋 | `ready` | official and multi ota bath surface confirmed |
| 8 | accommodation | 新潟県 | `echigo-yuzawa-quattro` | 四季Yuzawa QUATTRO | `ready` | official and multi ota bath surface confirmed |
| 9 | accommodation | 新潟県 | `echigo-yuzawa-takahan` | 越後湯沢温泉 雪国の宿 高半 | `ready` | official and multi ota bath surface confirmed |
| 10 | accommodation | 新潟県 | `senami-haginoya` | 瀬波温泉 瀬波グランドホテル はぎのや | `ready` | official and high volume ota bath surface confirmed |
| 11 | accommodation | 新潟県 | `senami-seiunsou` | 瀬波温泉 くつろぎの宿 旅館 静雲荘 | `ready` | official and high volume ota bath surface confirmed |
| 12 | accommodation | 新潟県 | `senami-taikanso` | 瀬波温泉 大観荘せなみの湯 | `ready` | official and multi ota bath surface confirmed |
| 13 | accommodation | 新潟県 | `tsukioka-kahou` | 月岡温泉 白玉の湯 華鳳 | `ready` | official and high volume ota bath surface confirmed |
| 14 | accommodation | 新潟県 | `tsukioka-senkei` | 月岡温泉 摩周 | `ready` | official and multi ota bath surface confirmed |
| 15 | accommodation | 石川県 | `yamanaka-kagari-kisshotei` | 山中温泉 かがり吉祥亭 | `ready` | official and multi ota bath surface confirmed |
| 16 | accommodation | 石川県 | `yamanaka-kayotei` | 山中温泉 花紫 | `ready` | official and multi review surface confirmed |
| 17 | accommodation | 石川県 | `yamanaka-kissho-yamanaka` | 山中温泉 吉祥やまなか | `ready` | official and multi ota bath surface confirmed |
| 18 | accommodation | 石川県 | `yamashiro-araya-totoan` | 山代温泉 あらや滔々庵 | `ready` | official and multi review surface confirmed |

## 5. 보류·분리 주의 후보

| kind | prefecture | slug | name_ja | status | 주의점 |
|---|---|---|---|---|---|
| accommodation | 岐阜県 | `gero-suihoen` | 下呂温泉 懐石宿 水鳳園 | `split_needed|ready` | 室数表記が公式/協会で差分。객실탕 유무 자체는強いが 최신 객실수 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | 岐阜県 | `gero-tsukinoakari` | 下呂温泉 離れの宿 月のあかり | `split_needed|ready` | 公式 하위 페이지 직접 확인 필요. 이번 확장에서는 보류성 확인. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | 岐阜県 | `gero-yunoshimakan` | 下呂温泉 湯之島館 | `split_needed|ready` | 고급/역사성은 강하지만 객실탕 신호는 별도 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | 新潟県 | `echigo-yuzawa-ryugon` | ryugon | `split_needed|ready` | 全室客室露天ではない。古民家ホテル体験と温泉/サウナ/客室露天を分離 / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | 石川県 | `wakura-kagaya` | 和倉温泉 加賀屋 | `hold|operation_recheck` | 全国知名度はTier1だが現時点では営業中宿として扱わない。再開後に新施設として再検証必須 / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | 石川県 | `wakura-niji-to-umi` | 和倉温泉 虹と海 | `hold|operation_recheck` | 現行宿泊候補としては保留。再開後は場所/客室数/浴場構成が変わる可能性がある / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | 石川県 | `katayamazu-morimoto` | 片山津温泉 湖畔の宿 森本 | `split_needed|ready` | 湖畔眺望型。大浴場、露天、貸切風呂、温泉岩風呂付客室、花火/湖ビューを分ける。食事評価が温泉評価を覆いやすい / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | 福井県 | `awara-grandia-housen` | あわら温泉 グランディア芳泉 | `split_needed|ready` | 大型リゾート旅館。客室半露天が温泉でない部屋タイプがあるため、room_bath_hot_springに一括タグしない。大浴場/露天/食事/子連れ導線を分ける / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | 福井県 | `awara-mimatsu` | あわら温泉 美松 | `split_needed|ready` | 客室露天と自家源泉の宿。大浴場/客室露天/インクルーシブ/古さと清潔感/子連れ信号を分ける / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | 長野県 | `bessho-kashiwaya-honten` | 別所温泉 かしわや本店 | `split_needed|ready` | 客室露天、内風呂付き客室、貸切常楽の湯、大岩風呂を分ける。別所温泉駅アクセス/北向観音隣接も滞在価値に混ざる / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | 長野県 | `bessho-nanjo-ryokan` | 別所温泉 旅館花屋 | `split_needed|ready` | slugはnanjo-ryokanだが日本語名/公式は旅館花屋。南條旅館とは別施設の可能性が高いためslug修正が必要。文化財/大理石風呂/露天を分ける / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | 長野県 | `matsumoto-jujo` | 松本十帖 | `split_needed|ready` | 全室客室源泉かけ流し露天型だが大浴場なし。松本本箱/小柳、湯小屋、シャワー/アメニティ制限、照明暗めを分ける / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | 長野県 | `katakura-silk` | 湖畔の洋館かたくらシルクホテル | `split_needed|ready` | 全室源泉かけ流し客室露天型。湯温が熱い信号、諏訪湖ビュー、全9室、片倉館連携/湖畔立地を分ける / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | 福井県 | `awara-seifuso` | あわら温泉 清風荘 | `split_needed|ready` | 大規模温泉旅館。庭園露天、複数浴場、足湯、日帰り、劇場型ビュッフェが強く混ざるため温泉/食事/子連れを分ける / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| accommodation | 長野県 | `bessho-nakamatsuya` | 別所温泉 旅館中松屋 | `split_needed|ready` | 別所温泉の展望大浴場型。館内7階展望風呂、公衆浴場利用、日帰り、眺望あり/なし部屋、家族需要を分ける / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | 岐阜県 | `gero-sachinoyu` | 幸乃湯 | `operation_recheck|ready` | 가족탕 후보였으나 현재 휴止. 시설 신호에서 큰 주의점. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | 岐阜県 | `gero-shirasagi` | 白鷺の湯 | `operation_recheck|ready` | 공식 개별 페이지 본문 추가 확인 필요. / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | 石川県 | `wakura-soyu` | 和倉温泉 総湯 | `operation_recheck|ready` | 能登復興文脈が 있어 현재 운영/혼잡/지역 분위기 리뷰를 별도 확인해야 함 / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | 長野県 | `nozawa-furusato-no-yu` | 野沢温泉 ふるさとの湯 | `operation_recheck|ready` | 2026年7月料金改定らしきSNS信号あり。公式ページ料金との鮮度差確認 필요 / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | 長野県 | `nozawa-ogama` | 野沢温泉 麻釜 | `route_or_pass` | 入浴施設ではない。온천시설 마스터에서는 food_steam/local_culture spot으로 분리 / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | 長野県 | `nozawa-sotoyu-route` | 野沢温泉 外湯めぐり | `route_or_pass` | 個別施設ではなく外湯ルート。大湯/麻釜の湯など個別外湯とは別に route row로 유지 / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | 長野県 | `shirahonet-public-openair` | 白骨温泉 公共野天風呂 | `operation_recheck|ready` | 公式更新鮮度が弱い。白濁期待と実際の湯色/循環感で評価が割れる可能性 / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | 長野県 | `shibu-kyuto-route` | 渋温泉 九湯めぐり | `route_or_pass` | 宿泊者限定の鍵ルールが 핵심. 일반 일귀리 온천으로 노출하면 안 됨 / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | 長野県 | `shibu-oinoyu` | 渋温泉 大湯 | `route_or_pass` | 大湯だけ個別に扱う場合も宿泊者限定ルールを 붙여야 함. 熱すぎる/土色/蒸し風呂 신호 확인 가치 / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | 新潟県 | `echigo-yuzawa-komako-no-yu` | 越後湯沢温泉 駒子の湯 | `operation_recheck|ready` | 価格改定・地元利用/場所取り 신호 확인 필요。共同浴場型の観光期待差も重要 / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | 新潟県 | `tsukioka-ashiyu-yuashibi` | 月岡温泉 足湯 湯足美 | `footbath_only|ready` | footbath_only。月岡の硫黄泉体験を短時間で試す stopover 候補 / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | 石川県 | `wakura-yuttari-park-footbath` | 和倉温泉 湯っ足りパーク | `footbath_only|operation_recheck` | footbath_only。能登地震後の営業状況・再開情報を最新確認してから掲載 / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |
| facility | 福井県 | `awara-ashiyu` | 芦湯 | `footbath_only|ready` | footbath_only。北陸新幹線/温泉街回遊の stopover として扱う / 직접 리뷰 카운트와 플랫폼상 리뷰풀은 분리 유지. |

## 6. Gaps / 이어받을 액션

- Tier 2/3는 이번 우선 처리 범위에서 제외했다. 지정 현 안의 미처리 후보는 숙소 22건, 시설 6건이다.
- 플랫폼상 전체 리뷰풀은 일부 배치 행에서 Rakuten/Jalan/Nifty 등 표면 관찰로만 기록되어 있으며, 이번 파일에서는 직접 읽은 리뷰 수로 환산하지 않았다.
- 다음 에이전트는 `ready` 숙소부터 Google Maps/Google Hotels, Rakuten, Jalan, Ikkyu/Yahoo, Booking/Agoda/Trip.com, Naver Blog/Cafe를 열어 visible review count와 직접 읽은 리뷰 수를 분리 기록해야 한다.
- `split_needed` 후보는 딥리서치 전 bath_area 축을 먼저 고정해야 한다: 객실 내탕, 객실 노천탕, 공용 대욕장, 공용 노천탕, 대절탕/가족탕, 발탕/외탕 루트를 분리한다.
- `operation_recheck`와 `hold` 후보는 공식 사이트 또는 관광협회 최신 공지로 영업 상태를 재확인한 뒤 리뷰 표본을 잡는다. 특히 和倉温泉 계열은 지진 이후 재개장/운영 맥락을 분리해야 한다.

## 7. 산출 파일

- `chubu_hokuriku_koshin_accommodation_candidate_status_2026-07-03.csv`
- `chubu_hokuriku_koshin_facility_candidate_status_2026-07-03.csv`
- `chubu_hokuriku_koshin_candidate_collection_report_2026-07-03.md`
