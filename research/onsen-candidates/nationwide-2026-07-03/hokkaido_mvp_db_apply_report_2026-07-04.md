# Hokkaido MVP DB Apply Report

- 적용일: 2026-07-04
- 적용 테이블: `onsen_accommodations`
- 적용 범위: 홋카이도 MVP 숙소 A등급 16곳
- 적용 파일: `output/hokkaido-onsen-mvp-accommodations.v1.json`
- 적용 방식: Supabase/PostgREST `on_conflict=slug` upsert

## 적용 결과

- 업서트 요청: 16건
- 검증 조회: 16건
- `evidence_grade`: A 16건
- `region_group`: hokkaido
- `status`: draft

## 시설 데이터

시설 A등급 3곳은 이번 DB 적용에서 제외했다.

- `jozankei-hoheikyo`
- `jozankei-yunohana`
- `hakodate-yachigashira`

제외 사유: 현재 운영 DB에는 숙소용 `onsen_accommodations` 테이블만 있고, 온천시설용 테이블/공통 장소 테이블이 아직 없다. 시설 데이터는 `output/hokkaido-onsen-mvp-facilities.v1.pending-schema.json`과 `output/hokkaido-onsen-mvp-places.v1.csv`에 분리 보관했다.
