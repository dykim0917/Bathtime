# 규슈 3차-B 방향값 Backfill 결과

작성일: 2026-07-08

## 요약

- backfilled 후보: 14곳
- 본문 감성/문맥 판정 후보: 5곳
- issue/caution 캘리브레이션 후보: 9곳
- positive-default-only 후보는 이번 backfill에서 제외했다.

## 후보별 방향 분포

| slug | type | rows | positive | mixed | negative | neutral | top_rules |
|---|---|---:|---:|---:|---:|---:|---|
| beppu-bettei-haruki | body_sentiment_inference_needed | 387 | 244 | 122 | 2 | 19 | body_positive:244; body_positive_and_negative:105; neutral_or_lodging_context:19; body_negative_with_context:17; low_rating_negative_body:2 |
| beppu-hachiyo | body_sentiment_inference_needed | 498 | 298 | 176 | 6 | 18 | body_positive:286; body_positive_and_negative:159; neutral_or_lodging_context:18; rating_positive_signal:12; body_negative_with_context:12 |
| beppu-hoshino-kai | body_sentiment_inference_needed | 379 | 135 | 220 | 6 | 18 | body_positive:130; conditional_signal_tag:111; body_positive_and_negative:90; body_negative_with_context:19; neutral_or_lodging_context:18 |
| beppu-kannawa-bettei | body_sentiment_inference_needed | 389 | 277 | 96 | 1 | 15 | body_positive:277; body_positive_and_negative:87; neutral_or_lodging_context:15; body_negative_with_context:9; low_rating_negative_body:1 |
| beppu-terrace-midoubaru | body_sentiment_inference_needed | 363 | 211 | 138 | 4 | 10 | body_positive:197; body_positive_and_negative:120; neutral_or_lodging_context:10; conditional_signal_tag:9; body_negative_with_context:9 |
| takeo-koyokaku | issue_caution_calibration_needed | 330 | 176 | 102 | 2 | 50 | body_positive:90; rating_positive_signal:62; neutral_or_lodging_context:50; caution_or_issue_tag:43; conditional_signal_tag:37 |
| ureshino-shiibasanso | issue_caution_calibration_needed | 319 | 42 | 265 | 4 | 8 | caution_or_issue_tag:192; conditional_signal_tag:45; body_positive:26; body_negative_with_context:20; rating_positive_signal:15 |
| ureshino-taishoya | issue_caution_calibration_needed | 369 | 161 | 179 | 4 | 25 | caution_or_issue_tag:127; rating_positive_signal:89; body_positive:63; conditional_signal_tag:45; neutral_or_lodging_context:25 |
| ureshino-wataya-besso | issue_caution_calibration_needed | 316 | 124 | 167 | 9 | 16 | caution_or_issue_tag:135; body_positive:63; rating_positive_signal:45; positive_signal_no_caution:16; neutral_or_lodging_context:16 |
| yufuin-enokiya | issue_caution_calibration_needed | 414 | 199 | 87 | 0 | 128 | neutral_or_lodging_context:128; rating_positive_signal:105; body_positive:76; conditional_signal_tag:50; caution_or_issue_tag:35 |
| yufuin-kounokura | issue_caution_calibration_needed | 301 | 108 | 144 | 4 | 45 | conditional_signal_tag:98; positive_signal_no_caution:61; neutral_or_lodging_context:45; rating_positive_signal:38; body_negative_with_context:23 |
| yufuin-oyado-kaikatei | issue_caution_calibration_needed | 428 | 311 | 102 | 2 | 13 | rating_positive_signal:299; caution_or_issue_tag:87; neutral_or_lodging_context:13; conditional_signal_tag:12; body_positive:6 |
| yufuin-shuhokan | issue_caution_calibration_needed | 329 | 100 | 164 | 1 | 64 | caution_or_issue_tag:82; rating_positive_signal:80; neutral_or_lodging_context:64; conditional_signal_tag:63; positive_signal_no_caution:20 |
| yufuin-tosyoan | issue_caution_calibration_needed | 413 | 162 | 138 | 0 | 113 | rating_positive_signal:120; neutral_or_lodging_context:113; caution_or_issue_tag:109; body_positive:38; body_negative_with_context:24 |

## 산출물

- `research/onsen-db-seed/kyushu_direction_backfill_rules_2026-07-08.json`
- `research/onsen-db-seed/kyushu_direction_backfill_rules_2026-07-08.md`
- `research/onsen-db-seed/kyushu_direction_backfill_audit_rows_2026-07-08.csv`
- `research/onsen-db-seed/kyushu-direction-backfill/*/direct_review_sample_index_direction_backfilled_2026-07-08.csv`

