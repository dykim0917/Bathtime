# Frontend Architect Agent Memory — Bath Sommelier

## Project Architecture
- React Native / Expo SDK 54 / TypeScript strict mode
- File-based routing via Expo Router (`app/` directory)
- `src/analytics/`, `src/components/`, `src/data/`, `src/engine/`, `src/hooks/`, `src/storage/`, `src/theme/`
- Design tokens: `src/data/colors.ts`, shared styles: `src/theme/ui.ts`

## Key Design Decisions (Confirmed)

### GNB Redesign (v3.12.0)
- 3탭 → 5탭: Home / Care / Trip / Product / My
- `result/` 경로는 탭 하위로 이동하지 않음 — 탭 독립적 진입
- My 탭은 단일 파일 + useState 서브탭 전환 (중첩 라우팅 불필요)
- Product 탭 P0는 플레이스홀더만 (빌드 통과 최우선)
- `history.tsx` / `settings.tsx` → Redirect 처리 후 삭제
- Design doc: `docs/02-design/features/gnb-redesign.design.md`

## Component Conventions
- Named exports only (no default exports for components)
- StyleSheet.create() at bottom of file
- Props interface defined explicitly above component
- `ui.*` from `src/theme/ui.ts` for common patterns (screenShell, glassCard, pillButton)

## Tokens (Never Hardcode)
- Colors: V2_ACCENT (#B08D57), V2_TEXT_PRIMARY (#F5F0E8), V2_BG_BASE (#101920), V2_SURFACE (rgba(23, 33, 42, 0.88))
- Typography source of truth: TYPE_SCALE { headingLg: 34, headingMd: 20, title: 18, body: 14, caption: 12 }
- Font roles: `luxuryFonts.display` for editorial headings, `luxuryFonts.sans` for interaction/body, `luxuryFonts.mono` for timer/data moments
- Icons: FontAwesome only (@expo/vector-icons) — no new icon libraries

## Docs Structure
- `docs/01-plan/features/` — Plan documents
- `docs/02-design/features/` — Design documents (created 2026-02-27)
