import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import {
  parseKrnEvalReport,
  parseKrnEvalRunsViewModel,
  type EvalModuleResult,
  type KrnEvalRunsViewModel,
} from "@krn/contracts";

const EVAL_RUNS_SPEC_SOURCE_REFS = [
  "docs/specs/krn-eval/README.md",
  "docs/specs/krn-eval-runs-view-model/README.md",
] as const;

function readJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function toTargetRelativePath(targetRoot: string, absolutePath: string): string {
  const relativePath = relative(targetRoot, absolutePath).replaceAll("\\", "/");
  if (relativePath.length > 0 && !relativePath.startsWith("..") && !relativePath.startsWith("/")) {
    return relativePath;
  }
  return absolutePath;
}

function latestEvalReportPath(targetRoot: string): string | null {
  const evalRoot = resolve(targetRoot, ".krn/eval");
  if (!existsSync(evalRoot) || !statSync(evalRoot).isDirectory()) {
    return null;
  }

  const candidates = readdirSync(evalRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(evalRoot, entry.name, "report.json"))
    .filter((candidate) => existsSync(candidate) && statSync(candidate).isFile())
    .sort();

  return candidates.at(-1) ?? null;
}

function moduleNextAction(status: EvalModuleResult["status"]): string {
  if (status === "passed") {
    return "Keep this eval module as deterministic regression evidence; do not claim productivity lift.";
  }

  if (status === "failed") {
    return "Create a repair record before changing prompts, skills, hooks, or product code for this eval failure.";
  }

  return "Repair the eval runner or module command before relying on this dashboard row.";
}

function sourceRefsWithEvalRunsSpec(sourceRefs: readonly string[]): string[] {
  return [...new Set([...sourceRefs, ...EVAL_RUNS_SPEC_SOURCE_REFS])];
}

function evalRunsNextAction(
  source: KrnEvalRunsViewModel["source"],
  failedModules: number,
  sourceRefs: readonly string[],
): KrnEvalRunsViewModel["next_allowed_action"] {
  if (source === "missing_eval_report") {
    return {
      action_id: "generate-eval-report",
      target_surface: "eval_reports",
      label: "Generate eval report",
      rationale: "No aggregate eval report exists, so Eval Runs must render explicit empty state.",
      source_refs: [...sourceRefs],
    };
  }

  if (source === "invalid_eval_report") {
    return {
      action_id: "repair-invalid-eval-report",
      target_surface: "eval_reports",
      label: "Repair invalid eval report",
      rationale: "The latest aggregate eval report failed to parse and cannot be used as dashboard evidence.",
      source_refs: [...sourceRefs],
    };
  }

  if (failedModules > 0) {
    return {
      action_id: "create-eval-repair-record",
      target_surface: "repair_loop",
      label: "Create eval repair record",
      rationale: "At least one eval module failed, so the next safe action is a bounded repair record before changes.",
      source_refs: [...sourceRefs],
    };
  }

  return {
    action_id: "review-eval-run-evidence",
    target_surface: "eval_reports",
    label: "Review eval run evidence",
    rationale: "The latest aggregate eval report passed, so it can be reviewed as deterministic regression evidence only.",
    source_refs: [...sourceRefs],
  };
}

function emptyViewModel(targetRoot: string, now: Date): KrnEvalRunsViewModel {
  const sourceRefs = sourceRefsWithEvalRunsSpec([]);

  return parseKrnEvalRunsViewModel({
    schema_version: "krn-eval-runs-view-model.v1",
    kind: "krn_eval_runs_view_model",
    target_root: targetRoot,
    generated_at: now.toISOString(),
    no_mock_state: true,
    source: "missing_eval_report",
    eval_state: "empty",
    latest_report_path: null,
    latest_run_id: null,
    latest_created_at: null,
    eval_report_status: "missing",
    total_modules: 0,
    passed_modules: 0,
    failed_modules: 0,
    total_cases: 0,
    passed_cases: 0,
    failed_cases: 0,
    total_assertions: 0,
    passed_assertions: 0,
    failed_assertions: 0,
    modules: [],
    invalid_report: null,
    productivity_lift_claimed: false,
    dashboard_commands_enabled: false,
    benchmark_lift_status: "not_measured",
    next_allowed_action: evalRunsNextAction("missing_eval_report", 0, sourceRefs),
    blocked_actions: ["claim_productivity_lift", "dashboard_rerun_eval", "auto_repair_from_dashboard", "write_memory"],
    source_refs: sourceRefs,
    failure_mode:
      "Eval Runs becomes harmful if it invents eval state or treats missing reports as product lift.",
    interpretation_caveat:
      "This view model renders local aggregate eval state only; it does not run benchmarks, repair failures, mutate ledgers, or prove productivity lift.",
  });
}

function invalidViewModel(targetRoot: string, now: Date, reportPath: string, error: unknown): KrnEvalRunsViewModel {
  const relativeReportPath = toTargetRelativePath(targetRoot, reportPath);
  const message = error instanceof Error ? error.message : "unknown parse error";
  const sourceRefs = sourceRefsWithEvalRunsSpec([]);

  return parseKrnEvalRunsViewModel({
    schema_version: "krn-eval-runs-view-model.v1",
    kind: "krn_eval_runs_view_model",
    target_root: targetRoot,
    generated_at: now.toISOString(),
    no_mock_state: true,
    source: "invalid_eval_report",
    eval_state: "blocked",
    latest_report_path: relativeReportPath,
    latest_run_id: null,
    latest_created_at: null,
    eval_report_status: "invalid",
    total_modules: 0,
    passed_modules: 0,
    failed_modules: 0,
    total_cases: 0,
    passed_cases: 0,
    failed_cases: 0,
    total_assertions: 0,
    passed_assertions: 0,
    failed_assertions: 0,
    modules: [],
    invalid_report: {
      report_path: relativeReportPath,
      error_summary: `Latest krn eval report failed to parse: ${message}`,
    },
    productivity_lift_claimed: false,
    dashboard_commands_enabled: false,
    benchmark_lift_status: "not_measured",
    next_allowed_action: evalRunsNextAction("invalid_eval_report", 0, sourceRefs),
    blocked_actions: ["claim_productivity_lift", "dashboard_rerun_eval", "auto_repair_from_dashboard", "write_memory"],
    source_refs: sourceRefs,
    failure_mode:
      "Eval Runs becomes harmful if invalid aggregate reports are hidden or rendered as passed evidence.",
    interpretation_caveat:
      "This view model renders local aggregate eval state only; it does not run benchmarks, repair failures, mutate ledgers, or prove productivity lift.",
  });
}

export function buildKrnEvalRunsViewModel(targetInput = ".", now = new Date()): KrnEvalRunsViewModel {
  const targetRoot = resolve(targetInput);
  const latestPath = latestEvalReportPath(targetRoot);

  if (!latestPath) {
    return emptyViewModel(targetRoot, now);
  }

  try {
    const report = parseKrnEvalReport(readJsonFile(latestPath));
    const failedModules = report.summary.failed_modules;
    const evalState = report.overall_status === "passed" && failedModules === 0 ? "ready" : "blocked";
    const sourceRefs = sourceRefsWithEvalRunsSpec(report.source_refs);

    return parseKrnEvalRunsViewModel({
      schema_version: "krn-eval-runs-view-model.v1",
      kind: "krn_eval_runs_view_model",
      target_root: targetRoot,
      generated_at: now.toISOString(),
      no_mock_state: true,
      source: "eval_report",
      eval_state: evalState,
      latest_report_path: toTargetRelativePath(targetRoot, latestPath),
      latest_run_id: report.run_id,
      latest_created_at: report.created_at,
      eval_report_status: report.overall_status,
      total_modules: report.summary.total_modules,
      passed_modules: report.summary.passed_modules,
      failed_modules: report.summary.failed_modules,
      total_cases: report.summary.total_cases,
      passed_cases: report.summary.passed_cases,
      failed_cases: report.summary.failed_cases,
      total_assertions: report.summary.total_assertions,
      passed_assertions: report.summary.passed_assertions,
      failed_assertions: report.summary.failed_assertions,
      modules: report.modules.map((moduleResult) => ({
        owner: "krn",
        source_refs: moduleResult.source_refs,
        next_action: moduleNextAction(moduleResult.status),
        failure_mode:
          "Eval module rows become harmful if deterministic results are overclaimed as benchmark lift, human review quality, or full product readiness.",
        module_id: moduleResult.module_id,
        command: moduleResult.command,
        status: moduleResult.status,
        report_path: moduleResult.report_path,
        total_cases: moduleResult.total_cases,
        passed_cases: moduleResult.passed_cases,
        failed_cases: moduleResult.failed_cases,
        case_pass_rate: moduleResult.case_pass_rate,
        total_assertions: moduleResult.total_assertions,
        passed_assertions: moduleResult.passed_assertions,
        failed_assertions: moduleResult.failed_assertions,
        assertion_pass_rate: moduleResult.assertion_pass_rate,
        interpretation_caveat: moduleResult.interpretation_caveat,
      })),
      invalid_report: null,
      productivity_lift_claimed: false,
      dashboard_commands_enabled: false,
      benchmark_lift_status: "not_measured",
      next_allowed_action: evalRunsNextAction("eval_report", failedModules, sourceRefs),
      blocked_actions: ["claim_productivity_lift", "dashboard_rerun_eval", "auto_repair_from_dashboard", "write_memory"],
      source_refs: sourceRefs,
      failure_mode:
        "Eval Runs becomes harmful if deterministic eval reports are overclaimed as benchmark lift, productivity improvement, or permission for automated repair/write commands.",
      interpretation_caveat:
        "This view model renders local aggregate eval state only; it does not run benchmarks, repair failures, mutate ledgers, or prove productivity lift.",
    });
  } catch (error: unknown) {
    return invalidViewModel(targetRoot, now, latestPath, error);
  }
}
