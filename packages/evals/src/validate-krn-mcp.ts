import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import {
  parseKrnControlPlaneResource,
  parseKrnControlPlaneResourceIndex,
} from "@krn/contracts";
import { listKrnControlPlaneResources, readKrnControlPlaneResource } from "@krn/mcp";

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
  schema_version: "krn-mcp-read-model-result.v1";
  kind: "krn_mcp_read_model_result";
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
  generated_resource_uri: string | null;
  interpretation_caveat: string;
};

const REQUIRED_URIS = [
  "krn://runtime/summary",
  "krn://runtime/init/latest",
  "krn://runtime/doctor/latest",
  "krn://runtime/eval/latest",
  "krn://runtime/review/latest",
  "krn://runtime/benchmark/latest",
];

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

function hasRequiredUris(uris: readonly string[]): boolean {
  return REQUIRED_URIS.every((uri) => uris.includes(uri));
}

function copyJsonFixture(targetRoot: string, fixturePath: string, runtimePath: string): void {
  const absoluteRuntimePath = join(targetRoot, runtimePath);
  mkdirSync(dirname(absoluteRuntimePath), { recursive: true });
  writeFileSync(absoluteRuntimePath, readFileSync(resolve(fixturePath), "utf8"), "utf8");
}

function createRuntimeTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-mcp-eval-"));
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-init/examples/init-manifest.example.json",
    ".krn/init/20260619T220000Z-eval/manifest.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-doctor/examples/doctor-report.example.json",
    ".krn/doctor/20260619T220100Z-eval/report.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-eval/examples/krn-eval-report.example.json",
    ".krn/eval/20260619T220200Z-eval/report.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-review/examples/krn-review-report.example.json",
    ".krn/review/20260619T220300Z-eval/report.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-benchmark-report/examples/benchmark-report.example.json",
    ".krn/benchmarks/krn-benchmark-spine/20260619T220400Z-eval/report.json",
  );
  return targetRoot;
}

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-mcp-read-model/cases.json")));
  const results: CaseResult[] = [];
  let generatedResourceUri: string | null = null;

  const caseById = new Map(cases.map((testCase) => [testCase.id, testCase]));

  const validFixtureCase = caseById.get("valid-fixtures-parse");
  if (!validFixtureCase) {
    throw new Error("Missing case valid-fixtures-parse");
  }
  try {
    const index = parseKrnControlPlaneResourceIndex(
      readJson(resolve("docs/specs/krn-mcp-read-model/examples/control-plane-resource-index.example.json")),
    );
    const resource = parseKrnControlPlaneResource(
      readJson(resolve("docs/specs/krn-mcp-read-model/examples/control-plane-resource.example.json")),
    );
    results.push(
      result(
        validFixtureCase.id,
        hasRequiredUris(index.allowlisted_uris) && resource.read_only,
        ["valid index fixture parses", "valid resource fixture parses"],
        validFixtureCase.failure_mode,
        "Valid control-plane read-model fixtures parsed through @krn/contracts.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        validFixtureCase.id,
        false,
        ["valid fixtures parse"],
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
    parseKrnControlPlaneResource(
      readJson(resolve("docs/specs/krn-mcp-read-model/fixtures/bad-control-plane-resource.example.json")),
    );
    results.push(
      result(
        knownBadCase.id,
        false,
        ["known-bad fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad control-plane resource fixture unexpectedly parsed.",
      ),
    );
  } catch {
    results.push(
      result(
        knownBadCase.id,
        true,
        ["known-bad fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad control-plane resource fixture failed as expected.",
      ),
    );
  }

  const generatedCase = caseById.get("generated-read-model-parses");
  if (!generatedCase) {
    throw new Error("Missing case generated-read-model-parses");
  }
  try {
    const targetRoot = createRuntimeTarget();
    const index = listKrnControlPlaneResources(targetRoot);
    const summary = readKrnControlPlaneResource("krn://runtime/summary", targetRoot);
    const review = readKrnControlPlaneResource("krn://runtime/review/latest", targetRoot);
    const benchmark = readKrnControlPlaneResource("krn://runtime/benchmark/latest", targetRoot);
    generatedResourceUri = summary.uri;
    results.push(
      result(
        generatedCase.id,
        hasRequiredUris(index.allowlisted_uris) &&
          summary.read_only &&
          review.status === "available" &&
          benchmark.status === "available" &&
          benchmark.payload?.kind === "krn_benchmark_report" &&
          !index.summary.write_tools_enabled &&
          !index.summary.proposal_tools_enabled,
        [
          "resource index parses",
          "summary resource parses",
          "latest review resource parses",
          "latest benchmark resource parses",
          "write tools disabled",
        ],
        generatedCase.failure_mode,
        "Generated read model parsed isolated .krn runtime reports through @krn/contracts.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        generatedCase.id,
        false,
        ["generated read model parses"],
        generatedCase.failure_mode,
        error instanceof Error ? error.message : "unknown generated read-model error",
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
    schema_version: "krn-mcp-read-model-result.v1",
    kind: "krn_mcp_read_model_result",
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
    generated_resource_uri: generatedResourceUri,
    interpretation_caveat:
      "This eval proves the KRN MCP read-model contract only; it does not prove a deployed MCP transport, dashboard readiness, write-tool safety, human approval, or productivity lift.",
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-mcp-read-model", report.run_id);
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
