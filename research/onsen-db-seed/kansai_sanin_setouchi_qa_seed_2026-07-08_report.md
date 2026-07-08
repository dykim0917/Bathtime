# 간사이/산인/세토우치 QA 1차 DB Seed 생성 리포트

작성일: 2026-07-08

## 요약

- QA ready_for_db 후보: 23곳
- 생성 숙소 row: 23곳
- full verdict: 10곳
- lite verdict: 13곳
- full 후보였으나 lite로 낮춘 곳: 13곳
- 검산 중 제외한 곳: 0곳

## Full Verdict

| slug | 숙소명 | 직접 | 온천 | 플랫폼 | items |
|---|---|---:|---:|---:|---:|
| arima-hyoe-koyokaku | 효에 고요카쿠 | 565 | 285 | 5 | 5 |
| arima-nakanobo | 나카노보 즈이엔 | 433 | 305 | 5 | 5 |
| toba-kisara | 키사라 | 780 | 393 | 3 | 3 |
| toba-kisara-bettei-toki | 키사라 벳테이 토키 | 300 | 213 | 11 | 4 |
| misasa-izanro-iwasaki | 이잔로 이와사키 | 372 | 253 | 7 | 4 |
| misasa-mansuirou | 미사사 만스이로 | 579 | 319 | 6 | 5 |
| tamatsukuri-chorakuen | 초라쿠엔 | 304 | 238 | 6 | 5 |
| tamatsukuri-kasuien-minami | 가스이엔 미나미 | 606 | 320 | 4 | 5 |
| tamatsukuri-konya | 호텔 교쿠센 | 680 | 360 | 5 | 4 |
| dogo-funaya | 도고온천 후나야 | 535 | 277 | 5 | 5 |

## Lite Verdict

| slug | 숙소명 | 직접 | 온천 | 플랫폼 | 이유 |
|---|---|---:|---:|---:|---|
| arima-grand-hotel | 아리마 그랜드 호텔 | 402 | 189 | 5 | full 표본 기준 미달 |
| arima-hanamusubi | 미유키소 하나무스비 | 548 | 306 | 5 | 상세 signal row 없음 |
| kinosaki-nishimuraya-shogetsutei | 니시무라야 호텔 쇼게츠테이 | 321 | 184 | 7 | full 표본 기준 미달 |
| shirahama-kaishu | 하마치도리노유 가이슈 | 411 | 331 | 5 | 상세 signal row 없음 |
| shirahama-kawakyu | 호텔 가와큐 | 588 | 149 | 5 | full 표본 기준 미달 |
| shirahama-key-terrace | 시라하마 키 테라스 호텔 시모어 | 387 | 199 | 4 | full 표본 기준 미달 |
| shirahama-sanrakuso | 호텔 산라쿠소 | 535 | 326 | 3 | 상세 signal row 없음 |
| shirahama-yanagiya | 시라하마 야나기야 | 317 | 195 | 7 | full 표본 기준 미달 |
| toba-todaya | 토다야 | 679 | 274 | 5 | 상세 signal row 없음 |
| kaike-yugetsu | 가이케 유게츠 | 542 | 290 | 5 | 상세 signal row 없음 |
| tamatsukuri-yunosuke | 다마쓰쿠리 그랜드 호텔 조세이카쿠 | 599 | 336 | 5 | 상세 signal row 없음 |
| dogo-miyu | 도고 미유 | 344 | 239 | 6 | 상세 signal row 없음 |
| dogo-yachiyo | 도고온천 야치요 | 323 | 196 | 7 | full 표본 기준 미달 |

## Aggregate 구조 메모

| slug | aggregate rows | adopted items | row source |
|---|---:|---:|---|
| arima-grand-hotel | 8 | 5 | review_signal_rows |
| arima-hanamusubi | 0 | 0 | none |
| arima-hyoe-koyokaku | 8 | 5 | review_signal_rows |
| arima-nakanobo | 9 | 5 | review_signal_rows |
| kinosaki-nishimuraya-shogetsutei | 5 | 5 | review_signal_table |
| shirahama-kaishu | 0 | 0 | none |
| shirahama-kawakyu | 8 | 5 | signals |
| shirahama-key-terrace | 7 | 5 | signals |
| shirahama-sanrakuso | 0 | 0 | none |
| shirahama-yanagiya | 11 | 5 | signal_rows |
| toba-kisara | 9 | 3 | <root> |
| toba-kisara-bettei-toki | 8 | 4 | review_signal_rows |
| toba-todaya | 0 | 0 | none |
| kaike-yugetsu | 0 | 0 | none |
| misasa-izanro-iwasaki | 8 | 4 | review_signal_tags |
| misasa-mansuirou | 8 | 5 | review_signal_tags |
| tamatsukuri-chorakuen | 10 | 5 | signal_rows |
| tamatsukuri-kasuien-minami | 9 | 5 | signal_rows |
| tamatsukuri-konya | 6 | 4 | review_signal_table |
| tamatsukuri-yunosuke | 0 | 0 | none |
| dogo-funaya | 7 | 5 | review_signal_rows |
| dogo-miyu | 0 | 0 | none |
| dogo-yachiyo | 0 | 0 | none |

## 다음 백로그

| bucket | count |
|---|---:|
| 2차 보강 후보 | 3 |
| 2차 표본 보강 | 6 |
| 3차 상세 signal row 복원 | 7 |
| 딥리서치 대기 | 23 |
| 재조사 필요 | 1 |

## 제외

| slug | 이유 |
|---|---|

## 산출물

- `research/onsen-db-seed/kansai_sanin_setouchi_qa_seed_2026-07-08.json`
- `research/onsen-db-seed/kansai_sanin_setouchi_qa_seed_2026-07-08.upsert.sql`
- `research/onsen-db-seed/kansai_sanin_setouchi_qa_backlog_2026-07-08.csv`

## 적용 전 주의

- 이 권역은 숙소별 aggregate JSON 스키마가 일정하지 않아, 상세 signal row가 없는 숙소는 full로 승격하지 않았다.
- full 항목은 `mentions >= 10`, 분모 2% 이상, 2플랫폼 이상, 방향 카운트 보유 기준으로만 생성했다.
- `ise_shima`는 DB 권역상 `kansai`, `sanin`/`shikoku_setouchi`는 `chugoku_shikoku`로 정규화했다.

