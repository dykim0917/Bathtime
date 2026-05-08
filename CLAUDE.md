# BathSommelier Agent Guide

## Current Product Direction

바스타임의 현재 P0 기준은 웹 아카이브와 관리자 운영 흐름이다. 이전 모바일 앱 중심 문서는 `docs/_tmp_app_legacy_2026-05-08/`에 보관되어 있으며, 새 작업은 아래 문서를 우선한다.

- `docs/P0_WEB_IMPLEMENTATION_PLAN.md`
- `docs/01-plan/features/p0-operational-readiness.plan.md`
- `docs/02-design/features/archive-component-system.design.md`
- `docs/01-plan/features/brand-messaging-copy-refresh.plan.md`

## Language Rules

- 사용자에게 보이는 행위명은 `의식`을 사용한다.
- `루틴`은 타입명, 변수명, 이벤트명, 관리자 내부 technical label에만 허용한다.
- 사용자 노출 카테고리는 한국어 브랜드 언어를 사용한다.
- 내부 enum 값은 UI에 그대로 노출하지 않고 label mapper를 거친다.

## Frontend Rules

- Expo / React Native 화면은 React Native primitives와 `StyleSheet.create()`를 사용한다.
- 새 웹 아카이브 공통 UI는 `src/components/web/`에 named export로 둔다.
- 페이지 폭은 Shell이 아니라 `ArchivePageContainer`가 담당한다.
- `SaveButton`, `Badge`, `MetaRow`, 구조화 정보 mapper 같은 작은 컴포넌트를 먼저 재사용한다.
- 최신 시안 기준 폭:
  - Explore/Home/Saved grid: 1040~1120px
  - Detail: 1040~1120px
  - Submit/Routines narrow: 720~760px

## Admin Rules

- 관리자 앱은 `apps/admin`의 Next.js 앱이다.
- Supabase/PostgREST 기반 운영 데이터가 최종 방향이다.
- P0 검증용 제보 저장소는 `.data/p0-submissions.json`을 사용하며, `.data/`는 git에 올리지 않는다.
- 관리자 버튼이 사용자에게 저장처럼 보이면 실제 저장 동작을 갖춰야 한다. Mock 버튼은 명시적으로 표시한다.

## Verification

주요 변경 후 다음을 확인한다.

```bash
npm run typecheck
npm --prefix apps/admin run build
npm test -- --runInBand
```

