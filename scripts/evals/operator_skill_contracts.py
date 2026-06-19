#!/usr/bin/env python3
"""Validate KRN repo-local operator skill contracts."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
MODULE_ID = "operator-skill-contracts"
MODULE_DIR = ROOT / "docs" / "evals" / MODULE_ID
DEFAULT_CASES = MODULE_DIR / "cases.json"
RESULT_ROOT = ROOT / ".krn" / "evals" / MODULE_ID


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


def load_cases(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("module_id") != MODULE_ID:
        raise ValueError(f"Unexpected module_id in {path}: {data.get('module_id')!r}")
    if not data.get("skills"):
        raise ValueError("cases.json must define skills")
    return data


def parse_frontmatter(text: str) -> dict[str, str]:
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}
    raw = text[4:end].strip().splitlines()
    data: dict[str, str] = {}
    for line in raw:
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        data[key.strip()] = value.strip().strip('"').strip("'")
    return data


def assertion(assertions: list[dict[str, Any]], assertion_id: str, metric: str, passed: bool, detail: str) -> None:
    assertions.append(
        {
            "id": assertion_id,
            "metric": metric,
            "passed": passed,
            "detail": detail,
        }
    )


def validate_skill(skill: dict[str, Any], required_sections: list[str]) -> dict[str, Any]:
    skill_path = ROOT / skill["path"]
    metadata_path = ROOT / skill["metadata_path"]
    assertions: list[dict[str, Any]] = []

    text = skill_path.read_text(encoding="utf-8") if skill_path.exists() else ""
    metadata = metadata_path.read_text(encoding="utf-8") if metadata_path.exists() else ""
    frontmatter = parse_frontmatter(text)

    assertion(assertions, "skill_path_exists", "skill_contract_score", skill_path.exists(), skill["path"])
    assertion(assertions, "metadata_path_exists", "skill_contract_score", metadata_path.exists(), skill["metadata_path"])
    assertion(assertions, "repo_skill_path", "skill_contract_score", skill["path"].startswith(".agents/skills/"), skill["path"])
    assertion(assertions, "frontmatter_name", "skill_contract_score", frontmatter.get("name") == skill["id"], frontmatter.get("name", "missing"))

    description = frontmatter.get("description", "")
    assertion(assertions, "description_present", "trigger_clarity_score", len(description) >= 80, description[:120])
    assertion(assertions, "description_has_use_when", "trigger_clarity_score", "Use when" in description, description[:120])
    assertion(assertions, "description_no_todo", "trigger_clarity_score", "TODO" not in description, description[:120])

    for section in required_sections:
        assertion(assertions, f"section_{section[3:].lower().replace(' ', '_')}", "skill_contract_score", section in text, section)

    for phrase in skill.get("required_phrases", []):
        assertion(assertions, f"phrase_{re.sub(r'[^a-z0-9]+', '_', phrase.lower()).strip('_')}", "phase_boundary_score", phrase.lower() in text.lower(), phrase)

    assertion(assertions, "body_no_todo", "skill_contract_score", "TODO" not in text, "no TODO placeholders")
    assertion(assertions, "has_eval_case_id", "eval_binding_score", f"{skill['id']}-contract" in text, f"{skill['id']}-contract")
    assertion(assertions, "metadata_default_prompt", "trigger_clarity_score", f"${skill['id']}" in metadata, f"${skill['id']}")
    assertion(assertions, "metadata_no_todo", "trigger_clarity_score", "TODO" not in metadata, "no TODO placeholders")

    passed_count = sum(1 for item in assertions if item["passed"])
    total = len(assertions)
    return {
        "id": skill["id"],
        "passed": passed_count == total,
        "failure_mode": skill.get("failure_mode", ""),
        "assertion_summary": {
            "total": total,
            "passed": passed_count,
            "failed": total - passed_count,
            "pass_rate": passed_count / total if total else 0.0,
        },
        "assertions": assertions,
    }


def aggregate_metrics(results: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    metrics: dict[str, dict[str, Any]] = {}
    for result in results:
        for item in result["assertions"]:
            metric = item["metric"]
            bucket = metrics.setdefault(metric, {"total": 0, "passed": 0, "failed": 0, "score": 0.0})
            bucket["total"] += 1
            if item["passed"]:
                bucket["passed"] += 1
            else:
                bucket["failed"] += 1
    for bucket in metrics.values():
        bucket["score"] = bucket["passed"] / bucket["total"] if bucket["total"] else 0.0
    return dict(sorted(metrics.items()))


def build_report(mode: str, results: list[dict[str, Any]], run: str) -> dict[str, Any]:
    passed = sum(1 for result in results if result["passed"])
    total_assertions = sum(result["assertion_summary"]["total"] for result in results)
    passed_assertions = sum(result["assertion_summary"]["passed"] for result in results)
    failed_assertions = total_assertions - passed_assertions
    return {
        "module_id": MODULE_ID,
        "run_id": run,
        "mode": mode,
        "generated_at": utc_now(),
        "summary": {
            "total_skills": len(results),
            "passed_skills": passed,
            "failed_skills": len(results) - passed,
            "skill_pass_rate": passed / len(results) if results else 0.0,
            "total_assertions": total_assertions,
            "passed_assertions": passed_assertions,
            "failed_assertions": failed_assertions,
            "assertion_pass_rate": passed_assertions / total_assertions if total_assertions else 0.0,
        },
        "metrics": aggregate_metrics(results),
        "skills": results,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate KRN operator skill contracts")
    parser.add_argument("--mode", choices=["validate"], default="validate")
    parser.add_argument("--cases", type=Path, default=DEFAULT_CASES)
    args = parser.parse_args()

    data = load_cases(args.cases)
    run = run_id()
    out_dir = RESULT_ROOT / run
    out_dir.mkdir(parents=True, exist_ok=True)

    results = [validate_skill(skill, data["required_sections"]) for skill in data["skills"]]
    report = build_report(args.mode, results, run)
    report_path = out_dir / "report.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], indent=2))
    print(f"report: {report_path}")
    return 0 if report["summary"]["failed_skills"] == 0 else 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(2)
