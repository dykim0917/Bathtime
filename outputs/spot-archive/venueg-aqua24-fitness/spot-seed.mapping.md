# Spot Seed Mapping

## Target
- Format: canonical JSON + Bathtime static ArchiveContent + CMS import JSON + Supabase JSON row
- Source folder: outputs/spot-archive/venueg-aqua24-fitness
- Target files:
  - spot-seed.canonical.json
  - spot-seed.archive-content.ts
  - spot-seed.cms-import.json
  - spot-seed.supabase.json

## Field Mapping
| Source | Canonical | ArchiveContent / Import Target | Notes |
| --- | --- | --- | --- |
| updated_archive_record.spot_id | id | id / slug | Stable seed id. |
| updated_archive_record.name_ko | content.title, spot.name_ko | title | Korean display title. |
| sns_summary App Card Subtitle | content.subtitle | subtitle | Falls back to short summary if missing. |
| bathtime_context.related_tags | content.tags | tags | Preserves researcher tags. |
| short_summary + editorial sections | content.body_blocks | body | Body is generated from structured researcher fields, not free invention. |
| access_conditions.external_user_access_status | spot.access.public_access | structuredInfo.publicAccess | Normalized available -> available. |
| price.price_summary | spot.price.summary | structuredInfo.priceRange | Full price detail remains in canonical JSON. |
| access_conditions.reservation_required | spot.access.reservation_required | structuredInfo.reservationRequired | not_required -> false. |
| location.city + district | spot.location.region_label | structuredInfo.region | Region label for app card filtering. |
| experience_fit.solo_fit | spot.experience_fit.solo_fit | structuredInfo.suitableForSolo | medium cannot be represented as boolean, so omitted in ArchiveContent. |
| experience_fit.couple_fit | spot.experience_fit.couple_fit | structuredInfo.suitableForCouple | medium cannot be represented as boolean, so omitted in ArchiveContent. |
| experience_fit.privacy_level | spot.experience_fit.privacy_level | structuredInfo.privateLevel | public -> public. |
| facilities.facility_types | spot.facilities.facility_types | structuredInfo.facilityTypes | App-supported concise facility list. |
| sources | audit.sources | sources | Preserved in canonical/CMS/Supabase only. |
| missing_fields.md | quality.missing_fields | quality | Preserved outside static ArchiveContent. |
| verification_checklist.md | quality.verification_checklist | quality | Preserved outside static ArchiveContent. |

## Skipped Or Compressed Fields

- Full source conflicts, review intelligence, exact operating limitations, facility detail, and verification checklists are not representable in current `ArchiveContent.PlaceStructuredInfo`; they remain in `spot-seed.canonical.json`, `spot-seed.cms-import.json`, and `spot-seed.supabase.json`.
- `suitableForSolo` and `suitableForCouple` are omitted from static ArchiveContent because source value is `medium` and the app type only accepts boolean.
- No Prisma seed or SQL seed was generated because this repo does not currently expose a spot/content table schema for these archive records.

## Publish Blockers

- 정확한 주소: 지도/전화로 방문자용 주소 확정
- 대표 전화: 실제 응대 번호 확인
- 최신 요금표: 공식 요금표 또는 전화 확인
- 찜질복 포함 여부: 입장권 포함/별도 여부 확인
- 수건 포함 여부: 기본 수건 제공 여부 확인
- 운영시간: 현재 24시간 운영 여부 확인
- 휴무: 월별 변동/공휴일 운영 확인
- 마지막 입장: 전화 확인
- 외부 일반 이용 가능 여부: 사우나/찜질방 외부 이용 조건 확인
- 주차 무료 시간: 무료 시간과 등록 방법 확인

## Verification Needed

- 공식 대표 전화번호 확인: 02-2065-0011 / 0507-1441-0011 중 실제 응대 번호
- 방문자용 정확한 주소 확인: 화곡로 347 지하2층인지, 공식 페이지의 강서로 388 표기가 별도 주소인지
- 현재 24시간 운영 여부 확인
- 매월 셋째 주 수요일 정기휴무 여부 확인
- 휴무 전날 23시 단축 운영 여부 확인
- 마지막 입장 시간 확인
- 최신 요금표 확인
- 찜질복 대여료와 필수 여부 확인
- 수건/대형 수면타월 대여료, 보증금 확인
- 24개월 미만 무료 입장 여부 확인
- 소인/대인 기준 확인
- 일반 외부 이용자 사우나·찜질방 이용 가능 여부 확인
- 피트니스 회원 전용 구역과 일반 이용 가능 구역 구분 확인
- 예약 필요 여부 확인
- 현장 결제 수단 확인
- 남성/여성 사우나 시설 실제 운영 범위 확인
- 불한증막, 소금방, 참숯방, 황토방, 편백방, 토굴방 운영 여부 확인
- 북카페 운영 여부 확인
- 미디어룸 운영 여부 확인
- 풋스파 또는 풋마사지존 운영 여부 확인
