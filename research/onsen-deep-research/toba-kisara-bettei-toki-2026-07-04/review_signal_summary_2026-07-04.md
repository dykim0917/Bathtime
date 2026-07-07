# 季さら別邸 刻 리뷰 신호 딥리서치 (2026-07-04)

## 1. 이름/별칭 정규화

| 구분 | 값 |
|---|---|
| 일본어 공식명 | 伊勢志摩・鳥羽 季さら別邸 刻 |
| 한국어 통용명 | 키사라 벳테이 토키 |
| 영어/OTA 표기 | Kisara Bettei Toki / Toki Kisara Bettei |
| OTA 표기 | 季さら別邸刻〜TOKI〜, 季さら別邸 刻～TOKI～ |
| 혼동 주의 | `季さら` 본관, `季さらOneness`, `Nostalgic Romance Renewal Inn`과 별도 숙소 |
| 공식 사이트 | https://www.toba-kisara.com/toki/ |
| 주소/온천지 | 三重県鳥羽市安楽島町1075-7 / 社宮司温泉 |

## 2. Official Facts

공식 사이트는 `季さら別邸 刻`을 전 10실의 별저형 숙소로 설명한다. 공식 표면에서 `全室、内風呂と露天風呂`, 객실별 일부 `足湯付き`, `社宮司温泉`이 확인된다.

Rakuten 시설 표면은 `七栗の湯`·`社宮司温泉`, 알칼리성, 거의 무색투명·무취의 온천이라고 설명한다. 공식 사실로는 객실 노천탕과 객실 내탕이 핵심이며, 공용 대욕장·시간 예약식 가족탕/대절탕은 확인하지 못했다.

Bathtime 표시에서는 본관 `季さら`와 주소가 다르다는 점이 중요하다. 본관은 `1075-11`, 刻은 `1075-7`이며 Google Hotels에서도 본관과 Oneness가 nearby 카드로 함께 뜬다.

## 3. 수집 브리핑

| source | visible_review_count | rating | directly_read_reviews | onsen_related_reviews | access_status | notes |
|---|---:|---:|---:|---:|---|---|
| Rakuten Travel | 62 | 4.40 | 48 | 32 | direct_readable | SPA 상태 JSON 본문 직접 추출 |
| Jalan | 19 | - | 19 | 11 | direct_readable | 최신 4건 + archive 15건, `yad389295`가 정답 |
| Relux | 44 | 4.6 | 44 | 29 | direct_readable | 리뷰 총합 44건, 욕장 4.8 |
| Ikkyu | 125 combined | 4.56 | 100 | 74 | direct_readable_via_aside | p1-p4 브라우저 확인. 표시 125는 Yahoo 합산 안내 |
| Yahoo Travel | 125 combined | 4.56 | 25 | 20 | direct_readable_via_aside | Ikkyu와 합산 표면. Yahoo-only 본문만 별도 계산 |
| Google Hotels / Google-native | 140 | 4.5 | 20 | 8 | partial_direct_readable | 유용도순/낮은 점수순 표면 확인, 추가 스크롤 로딩 제한 |
| Naver Search/Blog | - | - | 0 | 0 | snippet_only_or_not_found_direct | 직접 한국어 숙박기 미확보, AI/Jalan/무관 블로그 중심 |

- 중복 가능성을 제거하지 않은 플랫폼상 visible review pool은 최소 390건이다. Ikkyu와 Yahoo는 125건 합산 표면이라 visible pool에 중복 합산하지 않았다.
- 직접 확인 리뷰 수는 256건이다. 그중 온천 관련 직접 본문은 174건으로 집계했다.
- 직접 본문 플랫폼 수는 6개다: Rakuten, Jalan, Relux, Ikkyu, Yahoo Travel, Google-native.
- Google Hotels와 Naver Search는 Aside Browser로 확인했다.
- 데이터 품질 등급: B. 300건에는 못 미치지만, 150건 이상·다중 플랫폼·저평점/온천 키워드 표본을 확보했다.
- 150-299건 종료 사유: 접근 가능한 정적/브라우저 본문은 256건까지 확인했다. Google은 140건 visible pool이 남아 있으나 Aside 스크롤 반복 후에도 리뷰 패널이 충분히 추가 로딩되지 않아 나머지는 직접 수에 넣지 않았다.

## 4. Review Signal Summary

| bath_area | bath_area_confidence | signal_type | signal_direction | mention_count | source_count | platform_count | contradiction_level | review_signal_status |
|---|---|---|---|---:|---:|---:|---|---|
| room_open_air_bath | specific | room_bath_hot_spring | positive | 172 | 172 | 6 | low | strong_signal |
| room_bath | specific | room_bath_hot_spring | positive | 91 | 91 | 6 | low | strong_signal |
| facility_wide | facility_wide | water_texture | positive | 86 | 86 | 6 | low | strong_signal |
| room_open_air_bath | specific | private_bath_experience | positive | 151 | 151 | 6 | low | strong_signal |
| facility_wide | facility_wide | booking_confusion | mixed | 44 | 44 | 5 | medium | strong_signal |
| room_open_air_bath | specific | weak_onsen_feeling | negative | 2 | 2 | 2 | low | weak_signal |
| room_open_air_bath | specific | chlorine_smell | negative | 2 | 2 | 1 | low | weak_signal |
| footbath | specific | private_bath_experience | positive | 18 | 18 | 5 | low | moderate_signal |

## 5. 부정/주의 신호

| issue | bath_area | evidence_level | summary | sample_count |
|---|---|---|---|---:|
| 가케나가시 기대 차이 | room_open_air_bath | direct_review | Ikkyu에서 `かけ流しではありません`이 직접 확인된다. 공식 원천 주장과 운영 방식은 분리해야 한다 | 2 |
| 벌레·모기 | room_open_air_bath / facility_wide | direct_review | Yahoo/Ikkyu에서 `虫`, `蚊` 신호가 소수 반복된다 | 8 |
| 온도·동선/추위 | room_bath / room_open_air_bath | direct_review | `湯加減`, `寒い`, 내탕에서 데운 뒤 노천으로 가는 동선 신호가 함께 보인다 | 9 |
| 미끄러움 | room_bath | direct_review | Relux에서 탈의/세정 공간 바닥이 미끄러워 넘어졌다는 신호가 확인된다 | 1 |
| 음식·라운지 운영 | facility_wide | direct_review | `配膳`, `ラウンジ`, `オードブル`, 식사 설명·간격 관련 혼합 신호가 반복된다 | 44 |
| Google 추가 본문 제한 | facility_wide | access_gap | Google visible 140건 중 Aside 표면에서 안정적으로 직접 확인한 것은 유용도순/저평점 표면 일부다 | - |

## 6. Evidence Examples

| signal_type | source_type | source_url | language | short_paraphrase | original_keyword | review_date |
|---|---|---|---|---|---|---|
| room_bath_hot_spring | Rakuten direct | https://travel.rakuten.co.jp/HOTEL/172767/review.html | ja | 임신/아이 동반으로 객실 노천탕과 방 식사를 선택했다는 신호 | 客室露天風呂, 部屋食 | 2026 |
| room_bath_hot_spring | Jalan direct | https://www.jalan.net/yad389295/kuchikomi/ | ja | 방 노천탕에서 이세만 조망과 온도 조절을 긍정 평가 | 部屋についてる露天風呂, 温度 | 2026 |
| water_texture | Ikkyu direct | https://www.ikyu.com/00002691/review/ | ja | 온천이 미끈하고 피부감이 좋다는 표현이 반복 | トロトロ, すべすべ | 2026 |
| room_bath_hot_spring | Relux direct | https://rlx.jp/23788/review/ | ja | 객실 내탕·노천탕·발탕을 언제든 쓸 수 있어 좋았다는 신호 | 内風呂, 露天風呂, 足湯 | 2020 |
| weak_onsen_feeling | Ikkyu direct | https://www.ikyu.com/00002691/review/ | ja | 원천 운반/순환 운영 기대 차이가 보이는 리뷰 | かけ流しではありません | 2026 |
| booking_confusion | Yahoo direct | https://travel.yahoo.co.jp/00002691/review/ | ja | 잊은 물건 대응, 전화 연결, 안내 태도에 대한 저평점 운영 신호 | 忘れ物, 連絡 | 2026 |
| insects | Yahoo direct | https://travel.yahoo.co.jp/00002691/review/ | ja | 실내 모기와 방충 대응 불만이 확인됨 | 蚊, 蚊取り | 2025 |
| room_bath_hot_spring | Google-native direct | Google Hotels review tab | ja/ko-ui | 객실 노천탕·내탕·족탕을 모두 긍정 평가 | 노천탕, 내탕, 족탕 | 2026 |
| official_fact | Official | https://www.toba-kisara.com/toki/ | ja | 공식은 전 객실에 내탕과 노천탕이 있다고 표기 | 全室、内風呂と露天風呂 | official |
| identity_caution | Google Hotels | Google panel | ko/ja | 본관·Oneness가 nearby 카드로 함께 노출되어 숙소 정체성 분리 필요 | Nostalgic Romance, Kisara Oneness | 2026 snapshot |

## 7. Bathtime Interpretation

직접 확인 표본 256건에서는 객실 노천탕과 객실 내탕 만족이 뚜렷하게 확인된다. 특히 `内風呂`, `露天風呂`, `足湯`, `トロトロ`, `すべすべ`가 여러 플랫폼에서 반복되어, 이 숙소는 공용 대욕장보다 객실 안에서 완결되는 온천 체류로 해석하는 것이 데이터에 맞다.

다만 `源泉` 또는 `社宮司温泉` 주장은 공식/OTA 시설 설명이고, 리뷰 신호에서는 `かけ流しではありません` 같은 기대 차이도 소수 확인된다. Bathtime에서는 “객실 노천탕/내탕/일부 발탕”을 강하게 분리 표시하되, 가족탕·대절탕으로 오역하지 않는 것이 중요하다.

## 8. Gaps

- 직접 확인 256건으로 B등급이다. A급으로 올리려면 최소 44건 이상의 추가 직접 본문이 필요하다.
- Google Hotels는 visible 140건이지만 Aside 스크롤 반복 후에도 추가 본문 로딩이 제한되어 20건만 직접 수에 넣었다.
- Naver는 직접 숙박기 본문을 찾지 못했고, AI 브리핑/Jalan 한국어 페이지/무관 블로그 결과는 직접 리뷰 수에서 제외했다.
- Ikkyu/Yahoo의 125건 표면은 합산 카운트라 visible pool에서는 한 번만 세고, 직접 본문은 Ikkyu 100건과 Yahoo 25건으로 분리했다.
- `yad353540`은 `品川プリンスホテル イーストタワー`로 확인되어 제외했다. `季さら別邸 刻`의 Jalan ID는 `yad389295`다.
