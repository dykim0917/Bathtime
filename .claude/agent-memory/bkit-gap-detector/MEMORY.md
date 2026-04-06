# Gap Detector Agent Memory - Bath Sommelier

## Project Context
- React Native / Expo SDK 54 / TypeScript strict
- Dynamic level architecture: src/engine, src/components, src/storage, src/hooks, app/ (Expo Router)
- Design tokens in `src/data/colors.ts`, shared styles in `src/theme/ui.ts`

## Analysis History
- **care-intent-cards** (2026-03-03): Match Rate 100%, 38 checklist items, 0 FAIL, 0 WARN (in-scope). 2 pre-existing WARN (hardcoded colors, out of scope). Overall 99%.
- **gnb-redesign** (2026-02-27): P0 Match Rate 97%, 33 checklist items, 0 FAIL, 1 WARN (placeholder mapped_mode)

## Known Patterns
- Hardcoded `#EAEEF5` (inactive pill bg) and `#FFFFFF` (active pill text) used across care/trip/my tabs - inherited from index.tsx pattern, not yet tokenized
- Redirect files (history.tsx, settings.tsx) use `<Redirect>` component instead of Design-specified `useFocusEffect + router.replace` - this is an improvement
- CLAUDE.md was updated from 3-tab constraint to 5-tab (v3.12.0) structure

## File Locations
- Design docs: `docs/02-design/features/`
- Plan docs: `docs/01-plan/features/`
- Analysis output: `docs/03-analysis/`
- Tab screens: `app/(tabs)/`
