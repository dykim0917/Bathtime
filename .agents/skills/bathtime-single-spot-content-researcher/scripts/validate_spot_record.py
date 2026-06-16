#!/usr/bin/env python3
"""
Validate a Bathtime spot archive record.

Usage:
  python scripts/validate_spot_record.py archive_record.json
  python scripts/validate_spot_record.py archive_record.json --strict

Exit codes:
  0 = valid enough
  1 = validation failed
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


ALLOWED_SPOT_TYPES = {
    "sauna",
    "hotel_sauna",
    "jjimjilbang",
    "public_bath",
    "spa",
    "private_spa",
    "hot_spring",
    "wellness_space",
    "bath_accommodation",
    "jacuzzi_stay",
    "pool_villa",
    "foot_bath",
    "other",
}

ALLOWED_EXTERNAL_ACCESS = {
    "available",
    "limited",
    "guest_only",
    "member_only",
    "unavailable",
    "unknown",
}

ALLOWED_RESERVATION = {
    "required",
    "recommended",
    "not_required",
    "depends",
    "unknown",
}

ALLOWED_PRIVACY = {
    "public",
    "semi_private",
    "private",
    "mixed",
    "unknown",
}

ALLOWED_FIT = {
    "high",
    "medium",
    "low",
    "unknown",
}

ALLOWED_CONFIDENCE = {
    "high",
    "medium",
    "low",
    "unknown",
}

BANNED_CLAIMS = [
    "치료",
    "효능",
    "완치",
    "수면 개선",
    "혈액순환 개선",
    "회복 보장",
    "다이어트",
    "불면증 개선",
    "의학적",
]

REQUIRED_TOP_LEVEL_FIELDS = [
    "spot_id",
    "name_ko",
    "spot_type",
    "status",
    "short_summary",
    "location",
    "access_conditions",
    "price",
    "operating_info",
    "facilities",
    "experience_fit",
    "bathtime_context",
    "editorial",
    "sources",
    "last_researched_at",
    "last_updated_at",
    "confidence_overall",
]

REQUIRED_LOCATION_FIELDS = [
    "country",
    "city",
    "district",
    "address",
    "map_urls",
]

REQUIRED_ACCESS_FIELDS = [
    "external_user_access_status",
    "external_user_access_condition",
    "reservation_required",
    "reservation_method",
    "official_booking_url",
]

REQUIRED_PRICE_FIELDS = [
    "price_summary",
    "price_min",
    "price_max",
    "currency",
    "price_basis",
    "price_confidence",
]

REQUIRED_EXPERIENCE_FIELDS = [
    "solo_fit",
    "couple_fit",
    "privacy_level",
    "beginner_friendliness",
]

REQUIRED_EDITORIAL_FIELDS = [
    "good_points",
    "weak_points",
    "fit_for",
    "not_fit_for",
    "missing_or_uncertain_info",
    "update_needed_items",
]


def get_nested(data: dict[str, Any], path: str) -> Any:
    current: Any = data
    for part in path.split("."):
        if not isinstance(current, dict):
            return None
        current = current.get(part)
    return current


def is_blank(value: Any) -> bool:
    return value is None or value == "" or value == [] or value == {}


def collect_text(data: Any) -> str:
    if isinstance(data, dict):
        return " ".join(collect_text(v) for v in data.values())
    if isinstance(data, list):
        return " ".join(collect_text(v) for v in data)
    if isinstance(data, str):
        return data
    return ""


def validate_required_fields(record: dict[str, Any], errors: list[str]) -> None:
    for field in REQUIRED_TOP_LEVEL_FIELDS:
        if field not in record:
            errors.append(f"Missing top-level field: {field}")

    for field in REQUIRED_LOCATION_FIELDS:
        if field not in record.get("location", {}):
            errors.append(f"Missing location field: location.{field}")

    for field in REQUIRED_ACCESS_FIELDS:
        if field not in record.get("access_conditions", {}):
            errors.append(f"Missing access field: access_conditions.{field}")

    for field in REQUIRED_PRICE_FIELDS:
        if field not in record.get("price", {}):
            errors.append(f"Missing price field: price.{field}")

    for field in REQUIRED_EXPERIENCE_FIELDS:
        if field not in record.get("experience_fit", {}):
            errors.append(f"Missing experience field: experience_fit.{field}")

    for field in REQUIRED_EDITORIAL_FIELDS:
        if field not in record.get("editorial", {}):
            errors.append(f"Missing editorial field: editorial.{field}")


def validate_allowed_values(record: dict[str, Any], errors: list[str]) -> None:
    spot_type = record.get("spot_type")
    if spot_type not in ALLOWED_SPOT_TYPES:
        errors.append(f"Invalid spot_type: {spot_type}")

    external_access = get_nested(record, "access_conditions.external_user_access_status")
    if external_access not in ALLOWED_EXTERNAL_ACCESS:
        errors.append(f"Invalid external_user_access_status: {external_access}")

    reservation = get_nested(record, "access_conditions.reservation_required")
    if reservation not in ALLOWED_RESERVATION:
        errors.append(f"Invalid reservation_required: {reservation}")

    privacy = get_nested(record, "experience_fit.privacy_level")
    if privacy not in ALLOWED_PRIVACY:
        errors.append(f"Invalid privacy_level: {privacy}")

    for field in ["solo_fit", "couple_fit", "friend_group_fit", "beginner_friendliness"]:
        value = get_nested(record, f"experience_fit.{field}")
        if value is not None and value not in ALLOWED_FIT:
            errors.append(f"Invalid {field}: {value}")

    for path in [
        "price.price_confidence",
        "operating_info.operating_info_confidence",
        "confidence_overall",
    ]:
        value = get_nested(record, path)
        if value is not None and value not in ALLOWED_CONFIDENCE:
            errors.append(f"Invalid {path}: {value}")


def validate_quality_gates(record: dict[str, Any], warnings: list[str]) -> None:
    if get_nested(record, "access_conditions.external_user_access_status") == "unknown":
        warnings.append("External user access is unknown. Human confirmation is needed.")

    if is_blank(get_nested(record, "price.price_summary")):
        warnings.append("Price summary is missing or blank.")

    if get_nested(record, "price.price_confidence") in {"low", "unknown"}:
        warnings.append("Price confidence is low or unknown.")

    if get_nested(record, "access_conditions.reservation_required") == "unknown":
        warnings.append("Reservation requirement is unknown.")

    if is_blank(get_nested(record, "location.address")) and is_blank(get_nested(record, "location.map_urls")):
        warnings.append("Address and map URLs are both missing.")

    sources = record.get("sources", [])
    if not isinstance(sources, list) or len(sources) == 0:
        warnings.append("No sources are attached.")

    editorial = record.get("editorial", {})
    if is_blank(editorial.get("good_points")):
        warnings.append("editorial.good_points is empty.")

    if is_blank(editorial.get("weak_points")):
        warnings.append("editorial.weak_points is empty.")

    if is_blank(record.get("last_updated_at")):
        warnings.append("last_updated_at is missing.")


def validate_banned_claims(record: dict[str, Any], errors: list[str]) -> None:
    text = collect_text(record)
    for phrase in BANNED_CLAIMS:
        if phrase in text:
            errors.append(f"Banned or risky claim found: {phrase}")


def validate_sources(record: dict[str, Any], warnings: list[str]) -> None:
    sources = record.get("sources", [])
    if not isinstance(sources, list):
        warnings.append("sources must be a list.")
        return

    for index, source in enumerate(sources):
        if not isinstance(source, dict):
            warnings.append(f"Source #{index + 1} is not an object.")
            continue

        if is_blank(source.get("title")):
            warnings.append(f"Source #{index + 1} is missing title.")

        url = source.get("url", "")
        if is_blank(url):
            warnings.append(f"Source #{index + 1} is missing url.")
        elif not re.match(r"^https?://", url):
            warnings.append(f"Source #{index + 1} url does not look valid: {url}")

        if is_blank(source.get("source_type")):
            warnings.append(f"Source #{index + 1} is missing source_type.")

        if is_blank(source.get("supports")):
            warnings.append(f"Source #{index + 1} is missing supports.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("record_path", type=Path)
    parser.add_argument("--strict", action="store_true", help="Treat warnings as failures.")
    args = parser.parse_args()

    if not args.record_path.exists():
        print(f"ERROR: File not found: {args.record_path}", file=sys.stderr)
        return 1

    try:
        record = json.loads(args.record_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"ERROR: Invalid JSON: {exc}", file=sys.stderr)
        return 1

    if not isinstance(record, dict):
        print("ERROR: Root JSON must be an object.", file=sys.stderr)
        return 1

    errors: list[str] = []
    warnings: list[str] = []

    validate_required_fields(record, errors)
    validate_allowed_values(record, errors)
    validate_quality_gates(record, warnings)
    validate_banned_claims(record, errors)
    validate_sources(record, warnings)

    if errors:
        print("Validation errors:")
        for error in errors:
            print(f"- {error}")

    if warnings:
        print("Validation warnings:")
        for warning in warnings:
            print(f"- {warning}")

    if errors or (args.strict and warnings):
        return 1

    print("Spot record validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())