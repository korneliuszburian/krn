import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import {
  parseKrnBenchmarkReport,
  parseKrnBenchmarkReportsViewModel,
  type KrnBenchmarkReport,
} from "@krn/contracts";
import { BenchmarkReportsDashboard, parseDashboardData } from "@krn/dashboard";
import { buildKrnBenchmarkReportsViewModel } from "@krn/mcp";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

type EvalCase = {
  id: string;
  expected_behavior: string;
  metrics: string[];
  failure_mode: string;
};

type CaseResult = {
  id: string;
  passed: boolean;
  assertions: string[];
  failure_mode: string;
  message: string;
};

type EvalReport = {
  schema_version: "krn-dashboard-benchmark-reports-ui-result.v1";
  kind: "krn_dashboard_benchmark_reports_ui_result";
  run_id: string;
  created_at: string;
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  case_pass_rate: number;
  total_assertions: number;
  passed_assertions: number;
  failed_assertions: number;
  assertion_pass_rate: number;
  cases: CaseResult[];
  generated_data_path: string | null;
  interpretation_caveat: string;
};

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function parseCases(input: unknown): EvalCase[] {
  if (!Array.isArray(input)) {
    throw new Error("cases.json must be an array");
  }

  return input.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`case ${index} must be an object`);
    }

    const record = item as Record<string, unknown>;
    const id = record.id;
    const expectedBehavior = record.expected_behavior;
    const metrics = record.metrics;
    const failureMode = record.failure_mode;

    if (typeof id !== "string" || id.length === 0) {
      throw new Error(`case ${index} missing id`);
    }
    if (typeof expectedBehavior !== "string" || expectedBehavior.length === 0) {
      throw new Error(`case ${id} missing expected_behavior`);
    }
    if (!Array.isArray(metrics) || !metrics.every((metric) => typeof metric === "string" && metric.length > 0)) {
      throw new Error(`case ${id} missing metrics`);
    }
    if (typeof failureMode !== "string" || failureMode.length === 0) {
      throw new Error(`case ${id} missing failure_mode`);
    }

    return { id, expected_behavior: expectedBehavior, metrics, failure_mode: failureMode };
  });
}

function result(id: string, passed: boolean, assertions: string[], failureMode: string, message: string): CaseResult {
  return { id, passed, assertions, failure_mode: failureMode, message };
}

function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}`;
}

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function liveNegativeBenchmarkReport(targetRoot: string, runId = "20260620T060340Z-test"): KrnBenchmarkReport {
  const base = parseKrnBenchmarkReport(readJson(resolve("docs/specs/krn-benchmark-report/examples/benchmark-report.example.json")));
  const baseTask = base.tasks[0];
  if (!baseTask) {
    throw new Error("benchmark report fixture must include at least one task");
  }

  const reportPath = `.krn/benchmarks/krn-benchmark-live-pilot/${runId}/report.json`;
  const baselineEvidence = `.krn/benchmarks/krn-benchmark-live-pilot/${runId}/baseline.final.json`;
  const assistedEvidence = `.krn/benchmarks/krn-benchmark-live-pilot/${runId}/assisted.final.json`;
  const repairTarget = {
    id: "expand-live-codex-benchmark-suite",
    owner: "krn",
    next_action: "Run a larger live_codex_exec benchmark suite with enough tasks before any productivity lift claim is allowed.",
    source_refs: ["docs/goals/goal-006.md", "docs/specs/krn-benchmark-report/README.md"],
    failure_mode: "A one-task live pilot is overclaimed as measured productivity improvement.",
  };

  return parseKrnBenchmarkReport({
    ...base,
    run_id: runId,
    created_at: "2026-06-20T06:03:40.522Z",
    target_root: targetRoot,
    benchmark_id: "krn-benchmark-live-pilot",
    suite_id: "one-task-routing-pilot",
    measurement_mode: "live_codex_exec",
    productivity_lift_claimed: false,
    lift_status: "no_lift_evidence",
    task_count: 1,
    completed_task_count: 1,
    blocked_task_count: 0,
    failed_task_count: 0,
    baseline_score: 0.95,
    assisted_score: 0.85,
    assisted_minus_baseline: -0.1,
    tasks: [
      {
        ...baseTask,
        task_id: "next-slice-routing",
        title: "Route the next KRN slice without overclaiming benchmark evidence",
        task_source_refs: ["docs/goals/goal-006.md", "docs/goals/goal-018.md", "docs/goals/goal-019.md"],
        baseline: {
          label: "baseline_codex",
          score: 0.95,
          evidence_refs: [baselineEvidence],
          interpretation_caveat: "Live pilot baseline score for one task only; it is not statistical benchmark evidence.",
        },
        assisted: {
          label: "krn_assisted_codex",
          score: 0.85,
          evidence_refs: [assistedEvidence],
          interpretation_caveat: "Live pilot assisted score for one task only; it is not productivity lift evidence.",
        },
        assisted_minus_baseline: -0.1,
        metrics: [
          {
            metric_id: "slice_routing_score",
            baseline_score: 0.95,
            assisted_score: 0.85,
            assisted_minus_baseline: -0.1,
            weight: 1,
            source_refs: ["docs/evals/krn-benchmark-live-pilot/README.md"],
            interpretation_caveat: "Metric delta is one-task live pilot evidence only.",
          },
        ],
        repair_targets: [repairTarget],
        interpretation_caveat:
          "This one-task row proves the live benchmark measurement path only; it does not prove productivity lift.",
      },
    ],
    repair_targets: [repairTarget],
    benchmark_report_path: reportPath,
    source_refs: [
      "docs/goals/goal-006.md",
      "docs/goals/goal-018.md",
      "docs/goals/goal-019.md",
      "docs/specs/krn-benchmark-report/README.md",
    ],
    interpretation_caveat:
      "This live pilot proves one baseline-vs-assisted codex exec scoring path only; it does not prove measured productivity lift.",
  });
}

function writeBenchmarkReport(targetRoot: string, report: KrnBenchmarkReport | unknown): string {
  const parsed = parseKrnBenchmarkReport(report);
  const reportPath = join(targetRoot, parsed.benchmark_report_path);
  writeText(reportPath, `${JSON.stringify(parsed, null, 2)}\n`);
  return reportPath;
}

function writeInvalidBenchmarkReport(targetRoot: string): string {
  const reportPath = join(targetRoot, ".krn/benchmarks/bad/20260620T063000Z-test/report.json");
  writeText(reportPath, `${JSON.stringify({ bad: true }, null, 2)}\n`);
  return reportPath;
}

function caseById(cases: EvalCase[], id: string): EvalCase {
  const found = cases.find((testCase) => testCase.id === id);
  if (!found) {
    throw new Error(`Missing case ${id}`);
  }
  return found;
}

function renderBenchmarkReports(input: unknown): string {
  return renderToStaticMarkup(
    createElement(BenchmarkReportsDashboard, { viewModel: parseKrnBenchmarkReportsViewModel(input) }),
  );
}

function containsBlockedCommandName(html: string): boolean {
  return (
    html.includes("claim_productivity_lift_from_one_task") ||
    html.includes("dashboard_run_benchmark") ||
    html.includes("dashboard_auto_repair") ||
    html.includes("write_memory") ||
    html.includes("krn benchmark")
  );
}

function runDashboardDataCommand(targetRoot: string, outputPath: string): void {
  execFileSync("pnpm", ["--filter", "@krn/dashboard", "data"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      KRN_TARGET_ROOT: targetRoot,
      KRN_DASHBOARD_DATA_OUT: outputPath,
    },
    stdio: "pipe",
  });
}

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-dashboard-benchmark-reports-ui/cases.json")));
  const results: CaseResult[] = [];
  let generatedDataPath: string | null = null;
  let readyViewModel = parseKrnBenchmarkReportsViewModel(
    readJson(resolve("docs/specs/krn-benchmark-reports-view-model/examples/benchmark-reports-view-model.example.json")),
  );

  const dataCase = caseById(cases, "dashboard-data-generation-includes-benchmark-reports");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-benchmark-reports-data-"));
    const report = liveNegativeBenchmarkReport(targetRoot);
    writeBenchmarkReport(targetRoot, report);
    const outputPath = join(
      mkdtempSync(join(tmpdir(), "krn-dashboard-benchmark-reports-data-out-")),
      "krn-dashboard-data.json",
    );
    runDashboardDataCommand(targetRoot, outputPath);
    generatedDataPath = outputPath;
    const dashboardData = parseDashboardData(readJson(outputPath));
    readyViewModel = dashboardData.benchmark_reports;

    results.push(
      result(
        dataCase.id,
        existsSync(outputPath) &&
          dashboardData.kind === "krn_dashboard_data" &&
          readyViewModel.valid_reports === 1 &&
          readyViewModel.negative_delta_reports === 1 &&
          readyViewModel.no_lift_reports === 1 &&
          readyViewModel.productivity_lift_claimed_reports === 0 &&
          !readyViewModel.dashboard_commands_enabled,
        [
          "dashboard data command exits",
          "generated data file exists",
          "generated dashboard data parses",
          "benchmark report row present",
          "negative delta preserved",
          "no lift preserved",
          "lift claims absent",
          "dashboard commands disabled",
        ],
        dataCase.failure_mode,
        "Dashboard data command generated a parsed Benchmark Reports object from a real live_codex_exec benchmark report.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        dataCase.id,
        false,
        ["dashboard data command exits", "generated dashboard data parses"],
        dataCase.failure_mode,
        error instanceof Error ? error.message : "unknown dashboard data error",
      ),
    );
  }

  const rowCase = caseById(cases, "benchmark-row-renders-no-lift-evidence");
  try {
    const html = renderBenchmarkReports(readyViewModel);
    results.push(
      result(
        rowCase.id,
        html.includes("krn-benchmark-live-pilot") &&
          html.includes("docs/goals/goal-018.md") &&
          html.includes("-0.1") &&
          html.includes("no lift evidence") &&
          html.includes("Expand live benchmark suite") &&
          html.includes("Failure mode") &&
          !containsBlockedCommandName(html),
        [
          "benchmark id rendered",
          "source ref rendered",
          "negative delta rendered",
          "no lift status rendered",
          "next action rendered",
          "failure mode rendered",
          "command names absent",
        ],
        rowCase.failure_mode,
        "Dashboard static render preserved benchmark report evidence without lift/run/repair/write command names.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        rowCase.id,
        false,
        ["benchmark row renders"],
        rowCase.failure_mode,
        error instanceof Error ? error.message : "unknown render error",
      ),
    );
  }

  const emptyCase = caseById(cases, "missing-benchmark-report-renders-explicit-empty");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-benchmark-reports-empty-"));
    const viewModel = buildKrnBenchmarkReportsViewModel(targetRoot, new Date("2026-06-20T06:30:00.000Z"));
    const html = renderBenchmarkReports(viewModel);
    results.push(
      result(
        emptyCase.id,
        viewModel.source === "missing_benchmark_reports" &&
          viewModel.queue_state === "empty" &&
          html.includes("Empty") &&
          html.includes("No benchmark reports") &&
          !html.includes("krn-benchmark-live-pilot"),
        ["missing source parses", "empty queue state rendered", "empty copy rendered", "no benchmark row invented"],
        emptyCase.failure_mode,
        "Dashboard static render displayed the explicit missing benchmark report state.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        emptyCase.id,
        false,
        ["missing benchmark state renders"],
        emptyCase.failure_mode,
        error instanceof Error ? error.message : "unknown missing-state error",
      ),
    );
  }

  const invalidCase = caseById(cases, "invalid-benchmark-report-renders-blocked");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-benchmark-reports-invalid-"));
    writeInvalidBenchmarkReport(targetRoot);
    const viewModel = buildKrnBenchmarkReportsViewModel(targetRoot, new Date("2026-06-20T06:31:00.000Z"));
    const html = renderBenchmarkReports(viewModel);
    results.push(
      result(
        invalidCase.id,
        viewModel.source === "invalid_benchmark_reports" &&
          html.includes("Blocked") &&
          html.includes(".krn/benchmarks/bad/20260620T063000Z-test/report.json"),
        ["invalid report surfaced", "blocked state rendered", "invalid report path rendered"],
        invalidCase.failure_mode,
        "Dashboard static render surfaced invalid benchmark report as blocked state.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        invalidCase.id,
        false,
        ["invalid benchmark report renders"],
        invalidCase.failure_mode,
        error instanceof Error ? error.message : "unknown invalid-report error",
      ),
    );
  }

  const boundaryCase = caseById(cases, "negative-delta-preserves-no-lift-boundary");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-benchmark-reports-boundary-"));
    const report = liveNegativeBenchmarkReport(targetRoot);
    writeBenchmarkReport(targetRoot, report);
    const viewModel = buildKrnBenchmarkReportsViewModel(targetRoot, new Date("2026-06-20T06:32:00.000Z"));
    const html = renderBenchmarkReports(viewModel);
    results.push(
      result(
        boundaryCase.id,
        viewModel.live_codex_exec_reports === 1 &&
          viewModel.negative_delta_reports === 1 &&
          viewModel.no_lift_reports === 1 &&
          viewModel.productivity_lift_claimed_reports === 0 &&
          viewModel.next_allowed_action.action_id === "expand-live-benchmark-suite" &&
          !containsBlockedCommandName(html),
        [
          "live report parsed",
          "negative delta counted",
          "no lift report counted",
          "productivity lift claims remain zero",
          "next action expands benchmark suite",
          "dashboard command names absent",
        ],
        boundaryCase.failure_mode,
        "Negative live benchmark evidence stayed below the lift gate and routed to larger-suite work.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        boundaryCase.id,
        false,
        ["negative benchmark boundary preserved"],
        boundaryCase.failure_mode,
        error instanceof Error ? error.message : "unknown no-lift-boundary error",
      ),
    );
  }

  const totalCases = results.length;
  const passedCases = results.filter((caseResult) => caseResult.passed).length;
  const totalAssertions = results.reduce((count, caseResult) => count + caseResult.assertions.length, 0);
  const passedAssertions = results.reduce(
    (count, caseResult) => count + (caseResult.passed ? caseResult.assertions.length : 0),
    0,
  );

  return {
    schema_version: "krn-dashboard-benchmark-reports-ui-result.v1",
    kind: "krn_dashboard_benchmark_reports_ui_result",
    run_id: runId,
    created_at: now.toISOString(),
    total_cases: totalCases,
    passed_cases: passedCases,
    failed_cases: totalCases - passedCases,
    case_pass_rate: totalCases === 0 ? 0 : passedCases / totalCases,
    total_assertions: totalAssertions,
    passed_assertions: passedAssertions,
    failed_assertions: totalAssertions - passedAssertions,
    assertion_pass_rate: totalAssertions === 0 ? 0 : passedAssertions / totalAssertions,
    cases: results,
    generated_data_path: generatedDataPath,
    interpretation_caveat:
      "This eval proves the local dashboard can render typed Benchmark Reports product objects only; it does not prove measured productivity lift, benchmark statistical validity, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, or human review quality.",
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-dashboard-benchmark-reports-ui", report.run_id);
  const reportPath = resolve(reportDir, "report.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`report: ${reportPath}\n`);

  if (report.failed_cases > 0) {
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
