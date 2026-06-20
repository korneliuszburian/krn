import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { parseKrnEvalReport, parseKrnEvalRunsViewModel, type KrnEvalReport } from "@krn/contracts";
import { EvalRunsDashboard, parseDashboardData } from "@krn/dashboard";
import { buildKrnEvalRunsViewModel } from "@krn/mcp";
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
  schema_version: "krn-dashboard-eval-runs-ui-result.v1";
  kind: "krn_dashboard_eval_runs_ui_result";
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

function validEvalReport(overrides: Partial<KrnEvalReport> = {}): KrnEvalReport {
  const report = parseKrnEvalReport(readJson(resolve("docs/specs/krn-eval/examples/krn-eval-report.example.json")));
  return parseKrnEvalReport({
    ...report,
    ...overrides,
  });
}

function failedEvalReport(targetRoot: string): KrnEvalReport {
  const base = validEvalReport({
    target_root: targetRoot,
    overall_status: "failed",
    summary: {
      total_modules: 1,
      passed_modules: 0,
      failed_modules: 1,
      total_cases: 1,
      passed_cases: 0,
      failed_cases: 1,
      total_assertions: 2,
      passed_assertions: 1,
      failed_assertions: 1,
    },
  });
  const moduleResult = base.modules[0];
  if (!moduleResult) {
    throw new Error("valid eval report fixture must include at least one module");
  }

  return validEvalReport({
    ...base,
    modules: [
      {
        ...moduleResult,
        status: "failed",
        total_cases: 1,
        passed_cases: 0,
        failed_cases: 1,
        case_pass_rate: 0,
        total_assertions: 2,
        passed_assertions: 1,
        failed_assertions: 1,
        assertion_pass_rate: 0.5,
      },
    ],
  });
}

function writeEvalReport(targetRoot: string, report: KrnEvalReport | unknown, runId = "20260620T040000Z-test"): string {
  const reportPath = join(targetRoot, ".krn/eval", runId, "report.json");
  writeText(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  return reportPath;
}

function caseById(cases: EvalCase[], id: string): EvalCase {
  const found = cases.find((testCase) => testCase.id === id);
  if (!found) {
    throw new Error(`Missing case ${id}`);
  }
  return found;
}

function renderEvalRuns(input: unknown): string {
  return renderToStaticMarkup(createElement(EvalRunsDashboard, { viewModel: parseKrnEvalRunsViewModel(input) }));
}

function containsBlockedCommandName(html: string): boolean {
  return (
    html.includes("claim_productivity_lift") ||
    html.includes("dashboard_rerun_eval") ||
    html.includes("auto_repair_from_dashboard") ||
    html.includes("write_memory")
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
  const cases = parseCases(readJson(resolve("docs/evals/krn-dashboard-eval-runs-ui/cases.json")));
  const results: CaseResult[] = [];
  let generatedDataPath: string | null = null;
  let readyViewModel = parseKrnEvalRunsViewModel(
    readJson(resolve("docs/specs/krn-eval-runs-view-model/examples/eval-runs-view-model.example.json")),
  );

  const dataCase = caseById(cases, "dashboard-data-generation-includes-eval-runs");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-eval-runs-data-"));
    const report = validEvalReport({ target_root: targetRoot });
    writeEvalReport(targetRoot, report);
    const outputPath = join(mkdtempSync(join(tmpdir(), "krn-dashboard-eval-runs-data-out-")), "krn-dashboard-data.json");
    runDashboardDataCommand(targetRoot, outputPath);
    generatedDataPath = outputPath;
    const dashboardData = parseDashboardData(readJson(outputPath));
    readyViewModel = dashboardData.eval_runs;

    results.push(
      result(
        dataCase.id,
        existsSync(outputPath) &&
          dashboardData.kind === "krn_dashboard_data" &&
          readyViewModel.total_modules === report.summary.total_modules &&
          !readyViewModel.productivity_lift_claimed,
        [
          "dashboard data command exits",
          "generated data file exists",
          "generated dashboard data parses",
          "eval runs row present",
          "productivity lift remains unclaimed",
        ],
        dataCase.failure_mode,
        "Dashboard data command generated a parsed Eval Runs object from a real aggregate eval report.",
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

  const rowCase = caseById(cases, "eval-module-row-renders-evidence");
  try {
    const html = renderEvalRuns(readyViewModel);
    results.push(
      result(
        rowCase.id,
        html.includes(readyViewModel.modules[0]?.module_id ?? "missing-module") &&
          html.includes(readyViewModel.modules[0]?.source_refs[0] ?? "missing-source-ref") &&
          html.includes("Keep this eval module") &&
          html.includes("Failure mode") &&
          !containsBlockedCommandName(html),
        ["module id rendered", "source ref rendered", "next action rendered", "failure mode rendered", "command names absent"],
        rowCase.failure_mode,
        "Dashboard static render preserved eval module evidence without lift/rerun/repair command names.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        rowCase.id,
        false,
        ["module row renders"],
        rowCase.failure_mode,
        error instanceof Error ? error.message : "unknown render error",
      ),
    );
  }

  const emptyCase = caseById(cases, "missing-eval-report-renders-explicit-empty");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-eval-runs-empty-"));
    const viewModel = buildKrnEvalRunsViewModel(targetRoot, new Date("2026-06-20T04:00:00.000Z"));
    const html = renderEvalRuns(viewModel);
    results.push(
      result(
        emptyCase.id,
        viewModel.source === "missing_eval_report" &&
          html.includes("Empty") &&
          html.includes("No aggregate eval report") &&
          !html.includes("krn-init-contracts"),
        ["missing source parses", "empty label rendered", "no module rows invented"],
        emptyCase.failure_mode,
        "Dashboard static render displayed the explicit missing aggregate eval state.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        emptyCase.id,
        false,
        ["missing eval state renders"],
        emptyCase.failure_mode,
        error instanceof Error ? error.message : "unknown missing-state error",
      ),
    );
  }

  const invalidCase = caseById(cases, "invalid-eval-report-renders-blocked");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-eval-runs-invalid-"));
    writeEvalReport(targetRoot, { bad: true });
    const viewModel = buildKrnEvalRunsViewModel(targetRoot, new Date("2026-06-20T04:01:00.000Z"));
    const html = renderEvalRuns(viewModel);
    results.push(
      result(
        invalidCase.id,
        viewModel.source === "invalid_eval_report" &&
          html.includes("Blocked") &&
          html.includes(".krn/eval/20260620T040000Z-test/report.json"),
        ["invalid report surfaced", "blocked state rendered", "invalid report path rendered"],
        invalidCase.failure_mode,
        "Dashboard static render surfaced invalid aggregate eval report as blocked state.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        invalidCase.id,
        false,
        ["invalid eval report renders"],
        invalidCase.failure_mode,
        error instanceof Error ? error.message : "unknown invalid-report error",
      ),
    );
  }

  const failedCase = caseById(cases, "failed-module-renders-blocked");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-eval-runs-failed-"));
    writeEvalReport(targetRoot, failedEvalReport(targetRoot));
    const viewModel = buildKrnEvalRunsViewModel(targetRoot, new Date("2026-06-20T04:02:00.000Z"));
    const html = renderEvalRuns(viewModel);
    results.push(
      result(
        failedCase.id,
        viewModel.eval_state === "blocked" &&
          viewModel.failed_modules === 1 &&
          html.includes("Create eval repair record") &&
          !html.includes("claim_productivity_lift"),
        ["failed module parsed", "blocked state rendered", "repair action rendered", "lift claim absent"],
        failedCase.failure_mode,
        "Dashboard static render surfaced failed eval modules as blocked repair-ready evidence.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        failedCase.id,
        false,
        ["failed eval module renders"],
        failedCase.failure_mode,
        error instanceof Error ? error.message : "unknown failed-module error",
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
    schema_version: "krn-dashboard-eval-runs-ui-result.v1",
    kind: "krn_dashboard_eval_runs_ui_result",
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
      "This eval proves the local dashboard can render typed Eval Runs product objects only; it does not prove benchmark lift, productivity improvement, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, or human review quality.",
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-dashboard-eval-runs-ui", report.run_id);
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
