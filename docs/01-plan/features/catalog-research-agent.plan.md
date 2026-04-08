# Catalog Research Agent v1

> **Summary**: 실제 판매 상품을 검색해 후보를 수집하고, 기존 catalog seed와 대조해서 `listing 추가` 또는 `canonical 초안 생성` proposal을 만드는 반자동 에이전트 흐름이다.

## 1. Why

현재 [`/Users/exem/DK/BathSommelier/src/data/catalogResearchSeed.ts`](/Users/exem/DK/BathSommelier/src/data/catalogResearchSeed.ts) 는 등록 포맷은 준비돼 있지만, 실제 마켓 검색과 등록 제안 생성은 수동이다. 이 문서와 스크립트는 그 사이를 메운다.

목표는 세 가지다.

- 실제 판매 링크 후보를 반복 가능하게 수집
- 기존 canonical product와 중복 없이 연결
- 사람이 승인하기 쉬운 proposal JSON 생성

## 2. Workflow

```txt
canonical seed / ad-hoc query
  -> catalog:research
  -> output/catalog-candidates/*.json
  -> catalog:proposal
  -> output/catalog-proposals/catalog-proposals.v1.json
  -> human review
  -> seed or DB upsert
```

## 3. Commands

후보 수집:

```bash
npm run catalog:research
```

브라우저 collector:

```bash
npm run catalog:collect:browser -- --canonical-product-id p_shower_steamer --market coupang --limit 3
```

브라우저 수동 보조 모드:

```bash
npm run catalog:collect:browser -- --canonical-product-id p_shower_steamer --market coupang --limit 3 --manual
```

특정 제품만 재조사:

```bash
npm run catalog:research -- --canonical-product-id p_shower_steamer
```

새 쿼리로 ad-hoc 조사:

```bash
npm run catalog:research -- --query "입욕제 라벤더" --ingredient-key lavender_oil --market coupang
```

proposal 생성:

```bash
npm run catalog:proposal
```

특정 후보 파일만 proposal로 변환:

```bash
npm run catalog:proposal -- --file output/catalog-candidates/p_shower_steamer.json
```

## 4. Output Contracts

후보 파일:

- 경로: [`/Users/exem/DK/BathSommelier/output/catalog-candidates`](/Users/exem/DK/BathSommelier/output/catalog-candidates)
- 내용: `runs`, `candidates`, `target`

proposal 파일:

- 경로: [`/Users/exem/DK/BathSommelier/output/catalog-proposals/catalog-proposals.v1.json`](/Users/exem/DK/BathSommelier/output/catalog-proposals/catalog-proposals.v1.json)
- action:
  - `attach_listing`
  - `create_canonical`
  - `skip`

## 5. v1 Boundaries

- 완전 자동 등록은 하지 않는다.
- 검색 결과 HTML 파싱은 마켓 DOM 변경에 민감하다.
- 2026-04-08 기준 쿠팡은 서버측 `fetch`에 `403 Access Denied`를 반환했다. 그래서 v1은 `직접 fetch`보다 `공개 검색 fallback + 사람이 승인하는 proposal`에 초점을 둔다.
- `create_canonical` proposal은 반드시 사람이 summary / editorial / mechanism을 검수해야 한다.
- `priceSnapshotKrw`는 v1에서 비어 있을 수 있다. 이건 결함이 아니라 snapshot 한계다.

## 6. Recommended Next Step

v1이 안정화되면 다음 순서가 가장 자연스럽다.

1. 후보 상세 페이지 fetch로 가격/판매자 보강
2. proposal 승인 후 seed patch를 생성하는 apply 스크립트 추가
3. 이후 DB upsert 파이프라인에 연결

실제 운영 에이전트는 이 다음 단계에서 브라우저 기반으로 가는 편이 맞다.

- 추천안: Playwright 또는 gstack browse를 쓰는 별도 collector
- 이유: 쿠팡/네이버는 서버측 fetch보다 실제 브라우저 세션에서 더 안정적으로 검색/상세 확인이 가능하다
- 구조: `browser collector -> candidate json -> catalog:proposal -> human approve`

현재 repo에는 이 collector의 CLI 초안이 이미 있다.

- [`/Users/exem/DK/BathSommelier/scripts/catalog_browser_collector.mjs`](/Users/exem/DK/BathSommelier/scripts/catalog_browser_collector.mjs)
- 실행: `npm run catalog:collect:browser -- --canonical-product-id p_shower_steamer --market coupang --limit 3`
- 자동화 차단이 심한 마켓에서는 `--manual`로 headed 브라우저를 열고 사람이 검색 결과를 정리한 뒤 계속 진행할 수 있다.
