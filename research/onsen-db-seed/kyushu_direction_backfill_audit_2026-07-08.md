# 규슈 3차 방향값 Backfill 감사 리포트

작성일: 2026-07-08

## 요약

- 3차-A seed 생성/검산 후보: 9곳
- 3차-A 방식: `signal_direction_tags` 또는 동등한 명시 방향 컬럼이 80% 이상 채워진 원천만 사용
- 3차-B 보류 후보: 27곳

## 3차-A 회수 후보

| slug | 직접 | 온천 | 플랫폼 |
|---|---:|---:|---:|
| yufuin-gorinka | 504 | 503 | 6 |
| yufuin-nakaya | 454 | 375 | 5 |
| yufuin-nihon-no-ashitaba | 329 | 304 | 6 |
| yufuin-reimei | 485 | 465 | 5 |
| yufuin-sakuratei | 619 | 616 | 5 |
| yufuin-sanso-waremokou | 587 | 574 | 6 |
| yufuin-wazanho | 313 | 269 | 3 |
| yufuin-yasuha | 576 | 552 | 5 |
| yunohira-gyounso | 560 | 467 | 5 |

## 3차-B 보류 유형

- 긍정 기본값 가정만으로는 위험: 13곳
- issue/caution 태그 방향 캘리브레이션 필요: 9곳
- 본문 감성/문맥 판정 필요: 5곳

## 3차-B 상세

| slug | area | 직접 | 온천 | 플랫폼 | 보류 유형 | 보조 수치 |
|---|---|---:|---:|---:|---|---:|
| beppu-bettei-haruki | Beppu | 387 | 324 | 4 | 본문 감성/문맥 판정 필요 | 0 |
| beppu-hachiyo | Beppu | 498 | 487 | 4 | 본문 감성/문맥 판정 필요 | 0 |
| beppu-hoshino-kai | Beppu | 379 | 221 | 3 | 본문 감성/문맥 판정 필요 | 0 |
| beppu-kannawa-bettei | Beppu | 389 | 331 | 3 | 본문 감성/문맥 판정 필요 | 0 |
| beppu-terrace-midoubaru | Beppu | 363 | 350 | 4 | 본문 감성/문맥 판정 필요 | 0 |
| takeo-koyokaku | Takeo | 330 | 255 | 5 | issue/caution 태그 방향 캘리브레이션 필요 | 64 |
| ureshino-shiibasanso | Ureshino | 319 | 297 | 4 | issue/caution 태그 방향 캘리브레이션 필요 | 224 |
| ureshino-taishoya | Ureshino | 369 | 328 | 4 | issue/caution 태그 방향 캘리브레이션 필요 | 134 |
| ureshino-wataya-besso | Ureshino | 316 | 275 | 4 | issue/caution 태그 방향 캘리브레이션 필요 | 165 |
| yufuin-bessou-shikisai-hotel | Yufuin | 449 | 359 | 3 | 긍정 기본값 가정만으로는 위험 | 0 |
| yufuin-bettei-kazenomori | Yufuin/Yunohira | 388 | 326 | 3 | 긍정 기본값 가정만으로는 위험 | 0 |
| yufuin-den-rikyu | Yufuin | 301 | 220 | 7 | 긍정 기본값 가정만으로는 위험 | 0 |
| yufuin-enokiya | Yufuin | 414 | 276 | 4 | issue/caution 태그 방향 캘리브레이션 필요 | 87 |
| yufuin-ikkoten | Yufuin | 524 | 509 | 5 | 긍정 기본값 가정만으로는 위험 | 0 |
| yufuin-kaede-no-shouja | Yufuin | 340 | 327 | 3 | 긍정 기본값 가정만으로는 위험 | 0 |
| yufuin-kosumosu | Yufuin | 472 | 314 | 3 | 긍정 기본값 가정만으로는 위험 | 0 |
| yufuin-kounokura | Yufuin | 301 | 233 | 5 | issue/caution 태그 방향 캘리브레이션 필요 | 49 |
| yufuin-onyado-yufuintei | Yufuin/Yunohira | 1437 | 1246 | 3 | 긍정 기본값 가정만으로는 위험 | 0 |
| yufuin-oyado-kaikatei | Yufuin/Yunohira | 428 | 415 | 3 | issue/caution 태그 방향 캘리브레이션 필요 | 91 |
| yufuin-satoyamasafu | Yufuin | 375 | 244 | 4 | 긍정 기본값 가정만으로는 위험 | 0 |
| yufuin-shuhokan | Yufuin | 329 | 233 | 4 | issue/caution 태그 방향 캘리브레이션 필요 | 101 |
| yufuin-sumika | Yufuin | 480 | 476 | 3 | 긍정 기본값 가정만으로는 위험 | 0 |
| yufuin-tamayura | Yufuin/Yunohira | 438 | 408 | 4 | 긍정 기본값 가정만으로는 위험 | 0 |
| yufuin-tosyoan | Yufuin | 413 | 284 | 4 | issue/caution 태그 방향 캘리브레이션 필요 | 138 |
| yufuin-yamadaya | Yufuin | 324 | 249 | 6 | 긍정 기본값 가정만으로는 위험 | 0 |
| yufuin-yuhri | Yufuin | 377 | 338 | 3 | 긍정 기본값 가정만으로는 위험 | 0 |
| yufuin-zen | Yufuin | 307 | 285 | 3 | 긍정 기본값 가정만으로는 위험 | 0 |

## 3차-B 작업 기준

- 본문이 있는 Beppu 계열은 평점만으로 방향을 확정하지 말고 온천 문장 단위로 긍정/혼합/부정을 분리해야 한다.
- `issue_tags`/`caution_tags` 계열은 태그별 방향 사전을 먼저 만들고, `temperature`, `booking_confusion`, `crowding` 같은 조건부 항목은 기본 mixed로 둔다.
- 방향 컬럼도 본문도 없는 유후인 계열은 “signal_tags가 있으니 positive”로 올리지 않는다. 최소 20건 이상 원문 spot check 또는 원천 CSV 재작성 후 seed로 전환한다.
- 3차-B는 DB 직행이 아니라 backfilled sample index 생성 -> local aggregation -> 금지어/조합/플랫폼 검산 -> DB 적용 순서로 진행한다.
