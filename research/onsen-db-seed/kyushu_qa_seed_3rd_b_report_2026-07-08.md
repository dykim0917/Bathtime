# 규슈 QA 3차-B 방향 Backfill 회수 DB Seed 생성 리포트

작성일: 2026-07-08

## 요약

- QA 매트릭스 적재 후보: 14곳
- 생성 숙소 row: 14곳
- full verdict: 14곳
- lite verdict: 0곳
- full 후보였으나 lite로 낮춘 곳: 0곳
- 검산 중 제외한 곳: 0곳

## Full Verdict

| slug | 숙소명 | 직접 | 온천 | 플랫폼 | items |
|---|---|---:|---:|---:|---:|
| beppu-bettei-haruki | 세키야 리조트 벳테이 하루키 | 387 | 324 | 4 | 4 |
| beppu-hachiyo | 하치요 | 498 | 487 | 4 | 5 |
| beppu-hoshino-kai | 호시노 리조트 카이 벳푸 | 379 | 221 | 3 | 5 |
| beppu-kannawa-bettei | 칸나와 벳테이 | 389 | 331 | 3 | 5 |
| beppu-terrace-midoubaru | 세키야 리조트 테라스 미도바루 | 363 | 350 | 4 | 3 |
| takeo-koyokaku | 다케오온천 가이세키야도 오기야 | 330 | 255 | 5 | 5 |
| ureshino-shiibasanso | 우레시노 온천 시이바산소 | 319 | 297 | 4 | 5 |
| ureshino-taishoya | 우레시노 온천 다이쇼야 | 369 | 328 | 4 | 5 |
| ureshino-wataya-besso | 우레시노 온천 와타야벳소 | 316 | 275 | 4 | 5 |
| yufuin-enokiya | 유후인 에노키야 료칸 | 414 | 276 | 4 | 5 |
| yufuin-kounokura | 하타고 코노쿠라 | 301 | 233 | 5 | 5 |
| yufuin-oyado-kaikatei | 오야도 카이카테이 | 428 | 415 | 3 | 4 |
| yufuin-shuhokan | 유후인 호텔 슈호칸 | 329 | 233 | 4 | 5 |
| yufuin-tosyoan | 유후인 토쇼안 | 413 | 284 | 4 | 5 |

## Lite Verdict

| slug | 숙소명 | 직접 | 온천 | 플랫폼 | 이유 |
|---|---|---:|---:|---:|---|

## 제외

| slug | 이유 |
|---|---|

## 산출물

- `research/onsen-db-seed/kyushu_qa_seed_3rd_b_2026-07-08.json`
- `research/onsen-db-seed/kyushu_qa_seed_3rd_b_2026-07-08.upsert.sql`

## 적용 전 주의

- 이 산출물은 생성 후 별도 검산을 거쳐 DB 적용 여부를 결정한다.
- `needs_direction_backfill` 후보와 방향/플랫폼 기준을 통과하지 못한 나머지 후보는 이번 seed에서 제외했다.
- full 항목은 `mentions >= 10`, 분모 2% 이상, 2플랫폼 이상, 방향 카운트 보유 기준으로만 생성했다.

