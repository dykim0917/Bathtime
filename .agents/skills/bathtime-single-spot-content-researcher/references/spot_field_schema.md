# Bathtime Spot Field Schema

## Required Fields

- 외부인 이용 가능 여부
- 가격대
- 예약 필요 여부
- 위치/접근성
- 혼자 이용 적합도
- 커플/동행 이용 적합도
- 프라이빗 여부
- 시설 종류
- 좋았던 점
- 아쉬운 점
- 이런 사람에게 맞음
- 이런 사람에게는 애매함
- 업데이트 일자

## Additional Differentiation Fields

- 투숙객/회원 전용 여부
- 시설 노후도/청결도
- 혼잡도
- 휴대폰 사용 가능 여부
- 준비물/이용 팁
- 수면 전/운동 후/데이트/혼자 쉬기 적합도
- 문의/예약 링크
- 최신 운영 정보 업데이트 일자

## Consistency Rules

If a field is listed in `missing_fields.md` as High Priority, do not present it as fully confirmed in `archive_record.json`.

Examples:

- If reservation requirement needs confirmation, set `reservation_required` to `unknown` or `depends`.
- If external access is likely but not officially confirmed, include a confidence field or mark the condition clearly.
- If operating hours are repeated in secondary sources but not officially confirmed, write "반복 언급" instead of stating it as confirmed.
- If a value appears in SNS or SEO output, it must be no more confident than the archive record.