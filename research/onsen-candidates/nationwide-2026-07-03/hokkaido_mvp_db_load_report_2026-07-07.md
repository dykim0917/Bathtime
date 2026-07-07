# Hokkaido MVP DB Load Report

- 생성일: 2026-07-07
- 범위: 홋카이도 MVP 숙소 A 16곳 + 온천시설 A 3곳
- 숙소 DB 상태: 기존 `onsen_accommodations` 테이블에 업서트 가능
- DB 적용 여부: export only
- 시설 DB 상태: 현재 시설 전용 테이블이 없어 `pending-schema` JSON/CSV로 분리 보관

## 적재 대상

- 숙소: 16곳, 직접 확인 리뷰 합계 5,170건
- 시설: 3곳, 직접 확인 리뷰 합계 1,343건
- 통합 장소 원장: 19건
- 통합 리뷰 신호 rows: 180건

## 생성 파일

- `output/hokkaido-onsen-mvp-accommodations.v1.json`
- `output/hokkaido-onsen-mvp-accommodations.v1.postgres.upserts.sql`
- `output/hokkaido-onsen-mvp-facilities.v1.pending-schema.json`
- `output/hokkaido-onsen-mvp-places.v1.csv`
- `output/hokkaido-onsen-mvp-review-signals.v1.csv`

## 시설 A 3곳

| slug | name_ja | direct_reviews | onsen_reviews | platforms | status |
|---|---:|---:|---:|---:|---|
| jozankei-hoheikyo | 豊平峡温泉 | 479 | 455 | 3 | ready_for_service |
| jozankei-yunohana | 湯の花 定山渓殿 | 332 | 300 | 7 | ready_for_service |
| hakodate-yachigashira | 谷地頭温泉 | 532 | 505 | 4 | ready_for_service |

## 주의

- Google/OTA visible review pool은 직접 읽은 리뷰 수와 합산하지 않았다.
- 시설 신호는 숙소 신호와 다른 모델이므로 `bath_area_raw/signal_type_raw`와 normalized 값을 함께 남겼다.
- `noboribetsu-sagiriyu`는 C등급 87건으로 MVP 적재 대상에서 제외했다.
- 실제 DB 반영 전 시설 테이블을 만들거나, 장소 공통 테이블로 스키마를 재설계해야 한다.
