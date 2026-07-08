# 규슈 QA 1차 DB Seed 생성 리포트

작성일: 2026-07-08

## 요약

- QA 매트릭스 적재 후보: 21곳
- 생성 숙소 row: 21곳
- full verdict: 15곳
- lite verdict: 6곳
- full 후보였으나 lite로 낮춘 곳: 0곳

## Full Verdict

| slug | 숙소명 | 직접 | 온천 | 플랫폼 | items |
|---|---|---:|---:|---:|---:|
| beppu-amane-resort-gahama | 아마네 리조트 가하마 | 341 | 200 | 6 | 5 |
| beppu-ana-intercontinental | ANA 인터컨티넨탈 벳푸 리조트 앤 스파 | 339 | 206 | 6 | 4 |
| beppu-bokai | 유사이노야도 보카이 | 434 | 302 | 3 | 5 |
| beppu-nagomitsuki | 나고미츠키 | 414 | 414 | 3 | 5 |
| beppu-rex-hotel | 렉스 호텔 벳푸 | 586 | 411 | 3 | 5 |
| beppu-suginoi-hotel | 스기노이 호텔 | 381 | 270 | 3 | 5 |
| beppu-yunosato-hayama | 유노사토 하야마 | 575 | 557 | 3 | 5 |
| beppu-yutorelo | 유토리로 벳푸 | 423 | 414 | 3 | 5 |
| ibusuki-yurian | 이부스키 유리안 | 606 | 518 | 8 | 5 |
| kirishima-lavista | 라비스타 기리시마 힐즈 | 518 | 372 | 8 | 5 |
| kurokawa-sanga | 료칸 산가 | 339 | 310 | 6 | 5 |
| kurokawa-yamamizuki | 야마미즈키 | 361 | 342 | 5 | 5 |
| unzen-kyushu-hotel | 운젠 규슈 호텔 | 1531 | 1046 | 4 | 4 |
| yufuin-musouen | 야마노호텔 무소엔 | 1391 | 1362 | 3 | 5 |
| yufuin-warabino | 산소 와라비노 | 315 | 300 | 4 | 5 |

## Lite Verdict

| slug | 숙소명 | 직접 | 온천 | 플랫폼 | 이유 |
|---|---|---:|---:|---:|---|
| beppu-amane-resort-seikai | 아마네 리조트 세이카이 | 399 | 310 | 3 | ready_for_db_lite |
| beppu-kannawaen | 벳푸 칸나와엔 | 391 | 335 | 4 | ready_for_db_lite |
| beppu-kokoroan | 벳푸 코코로안 | 395 | 349 | 3 | ready_for_db_lite |
| beppu-mimatsu | 시사이드 호텔 미마쓰 오에테이 | 319 | 181 | 3 | ready_for_db_lite |
| unzen-hanzuiryo | 운젠 한즈이료 | 154 | 105 | 7 | ready_for_db_lite |
| yufuin-enowa | 에노와 유후인 | 42 | 32 | 8 | ready_for_db_lite |

## 산출물

- `research/onsen-db-seed/kyushu_qa_seed_2026-07-08.json`
- `research/onsen-db-seed/kyushu_qa_seed_2026-07-08.upsert.sql`

## 적용 전 주의

- 이 산출물은 DB에 자동 적용하지 않았다.
- `needs_direction_backfill`, `needs_platform_reconciliation`, `needs_count_reconciliation` 나머지 후보는 이번 seed에서 제외했다.
- full 항목은 `mentions >= 10`, 분모 2% 이상, 2플랫폼 이상, 방향 카운트 보유 기준으로만 생성했다.

