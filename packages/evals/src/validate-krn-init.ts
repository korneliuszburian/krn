import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseInitManifest } from "@krn/contracts";
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
  schema_version: "krn-init-contracts-result.v1";
  kind: "krn_init_contracts_result";
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
  generated_manifest_path: string | null;
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

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-init-contracts/cases.json")));
  const results: CaseResult[] = [];
  let generatedManifestPath: string | null = null;

  const caseById = new Map(cases.map((testCase) => [testCase.id, testCase]));

  const validFixtureCase = caseById.get("valid-fixture-parses");
  if (!validFixtureCase) {
    throw new Error("Missing case valid-fixture-parses");
  }
  try {
    const manifest = parseInitManifest(readJson(resolve("docs/specs/krn-init/examples/init-manifest.example.json")));
    results.push(
      result(
        validFixtureCase.id,
        manifest.mode === "dry-run" && manifest.interpretation_caveat.length > 0,
        ["valid fixture parses", "dry-run mode", "interpretation caveat present"],
        validFixtureCase.failure_mode,
        "Valid fixture parsed through @krn/contracts.",
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
    parseInitManifest(readJson(resolve("docs/specs/krn-init/fixtures/bad-init-manifest.example.json")));
    results.push(
      result(
        knownBadCase.id,
        false,
        ["known-bad fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad fixture unexpectedly parsed.",
      ),
    );
  } catch {
    results.push(
      result(
        knownBadCase.id,
        true,
        ["known-bad fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad fixture failed as expected.",
      ),
    );
  }

  const generatedCase = caseById.get("generated-dry-run-manifest-parses");
  if (!generatedCase) {
    throw new Error("Missing case generated-dry-run-manifest-parses");
  }
  const cliResult = runKrnCli(["init", "--dry-run", "--target", "."]);
  const cliManifestPath = cliResult.stdout.trim();
  generatedManifestPath = cliManifestPath;
  if (cliResult.exitCode !== 0) {
    results.push(
      result(
        generatedCase.id,
        false,
        ["CLI exits zero", "generated manifest parses"],
        generatedCase.failure_mode,
        cliResult.stderr,
      ),
    );
  } else {
    try {
      const manifest = parseInitManifest(readJson(cliManifestPath));
      const onlyAllowedWrite = manifest.planned_files.some((file) => file.path.endsWith("/manifest.json"));
      results.push(
        result(
          generatedCase.id,
          manifest.mode === "dry-run" && existsSync(cliManifestPath) && onlyAllowedWrite,
          ["CLI exits zero", "generated manifest exists", "generated manifest parses", "dry-run mode"],
          generatedCase.failure_mode,
          "Generated dry-run manifest parsed through @krn/contracts.",
        ),
      );
    } catch (error: unknown) {
      results.push(
        result(
          generatedCase.id,
          false,
          ["generated manifest parses"],
          generatedCase.failure_mode,
          error instanceof Error ? error.message : "unknown generated manifest error",
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
    schema_version: "krn-init-contracts-result.v1",
    kind: "krn_init_contracts_result",
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
    generated_manifest_path: generatedManifestPath,
    interpretation_caveat:
      "This eval proves krn-init contract behavior only; it does not prove productivity lift, dashboard readiness, MCP readiness, or write-mode safety.",
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-init-contracts", report.run_id);
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
