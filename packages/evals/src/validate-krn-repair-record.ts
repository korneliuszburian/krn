import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  parseKrnBenchmarkReport,
  parseKrnRepairRecord,
  type KrnBenchmarkReport,
  type KrnRepairRecord,
} from "@krn/contracts";

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
  schema_version: "krn-repair-record-result.v1";
  kind: "krn_repair_record_result";
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
  generated_repair_record_path: string | null;
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

function buildRepairRecordFromBenchmarkReport(report: KrnBenchmarkReport, runId: string, now: Date): KrnRepairRecord {
  return parseKrnRepairRecord({
    schema_version: "krn-repair-record.v1",
    kind: "krn_repair_record",
    repair_id: `repair-${report.benchmark_id}-${report.run_id}`,
    created_at: now.toISOString(),
    owner: "krn",
    status: "proposed",
    failure_source: {
      source_type: "benchmark_report",
      source_ref: report.benchmark_report_path,
      summary: `Benchmark ${report.benchmark_id} produced assisted_minus_baseline ${report.assisted_minus_baseline}.`,
      evidence_refs: [
        report.benchmark_report_path,
        `.krn/evals/${report.benchmark_id}/${report.run_id}/report.json`,
      ],
      source_refs: report.source_refs,
      observed_metric_id: "assisted_minus_baseline",
      observed_metric_value: report.assisted_minus_baseline,
      expected_metric_direction: "increase",
    },
    classification: "benchmark_no_lift",
    repair_surface: "benchmark_suite",
    proposed_repair:
      "Inspect low-scoring assisted benchmark paths and propose one bounded repair before prompt, skill, memory, suite, dashboard, or API changes.",
    next_action:
      "Create the next repair attempt from this record, apply one scoped change, then rerun the live benchmark suite explicitly.",
    attempts: [
      {
        attempt_id: "attempt-001-record-no-lift",
        sequence: 1,
        attempted_change: "No product repair applied yet; this attempt records benchmark no-lift evidence.",
        changed_surfaces: ["none"],
        validator_command: "pnpm run eval:krn-benchmark-live-suite:live",
        validator_report_path: `.krn/evals/${report.benchmark_id}/${report.run_id}/report.json`,
        validator_status: "failed",
        metric_before: report.assisted_minus_baseline,
        metric_after: null,
        metric_delta: null,
        stop_reason: "record_created",
        interpretation_caveat:
          "The live benchmark run completed but failed the repair target because assisted did not beat baseline.",
      },
    ],
    source_refs: [
      ...new Set([
        ...report.source_refs,
        "docs/goals/goal-021.md",
        "docs/specs/krn-repair-record/README.md",
        "docs/evals/krn-repair-record/README.md",
      ]),
    ],
    evidence_refs: [
      report.benchmark_report_path,
      `.krn/evals/${report.benchmark_id}/${report.run_id}/report.json`,
      `.krn/repairs/krn-repair-record/${runId}/repair-record.json`,
    ],
    blocked_surfaces: [
      "productivity_lift_claim",
      "prompt_tuning_without_repair_record",
      "default_live_eval",
      "dashboard_auto_repair",
    ],
    interpretation_caveat:
      "This generated record proves only a typed no-lift repair handoff. It does not prove repair quality, productivity lift, prompt improvement, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.",
  });
}

function writeRepairRecord(record: KrnRepairRecord, runId: string): string {
  const reportDir = resolve(".krn/repairs/krn-repair-record", runId);
  const reportPath = resolve(reportDir, "repair-record.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(record, null, 2)}\n`, "utf8");

  return reportPath;
}

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-repair-record/cases.json")));
  const results: CaseResult[] = [];
  let generatedRepairRecordPath: string | null = null;

  const validFixtureCase = caseById(cases, "valid-repair-record-fixture-parses");
  try {
    const record = parseKrnRepairRecord(
      readJson(resolve("docs/specs/krn-repair-record/examples/repair-record.example.json")),
    );
    results.push(
      result(
        validFixtureCase.id,
        record.classification === "benchmark_no_lift" && record.status === "proposed",
        ["valid fixture parses", "valid fixture remains proposed"],
        validFixtureCase.failure_mode,
        "Valid repair record fixture parsed through @krn/contracts.",
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

  const knownBadCase = caseById(cases, "known-bad-repair-record-fails");
  try {
    parseKrnRepairRecord(readJson(resolve("docs/specs/krn-repair-record/fixtures/bad-repair-record.example.json")));
    results.push(
      result(
        knownBadCase.id,
        false,
        ["known-bad fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad repair record fixture unexpectedly parsed.",
      ),
    );
  } catch {
    results.push(
      result(
        knownBadCase.id,
        true,
        ["known-bad fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad repair record fixture failed as expected.",
      ),
    );
  }

  const generatedCase = caseById(cases, "benchmark-no-lift-generates-repair-record");
  try {
    const benchmarkReport = parseKrnBenchmarkReport(
      readJson(resolve("docs/specs/krn-repair-record/fixtures/benchmark-no-lift-report.example.json")),
    );
    const repairRecord = buildRepairRecordFromBenchmarkReport(benchmarkReport, runId, now);
    generatedRepairRecordPath = writeRepairRecord(repairRecord, runId);
    const parsedRecord = parseKrnRepairRecord(readJson(generatedRepairRecordPath));

    results.push(
      result(
        generatedCase.id,
        benchmarkReport.assisted_minus_baseline <= 0 &&
          existsSync(generatedRepairRecordPath) &&
          parsedRecord.classification === "benchmark_no_lift" &&
          parsedRecord.status === "proposed" &&
          parsedRecord.blocked_surfaces.includes("productivity_lift_claim"),
        [
          "benchmark fixture parses",
          "generated repair record exists",
          "generated repair record parses",
          "classification is benchmark_no_lift",
          "repair status is proposed",
          "productivity lift is blocked",
        ],
        generatedCase.failure_mode,
        "Benchmark no-lift fixture generated a parseable proposed repair record.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        generatedCase.id,
        false,
        ["benchmark fixture parses", "generated repair record parses"],
        generatedCase.failure_mode,
        error instanceof Error ? error.message : "unknown generated repair record error",
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
    schema_version: "krn-repair-record-result.v1",
    kind: "krn_repair_record_result",
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
    generated_repair_record_path: generatedRepairRecordPath,
    interpretation_caveat:
      "This eval proves benchmark no-lift repair-record contract behavior only; it does not prove repair quality, productivity lift, prompt improvement, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.",
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-repair-record", report.run_id);
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
