#!/usr/bin/env python3
"""
Render a Bathtime spot archive record into SNS and distribution summaries.

Usage:
  python scripts/render_sns_summary.py archive_record.json
  python scripts/render_sns_summary.py archive_record.json --output sns_summary.md
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


def first_items(items: Any, limit: int = 3) -> list[str]:
    if not isinstance(items, list):
        return []
    return [str(item) for item in items[:limit]]


def label_external_access(value: str) -> str:
    labels = {
        "available": "외부인 이용 가능",
        "limited": "외부인 제한적 이용 가능",
        "guest_only": "투숙객 전용",
        "member_only": "회원 전용",
        "unavailable": "외부인 이용 불가",
        "unknown": "외부인 이용 여부 확인 필요",
    }
    return labels.get(value, "외부인 이용 여부 확인 필요")


def label_reservation(value: str) -> str:
    labels = {
        "required": "예약 필요",
        "recommended": "예약 권장",
        "not_required": "예약 불필요",
        "depends": "조건에 따라 다름",
        "unknown": "예약 필요 여부 확인 필요",
    }
    return labels.get(value, "예약 필요 여부 확인 필요")


def label_fit(value: str) -> str:
    labels = {
        "high": "혼자 가기 좋아 보임",
        "medium": "혼자 가기 무난해 보임",
        "low": "혼자 가기엔 애매할 수 있음",
        "unknown": "혼자 이용 적합도 확인 필요",
    }
    return labels.get(value, "혼자 이용 적합도 확인 필요")


def make_location(record: dict[str, Any]) -> str:
    city = get_nested(record, "location.city", "")
    district = get_nested(record, "location.district", "")
    neighborhood = get_nested(record, "location.neighborhood", "")
    parts = [part for part in [city, district, neighborhood] if part]
    return " ".join(parts) if parts else "위치 확인 필요"


def make_hook(record: dict[str, Any]) -> str:
    name = text(record.get("name_ko"), "이 스팟")
    location = make_location(record)
    return f"{location}에서 씻고 쉬는 시간을 찾고 있다면, {name}을 정리해봤습니다."


def render(record: dict[str, Any]) -> str:
    name = text(record.get("name_ko"), "이 스팟")
    location = make_location(record)
    short_summary = text(record.get("short_summary"))
    editorial_note = text(record.get("one_line_editorial_note"))

    external_access = label_external_access(
        get_nested(record, "access_conditions.external_user_access_status", "unknown")
    )
    reservation = label_reservation(
        get_nested(record, "access_conditions.reservation_required", "unknown")
    )
    price = text(get_nested(record, "price.price_summary"))
    solo_fit = label_fit(get_nested(record, "experience_fit.solo_fit", "unknown"))
    privacy = text(get_nested(record, "experience_fit.privacy_level"))
    facilities = text(get_nested(record, "facilities.facility_types"))

    editorial = record.get("editorial", {})
    good_points = first_items(editorial.get("good_points"))
    weak_points = first_items(editorial.get("weak_points"))
    check_items = first_items(
        get_nested(record, "bathtime_context.things_to_check_before_visit", [])
    )

    good_text = " / ".join(good_points) if good_points else "좋아 보이는 점 확인 필요"
    weak_text = " / ".join(weak_points) if weak_points else "아쉬운 점 확인 필요"
    check_text = " / ".join(check_items) if check_items else "방문 전 가격과 이용 조건 확인"

    app_card = f"{short_summary} 방문 전에는 {external_access}, {price}, {reservation}를 다시 확인하는 것이 좋습니다."

    threads_post = (
        f"{name}을 배스타임 기준으로 정리해봤습니다.\n\n"
        f"- 위치: {location}\n"
        f"- 이용: {external_access}\n"
        f"- 가격: {price}\n"
        f"- 예약: {reservation}\n"
        f"- 혼자 이용: {solo_fit}\n\n"
        f"좋아 보이는 점은 {good_text}. "
        f"다만 {check_text}은 방문 전 확인이 필요합니다."
    )

    newsletter = (
        f"이번에는 {location}의 {name}을 찾아봤습니다. "
        f"{editorial_note} "
        f"외부인 이용 가능 여부와 가격, 예약 조건처럼 실제 방문 전에 필요한 정보를 중심으로 정리했습니다."
    )

    seo_title = f"{name} 방문 전 확인할 것 | {location} 바스타임 스팟"
    meta_description = (
        f"{name}의 외부인 이용 가능 여부, 가격대, 예약 필요 여부, 시설 구성, "
        f"혼자 이용 적합도를 배스타임 기준으로 정리했습니다."
    )

    markdown = f"""# App Card

{app_card}

# Instagram Carousel

1. {make_hook(record)}
2. 외부인 이용 가능 여부: {external_access}
3. 가격/예약: {price} / {reservation}
4. 위치: {location}
5. 혼자 이용: {solo_fit}
6. 프라이빗 여부: {privacy}
7. 시설 종류: {facilities}
8. 좋아 보이는 점: {good_text}
9. 아쉬울 수 있는 점: {weak_text}
10. 방문 전 확인할 것: {check_text}

# Threads / X

{threads_post}

# Newsletter

{newsletter}

# SEO

Title: {seo_title}

Meta description: {meta_description}
"""
    return markdown


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("record_path", type=Path)
    parser.add_argument("--output", "-o", type=Path, default=Path("sns_summary.md"))
    args = parser.parse_args()

    record = json.loads(args.record_path.read_text(encoding="utf-8"))
    markdown = render(record)
    args.output.write_text(markdown, encoding="utf-8")

    print(f"Wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())