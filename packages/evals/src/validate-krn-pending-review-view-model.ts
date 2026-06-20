import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { parseKrnControlPlaneProposal, parseKrnPendingReviewViewModel } from "@krn/contracts";
import { buildKrnPendingReviewViewModel, storeKrnControlPlaneProposal } from "@krn/mcp";

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
  schema_version: "krn-pending-review-view-model-result.v1";
  kind: "krn_pending_review_view_model_result";
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
  generated_queue_state: string | null;
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

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function validProposal(): ReturnType<typeof parseKrnControlPlaneProposal> {
  return parseKrnControlPlaneProposal(
    readJson(resolve("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json")),
  );
}

function createProposalTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-pending-review-eval-"));
  const proposal = validProposal();
  for (const sourceRef of proposal.source_refs) {
    writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
  }
  return targetRoot;
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
  const cases = parseCases(readJson(resolve("docs/evals/krn-pending-review-view-model/cases.json")));
  const results: CaseResult[] = [];
  let generatedQueueState: string | null = null;

  const renderCase = caseById(cases, "proposal-store-records-render-pending-review");
  try {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    const stored = storeKrnControlPlaneProposal(proposal, {
      targetInput: targetRoot,
      now: new Date("2026-06-20T00:00:00.000Z"),
    });
    const viewModel = parseKrnPendingReviewViewModel(
      buildKrnPendingReviewViewModel(targetRoot, new Date("2026-06-20T00:01:00.000Z")),
    );
    generatedQueueState = viewModel.queue_state;
    const targetMutated =
      proposal.target.target_type === "path" ? existsSync(join(targetRoot, proposal.target.path)) : false;

    results.push(
      result(
        renderCase.id,
        stored.status === "stored" &&
          viewModel.pending_proposals === 1 &&
          viewModel.proposals[0]?.proposal_path === stored.proposal_path &&
          !targetMutated &&
          viewModel.proposals[0]?.review_gate_state === "not_reviewed",
        [
          "proposal store read",
          "typed view model parses",
          "pending proposal rendered",
          "target path not mutated",
          "proposal remains not reviewed",
        ],
        renderCase.failure_mode,
        "Pending Review rendered one source-backed proposal-store record without target mutation.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        renderCase.id,
        false,
        ["proposal store pending review row"],
        renderCase.failure_mode,
        error instanceof Error ? error.message : "unknown pending review render error",
      ),
    );
  }

  const emptyCase = caseById(cases, "empty-proposal-store-explicit-zero");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-pending-review-empty-eval-"));
    const viewModel = parseKrnPendingReviewViewModel(
      buildKrnPendingReviewViewModel(targetRoot, new Date("2026-06-20T00:00:00.000Z")),
    );

    results.push(
      result(
        emptyCase.id,
        viewModel.source === "explicit_zero_no_proposals" &&
          viewModel.queue_state === "empty" &&
          viewModel.no_mock_state,
        ["empty store explicit zero", "queue state empty", "no mock state"],
        emptyCase.failure_mode,
        "Empty proposal store rendered explicit zero Pending Review state.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        emptyCase.id,
        false,
        ["empty store explicit zero"],
        emptyCase.failure_mode,
        error instanceof Error ? error.message : "unknown empty-store check error",
      ),
    );
  }

  const invalidCase = caseById(cases, "invalid-proposal-record-blocks-readiness");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-pending-review-invalid-eval-"));
    writeText(join(targetRoot, ".krn/proposals/bad/proposal.json"), "{\"bad\": true}\n");
    const viewModel = parseKrnPendingReviewViewModel(
      buildKrnPendingReviewViewModel(targetRoot, new Date("2026-06-20T00:00:00.000Z")),
    );

    results.push(
      result(
        invalidCase.id,
        viewModel.invalid_records_count === 1 && viewModel.queue_state === "blocked" && viewModel.pending_proposals === 0,
        ["invalid record surfaced", "queue state blocked", "invalid proposal not counted as pending"],
        invalidCase.failure_mode,
        "Invalid proposal-store record blocked Pending Review readiness.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        invalidCase.id,
        false,
        ["invalid proposal record blocks readiness"],
        invalidCase.failure_mode,
        error instanceof Error ? error.message : "unknown invalid-record check error",
      ),
    );
  }

  const staleCase = caseById(cases, "stale-source-ref-blocks-readiness");
  try {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    storeKrnControlPlaneProposal(proposal, {
      targetInput: targetRoot,
      now: new Date("2026-06-20T00:00:00.000Z"),
    });
    rmSync(join(targetRoot, proposal.source_refs[0] ?? ""), { force: true });
    const viewModel = parseKrnPendingReviewViewModel(
      buildKrnPendingReviewViewModel(targetRoot, new Date("2026-06-20T00:01:00.000Z")),
    );

    results.push(
      result(
        staleCase.id,
        viewModel.pending_proposals === 1 &&
          viewModel.proposals[0]?.source_ref_status === "stale" &&
          viewModel.queue_state === "blocked",
        ["stored proposal rendered", "source ref status stale", "queue state blocked"],
        staleCase.failure_mode,
        "Pending Review blocked readiness for a stored proposal with stale source refs.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        staleCase.id,
        false,
        ["stale source refs block readiness"],
        staleCase.failure_mode,
        error instanceof Error ? error.message : "unknown stale-source check error",
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
    schema_version: "krn-pending-review-view-model-result.v1",
    kind: "krn_pending_review_view_model_result",
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
    generated_queue_state: generatedQueueState,
    interpretation_caveat:
      "This eval proves the local Pending Review view-model boundary over proposal-store records only; it does not prove dashboard UI readiness, human approval quality, HTTP/API readiness, ChatGPT connector behavior, or productivity lift.",
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-pending-review-view-model", report.run_id);
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
