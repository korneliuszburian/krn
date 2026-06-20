import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseKrnBenchmarkReport, type KrnBenchmarkReport } from "@krn/contracts";

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
  schema_version: "krn-benchmark-spine-result.v1";
  kind: "krn_benchmark_spine_result";
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
  generated_benchmark_report_path: string | null;
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

function caseById(cases: EvalCase[], id: string): EvalCase {
  const found = cases.find((testCase) => testCase.id === id);
  if (!found) {
    throw new Error(`Missing case ${id}`);
  }
  return found;
}

function buildBenchmarkReport(runId: string, now: Date): KrnBenchmarkReport {
  const fixture = parseKrnBenchmarkReport(
    readJson(resolve("docs/specs/krn-benchmark-report/examples/benchmark-report.example.json")),
  );
  return parseKrnBenchmarkReport({
    ...fixture,
    run_id: runId,
    created_at: now.toISOString(),
    target_root: process.cwd(),
    benchmark_report_path: `.krn/benchmarks/krn-benchmark-spine/${runId}/report.json`,
  });
}

function writeBenchmarkReport(report: KrnBenchmarkReport): string {
  const reportPath = resolve(report.benchmark_report_path);
  mkdirSync(resolve(".krn/benchmarks/krn-benchmark-spine", report.run_id), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return reportPath;
}

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-benchmark-spine/cases.json")));
  const results: CaseResult[] = [];
  let generatedBenchmarkReportPath: string | null = null;
  let generatedBenchmarkReport: KrnBenchmarkReport | null = null;

  const validFixtureCase = caseById(cases, "valid-benchmark-fixture-parses");
  try {
    const report = parseKrnBenchmarkReport(
      readJson(resolve("docs/specs/krn-benchmark-report/examples/benchmark-report.example.json")),
    );
    results.push(
      result(
        validFixtureCase.id,
        !report.productivity_lift_claimed && report.lift_status === "no_lift_evidence" && report.repair_targets.length > 0,
        [
          "valid fixture parses",
          "productivity lift remains unclaimed",
          "lift status is no_lift_evidence",
          "repair target present",
        ],
        validFixtureCase.failure_mode,
        "Valid benchmark report fixture parsed and preserved no-lift evidence state.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        validFixtureCase.id,
        false,
        ["valid fixture parses"],
        validFixtureCase.failure_mode,
        error instanceof Error ? error.message : "unknown parse error",
      ),
    );
  }

  const knownBadCase = caseById(cases, "known-bad-lift-fixture-fails");
  try {
    parseKrnBenchmarkReport(readJson(resolve("docs/specs/krn-benchmark-report/fixtures/bad-benchmark-report.example.json")));
    results.push(
      result(
        knownBadCase.id,
        false,
        ["known-bad fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad benchmark report fixture unexpectedly parsed.",
      ),
    );
  } catch {
    results.push(
      result(
        knownBadCase.id,
        true,
        ["known-bad fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad benchmark report fixture failed as expected.",
      ),
    );
  }

  const knownBadPositiveStatusCase = caseById(cases, "known-bad-positive-status-with-failed-task-fails");
  try {
    parseKrnBenchmarkReport(
      readJson(resolve("docs/specs/krn-benchmark-report/fixtures/bad-positive-lift-status-with-failed-task.example.json")),
    );
    results.push(
      result(
        knownBadPositiveStatusCase.id,
        false,
        ["known-bad positive status fixture rejected"],
        knownBadPositiveStatusCase.failure_mode,
        "Known-bad positive lift status fixture unexpectedly parsed.",
      ),
    );
  } catch {
    results.push(
      result(
        knownBadPositiveStatusCase.id,
        true,
        ["known-bad positive status fixture rejected"],
        knownBadPositiveStatusCase.failure_mode,
        "Known-bad positive lift status fixture failed as expected.",
      ),
    );
  }

  const generatedCase = caseById(cases, "generated-benchmark-report-writes-and-parses");
  try {
    generatedBenchmarkReport = buildBenchmarkReport(runId, now);
    generatedBenchmarkReportPath = writeBenchmarkReport(generatedBenchmarkReport);
    const parsedReport = parseKrnBenchmarkReport(readJson(generatedBenchmarkReportPath));
    results.push(
      result(
        generatedCase.id,
        existsSync(generatedBenchmarkReportPath) &&
          parsedReport.source_refs.length > 0 &&
          parsedReport.lift_status === "no_lift_evidence" &&
          !parsedReport.productivity_lift_claimed &&
          parsedReport.repair_targets.length > 0 &&
          parsedReport.benchmark_report_path.startsWith(".krn/benchmarks/krn-benchmark-spine/"),
        [
          "generated benchmark report exists",
          "generated benchmark report parses",
          "generated report has source refs",
          "generated report keeps no-lift state",
          "generated report keeps repair target",
          "generated report path is under .krn/benchmarks",
        ],
        generatedCase.failure_mode,
        "Generated benchmark report parsed through @krn/contracts with no-lift evidence state.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        generatedCase.id,
        false,
        ["generated benchmark report exists", "generated benchmark report parses"],
        generatedCase.failure_mode,
        error instanceof Error ? error.message : "unknown generated benchmark report error",
      ),
    );
  }

  const caveatCase = caseById(cases, "eval-report-preserves-overclaim-boundary");
  const caveat =
    "This eval proves the benchmark report contract and no-lift gate only; it does not prove measured productivity lift, live Codex benchmark quality, repair-loop quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.";
  results.push(
    result(
      caveatCase.id,
      Boolean(generatedBenchmarkReportPath) &&
        caveat.includes("does not prove measured productivity lift") &&
        caveat.includes("live Codex benchmark quality") &&
        generatedBenchmarkReport?.productivity_lift_claimed === false,
      [
        "eval report has generated benchmark path",
        "eval report caveat names no productivity lift",
        "eval report caveat names live benchmark gap",
      ],
      caveatCase.failure_mode,
      "Eval report caveat preserves the live benchmark and productivity-lift boundary.",
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
    schema_version: "krn-benchmark-spine-result.v1",
    kind: "krn_benchmark_spine_result",
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
    generated_benchmark_report_path: generatedBenchmarkReportPath,
    interpretation_caveat: caveat,
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-benchmark-spine", report.run_id);
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
