#!/usr/bin/env python3
"""
Render a Bathtime spot archive record into a Markdown content draft.

Usage:
  python scripts/render_spot_markdown.py archive_record.json
  python scripts/render_spot_markdown.py archive_record.json --output content_draft.md
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def get_nested(data: dict[str, Any], path: str, default: Any = "") -> Any:
    current: Any = data
    for part in path.split("."):
        if not isinstance(current, dict):
            return default
        current = current.get(part, default)
    return current


def text(value: Any, fallback: str = "확인 필요") -> str:
    if value is None or value == "" or value == [] or value == {}:
        return fallback
    if isinstance(value, list):
        return ", ".join(str(item) for item in value) if value else fallback
    return str(value)


def bullet_list(items: Any, fallback: str = "- 확인 필요") -> str:
    if not items:
        return fallback
    if not isinstance(items, list):
        return f"- {items}"
    return "\n".join(f"- {item}" for item in items)


def label_external_access(value: str) -> str:
    labels = {
        "available": "가능",
        "limited": "제한적 가능",
        "guest_only": "투숙객 전용",
        "member_only": "회원 전용",
        "unavailable": "불가",
        "unknown": "확인 필요",
    }
    return labels.get(value, "확인 필요")


def label_reservation(value: str) -> str:
    labels = {
        "required": "필요",
        "recommended": "권장",
        "not_required": "불필요",
        "depends": "조건에 따라 다름",
        "unknown": "확인 필요",
    }
    return labels.get(value, "확인 필요")


def label_fit(value: str) -> str:
    labels = {
        "high": "높음",
        "medium": "보통",
        "low": "낮음",
        "unknown": "확인 필요",
    }
    return labels.get(value, "확인 필요")


def label_privacy(value: str) -> str:
    labels = {
        "public": "공개형",
        "semi_private": "반프라이빗",
        "private": "프라이빗",
        "mixed": "혼합형",
        "unknown": "확인 필요",
    }
    return labels.get(value, "확인 필요")


def make_title(record: dict[str, Any]) -> str:
    name = text(record.get("name_ko"), "이 스팟")
    city = text(get_nested(record, "location.city"), "")
    district = text(get_nested(record, "location.district"), "")

    location = " ".join(part for part in [city, district] if part and part != "확인 필요")
    if location:
        return f"{location} {name}, 방문 전에 확인할 것들"
    return f"{name}, 방문 전에 확인할 것들"


def render(record: dict[str, Any]) -> str:
    title = make_title(record)

    external_access = label_external_access(
        get_nested(record, "access_conditions.external_user_access_status", "unknown")
    )
    reservation = label_reservation(
        get_nested(record, "access_conditions.reservation_required", "unknown")
    )
    solo_fit = label_fit(get_nested(record, "experience_fit.solo_fit", "unknown"))
    couple_fit = label_fit(get_nested(record, "experience_fit.couple_fit", "unknown"))
    privacy = label_privacy(get_nested(record, "experience_fit.privacy_level", "unknown"))

    facility_types = text(get_nested(record, "facilities.facility_types"))
    price_summary = text(get_nested(record, "price.price_summary"))
    address = text(get_nested(record, "location.address"))
    access_note = text(get_nested(record, "location.access_note"), "")
    last_updated_at = text(record.get("last_updated_at"))

    editorial = record.get("editorial", {})
    bathtime_context = record.get("bathtime_context", {})

    sources = record.get("sources", [])
    source_lines = []
    for source in sources:
        if not isinstance(source, dict):
            continue
        title_text = source.get("title", "출처")
        url = source.get("url", "")
        source_type = source.get("source_type", "source")
        if url:
            source_lines.append(f"- [{title_text}]({url}) ({source_type})")
        else:
            source_lines.append(f"- {title_text} ({source_type})")

    if not source_lines:
        source_lines.append("- 출처 확인 필요")

    markdown = f"""# {title}

## 한 줄 요약

{text(record.get("short_summary"))}

## 어떤 상황에 맞을까

{text(record.get("one_line_editorial_note"))}

## 빠르게 보는 정보

- 외부인 이용 가능 여부: {external_access}
- 이용 조건: {text(get_nested(record, "access_conditions.external_user_access_condition"))}
- 가격대: {price_summary}
- 예약 필요 여부: {reservation}
- 예약 방법: {text(get_nested(record, "access_conditions.reservation_method"))}
- 위치/접근성: {address} {access_note}
- 혼자 이용: {solo_fit}
- 커플/동행 이용: {couple_fit}
- 프라이빗 여부: {privacy}
- 시설 종류: {facility_types}
- 업데이트 일자: {last_updated_at}

## 좋았던 점으로 보이는 부분

{bullet_list(editorial.get("good_points"))}

## 아쉬울 수 있는 부분

{bullet_list(editorial.get("weak_points"))}

## 이런 사람에게 맞을 수 있어요

{bullet_list(editorial.get("fit_for"))}

## 이런 사람에게는 애매할 수 있어요

{bullet_list(editorial.get("not_fit_for"))}

## 방문 전에 확인할 것

{bullet_list(bathtime_context.get("things_to_check_before_visit"))}

## 배스타임 노트

{text(get_nested(record, "bathtime_context.ritual_angle"))}

## 확인이 필요한 정보

{bullet_list(editorial.get("missing_or_uncertain_info"))}

## 출처와 업데이트

이 글은 공개된 공식 정보, 예약/지도 정보, 후기 신호를 바탕으로 정리했습니다.
직접 방문 후기가 아닌 경우, 방문 전 가격과 이용 조건을 다시 확인하는 것을 권합니다.

업데이트: {last_updated_at}

### Sources

{chr(10).join(source_lines)}
"""
    return markdown


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("record_path", type=Path)
    parser.add_argument("--output", "-o", type=Path, default=Path("content_draft.md"))
    args = parser.parse_args()

    record = json.loads(args.record_path.read_text(encoding="utf-8"))
    markdown = render(record)
    args.output.write_text(markdown, encoding="utf-8")

    print(f"Wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())