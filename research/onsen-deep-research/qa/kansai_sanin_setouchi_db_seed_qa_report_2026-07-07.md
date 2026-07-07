# 간사이·산인·세토우치 DB Seed QA 리포트 (2026-07-07)

## 1. 산출물 인벤토리

- 숙소 후보 shortlist: `research/onsen-candidates/nationwide-2026-07-03/kansai_sanin_setouchi_accommodation_candidate_shortlist_2026-07-03.csv` / 50건
- 시설 후보 shortlist: `research/onsen-candidates/nationwide-2026-07-03/kansai_sanin_setouchi_facility_candidate_shortlist_2026-07-03.csv` / 27건. 숙소 QA 표에는 섞지 않고 별도 인벤토리로만 유지했다.
- 전국 숙소 master 범위 필터: 74건 / 대상 prefecture 10개
- 전국 시설 master 범위 필터: 41건
- 딥리서치 폴더: 27개. 이 중 summary 존재 26개, platform_mapping 존재 26개.
- 숙소별 manifest/summary/evidence 세트가 불완전한 폴더: `arima-maruyama-2026-07-04` 1건.

## 2. 지역 라벨 재분류

이 배치는 파일명상 `kansai`로만 넣으면 안 된다. 실제 숙소 후보 50건은 아래 네 그룹으로 갈린다.

| region_group | 숙소 후보 수 | ready_for_db | 설명 |
|---|---:|---:|---|
| `kansai` | 25 | 10 | 아리마·기노사키·시라하마 |
| `ise_shima` | 4 | 3 | 도바/이세시마 |
| `sanin` | 11 | 7 | 가이케·미사사·다마쓰쿠리 |
| `shikoku_setouchi` | 10 | 3 | 도고·유바라·유다 등 세토우치/시코쿠 축 |

시설 후보 27건도 같은 방식으로 분리되며, 시설 region 분포는 {'kansai': 12, 'ise_shima': 3, 'sanin': 6, 'shikoku_setouchi': 6}이다. 시설은 숙소 DB seed와 별도 테이블/트랙으로 유지해야 한다.

## 3. QA 판정 요약

- 이번에 본 숙소 후보: 50건
- 딥리서치 완료/부분 완료 숙소: 27건
- 플랫폼상 visible review pool 합계(숫자 추출 가능분만): 최소 88,307건. 직접 읽은 수와 합산하지 않는다.
- 직접 확인 리뷰 합계: 12,217건
- 온천 관련 직접 리뷰 합계: 6,833건
- verified grade 분포: {'D': 24, 'A': 23, 'B': 3}
- QA 상태 분포: {'candidate_only': 23, 'ready_for_db': 23, 'needs_research_reinforcement': 1, 'near_ready_b': 3}

| qa_status | 수 | 의미 |
|---|---:|---|
| `ready_for_db` | 23 | A verified. DB seed 후보 가능. 단 서비스 문구는 공식/후기 분리 재작성 필요. |
| `near_ready_b` | 3 | B verified. 직접 100-299건이거나 300건 이상이어도 한국어/플랫폼 층화 gap이 남음. |
| `needs_research_reinforcement` | 1 | 딥리서치 폴더는 있으나 manifest/summary/platform/evidence 세트나 직접 수가 부족. |
| `candidate_only` | 23 | 후보로만 유지. 아직 서비스 노출/DB seed 제외. |

## 4. Ready For DB 후보

| region_group | slug | name_ja | direct | onsen | platforms | copy QA |
|---|---|---|---:|---:|---:|---|
| `kansai` | `arima-grand-hotel` | 有馬グランドホテル | 402 | 189 | 5 | 공식/후기 분리 재작성 |
| `kansai` | `arima-hanamusubi` | 有馬温泉 御幸荘 花結び | 548 | 306 | 5 | 공식/후기 분리 재작성 |
| `kansai` | `arima-hyoe-koyokaku` | 兵衛向陽閣 | 565 | 285 | 5 | 공식/후기 분리 재작성 |
| `kansai` | `arima-nakanobo` | 中の坊瑞苑 | 433 | 305 | 5 | 공식/후기 분리 재작성 |
| `kansai` | `kinosaki-nishimuraya-shogetsutei` | 西村屋ホテル招月庭 | 321 | 184 | 7 | Google-native 직접 본문 약함/없음; visible count와 분리됨; Naver 직접 원문 약함/없음; snippet_only 분리 필요 |
| `kansai` | `shirahama-kaishu` | 白浜温泉 浜千鳥の湯 海舟 | 411 | 331 | 5 | 공식/후기 분리 재작성 |
| `kansai` | `shirahama-kawakyu` | ホテル川久 | 588 | 149 | 5 | 공식/후기 분리 재작성 |
| `kansai` | `shirahama-key-terrace` | SHIRAHAMA KEY TERRACE HOTEL SEAMORE | 387 | 199 | 4 | 공식/후기 분리 재작성 |
| `kansai` | `shirahama-sanrakuso` | 白浜温泉 ホテル三楽荘 | 535 | 326 | 3 | Google-native 직접 본문 약함/없음; visible count와 분리됨; Naver 직접 원문 약함/없음; snippet_only 분리 필요 |
| `kansai` | `shirahama-yanagiya` | 白浜温泉 家族とすごす白浜の宿 柳屋 | 317 | 195 | 7 | 공식/후기 분리 재작성 |
| `ise_shima` | `toba-kisara` | 季さら | 780 | 393 | 3 | 공식/후기 분리 재작성 |
| `ise_shima` | `toba-kisara-bettei-toki` | 季さら別邸 刻 | 300 | 213 | 11 | 공식/후기 분리 재작성 |
| `ise_shima` | `toba-todaya` | 戸田家 | 679 | 274 | 5 | 공식/후기 분리 재작성 |
| `sanin` | `kaike-yugetsu` | 皆生游月 | 542 | 290 | 5 | 공식/후기 분리 재작성 |
| `sanin` | `misasa-izanro-iwasaki` | 三朝温泉 依山楼岩崎 | 372 | 253 | 7 | 공식/후기 분리 재작성 |
| `sanin` | `misasa-mansuirou` | 三朝温泉 万翆楼 | 579 | 319 | 6 | 공식/후기 분리 재작성 |
| `sanin` | `tamatsukuri-chorakuen` | 玉造温泉 湯之助の宿 長楽園 | 304 | 238 | 6 | 공식/후기 분리 재작성 |
| `sanin` | `tamatsukuri-kasuien-minami` | 玉造温泉 佳翠苑皆美 | 606 | 320 | 4 | Naver 직접 원문 약함/없음; snippet_only 분리 필요 |
| `sanin` | `tamatsukuri-konya` | 玉造温泉 曲水の庭 ホテル玉泉 | 680 | 360 | 5 | Naver 직접 원문 약함/없음; snippet_only 분리 필요 |
| `sanin` | `tamatsukuri-yunosuke` | 玉造グランドホテル長生閣 | 599 | 336 | 5 | 공식/후기 분리 재작성 |
| `shikoku_setouchi` | `dogo-funaya` | 道後温泉 ふなや | 535 | 277 | 5 | 공식/후기 분리 재작성 |
| `shikoku_setouchi` | `dogo-miyu` | 道後御湯 | 344 | 239 | 6 | 공식/후기 분리 재작성 |
| `shikoku_setouchi` | `dogo-yachiyo` | 道後温泉 八千代 | 323 | 196 | 7 | 공식/후기 분리 재작성 |

## 5. Near Ready / 보강 필요

| qa_status | slug | verified | direct | onsen | platforms | issue | next_action |
|---|---|---|---:|---:|---:|---|---|
| `near_ready_b` | `shirahama-kachofugetsu` | B | 545 | 285 | 4 | snippet_only 분리 확인; 300건 이상이나 한국어/플랫폼 층화 gap으로 B 유지 | A 승급 목표 보강: 한국어 직접 본문 또는 추가 플랫폼/저평점 표본 확보 |
| `near_ready_b` | `shirahama-xyz-speciale` | B | 251 | 174 | 8 | snippet_only 분리 확인; A까지 직접 리뷰 49건 이상 추가 필요 | A 승급 목표 보강: 한국어 직접 본문 또는 추가 플랫폼/저평점 표본 확보 |
| `near_ready_b` | `dogo-kotononiwa` | B | 271 | 197 | 12 | snippet_only 분리 확인; A까지 직접 리뷰 29건 이상 추가 필요 | A 승급 목표 보강: 한국어 직접 본문 또는 추가 플랫폼/저평점 표본 확보 |
| `needs_research_reinforcement` | `arima-maruyama` | D |  |  |  | manifest/summary/platform_mapping 세트 미완성; 직접 리뷰 수 미확정; 직접 본문 플랫폼 수 미확정; bath axis 분리 산출 확인 필요 | 딥리서치 manifest/summary/platform/evidence 세트 작성부터 재개 |

## 6. Candidate Only

딥리서치가 아직 없는 숙소 후보 23건은 후보로만 유지한다. 대표적으로 아리마 hold 계열, 기노사키 일부, 도바국제/가이케/유다/도고 일부 숙소가 여기에 남아 있다. 이들은 visible review count나 후보 status가 있어도 직접 읽은 리뷰 수가 없으므로 서비스 노출 후보가 아니다.

## 7. 문구 QA 규칙

- `후기에서 강하게 반복된다`는 `ready_for_db`이면서 verified A인 숙소에만 사용한다.
- `공식 정보상` 욕장 구성과 `후기상` 만족/불만 신호를 같은 문장 안에서 단정적으로 섞지 않는다.
- 객실 노천탕이 공식상 온천인지, 백탕/沸かし湯인지, 일부 객실 옵션인지 반드시 분리한다.
- 대욕장 중심 숙소와 객실탕 중심 숙소는 같은 템플릿으로 쓰지 않는다.
- 내부 QA 용어, 샘플 수, 파일명, 조사 과정은 서비스 노출 문구에서 제거한다.

## 8. 차단/Gap 요약

- Google Maps/Hotels는 `arima-maruyama`를 제외한 딥리서치 폴더에서 platform mapping 또는 summary상 확인 흔적이 있다. 단 Google-native 본문이 0건인 숙소가 있어 visible count와 직접 리뷰 수는 분리해야 한다.
- Naver Blog/Search도 대부분 확인 흔적이 있으나, 직접 본문 0건 또는 `snippet_only`인 숙소가 있다. Naver 검색 preview는 직접 리뷰 수에 넣지 않는다.
- Yahoo Travel/Ikkyu/Tripadvisor/Expedia 계열은 숙소별로 403, 인증, partial, 공급자 카드 문제가 반복된다. 각 summary의 gaps를 DB 적재 전 copy QA 메모로 반영해야 한다.

## 9. 다음 에이전트 액션

1. CSV에서 `ready_for_db` 23건만 1차 DB seed 후보로 분리한다.
2. `near_ready_b` 3건은 A 승급용 보강 대상으로 두고, 특히 `dogo-kotononiwa`, `shirahama-xyz-speciale`는 300건까지 추가 direct 확보 가능성을 먼저 본다.
3. `arima-maruyama`는 폴더가 있으나 manifest/summary/platform_mapping이 없어 딥리서치 세트를 새로 작성한다.
4. DB seed 생성 전 숙소별 public copy를 새로 쓰고, 객실탕/객실 노천탕/대욕장/대절탕/가족탕 축을 각 숙소별로 다시 검수한다.
5. 이후 export script 생성, Supabase upsert, anon query 노출 확인 순서로 진행한다.
