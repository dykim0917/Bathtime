# 중부/호쿠리쿠/고신 온천 판정 DB Seed 리포트

작성일: 2026-07-08

## 요약

- ready 후보: 52곳
- 이번 seed 생성 숙소: 16곳
- full verdict: 15곳
- lite verdict: 1곳
- 딥리서치 원천이 없어 보류한 ready 후보: 1곳

## Seed 대상

| slug | 숙소명 | 지역 | 직접 | 온천 | 플랫폼 | verdict | item | 온천수 방식 |
|---|---|---|---:|---:|---:|---|---:|---|
| echigo-yuzawa-nakaya | 오유야도 나카야 | 주부 · 니가타현 · 에치고유자와 | 957 | 877 | 6 | full | 5 | free_flowing_source |
| echigo-yuzawa-quattro | 시키 유자와 콰트로 | 주부 · 니가타현 · 에치고유자와 | 325 | 265 | 6 | full | 5 | free_flowing_source |
| echigo-yuzawa-ryugon | 류곤 | 주부 · 니가타현 · 에치고유자와 | 372 | 237 | 4 | full | 5 | hot_spring_confirmed |
| echigo-yuzawa-takahan | 유키구니노야도 다카한 | 주부 · 니가타현 · 에치고유자와 | 933 | 828 | 4 | full | 4 | free_flowing_source |
| gero-kawakamiya | 가와카미야 가스이테이 | 주부 · 기후현 · 게로 | 928 | 816 | 3 | full | 5 | hot_spring_confirmed |
| gero-miyako | 미야코 | 주부 · 기후현 · 게로 | 1350 | 1303 | 3 | full | 5 | hot_spring_confirmed |
| gero-ogawaya | 오가와야 | 주부 · 기후현 · 게로 | 656 | 587 | 4 | full | 5 | hot_spring_confirmed |
| gero-shogetsu | 쇼게츠 | 주부 · 기후현 · 게로 | 925 | 628 | 4 | full | 5 | hot_spring_confirmed |
| gero-suihoen | 가이세키야도 스이호엔 | 주부 · 기후현 · 게로 | 331 | 306 | 3 | full | 5 | hot_spring_confirmed |
| gero-suimeikan | 스이메이칸 | 주부 · 기후현 · 게로 | 472 | 391 | 7 | full | 5 | hot_spring_confirmed |
| gero-tsukinoakari | 하나레노야도 츠키노아카리 | 주부 · 기후현 · 게로 | 329 | 301 | 4 | full | 4 | hot_spring_confirmed |
| gero-yunoshimakan | 유노시마칸 | 주부 · 기후현 · 게로 | 478 | 421 | 4 | full | 5 | hot_spring_confirmed |
| matsumoto-jujo | 마쓰모토 주조 | 주부 · 나가노현 · 마쓰모토 | 303 | 203 | 5 | full | 5 | free_flowing_source |
| yamanaka-kagari-kisshotei | 가가리 킷쇼테이 | 주부 · 이시카와현 · 야마나카 | 549 | 458 | 4 | full | 5 | hot_spring_confirmed |
| yamanaka-kayotei | 하나무라사키 | 주부 · 이시카와현 · 야마나카 | 406 | 317 | 6 | lite | 0 | hot_spring_confirmed |
| yamanaka-kissho-yamanaka | 킷쇼 야마나카 | 주부 · 이시카와현 · 야마나카 | 421 | 361 | 8 | full | 4 | hot_spring_confirmed |

## 원천 파일

| slug | stats | sample | rows |
|---|---|---|---:|
| echigo-yuzawa-nakaya | collection_stats_2026-07-04.json | direct_review_sample_index_2026-07-04.csv | 957 |
| echigo-yuzawa-quattro | collection_stats_2026-07-04.json | direct_review_sample_index_2026-07-04.csv | 325 |
| echigo-yuzawa-ryugon | collection_stats_2026-07-04.json | direct_review_sample_index_2026-07-04.csv | 372 |
| echigo-yuzawa-takahan | collection_stats_2026-07-04.json | direct_review_sample_index_2026-07-04.csv | 933 |
| gero-kawakamiya | collection_stats_2026-07-06.json | direct_review_tags_2026-07-06.csv + manual_web_evidence_2026-07-06.csv | 937 |
| gero-miyako | collection_stats_2026-07-06.json | direct_review_tags_2026-07-06.csv + manual_web_evidence_2026-07-06.csv | 1360 |
| gero-ogawaya | collection_stats_2026-07-06.json | direct_review_tags_2026-07-06.csv + manual_web_evidence_2026-07-06.csv | 666 |
| gero-shogetsu | review_sample_stats_2026-07-06.json | combined_review_sample_2026-07-06.csv | 925 |
| gero-suihoen | collection_stats_2026-07-04.json | direct_review_sample_index_2026-07-04.csv | 331 |
| gero-suimeikan | collection_stats_2026-07-06.json | direct_review_tags_2026-07-06.csv + manual_web_evidence_2026-07-06.csv | 488 |
| gero-tsukinoakari | collection_stats_2026-07-04.json | direct_review_sample_index_2026-07-04.csv | 329 |
| gero-yunoshimakan | collection_stats_2026-07-04.json | direct_review_sample_index_2026-07-04.csv | 478 |
| matsumoto-jujo | review_sample_stats_2026-07-06.json | combined_review_sample_2026-07-06.csv | 303 |
| yamanaka-kagari-kisshotei | collection_stats_2026-07-04.json | direct_review_sample_index_2026-07-04.csv | 549 |
| yamanaka-kayotei | collection_stats_2026-07-06.json | direct_review_tags_2026-07-06.csv | 406 |
| yamanaka-kissho-yamanaka | collection_stats_2026-07-06.json | direct_review_tags_2026-07-06.csv + manual_web_evidence_2026-07-06.csv | 421 |

## 산출물

- `research/onsen-db-seed/chubu_hokuriku_koshin_reconciliation_seed_2026-07-08.json`
- `research/onsen-db-seed/chubu_hokuriku_koshin_reconciliation_seed_2026-07-08.upsert.sql`
- `research/onsen-db-seed/chubu_hokuriku_koshin_reconciliation_seed_2026-07-08_backlog.csv`

## 적용 전 기준

- full verdict는 직접 읽은 이용 경험 300건 이상, 온천 관련 200건 이상, 본문 확인 플랫폼 3개 이상, 채택 item 3개 이상일 때만 생성했다.
- item 채택은 언급 10건 이상, 2개 플랫폼 이상, 분모 2% 이상으로 제한했다.
- 공식 문구에 `源泉かけ流し` 또는 `源泉100`이 있는 숙소만 `water_kakenagashi` confirmed fact를 부여했다.

