import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseKrnBenchmarkReport, type BenchmarkRepairTarget, type KrnBenchmarkReport } from "@krn/contracts";

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

type StabilitySummary = {
  evaluated_live_report_count: number;
  clean_completed_live_report_count: number;
  dirty_live_report_count: number;
  latest_live_report_path: string | null;
  latest_live_report_is_clean: boolean;
  suite_expansion_ready: boolean;
  productivity_lift_ready: boolean;
  next_allowed_action: string;
};

type EvalReport = {
  schema_version: "krn-benchmark-live-stability-result.v1";
  kind: "krn_benchmark_live_stability_result";
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
  stability_summary: StabilitySummary;
  interpretation_caveat: string;
};

type BenchmarkReportRecord = {
  path: string;
  report: KrnBenchmarkReport;
};

const MIN_REPEATED_CLEAN_REPORTS_FOR_EXPANSION = 2;
const LIVE_SUITE_REPORT_ROOT = ".krn/benchmarks/krn-benchmark-live-suite";

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

function caseById(cases: EvalCase[], id: string): EvalCase {
  const found = cases.find((testCase) => testCase.id === id);
  if (!found) {
    throw new Error(`Missing case ${id}`);
  }
  return found;
}

function repairTargets(): BenchmarkRepairTarget[] {
  return [
    {
      id: "repair-live-suite-stability-before-expansion",
      owner: "krn",
      next_action:
        "Produce repeated clean completed live-suite reports under the typed policy before expanding the benchmark suite.",
      source_refs: [
        "docs/goals/goal-006.md",
        "docs/goals/goal-026.md",
        "docs/goals/goal-027.md",
        "docs/evals/krn-benchmark-live-suite/README.md",
      ],
      failure_mode: "Dirty, missing, or one-off live evidence is overclaimed as suite expansion or productivity lift readiness.",
    },
  ];
}

function buildCleanLiveReport(runId: string, createdAt: string): KrnBenchmarkReport {
  const base = parseKrnBenchmarkReport(
    readJson(resolve("docs/specs/krn-benchmark-report/examples/benchmark-report.example.json")),
  );
  const candidate: unknown = {
    ...base,
    run_id: runId,
    created_at: createdAt,
    benchmark_id: "krn-benchmark-live-suite",
    suite_id: "clean-three-task-live-stability-fixture",
    measurement_mode: "live_codex_exec",
    lift_status: "no_lift_evidence",
    productivity_lift_claimed: false,
    benchmark_report_path: `${LIVE_SUITE_REPORT_ROOT}/${runId}/report.json`,
    repair_targets: repairTargets(),
    source_refs: [
      "docs/goals/goal-006.md",
      "docs/goals/goal-026.md",
      "docs/goals/goal-027.md",
      "docs/specs/krn-benchmark-report/README.md",
      "docs/evals/krn-benchmark-live-stability/README.md",
    ],
    interpretation_caveat:
      "This clean live fixture proves readiness classification only; three tasks remain below the 20-task productivity lift gate.",
  };

  return parseKrnBenchmarkReport(candidate);
}

function buildDirtyLiveReport(): KrnBenchmarkReport {
  const clean = buildCleanLiveReport("20260620T120000Z-dirty-live-stability-fixture", "2026-06-20T12:00:00.000Z");
  const candidate: unknown = {
    ...clean,
    suite_id: "dirty-three-task-live-stability-fixture",
    completed_task_count: clean.task_count - 1,
    failed_task_count: 1,
    tasks: clean.tasks.map((task, index) =>
      index === 0
        ? {
            ...task,
            status: "failed",
            repair_targets: repairTargets(),
            interpretation_caveat:
              "This dirty fixture task failed; positive score delta cannot establish clean comparable evidence.",
          }
        : task,
    ),
    interpretation_caveat:
      "This dirty live fixture proves readiness blocking only; failed tasks invalidate suite expansion and productivity lift claims.",
  };

  return parseKrnBenchmarkReport(candidate);
}

function isLiveSuiteReport(report: KrnBenchmarkReport): boolean {
  return report.benchmark_id === "krn-benchmark-live-suite" && report.measurement_mode === "live_codex_exec";
}

function isCleanCompletedLiveReport(report: KrnBenchmarkReport): boolean {
  return (
    isLiveSuiteReport(report) &&
    report.task_count > 0 &&
    report.completed_task_count === report.task_count &&
    report.blocked_task_count === 0 &&
    report.failed_task_count === 0
  );
}

function isProductivityLiftReady(report: KrnBenchmarkReport): boolean {
  return (
    isCleanCompletedLiveReport(report) &&
    report.task_count >= report.minimum_task_count_for_lift_claim &&
    report.assisted_minus_baseline > 0 &&
    report.lift_status === "positive_lift" &&
    report.productivity_lift_claimed
  );
}

function compareReportsNewestFirst(left: BenchmarkReportRecord, right: BenchmarkReportRecord): number {
  const createdAtCompare = right.report.created_at.localeCompare(left.report.created_at);
  if (createdAtCompare !== 0) {
    return createdAtCompare;
  }
  return right.path.localeCompare(left.path);
}

function assessStability(records: readonly BenchmarkReportRecord[]): StabilitySummary {
  const liveReports = records.filter((record) => isLiveSuiteReport(record.report)).sort(compareReportsNewestFirst);
  const cleanReports = liveReports.filter((record) => isCleanCompletedLiveReport(record.report));
  const dirtyReports = liveReports.filter((record) => !isCleanCompletedLiveReport(record.report));
  const latest = liveReports[0] ?? null;
  const latestIsClean = latest ? isCleanCompletedLiveReport(latest.report) : false;
  const recentWindow = liveReports.slice(0, MIN_REPEATED_CLEAN_REPORTS_FOR_EXPANSION);
  const suiteExpansionReady =
    recentWindow.length >= MIN_REPEATED_CLEAN_REPORTS_FOR_EXPANSION &&
    recentWindow.every((record) => isCleanCompletedLiveReport(record.report));
  const productivityLiftReady = liveReports.some((record) => isProductivityLiftReady(record.report));

  return {
    evaluated_live_report_count: liveReports.length,
    clean_completed_live_report_count: cleanReports.length,
    dirty_live_report_count: dirtyReports.length,
    latest_live_report_path: latest?.path ?? null,
    latest_live_report_is_clean: latestIsClean,
    suite_expansion_ready: suiteExpansionReady,
    productivity_lift_ready: productivityLiftReady,
    next_allowed_action: nextAllowedAction(liveReports.length, latestIsClean, suiteExpansionReady, productivityLiftReady),
  };
}

function nextAllowedAction(
  liveReportCount: number,
  latestIsClean: boolean,
  suiteExpansionReady: boolean,
  productivityLiftReady: boolean,
): string {
  if (productivityLiftReady) {
    return "review positive live lift evidence before any product claim";
  }
  if (suiteExpansionReady) {
    return "review suite expansion toward the 20-task lift gate without claiming productivity lift";
  }
  if (liveReportCount === 0) {
    return "run explicit live suite under typed policy before suite expansion";
  }
  if (!latestIsClean) {
    return "repair live runner stability until the latest live report completes every task cleanly";
  }
  return "repeat the clean live run under the typed policy before suite expansion";
}

function reportRecord(path: string, report: KrnBenchmarkReport): BenchmarkReportRecord {
  return { path, report };
}

function listLiveSuiteReportPaths(root = resolve(LIVE_SUITE_REPORT_ROOT)): string[] {
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    return [];
  }

  return readdirSync(root)
    .map((entry) => resolve(root, entry, "report.json"))
    .filter((path) => existsSync(path) && statSync(path).isFile())
    .sort();
}

function toTargetRelativePath(path: string): string {
  const root = `${process.cwd()}/`;
  return path.startsWith(root) ? path.slice(root.length) : path;
}

function readCurrentLiveSuiteRecords(): BenchmarkReportRecord[] {
  const records: BenchmarkReportRecord[] = [];
  for (const path of listLiveSuiteReportPaths()) {
    try {
      const parsed = parseKrnBenchmarkReport(readJson(path));
      if (isLiveSuiteReport(parsed)) {
        records.push(reportRecord(toTargetRelativePath(path), parsed));
      }
    } catch {
      // Invalid historical local reports are not readiness evidence. Contract-specific
      // invalidity is covered by the benchmark report parser and dashboard evals.
    }
  }
  return records;
}

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-benchmark-live-stability/cases.json")));
  const results: CaseResult[] = [];
  const cleanReport = buildCleanLiveReport("20260620T120100Z-clean-live-stability-fixture", "2026-06-20T12:01:00.000Z");
  const repeatedCleanReport = buildCleanLiveReport(
    "20260620T120200Z-clean-live-stability-fixture",
    "2026-06-20T12:02:00.000Z",
  );
  const dirtyReport = buildDirtyLiveReport();

  const knownBadCase = caseById(cases, "known-bad-positive-status-rejected");
  try {
    parseKrnBenchmarkReport(
      readJson(resolve("docs/specs/krn-benchmark-report/fixtures/bad-positive-lift-status-with-failed-task.example.json")),
    );
    results.push(
      result(
        knownBadCase.id,
        false,
        ["known-bad positive status fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad positive lift status fixture unexpectedly parsed.",
      ),
    );
  } catch {
    results.push(
      result(
        knownBadCase.id,
        true,
        ["known-bad positive status fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad positive lift status fixture failed as expected.",
      ),
    );
  }

  const dirtyCase = caseById(cases, "dirty-live-report-blocks-expansion");
  const dirtySummary = assessStability([reportRecord(dirtyReport.benchmark_report_path, dirtyReport)]);
  results.push(
    result(
      dirtyCase.id,
      dirtySummary.evaluated_live_report_count === 1 &&
        dirtySummary.dirty_live_report_count === 1 &&
        !dirtySummary.suite_expansion_ready &&
        !dirtySummary.productivity_lift_ready,
      [
        "dirty live report parses",
        "failed task count blocks clean evidence",
        "suite expansion remains blocked",
        "productivity lift remains blocked",
      ],
      dirtyCase.failure_mode,
      `Dirty fixture: dirty=${dirtySummary.dirty_live_report_count}, next=${dirtySummary.next_allowed_action}.`,
    ),
  );

  const singleCleanCase = caseById(cases, "single-clean-live-report-stays-below-repeat-gate");
  const singleCleanSummary = assessStability([reportRecord(cleanReport.benchmark_report_path, cleanReport)]);
  results.push(
    result(
      singleCleanCase.id,
      singleCleanSummary.clean_completed_live_report_count === 1 &&
        singleCleanSummary.latest_live_report_is_clean &&
        !singleCleanSummary.suite_expansion_ready &&
        !singleCleanSummary.productivity_lift_ready,
      [
        "clean live report parses",
        "latest live report is clean",
        "suite expansion remains blocked without repeat clean evidence",
        "productivity lift remains blocked below twenty tasks",
      ],
      singleCleanCase.failure_mode,
      `Single clean fixture: clean=${singleCleanSummary.clean_completed_live_report_count}, next=${singleCleanSummary.next_allowed_action}.`,
    ),
  );

  const repeatedCleanCase = caseById(cases, "repeated-clean-live-reports-enable-expansion-review-only");
  const repeatedCleanSummary = assessStability([
    reportRecord(cleanReport.benchmark_report_path, cleanReport),
    reportRecord(repeatedCleanReport.benchmark_report_path, repeatedCleanReport),
  ]);
  results.push(
    result(
      repeatedCleanCase.id,
      repeatedCleanSummary.clean_completed_live_report_count === 2 &&
        repeatedCleanSummary.suite_expansion_ready &&
        !repeatedCleanSummary.productivity_lift_ready &&
        repeatedCleanSummary.next_allowed_action.includes("20-task"),
      [
        "repeated clean live reports parse",
        "suite expansion becomes review-ready",
        "productivity lift remains blocked below twenty tasks",
        "next action remains suite expansion review, not lift claim",
      ],
      repeatedCleanCase.failure_mode,
      `Repeated clean fixture: expansion_ready=${repeatedCleanSummary.suite_expansion_ready}, next=${repeatedCleanSummary.next_allowed_action}.`,
    ),
  );

  const currentStoreSummary = assessStability(readCurrentLiveSuiteRecords());
  const currentStoreCase = caseById(cases, "current-live-store-readiness");
  results.push(
    result(
      currentStoreCase.id,
      currentStoreSummary.evaluated_live_report_count >= 0 &&
        (!currentStoreSummary.suite_expansion_ready ||
          (currentStoreSummary.latest_live_report_is_clean &&
            currentStoreSummary.clean_completed_live_report_count >= MIN_REPEATED_CLEAN_REPORTS_FOR_EXPANSION)) &&
        !currentStoreSummary.productivity_lift_ready &&
        currentStoreSummary.next_allowed_action.length > 0,
      [
        "current live store parsed or reported empty",
        "suite expansion readiness follows repeated clean policy",
        "productivity lift readiness follows benchmark lift gate",
        "current next action is explicit",
      ],
      currentStoreCase.failure_mode,
      `Current store: live=${currentStoreSummary.evaluated_live_report_count}, clean=${currentStoreSummary.clean_completed_live_report_count}, dirty=${currentStoreSummary.dirty_live_report_count}, expansion_ready=${currentStoreSummary.suite_expansion_ready}, next=${currentStoreSummary.next_allowed_action}.`,
    ),
  );

  const caveat =
    "This eval proves deterministic live-report readiness classification only; it does not prove measured productivity lift, clean repeated live execution in the current runtime, statistical validity, suite expansion completion, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.";
  const caveatCase = caseById(cases, "eval-report-preserves-overclaim-boundary");
  results.push(
    result(
      caveatCase.id,
      caveat.includes("does not prove measured productivity lift") &&
        caveat.includes("clean repeated live execution") &&
        caveat.includes("dashboard command readiness"),
      [
        "eval report caveat names no productivity lift",
        "eval report caveat names clean repeated live execution gap",
        "eval report caveat names command-surface gap",
      ],
      caveatCase.failure_mode,
      "Eval caveat preserves the stability-vs-lift boundary.",
    ),
  );

  const totalCases = results.length;
  const passedCases = results.filter((caseResult) => caseResult.passed).length;
  const totalAssertions = results.reduce((count, caseResult) => count + caseResult.assertions.length, 0);
  const passedAssertions = results.reduce(
    (count, caseResult) => count + (caseResult.passed ? caseResult.assertions.length : 0),
    0,
  );

  return {
    schema_version: "krn-benchmark-live-stability-result.v1",
    kind: "krn_benchmark_live_stability_result",
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
    stability_summary: currentStoreSummary,
    interpretation_caveat: caveat,
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-benchmark-live-stability", report.run_id);
  const reportPath = resolve(reportDir, "report.json");

  mkdirSync(dirname(reportPath), { recursive: true });
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
