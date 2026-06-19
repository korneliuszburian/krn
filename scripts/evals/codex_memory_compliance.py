#!/usr/bin/env python3
"""Run KRN's Codex memory-compliance eval module.

The live mode is intentionally black-box: it calls `codex exec` with neutral
prompts and checks whether the final answer shows that repo-local instructions
and memory conventions were followed without being restated in the prompt.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
MODULE_ID = "codex-memory-compliance"
MODULE_DIR = ROOT / "docs" / "evals" / MODULE_ID
DEFAULT_CASES = MODULE_DIR / "cases.json"
RESULT_ROOT = ROOT / ".krn" / "evals" / MODULE_ID


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def run_id() -> str:
    timestamp = (
        dt.datetime.now(dt.timezone.utc)
        .isoformat(timespec="microseconds")
        .replace("+00:00", "Z")
        .replace(":", "")
        .replace("-", "")
        .replace(".", "")
    )
    return f"{timestamp}-{os.getpid()}"


def load_cases(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("module_id") != MODULE_ID:
        raise ValueError(f"Unexpected module_id in {path}: {data.get('module_id')!r}")
    cases = data.get("cases")
    if not isinstance(cases, list) or not cases:
        raise ValueError("cases.json must contain a non-empty cases list")
    for case in cases:
        validate_case(case)
    return data


def validate_case(case: dict[str, Any]) -> None:
    required = ["id", "prompt", "expected_behavior", "source_patterns", "assertions", "metrics", "failure_mode"]
    missing = [key for key in required if key not in case]
    if missing:
        raise ValueError(f"Case {case.get('id', '<unknown>')} missing keys: {', '.join(missing)}")
    if not case["id"] or " " in case["id"]:
        raise ValueError(f"Case id must be stable kebab/snake format: {case['id']!r}")
    if "docs/memory" in case["prompt"].lower() or "agents.md" in case["prompt"].lower():
        raise ValueError(f"Case {case['id']} prompt must stay neutral; do not name AGENTS.md or docs/memory")
    if not isinstance(case["assertions"], list) or not case["assertions"]:
        raise ValueError(f"Case {case['id']} must define assertions")
    if not isinstance(case["metrics"], list) or not case["metrics"]:
        raise ValueError(f"Case {case['id']} must define metrics")
    known_metrics = set(case["metrics"])
    for assertion in case["assertions"]:
        if assertion.get("type") not in {"contains_any", "contains_all", "not_contains_any"}:
            raise ValueError(f"Case {case['id']} has unsupported assertion type: {assertion.get('type')!r}")
        if not assertion.get("id") or not assertion.get("values"):
            raise ValueError(f"Case {case['id']} assertion needs id and values")
        metric = assertion.get("metric")
        if not metric:
            raise ValueError(f"Case {case['id']} assertion {assertion.get('id', '<unknown>')} needs metric")
        if metric not in known_metrics:
            raise ValueError(
                f"Case {case['id']} assertion {assertion['id']} metric {metric!r} is not listed in case metrics"
            )


def evaluate_assertion(text: str, assertion: dict[str, Any]) -> dict[str, Any]:
    haystack = text.lower()
    values = [str(value) for value in assertion["values"]]
    lowered = [value.lower() for value in values]
    assertion_type = assertion["type"]

    if assertion_type == "contains_any":
        matched = [values[index] for index, value in enumerate(lowered) if value in haystack]
        passed = bool(matched)
    elif assertion_type == "contains_all":
        matched = [values[index] for index, value in enumerate(lowered) if value in haystack]
        passed = len(matched) == len(values)
    elif assertion_type == "not_contains_any":
        matched = [values[index] for index, value in enumerate(lowered) if value in haystack]
        passed = not matched
    else:
        raise ValueError(f"Unsupported assertion type: {assertion_type}")

    return {
        "id": assertion["id"],
        "type": assertion_type,
        "metric": assertion["metric"],
        "passed": passed,
        "matched": matched,
        "values": values,
    }


def evaluate_case_text(case: dict[str, Any], text: str) -> dict[str, Any]:
    assertions = [evaluate_assertion(text, assertion) for assertion in case["assertions"]]
    passed = sum(1 for assertion in assertions if assertion["passed"])
    total = len(assertions)
    return {
        "id": case["id"],
        "passed": passed == total,
        "metrics": case["metrics"],
        "assertion_summary": {
            "total": total,
            "passed": passed,
            "failed": total - passed,
            "pass_rate": passed / total if total else 0.0,
        },
        "assertions": assertions,
    }


def select_cases(data: dict[str, Any], case_id: str | None) -> list[dict[str, Any]]:
    cases = data["cases"]
    if case_id is None:
        return cases
    selected = [case for case in cases if case["id"] == case_id]
    if not selected:
        known = ", ".join(case["id"] for case in cases)
        raise ValueError(f"Unknown case {case_id!r}. Known cases: {known}")
    return selected


def run_codex_case(case: dict[str, Any], out_dir: Path, timeout: int) -> str:
    final_path = out_dir / f"{case['id']}.final.md"
    jsonl_path = out_dir / f"{case['id']}.stdout.jsonl"
    stderr_path = out_dir / f"{case['id']}.stderr.txt"
    command_path = out_dir / f"{case['id']}.command.json"
    cmd = [
        "codex",
        "exec",
        "--skip-git-repo-check",
        "--sandbox",
        "read-only",
        "--json",
        "--output-last-message",
        str(final_path),
        case["prompt"],
    ]
    command_path.write_text(json.dumps({"cmd": cmd, "cwd": str(ROOT)}, indent=2) + "\n", encoding="utf-8")
    completed = subprocess.run(
        cmd,
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=timeout,
        check=False,
    )
    jsonl_path.write_text(completed.stdout, encoding="utf-8")
    stderr_path.write_text(completed.stderr, encoding="utf-8")
    if completed.returncode != 0:
        raise RuntimeError(f"codex exec failed for {case['id']} with exit code {completed.returncode}; see {stderr_path}")
    if not final_path.exists():
        raise RuntimeError(f"codex exec did not write final message for {case['id']}: {final_path}")
    return final_path.read_text(encoding="utf-8")


def aggregate_metrics(results: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    metrics: dict[str, dict[str, Any]] = {}
    for result in results:
        for metric in result.get("metrics", []):
            metrics.setdefault(metric, {"total": 0, "passed": 0, "failed": 0, "score": 0.0})
        for assertion in result.get("assertions", []):
            metric = assertion.get("metric")
            if not metric:
                continue
            bucket = metrics.setdefault(metric, {"total": 0, "passed": 0, "failed": 0, "score": 0.0})
            bucket["total"] += 1
            if assertion["passed"]:
                bucket["passed"] += 1
            else:
                bucket["failed"] += 1
    for bucket in metrics.values():
        bucket["score"] = bucket["passed"] / bucket["total"] if bucket["total"] else 0.0
    return dict(sorted(metrics.items()))


def build_report(mode: str, cases: list[dict[str, Any]], results: list[dict[str, Any]], run: str) -> dict[str, Any]:
    passed = sum(1 for result in results if result["passed"])
    total_assertions = sum(result.get("assertion_summary", {}).get("total", 0) for result in results)
    passed_assertions = sum(result.get("assertion_summary", {}).get("passed", 0) for result in results)
    failed_assertions = total_assertions - passed_assertions
    return {
        "module_id": MODULE_ID,
        "run_id": run,
        "mode": mode,
        "generated_at": utc_now(),
        "summary": {
            "total_cases": len(cases),
            "passed_cases": passed,
            "failed_cases": len(cases) - passed,
            "case_pass_rate": passed / len(cases) if cases else 0.0,
            "total_assertions": total_assertions,
            "passed_assertions": passed_assertions,
            "failed_assertions": failed_assertions,
            "assertion_pass_rate": passed_assertions / total_assertions if total_assertions else 0.0,
        },
        "metrics": aggregate_metrics(results),
        "cases": results,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Run Codex memory-compliance evals")
    parser.add_argument("--mode", choices=["validate", "live", "score-fixture"], default="validate")
    parser.add_argument("--cases", type=Path, default=DEFAULT_CASES)
    parser.add_argument("--case", dest="case_id")
    parser.add_argument("--fixture", type=Path, help="Final-message fixture for score-fixture mode")
    parser.add_argument("--timeout", type=int, default=900)
    args = parser.parse_args()

    data = load_cases(args.cases)
    cases = select_cases(data, args.case_id)
    run = run_id()
    out_dir = RESULT_ROOT / run
    out_dir.mkdir(parents=True, exist_ok=True)

    if args.mode == "validate":
        results = [
            {
                "id": case["id"],
                "passed": True,
                "metrics": case["metrics"],
                "assertion_summary": {
                    "total": 0,
                    "passed": 0,
                    "failed": 0,
                    "pass_rate": 0.0,
                },
                "assertions": [],
                "validated_only": True,
            }
            for case in cases
        ]
    elif args.mode == "score-fixture":
        if not args.fixture:
            raise ValueError("--fixture is required for score-fixture mode")
        if len(cases) != 1:
            raise ValueError("--case is required for score-fixture mode")
        text = args.fixture.read_text(encoding="utf-8")
        results = [evaluate_case_text(cases[0], text)]
    else:
        results = []
        for case in cases:
            text = run_codex_case(case, out_dir, args.timeout)
            results.append(evaluate_case_text(case, text))

    report = build_report(args.mode, cases, results, run)
    report_path = out_dir / "report.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], indent=2))
    print(f"report: {report_path}")
    return 0 if report["summary"]["failed_cases"] == 0 else 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(2)
