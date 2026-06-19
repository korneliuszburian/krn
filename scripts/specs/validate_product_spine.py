#!/usr/bin/env python3
"""Validate product-spine schemas, examples, and known-bad fixtures."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
SPEC_ID = "product-spine"
SPEC_DIR = ROOT / "docs" / "specs" / SPEC_ID
SCHEMA_DIR = SPEC_DIR / "objects"
EXAMPLE_DIR = SPEC_DIR / "examples"
FIXTURE_DIR = SPEC_DIR / "fixtures"
RESULT_ROOT = ROOT / ".krn" / "specs" / SPEC_ID


class ValidationError(Exception):
    pass


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def run_id() -> str:
    stamp = (
        dt.datetime.now(dt.timezone.utc)
        .isoformat(timespec="microseconds")
        .replace("+00:00", "Z")
        .replace(":", "")
        .replace("-", "")
        .replace(".", "")
    )
    return f"{stamp}-{os.getpid()}"


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValidationError(f"{path}: invalid JSON: {exc}") from exc


def json_type(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, int) and not isinstance(value, bool):
        return "integer"
    if isinstance(value, float):
        return "number"
    if isinstance(value, str):
        return "string"
    if isinstance(value, list):
        return "array"
    if isinstance(value, dict):
        return "object"
    return type(value).__name__


def type_matches(value: Any, expected: str | list[str]) -> bool:
    expected_types = expected if isinstance(expected, list) else [expected]
    actual = json_type(value)
    if actual == "integer" and "number" in expected_types:
        return True
    return actual in expected_types


def validate_value(value: Any, schema: dict[str, Any], path: str) -> list[str]:
    errors: list[str] = []
    expected_type = schema.get("type")
    if expected_type is not None and not type_matches(value, expected_type):
        return [f"{path}: expected {expected_type}, got {json_type(value)}"]

    if "enum" in schema and value not in schema["enum"]:
        errors.append(f"{path}: value {value!r} not in enum {schema['enum']!r}")

    value_type = json_type(value)
    if value_type == "object":
        errors.extend(validate_object(value, schema, path))
    elif value_type == "array":
        errors.extend(validate_array(value, schema, path))
    return errors


def validate_object(value: dict[str, Any], schema: dict[str, Any], path: str) -> list[str]:
    errors: list[str] = []
    required = schema.get("required", [])
    properties = schema.get("properties", {})
    for key in required:
        if key not in value:
            errors.append(f"{path}.{key}: required field missing")
    if schema.get("additionalProperties") is False:
        for key in value:
            if key not in properties:
                errors.append(f"{path}.{key}: additional property is not allowed")
    for key, subschema in properties.items():
        if key in value:
            errors.extend(validate_value(value[key], subschema, f"{path}.{key}"))
    return errors


def validate_array(value: list[Any], schema: dict[str, Any], path: str) -> list[str]:
    errors: list[str] = []
    min_items = schema.get("minItems")
    if min_items is not None and len(value) < min_items:
        errors.append(f"{path}: expected at least {min_items} item(s), got {len(value)}")
    item_schema = schema.get("items")
    if item_schema:
        for index, item in enumerate(value):
            errors.extend(validate_value(item, item_schema, f"{path}[{index}]"))
    return errors


def validate_schema_shape(path: Path, schema: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
        errors.append(f"{path}: missing or unsupported $schema")
    if schema.get("type") != "object":
        errors.append(f"{path}: root type must be object")
    if not schema.get("title"):
        errors.append(f"{path}: missing title")
    if not isinstance(schema.get("properties"), dict):
        errors.append(f"{path}: missing properties object")
    for key in ["schema_version", "id", "kind", "status", "created_at", "source_refs"]:
        if key not in schema.get("required", []):
            errors.append(f"{path}: required must include {key}")
    return errors


def schema_name_from_example(path: Path) -> str:
    name = path.name
    if name.startswith("bad-"):
        name = name[len("bad-") :]
    if not name.endswith(".example.json"):
        raise ValidationError(f"{path}: expected *.example.json")
    return name[: -len(".example.json")]


def validate_source_refs_exist(document: dict[str, Any], path: Path) -> list[str]:
    errors: list[str] = []
    refs = document.get("source_refs", [])
    if not isinstance(refs, list):
        return errors
    for ref in refs:
        if not isinstance(ref, str):
            continue
        if ref.startswith("http://") or ref.startswith("https://"):
            continue
        if not (ROOT / ref).exists():
            errors.append(f"{path}: source_ref does not exist: {ref}")
    return errors


def validate_no_raw_private_data(document: Any, path: Path) -> list[str]:
    serialized = json.dumps(document, ensure_ascii=False).lower()
    forbidden = ["api_key", "secret_key", "private_key", "password", "raw transcript"]
    return [f"{path}: forbidden private/raw marker found: {marker}" for marker in forbidden if marker in serialized]


def load_schemas() -> dict[str, dict[str, Any]]:
    schemas: dict[str, dict[str, Any]] = {}
    for path in sorted(SCHEMA_DIR.glob("*.schema.json")):
        schemas[path.name[: -len(".schema.json")]] = load_json(path)
    if not schemas:
        raise ValidationError(f"No schemas found in {SCHEMA_DIR}")
    return schemas


def evaluate_document(path: Path, schema: dict[str, Any]) -> dict[str, Any]:
    document = load_json(path)
    errors = validate_value(document, schema, "$")
    errors.extend(validate_source_refs_exist(document, path))
    errors.extend(validate_no_raw_private_data(document, path))
    return {
        "path": str(path.relative_to(ROOT)),
        "passed": not errors,
        "errors": errors,
    }


def validate_all() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    schemas = load_schemas()

    schema_results: list[dict[str, Any]] = []
    for name, schema in schemas.items():
        path = SCHEMA_DIR / f"{name}.schema.json"
        errors = validate_schema_shape(path, schema)
        schema_results.append({
            "path": str(path.relative_to(ROOT)),
            "passed": not errors,
            "errors": errors,
        })

    example_results: list[dict[str, Any]] = []
    for path in sorted(EXAMPLE_DIR.glob("*.example.json")):
        schema_name = schema_name_from_example(path)
        schema = schemas.get(schema_name)
        if not schema:
            example_results.append({
                "path": str(path.relative_to(ROOT)),
                "passed": False,
                "errors": [f"missing schema {schema_name}.schema.json"],
            })
            continue
        example_results.append(evaluate_document(path, schema))

    bad_results: list[dict[str, Any]] = []
    for path in sorted(FIXTURE_DIR.glob("bad-*.example.json")):
        schema_name = schema_name_from_example(path)
        schema = schemas.get(schema_name)
        if not schema:
            bad_results.append({
                "path": str(path.relative_to(ROOT)),
                "passed": False,
                "expected_failure": True,
                "errors": [f"missing schema {schema_name}.schema.json"],
            })
            continue
        result = evaluate_document(path, schema)
        bad_results.append({
            **result,
            "expected_failure": True,
            "passed": not result["passed"],
            "errors": result["errors"],
        })

    if not bad_results:
        bad_results.append({
            "path": str(FIXTURE_DIR.relative_to(ROOT)),
            "passed": False,
            "expected_failure": True,
            "errors": ["at least one known-bad fixture is required"],
        })

    return schema_results, example_results, bad_results


def summarize(groups: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    total = sum(len(items) for items in groups.values())
    passed = sum(1 for items in groups.values() for item in items if item["passed"])
    failed = total - passed
    return {
        "total_checks": total,
        "passed_checks": passed,
        "failed_checks": failed,
        "check_pass_rate": passed / total if total else 0.0,
        "schema_count": len(groups["schemas"]),
        "example_count": len(groups["examples"]),
        "known_bad_count": len(groups["known_bad"]),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate KRN product-spine contracts")
    parser.add_argument("--mode", choices=["validate"], default="validate")
    args = parser.parse_args()

    run = run_id()
    out_dir = RESULT_ROOT / run
    out_dir.mkdir(parents=True, exist_ok=True)

    schema_results, example_results, bad_results = validate_all()
    groups = {
        "schemas": schema_results,
        "examples": example_results,
        "known_bad": bad_results,
    }
    report = {
        "spec_id": SPEC_ID,
        "run_id": run,
        "mode": args.mode,
        "generated_at": utc_now(),
        "summary": summarize(groups),
        "groups": groups,
    }
    report_path = out_dir / "report.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], indent=2))
    print(f"report: {report_path}")
    return 0 if report["summary"]["failed_checks"] == 0 else 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}")
        raise SystemExit(2)
