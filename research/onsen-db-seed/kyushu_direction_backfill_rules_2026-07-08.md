# 규슈 3차-B 방향 태그 Backfill 규칙

작성일: 2026-07-08

## 적용 범위

- 원천 CSV를 덮어쓰지 않고 별도 backfilled CSV를 생성한다.
- 이번 seed 후보는 본문 판정 가능 후보와 issue/caution 태그 캘리브레이션 가능 후보만 포함한다.
- 방향 컬럼도 본문도 없는 positive-default 후보는 계속 보류한다.

## 방향 정의

- positive: 온천/욕장 경험이 명확히 좋게 언급되거나, 긍정 본문 표현과 온천 태그가 함께 있는 경우
- mixed: 장점과 주의점이 같은 행에 함께 있거나, 예약/운영/온도/혼잡 같은 조건부 태그가 붙은 경우
- negative: 약한 온천감, 염소, 명백한 불만 본문 또는 낮은 평점+부정 본문이 있는 경우
- neutral: 숙박 맥락 또는 온천과 무관한 행

## 태그 규칙

| tag | direction |
|---|---|
| sister_property_movement | mixed |
| aging_or_access | mixed |
| operation_recheck | mixed |
| cleanliness | mixed |
| temperature | mixed |
| crowding | mixed |
| stairs_access | mixed |
| room_coldness | mixed |
| insects | mixed |
| weak_onsen_feeling | negative |
| chlorine | negative |
| booking_confusion | mixed |
| booking_access | mixed |
| operation_caution | mixed |
| temperature_control | mixed |
| cleanliness_or_age | mixed |
| cleanliness_or_safety | mixed |
| building_age | mixed |
| temperature_access_cleanliness | mixed |
| room_no_shower_or_small_wet_area | mixed |
| stairs_or_access | mixed |
| room_type_mismatch | mixed |
| access_or_taxi | mixed |
| expectation_or_service_gap | mixed |
| pet_friendly_context | neutral |

## 제외 원칙

- `signal_tags`만 있고 본문/issue/caution이 없는 행은 positive로 단정하지 않는다.
- `booking_confusion`, `temperature_control`, `crowding`은 기본적으로 mixed로 처리한다.
- `weak_onsen_feeling`, `chlorine_smell`은 negative 신호로 처리하되, 같은 행에 긍정 욕장 경험이 있으면 mixed가 될 수 있다.

