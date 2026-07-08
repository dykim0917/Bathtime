# 규슈 QA 3차-A 방향 태그 회수 DB Seed 생성 리포트

작성일: 2026-07-08

## 요약

- QA 매트릭스 적재 후보: 9곳
- 생성 숙소 row: 9곳
- full verdict: 9곳
- lite verdict: 0곳
- full 후보였으나 lite로 낮춘 곳: 0곳
- 검산 중 제외한 곳: 0곳

## Full Verdict

| slug | 숙소명 | 직접 | 온천 | 플랫폼 | items |
|---|---|---:|---:|---:|---:|
| yufuin-gorinka | 오야도 고린카 | 504 | 503 | 6 | 3 |
| yufuin-nakaya | 오야도 나카야 | 454 | 375 | 5 | 5 |
| yufuin-nihon-no-ashitaba | 오야도 니혼노 아시타바 | 329 | 304 | 6 | 5 |
| yufuin-reimei | 히스이노야도 레이메이 | 485 | 465 | 5 | 5 |
| yufuin-sakuratei | 오야도 사쿠라테이 | 619 | 616 | 5 | 5 |
| yufuin-sanso-waremokou | 유후인 산소 와레모코우 | 587 | 574 | 6 | 5 |
| yufuin-wazanho | 유후인 료안 와잔호 | 313 | 269 | 3 | 5 |
| yufuin-yasuha | 유후인 야스하 | 576 | 552 | 5 | 5 |
| yunohira-gyounso | 유노히라 교운소 | 560 | 467 | 5 | 5 |

## Lite Verdict

| slug | 숙소명 | 직접 | 온천 | 플랫폼 | 이유 |
|---|---|---:|---:|---:|---|

## 제외

| slug | 이유 |
|---|---|

## 산출물

- `research/onsen-db-seed/kyushu_qa_seed_3rd_2026-07-08.json`
- `research/onsen-db-seed/kyushu_qa_seed_3rd_2026-07-08.upsert.sql`

## 적용 전 주의

- 이 산출물은 생성 후 별도 검산을 거쳐 DB 적용 여부를 결정한다.
- `needs_direction_backfill` 후보와 방향/플랫폼 기준을 통과하지 못한 나머지 후보는 이번 seed에서 제외했다.
- full 항목은 `mentions >= 10`, 분모 2% 이상, 2플랫폼 이상, 방향 카운트 보유 기준으로만 생성했다.

