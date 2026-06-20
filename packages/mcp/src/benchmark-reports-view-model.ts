import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import {
  parseKrnBenchmarkReport,
  parseKrnBenchmarkReportsViewModel,
  type KrnBenchmarkReport,
  type KrnBenchmarkReportsViewModel,
} from "@krn/contracts";

const BENCHMARK_REPORTS_SOURCE_REFS = [
  "docs/goals/goal-006.md",
  "docs/goals/goal-018.md",
  "docs/goals/goal-019.md",
  "docs/specs/krn-benchmark-report/README.md",
  "docs/specs/krn-benchmark-reports-view-model/README.md",
] as const;

type ParsedBenchmarkReport = {
  report: KrnBenchmarkReport;
  path: string;
};

type InvalidBenchmarkReport = {
  path: string;
  error: unknown;
};

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

function collectReportPaths(root: string): string[] {
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    return [];
  }

  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(root, entry.name);
    if (entry.isDirectory()) {
      return collectReportPaths(entryPath);
    }
    return entry.name === "report.json" ? [entryPath] : [];
  });
}

function readBenchmarkReports(targetRoot: string): {
  parsed: ParsedBenchmarkReport[];
  invalid: InvalidBenchmarkReport[];
} {
  const reportPaths = collectReportPaths(resolve(targetRoot, ".krn/benchmarks")).sort();
  const parsed: ParsedBenchmarkReport[] = [];
  const invalid: InvalidBenchmarkReport[] = [];

  for (const reportPath of reportPaths) {
    try {
      parsed.push({
        report: parseKrnBenchmarkReport(readJsonFile(reportPath)),
        path: reportPath,
      });
    } catch (error: unknown) {
      invalid.push({ path: reportPath, error });
    }
  }

  parsed.sort((left, right) => left.report.created_at.localeCompare(right.report.created_at));
  return { parsed, invalid };
}

function errorSummary(error: unknown): string {
  return error instanceof Error ? error.message : "unknown parse error";
}

function rowNextAction(report: KrnBenchmarkReport): string {
  if (report.productivity_lift_claimed) {
    return "Review the benchmark lift claim against source refs and task evidence before promoting any product claim.";
  }

  if (report.assisted_minus_baseline <= 0 || report.task_count < report.minimum_task_count_for_lift_claim) {
    return "Expand the live benchmark suite or repair the assisted path before any productivity lift claim is allowed.";
  }

  return "Keep this benchmark report as review evidence and require a larger suite before product claims.";
}

function aggregateNextAction(
  source: KrnBenchmarkReportsViewModel["source"],
  invalidRecords: number,
  negativeDeltaReports: number,
  noLiftReports: number,
  claimedReports: number,
): KrnBenchmarkReportsViewModel["next_allowed_action"] {
  if (source === "missing_benchmark_reports") {
    return {
      action_id: "wait-for-benchmark-report-input",
      target_surface: "benchmark_reports",
      label: "Wait for benchmark report input",
      rationale: "No benchmark reports exist, so Benchmark Reports must render explicit zero state.",
      source_refs: [...BENCHMARK_REPORTS_SOURCE_REFS],
    };
  }

  if (invalidRecords > 0) {
    return {
      action_id: "repair-invalid-benchmark-report",
      target_surface: "benchmark_reports",
      label: "Repair invalid benchmark report",
      rationale: "At least one benchmark report failed to parse and cannot be used as review evidence.",
      source_refs: [...BENCHMARK_REPORTS_SOURCE_REFS],
    };
  }

  if (claimedReports > 0) {
    return {
      action_id: "review-benchmark-lift-evidence",
      target_surface: "benchmark_reports",
      label: "Review benchmark lift evidence",
      rationale: "A benchmark report claims productivity lift, so it needs human/source review before promotion.",
      source_refs: [...BENCHMARK_REPORTS_SOURCE_REFS],
    };
  }

  if (negativeDeltaReports > 0 || noLiftReports > 0) {
    return {
      action_id: "expand-live-benchmark-suite",
      target_surface: "benchmark_suite",
      label: "Expand live benchmark suite",
      rationale: "Current benchmark evidence is below the lift gate or has no positive assisted delta.",
      source_refs: [...BENCHMARK_REPORTS_SOURCE_REFS],
    };
  }

  return {
    action_id: "review-benchmark-reports",
    target_surface: "benchmark_reports",
    label: "Review benchmark reports",
    rationale: "Benchmark reports are available as typed review evidence only.",
    source_refs: [...BENCHMARK_REPORTS_SOURCE_REFS],
  };
}

function sourceForCounts(validReports: number, invalidRecords: number): KrnBenchmarkReportsViewModel["source"] {
  if (validReports > 0) {
    return "benchmark_report_store";
  }
  if (invalidRecords > 0) {
    return "invalid_benchmark_reports";
  }
  return "missing_benchmark_reports";
}

function queueStateForCounts(validReports: number, invalidRecords: number): KrnBenchmarkReportsViewModel["queue_state"] {
  if (invalidRecords > 0) {
    return "blocked";
  }
  if (validReports > 0) {
    return "ready";
  }
  return "empty";
}

export function buildKrnBenchmarkReportsViewModel(
  targetInput = ".",
  now = new Date(),
): KrnBenchmarkReportsViewModel {
  const targetRoot = resolve(targetInput);
  const { parsed, invalid } = readBenchmarkReports(targetRoot);
  const liveCodexExecReports = parsed.filter((entry) => entry.report.measurement_mode === "live_codex_exec").length;
  const noLiftReports = parsed.filter((entry) => entry.report.lift_status !== "positive_lift").length;
  const negativeDeltaReports = parsed.filter((entry) => entry.report.assisted_minus_baseline < 0).length;
  const claimedReports = parsed.filter((entry) => entry.report.productivity_lift_claimed).length;
  const latestReportPath = parsed.at(-1)?.path ?? null;
  const source = sourceForCounts(parsed.length, invalid.length);

  return parseKrnBenchmarkReportsViewModel({
    schema_version: "krn-benchmark-reports-view-model.v1",
    kind: "krn_benchmark_reports_view_model",
    target_root: targetRoot,
    generated_at: now.toISOString(),
    no_mock_state: true,
    source,
    queue_state: queueStateForCounts(parsed.length, invalid.length),
    total_records: parsed.length + invalid.length,
    valid_reports: parsed.length,
    invalid_records_count: invalid.length,
    live_codex_exec_reports: liveCodexExecReports,
    no_lift_reports: noLiftReports,
    negative_delta_reports: negativeDeltaReports,
    productivity_lift_claimed_reports: claimedReports,
    latest_report_path: latestReportPath ? toTargetRelativePath(targetRoot, latestReportPath) : null,
    reports: parsed.map(({ report, path }) => ({
      owner: "krn",
      source_refs: report.source_refs,
      next_action: rowNextAction(report),
      failure_mode:
        "Benchmark report rows become harmful if no-lift, one-task, fixture, or negative-delta evidence is presented as productivity improvement.",
      report_path: toTargetRelativePath(targetRoot, path),
      run_id: report.run_id,
      created_at: report.created_at,
      benchmark_id: report.benchmark_id,
      suite_id: report.suite_id,
      measurement_mode: report.measurement_mode,
      lift_status: report.lift_status,
      productivity_lift_claimed: report.productivity_lift_claimed,
      minimum_task_count_for_lift_claim: report.minimum_task_count_for_lift_claim,
      task_count: report.task_count,
      completed_task_count: report.completed_task_count,
      blocked_task_count: report.blocked_task_count,
      failed_task_count: report.failed_task_count,
      baseline_score: report.baseline_score,
      assisted_score: report.assisted_score,
      assisted_minus_baseline: report.assisted_minus_baseline,
      repair_targets: report.repair_targets,
      evidence_refs: report.tasks.flatMap((task) => [...task.baseline.evidence_refs, ...task.assisted.evidence_refs]),
      interpretation_caveat: report.interpretation_caveat,
    })),
    invalid_records: invalid.map(({ path, error }) => ({
      report_path: toTargetRelativePath(targetRoot, path),
      error_summary: `Benchmark report failed to parse: ${errorSummary(error)}`,
    })),
    dashboard_commands_enabled: false,
    next_allowed_action: aggregateNextAction(source, invalid.length, negativeDeltaReports, noLiftReports, claimedReports),
    blocked_actions: [
      "claim_productivity_lift_from_one_task",
      "dashboard_run_benchmark",
      "dashboard_auto_repair",
      "write_memory",
    ],
    source_refs: [...BENCHMARK_REPORTS_SOURCE_REFS],
    failure_mode:
      "Benchmark Reports becomes harmful if it converts local benchmark evidence into a product lift claim or dashboard command surface.",
    interpretation_caveat:
      "This view model renders local benchmark reports only; it does not run benchmarks, mutate ledgers, or prove productivity lift.",
  });
}
