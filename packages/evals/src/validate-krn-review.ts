import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseKrnReviewReport } from "@krn/contracts";
import { runKrnCli } from "@krn/cli";

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
  schema_version: "krn-review-contracts-result.v1";
  kind: "krn_review_contracts_result";
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
  generated_report_path: string | null;
  interpretation_caveat: string;
};

const REQUIRED_ARTIFACTS = ["latest-init-manifest", "latest-doctor-report", "latest-eval-report"];

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

    return {
      id,
      expected_behavior: expectedBehavior,
      metrics,
      failure_mode: failureMode,
    };
  });
}

function result(id: string, passed: boolean, assertions: string[], failureMode: string, message: string): CaseResult {
  return { id, passed, assertions, failure_mode: failureMode, message };
}

function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}`;
}

function hasRequiredArtifacts(report: ReturnType<typeof parseKrnReviewReport>): boolean {
  const artifactIds = report.artifacts.map((artifact) => artifact.id);
  return REQUIRED_ARTIFACTS.every((artifactId) => artifactIds.includes(artifactId));
}

function hasMemoryApplication(report: ReturnType<typeof parseKrnReviewReport>): boolean {
  return report.memory_selection.selected.length > 0 && report.memory_application.applied_memory_ids.length > 0;
}

function proposalsAreReviewOnly(report: ReturnType<typeof parseKrnReviewReport>): boolean {
  return report.proposals.every((proposal) => proposal.status === "proposal_only");
}

function runReviewWithFixtureStore(target: string): ReturnType<typeof runKrnCli> {
  const storeDir = mkdtempSync(join(tmpdir(), "krn-review-eval-store-"));
  const storePath = join(storeDir, "memory-store.json");
  const previousStorePath = process.env["KRN_MEMORY_STORE_PATH"];

  copyFileSync(resolve("docs/specs/krn-memory-store/examples/local-memory-store.example.json"), storePath);
  process.env["KRN_MEMORY_STORE_PATH"] = storePath;
  try {
    return runKrnCli(["review", "--target", target]);
  } finally {
    if (previousStorePath === undefined) {
      delete process.env["KRN_MEMORY_STORE_PATH"];
    } else {
      process.env["KRN_MEMORY_STORE_PATH"] = previousStorePath;
    }
  }
}

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-review-contracts/cases.json")));
  const results: CaseResult[] = [];
  let generatedReportPath: string | null = null;

  const caseById = new Map(cases.map((testCase) => [testCase.id, testCase]));

  const validFixtureCase = caseById.get("valid-fixture-parses");
  if (!validFixtureCase) {
    throw new Error("Missing case valid-fixture-parses");
  }
  try {
    const report = parseKrnReviewReport(readJson(resolve("docs/specs/krn-review/examples/krn-review-report.example.json")));
    results.push(
      result(
        validFixtureCase.id,
        report.command === "krn review" && hasRequiredArtifacts(report) && proposalsAreReviewOnly(report),
        ["valid fixture parses", "required runtime artifacts present", "proposals are proposal-only"],
        validFixtureCase.failure_mode,
        "Valid krn-review fixture parsed through @krn/contracts.",
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

  const knownBadCase = caseById.get("known-bad-fixture-fails");
  if (!knownBadCase) {
    throw new Error("Missing case known-bad-fixture-fails");
  }
  try {
    parseKrnReviewReport(readJson(resolve("docs/specs/krn-review/fixtures/bad-krn-review-report.example.json")));
    results.push(
      result(
        knownBadCase.id,
        false,
        ["known-bad fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad krn-review fixture unexpectedly parsed.",
      ),
    );
  } catch {
    results.push(
      result(
        knownBadCase.id,
        true,
        ["known-bad fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad krn-review fixture failed as expected.",
      ),
    );
  }

  const generatedCase = caseById.get("generated-review-report-parses");
  if (!generatedCase) {
    throw new Error("Missing case generated-review-report-parses");
  }
  const cliResult = runReviewWithFixtureStore(".");
  const cliReportPath = cliResult.stdout.trim();
  generatedReportPath = cliReportPath;
  if (cliResult.exitCode !== 0) {
    results.push(
      result(generatedCase.id, false, ["CLI exits zero", "generated report parses"], generatedCase.failure_mode, cliResult.stderr),
    );
  } else {
    try {
      const report = parseKrnReviewReport(readJson(cliReportPath));
      results.push(
        result(
          generatedCase.id,
          report.command === "krn review" &&
            existsSync(cliReportPath) &&
            hasRequiredArtifacts(report) &&
            hasMemoryApplication(report) &&
            proposalsAreReviewOnly(report),
          [
            "CLI exits zero",
            "generated report exists",
            "generated report parses",
            "memory selection is applied",
            "proposals are proposal-only",
          ],
          generatedCase.failure_mode,
          "Generated krn review report parsed through @krn/contracts.",
        ),
      );
    } catch (error: unknown) {
      results.push(
        result(
          generatedCase.id,
          false,
          ["generated report parses"],
          generatedCase.failure_mode,
          error instanceof Error ? error.message : "unknown generated report error",
        ),
      );
    }
  }

  const totalCases = results.length;
  const passedCases = results.filter((caseResult) => caseResult.passed).length;
  const totalAssertions = results.reduce((count, caseResult) => count + caseResult.assertions.length, 0);
  const passedAssertions = results.reduce(
    (count, caseResult) => count + (caseResult.passed ? caseResult.assertions.length : 0),
    0,
  );

  return {
    schema_version: "krn-review-contracts-result.v1",
    kind: "krn_review_contracts_result",
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
    generated_report_path: generatedReportPath,
    interpretation_caveat:
      "This eval proves krn review proposal-report contract behavior and memory-application wiring only; it does not prove human approval, productivity lift, final memory quality, API/MCP readiness, or dashboard readiness.",
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-review-contracts", report.run_id);
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
