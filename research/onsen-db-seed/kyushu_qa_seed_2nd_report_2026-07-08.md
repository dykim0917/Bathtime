# 규슈 QA 2차 회수 DB Seed 생성 리포트

작성일: 2026-07-08

## 요약

- QA 매트릭스 적재 후보: 12곳
- 생성 숙소 row: 12곳
- full verdict: 12곳
- lite verdict: 0곳
- full 후보였으나 lite로 낮춘 곳: 0곳
- 검산 중 제외한 곳: 0곳

## Full Verdict

| slug | 숙소명 | 직접 | 온천 | 플랫폼 | items |
|---|---|---:|---:|---:|---:|
| beppu-iyashi-iroha | 이야시노야도 이로하 | 391 | 360 | 4 | 5 |
| beppu-marugamiya | 마루가미야 | 568 | 529 | 3 | 5 |
| beppu-utsuwa | 니혼 료칸 우츠와 벳푸 간나와 | 356 | 356 | 3 | 5 |
| ibusuki-ginsyo | 이부스키 긴쇼 | 497 | 454 | 4 | 5 |
| ibusuki-hakusuikan | 이부스키 하쿠스이칸 | 2451 | 1799 | 8 | 5 |
| kurokawa-okunoyu | 료칸 오쿠노유 | 347 | 269 | 8 | 4 |
| kurokawa-takefue | 타케후에 | 524 | 373 | 6 | 5 |
| takeo-mifuneyama-rakuen | 미후네야마 라쿠엔 호텔 | 345 | 267 | 3 | 3 |
| unzen-azumaen | 운젠 아즈마엔 | 398 | 280 | 4 | 5 |
| unzen-fukudaya | 운젠 후쿠다야 | 530 | 435 | 8 | 5 |
| unzen-miyazaki-ryokan | 운젠 미야자키 료칸 | 333 | 217 | 9 | 3 |
| yufuin-konjakuan | 벳소 콘자쿠안 | 867 | 812 | 5 | 5 |

## Lite Verdict

| slug | 숙소명 | 직접 | 온천 | 플랫폼 | 이유 |
|---|---|---:|---:|---:|---|

## 제외

| slug | 이유 |
|---|---|

## 산출물

- `research/onsen-db-seed/kyushu_qa_seed_2nd_2026-07-08.json`
- `research/onsen-db-seed/kyushu_qa_seed_2nd_2026-07-08.upsert.sql`

## 적용 전 주의

- 이 산출물은 생성 후 별도 검산을 거쳐 DB 적용 여부를 결정한다.
- `needs_direction_backfill` 후보와 방향/플랫폼 기준을 통과하지 못한 나머지 후보는 이번 seed에서 제외했다.
- full 항목은 `mentions >= 10`, 분모 2% 이상, 2플랫폼 이상, 방향 카운트 보유 기준으로만 생성했다.

