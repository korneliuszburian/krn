#!/usr/bin/env python3
"""Compare neutral Codex runs with explicit KRN operator-skill runs."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import subprocess
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
MODULE_ID = "operator-skill-impact"
MODULE_DIR = ROOT / "docs" / "evals" / MODULE_ID
DEFAULT_CASES = MODULE_DIR / "cases.json"
RESULT_ROOT = ROOT / ".krn" / "evals" / MODULE_ID
REQUIRED_VARIANTS = ("baseline", "explicit")
ALL_VARIANTS = ("baseline", "explicit", "routing")


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
    known_metrics = set(data.get("metrics", []))
    if not known_metrics:
        raise ValueError("cases.json must define top-level metrics")
    for case in cases:
        validate_case(case, known_metrics)
    return data


def validate_case(case: dict[str, Any], known_metrics: set[str]) -> None:
    required = [
        "id",
        "target_skill",
        "expected_behavior",
        "source_patterns",
        "metrics",
        "variants",
        "assertions",
        "failure_mode",
    ]
    missing = [key for key in required if key not in case]
    if missing:
        raise ValueError(f"Case {case.get('id', '<unknown>')} missing keys: {', '.join(missing)}")
    if not case["id"] or " " in case["id"]:
        raise ValueError(f"Case id must be stable kebab/snake format: {case['id']!r}")
    if not case["target_skill"]:
        raise ValueError(f"Case {case['id']} must define target_skill")
    case_metrics = set(case["metrics"])
    unknown = sorted(case_metrics - known_metrics)
    if unknown:
        raise ValueError(f"Case {case['id']} uses unknown metrics: {', '.join(unknown)}")

    variants = case["variants"]
    if not isinstance(variants, dict):
        raise ValueError(f"Case {case['id']} variants must be an object")
    for variant in REQUIRED_VARIANTS:
        if not variants.get(variant):
            raise ValueError(f"Case {case['id']} must define {variant} prompt")
    if "$" in variants["baseline"]:
        raise ValueError(f"Case {case['id']} baseline prompt must not explicitly invoke a skill")
    explicit_marker = f"${case['target_skill']}"
    if explicit_marker not in variants["explicit"]:
        raise ValueError(f"Case {case['id']} explicit prompt must invoke {explicit_marker}")

    assertions = case["assertions"]
    if not isinstance(assertions, list) or not assertions:
        raise ValueError(f"Case {case['id']} must define assertions")
    for assertion in assertions:
        assertion_type = assertion.get("type")
        if assertion_type not in {"contains_any", "contains_all", "not_contains_any", "word_count_at_most"}:
            raise ValueError(f"Case {case['id']} has unsupported assertion type: {assertion_type!r}")
        if not assertion.get("id"):
            raise ValueError(f"Case {case['id']} assertion needs id")
        metric = assertion.get("metric")
        if metric not in case_metrics:
            raise ValueError(
                f"Case {case['id']} assertion {assertion['id']} metric {metric!r} is not listed in case metrics"
            )
        if assertion_type == "word_count_at_most":
            if not isinstance(assertion.get("max_words"), int) or assertion["max_words"] <= 0:
                raise ValueError(f"Case {case['id']} assertion {assertion['id']} needs positive max_words")
        elif not assertion.get("values"):
            raise ValueError(f"Case {case['id']} assertion {assertion['id']} needs values")


def select_cases(data: dict[str, Any], case_id: str | None) -> list[dict[str, Any]]:
    cases = data["cases"]
    if case_id is None:
        return cases
    selected = [case for case in cases if case["id"] == case_id]
    if not selected:
        known = ", ".join(case["id"] for case in cases)
        raise ValueError(f"Unknown case {case_id!r}. Known cases: {known}")
    return selected


def selected_variants(variant: str) -> tuple[str, ...]:
    if variant == "required":
        return REQUIRED_VARIANTS
    if variant == "all":
        return ALL_VARIANTS
    return (variant,)


def word_count(text: str) -> int:
    return len(re.findall(r"\S+", text))


def evaluate_assertion(text: str, assertion: dict[str, Any]) -> dict[str, Any]:
    assertion_type = assertion["type"]
    if assertion_type == "word_count_at_most":
        count = word_count(text)
        max_words = assertion["max_words"]
        return {
            "id": assertion["id"],
            "type": assertion_type,
            "metric": assertion["metric"],
            "passed": count <= max_words,
            "word_count": count,
            "max_words": max_words,
        }

    haystack = text.lower()
    values = [str(value) for value in assertion["values"]]
    lowered = [value.lower() for value in values]

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


def metric_scores(assertions: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    metrics: dict[str, dict[str, Any]] = {}
    for assertion in assertions:
        metric = assertion["metric"]
        bucket = metrics.setdefault(metric, {"total": 0, "passed": 0, "failed": 0, "score": 0.0})
        bucket["total"] += 1
        if assertion["passed"]:
            bucket["passed"] += 1
        else:
            bucket["failed"] += 1
    for bucket in metrics.values():
        bucket["score"] = bucket["passed"] / bucket["total"] if bucket["total"] else 0.0
    return dict(sorted(metrics.items()))


def evaluate_text(case: dict[str, Any], variant: str, text: str, artifact: str | None = None) -> dict[str, Any]:
    assertions = [evaluate_assertion(text, assertion) for assertion in case["assertions"]]
    passed_count = sum(1 for assertion in assertions if assertion["passed"])
    total = len(assertions)
    return {
        "variant": variant,
        "status": "completed",
        "blocked": False,
        "passed": passed_count == total,
        "artifact": artifact,
        "assertion_summary": {
            "total": total,
            "passed": passed_count,
            "failed": total - passed_count,
            "pass_rate": passed_count / total if total else 0.0,
        },
        "metrics": metric_scores(assertions),
        "assertions": assertions,
    }


def blocked_variant(variant: str, reason: str, artifact: str | None = None) -> dict[str, Any]:
    return {
        "variant": variant,
        "status": "blocked",
        "blocked": True,
        "passed": False,
        "artifact": artifact,
        "blocker": reason,
        "assertion_summary": {
            "total": 0,
            "passed": 0,
            "failed": 0,
            "pass_rate": 0.0,
        },
        "metrics": {},
        "assertions": [],
    }


def run_codex_prompt(case: dict[str, Any], variant: str, out_dir: Path, timeout: int) -> dict[str, Any]:
    prompt = case["variants"].get(variant)
    if not prompt:
        return blocked_variant(variant, f"case does not define {variant} prompt")

    stem = f"{case['id']}--{variant}"
    final_path = out_dir / f"{stem}.final.md"
    jsonl_path = out_dir / f"{stem}.stdout.jsonl"
    stderr_path = out_dir / f"{stem}.stderr.txt"
    command_path = out_dir / f"{stem}.command.json"
    cmd = [
        "codex",
        "exec",
        "--skip-git-repo-check",
        "--sandbox",
        "read-only",
        "--json",
        "--output-last-message",
        str(final_path),
        prompt,
    ]
    command_path.write_text(json.dumps({"cmd": cmd, "cwd": str(ROOT)}, indent=2) + "\n", encoding="utf-8")
    try:
        completed = subprocess.run(
            cmd,
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        jsonl_path.write_text(exc.stdout or "", encoding="utf-8")
        stderr_path.write_text(exc.stderr or "", encoding="utf-8")
        return blocked_variant(variant, f"codex exec timed out after {timeout}s", str(final_path))

    jsonl_path.write_text(completed.stdout, encoding="utf-8")
    stderr_path.write_text(completed.stderr, encoding="utf-8")
    if completed.returncode != 0:
        return blocked_variant(
            variant,
            f"codex exec exited {completed.returncode}; see {stderr_path.relative_to(ROOT)}",
            str(final_path),
        )
    if not final_path.exists():
        return blocked_variant(variant, f"codex exec did not write {final_path.relative_to(ROOT)}", str(final_path))
    text = final_path.read_text(encoding="utf-8")
    result = evaluate_text(case, variant, text, str(final_path.relative_to(ROOT)))
    result["stdout_jsonl"] = str(jsonl_path.relative_to(ROOT))
    result["stderr"] = str(stderr_path.relative_to(ROOT))
    return result


def build_validate_case(case: dict[str, Any], variants: tuple[str, ...]) -> dict[str, Any]:
    results = {
        variant: {
            "variant": variant,
            "status": "validated_only",
            "blocked": False,
            "passed": True,
            "assertion_summary": {
                "total": 0,
                "passed": 0,
                "failed": 0,
                "pass_rate": 0.0,
            },
            "metrics": {},
            "assertions": [],
        }
        for variant in variants
    }
    return build_case_result(case, results)


def score_of(result: dict[str, Any] | None) -> float:
    if not result or result.get("blocked"):
        return 0.0
    return float(result.get("assertion_summary", {}).get("pass_rate", 0.0))


def compare_case(variants: dict[str, dict[str, Any]]) -> dict[str, Any]:
    baseline = variants.get("baseline")
    explicit = variants.get("explicit")
    baseline_score = score_of(baseline)
    explicit_score = score_of(explicit)
    metric_deltas: dict[str, float] = {}

    if baseline and explicit:
        metrics = sorted(set(baseline.get("metrics", {})) | set(explicit.get("metrics", {})))
        for metric in metrics:
            baseline_metric = baseline.get("metrics", {}).get(metric, {}).get("score", 0.0)
            explicit_metric = explicit.get("metrics", {}).get(metric, {}).get("score", 0.0)
            metric_deltas[metric] = round(float(explicit_metric) - float(baseline_metric), 4)

    if not baseline and explicit and not explicit.get("blocked"):
        recommendation = "fixture_passed" if explicit_score >= 0.95 else "fixture_failed"
    elif not explicit and baseline and not baseline.get("blocked"):
        recommendation = "fixture_passed" if baseline_score >= 0.95 else "fixture_failed"
    elif not baseline or baseline.get("blocked") or not explicit or explicit.get("blocked"):
        recommendation = "runner_blocked"
    elif explicit_score > baseline_score:
        recommendation = "keep"
    elif explicit_score >= 0.95 and baseline_score >= 0.95:
        recommendation = "keep_observe"
    elif explicit_score >= baseline_score:
        recommendation = "refine"
    else:
        recommendation = "refine_or_merge"

    return {
        "baseline_score": baseline_score,
        "explicit_score": explicit_score,
        "explicit_minus_baseline": round(explicit_score - baseline_score, 4),
        "metric_deltas": metric_deltas,
        "recommendation": recommendation,
    }


def build_case_result(case: dict[str, Any], variants: dict[str, dict[str, Any]]) -> dict[str, Any]:
    comparison = compare_case(variants)
    explicit = variants.get("explicit")
    required_complete = all(not variants.get(name, {}).get("blocked", True) for name in REQUIRED_VARIANTS)
    return {
        "id": case["id"],
        "target_skill": case["target_skill"],
        "expected_behavior": case["expected_behavior"],
        "failure_mode": case["failure_mode"],
        "source_patterns": case["source_patterns"],
        "passed": bool(required_complete and explicit and explicit.get("passed")),
        "required_variants_complete": required_complete,
        "variants": variants,
        "comparison": comparison,
    }


def aggregate_variant_metrics(cases: list[dict[str, Any]]) -> dict[str, dict[str, dict[str, Any]]]:
    metrics: dict[str, dict[str, dict[str, Any]]] = {}
    for case in cases:
        for variant_name, variant in case["variants"].items():
            variant_bucket = metrics.setdefault(variant_name, {})
            for metric, result in variant.get("metrics", {}).items():
                bucket = variant_bucket.setdefault(metric, {"total": 0, "passed": 0, "failed": 0, "score": 0.0})
                bucket["total"] += result["total"]
                bucket["passed"] += result["passed"]
                bucket["failed"] += result["failed"]
    for variant_bucket in metrics.values():
        for bucket in variant_bucket.values():
            bucket["score"] = bucket["passed"] / bucket["total"] if bucket["total"] else 0.0
    return {variant: dict(sorted(values.items())) for variant, values in sorted(metrics.items())}


def build_report(mode: str, cases: list[dict[str, Any]], run: str) -> dict[str, Any]:
    if mode == "score-fixture":
        completed_required = len(cases)
        blocked_required = 0
    else:
        completed_required = sum(1 for case in cases if case["required_variants_complete"])
        blocked_required = len(cases) - completed_required
    explicit_results = [case["variants"].get("explicit") for case in cases if "explicit" in case["variants"]]
    explicit_completed = [result for result in explicit_results if result and not result.get("blocked")]
    explicit_passed = sum(1 for result in explicit_completed if result.get("passed"))
    explicit_failed = len(explicit_completed) - explicit_passed

    assertion_totals = [
        variant.get("assertion_summary", {})
        for case in cases
        for variant in case["variants"].values()
        if not variant.get("blocked")
    ]
    total_assertions = sum(item.get("total", 0) for item in assertion_totals)
    passed_assertions = sum(item.get("passed", 0) for item in assertion_totals)
    failed_assertions = total_assertions - passed_assertions

    recommendations: dict[str, int] = {}
    for case in cases:
        recommendation = case["comparison"]["recommendation"]
        recommendations[recommendation] = recommendations.get(recommendation, 0) + 1

    return {
        "module_id": MODULE_ID,
        "run_id": run,
        "mode": mode,
        "generated_at": utc_now(),
        "summary": {
            "total_cases": len(cases),
            "completed_required_cases": completed_required,
            "blocked_required_cases": blocked_required,
            "explicit_passed_cases": explicit_passed,
            "explicit_failed_cases": explicit_failed,
            "required_completion_rate": completed_required / len(cases) if cases else 0.0,
            "explicit_case_pass_rate": explicit_passed / len(explicit_completed) if explicit_completed else 0.0,
            "total_assertions": total_assertions,
            "passed_assertions": passed_assertions,
            "failed_assertions": failed_assertions,
            "assertion_pass_rate": passed_assertions / total_assertions if total_assertions else 0.0,
            "recommendations": dict(sorted(recommendations.items())),
        },
        "metrics": aggregate_variant_metrics(cases),
        "cases": cases,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Run KRN operator-skill impact evals")
    parser.add_argument("--mode", choices=["validate", "live", "score-fixture", "score-artifacts"], default="validate")
    parser.add_argument("--cases", type=Path, default=DEFAULT_CASES)
    parser.add_argument("--case", dest="case_id")
    parser.add_argument("--variant", choices=["baseline", "explicit", "routing", "required", "all"], default="required")
    parser.add_argument("--fixture", type=Path, help="Final-message fixture for score-fixture mode")
    parser.add_argument("--baseline-fixture", type=Path, help="Baseline final message for score-artifacts mode")
    parser.add_argument("--explicit-fixture", type=Path, help="Explicit-skill final message for score-artifacts mode")
    parser.add_argument("--routing-fixture", type=Path, help="Routing final message for score-artifacts mode")
    parser.add_argument("--timeout", type=int, default=900)
    parser.add_argument("--fail-on-explicit-fail", action="store_true")
    args = parser.parse_args()

    data = load_cases(args.cases)
    case_defs = select_cases(data, args.case_id)
    variants = selected_variants(args.variant)
    run = run_id()
    out_dir = RESULT_ROOT / run
    out_dir.mkdir(parents=True, exist_ok=True)

    if args.mode == "validate":
        case_results = [build_validate_case(case, variants) for case in case_defs]
    elif args.mode == "score-fixture":
        if not args.fixture:
            raise ValueError("--fixture is required for score-fixture mode")
        if len(case_defs) != 1:
            raise ValueError("--case is required for score-fixture mode")
        if args.variant in {"required", "all"}:
            raise ValueError("--variant must be baseline, explicit, or routing for score-fixture mode")
        text = args.fixture.read_text(encoding="utf-8")
        case = case_defs[0]
        result = evaluate_text(case, args.variant, text, str(args.fixture))
        case_results = [build_case_result(case, {args.variant: result})]
    elif args.mode == "score-artifacts":
        if len(case_defs) != 1:
            raise ValueError("--case is required for score-artifacts mode")
        artifact_map = {
            "baseline": args.baseline_fixture,
            "explicit": args.explicit_fixture,
            "routing": args.routing_fixture,
        }
        missing = [variant for variant in variants if not artifact_map.get(variant)]
        if missing:
            raise ValueError(
                "score-artifacts missing fixture(s): "
                + ", ".join(f"--{variant}-fixture" for variant in missing)
            )
        case = case_defs[0]
        variant_results = {}
        for variant in variants:
            path = artifact_map[variant]
            assert path is not None
            text = path.read_text(encoding="utf-8")
            variant_results[variant] = evaluate_text(case, variant, text, str(path))
        case_results = [build_case_result(case, variant_results)]
    else:
        case_results = []
        for case in case_defs:
            variant_results = {
                variant: run_codex_prompt(case, variant, out_dir, args.timeout)
                for variant in variants
            }
            case_results.append(build_case_result(case, variant_results))

    report = build_report(args.mode, case_results, run)
    report_path = out_dir / "report.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], indent=2))
    print(f"report: {report_path}")

    if report["summary"]["blocked_required_cases"]:
        return 1
    if args.fail_on_explicit_fail and report["summary"]["explicit_failed_cases"]:
        return 1
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}", file=os.sys.stderr)
        raise SystemExit(2)
