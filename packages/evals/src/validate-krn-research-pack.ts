import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseKrnResearchPack } from "@krn/contracts";
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
  schema_version: "krn-research-pack-result.v1";
  kind: "krn_research_pack_result";
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
  generated_research_pack_path: string | null;
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

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-research-pack/cases.json")));
  const results: CaseResult[] = [];
  let generatedResearchPackPath: string | null = null;

  const validFixtureCase = caseById(cases, "valid-fixture-parses");
  try {
    const pack = parseKrnResearchPack(
      readJson(resolve("docs/specs/krn-research-pack/examples/research-pack.example.json")),
    );
    results.push(
      result(
        validFixtureCase.id,
        pack.status === "ready_for_review" &&
          pack.sources.length >= pack.source_budget.min_sources &&
          pack.mechanism_matrix.length > 0,
        ["valid fixture parses", "source budget present", "mechanism matrix present"],
        validFixtureCase.failure_mode,
        "Valid research pack fixture parsed through @krn/contracts.",
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

  const knownBadCase = caseById(cases, "known-bad-shallow-ready-pack-fails");
  try {
    parseKrnResearchPack(
      readJson(resolve("docs/specs/krn-research-pack/fixtures/bad-research-pack.example.json")),
    );
    results.push(
      result(
        knownBadCase.id,
        false,
        ["known-bad fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad research pack fixture unexpectedly parsed.",
      ),
    );
  } catch {
    results.push(
      result(
        knownBadCase.id,
        true,
        ["known-bad fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad research pack fixture failed as expected.",
      ),
    );
  }

  const generatedCase = caseById(cases, "generated-scaffold-parses");
  const cliResult = runKrnCli([
    "research-pack",
    "--question",
    "Which bounded researcher pattern should KRN test next?",
    "--decision",
    "Decide whether to add a long-running researcher worker after the typed pack scaffold.",
    "--budget",
    "quick",
    "--target",
    ".",
  ]);
  generatedResearchPackPath = cliResult.stdout.trim();
  if (cliResult.exitCode !== 0) {
    results.push(
      result(
        generatedCase.id,
        false,
        ["CLI exits zero", "generated pack parses"],
        generatedCase.failure_mode,
        cliResult.stderr,
      ),
    );
  } else {
    try {
      const pack = parseKrnResearchPack(readJson(generatedResearchPackPath));
      results.push(
        result(
          generatedCase.id,
          existsSync(generatedResearchPackPath) &&
            pack.status === "scaffolded" &&
            pack.sources.length === 0 &&
            pack.mechanism_matrix.length === 0 &&
            pack.decision_candidates.length === 0 &&
            !pack.source_refs.includes("docs/goals/goal-038.md") &&
            !pack.source_refs.includes("docs/plans/canonical/draft.md"),
          [
            "CLI exits zero",
            "generated pack exists",
            "generated pack parses",
            "status is scaffolded",
            "no completed source work is claimed",
            "generated scaffold excludes active-goal truth",
          ],
          generatedCase.failure_mode,
          "Generated research-pack scaffold parsed through @krn/contracts.",
        ),
      );
    } catch (error: unknown) {
      results.push(
        result(
          generatedCase.id,
          false,
          ["generated pack parses"],
          generatedCase.failure_mode,
          error instanceof Error ? error.message : "unknown generated pack error",
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
    schema_version: "krn-research-pack-result.v1",
    kind: "krn_research_pack_result",
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
    generated_research_pack_path: generatedResearchPackPath,
    interpretation_caveat:
      "This eval proves research-pack scaffold contract behavior only; it does not prove source quality, researcher-worker quality, productivity lift, memory promotion correctness, dashboard command readiness, HTTP/API readiness, or ChatGPT connector behavior.",
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-research-pack", report.run_id);
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
