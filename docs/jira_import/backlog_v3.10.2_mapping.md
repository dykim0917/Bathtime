# Jira CSV Import Mapping — backlog_v3.10.2

## 1) Input file
- `/Users/exem/DK/BathSommelier/docs/jira_import/backlog_v3.10.2.csv`

## 2) Jira Import Wizard field mapping
- CSV `Issue Type` -> Jira `Issue Type`
- CSV `Summary` -> Jira `Summary`
- CSV `Description` -> Jira `Description`
- CSV `Epic Name` -> Jira `Epic Name` (Epic rows only)
- CSV `Epic Link` -> Jira `Epic Link` (Story rows only)
- CSV `Labels` -> Jira `Labels`
- CSV `Priority` -> Jira `Priority`
- CSV `Components` -> Jira `Component/s`
- CSV `Fix Version` -> Jira `Fix Version/s`

## 3) Linking rule
- `Epic Link` must exactly match the `Epic Name` value of its parent Epic.
- This package uses names like:
  - `E0 Contract & Compliance Foundation`
  - `E1 Onboarding & Intake`
  - ...
  - `E10 QA Safety Matrix & Release Gate`

## 4) Description template used for Story rows
- Goal
- Acceptance Criteria (`- [ ]` checklist)
- Dependencies
- Source References

## 5) Labels strategy
- Global labels: `getbathtime`, `v3_10_2`, `market_first`
- Domain labels by row: `engine`, `safety`, `analytics`, `commerce`, `trip`, `onboarding`, `home`, `qa`, `legal`, `copy`

## 6) Priority policy
- Highest: E0, E2, E3, E10
- High: E1, E4, E5, E6, E9
- Medium: E7, E8

## 7) Components policy
- Allowed values in this package: `core-engine`, `app-ui`, `analytics`, `compliance`, `commerce`, `trip`, `safety`

## 8) Notes
- Source backlog has Epic 11개(E0~E10), Story 30개.
- 이전 초안의 Story 29개 가정과 달리, 실제 문서 기준은 Story 30개가 맞다.
