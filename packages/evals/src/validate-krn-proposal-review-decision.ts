import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import {
  parseKrnControlPlaneProposal,
  parseKrnPendingReviewViewModel,
  parseKrnProposalReviewDecision,
  type KrnControlPlaneProposal,
  type KrnProposalReviewDecision,
} from "@krn/contracts";
import {
  buildKrnPendingReviewViewModel,
  storeKrnControlPlaneProposal,
  storeKrnProposalReviewDecision,
} from "@krn/mcp";

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
  schema_version: "krn-proposal-review-decision-result.v1";
  kind: "krn_proposal_review_decision_eval_result";
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
  stored_decision_path: string | null;
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

function collectFiles(targetRoot: string, prefix = ""): string[] {
  const absoluteRoot = join(targetRoot, prefix);
  return readdirSync(absoluteRoot, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(prefix, entry.name);
    if (entry.isDirectory()) {
      return collectFiles(targetRoot, entryPath);
    }
    return entryPath.replaceAll("\\", "/");
  });
}

function validProposal(): KrnControlPlaneProposal {
  return parseKrnControlPlaneProposal(
    readJson(resolve("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json")),
  );
}

function validDecisionFor(proposal: KrnControlPlaneProposal, proposalPath: string): KrnProposalReviewDecision {
  const decision = parseKrnProposalReviewDecision(
    readJson(resolve("docs/specs/krn-proposal-review-decision/examples/proposal-review-decision.example.json")),
  );

  return parseKrnProposalReviewDecision({
    ...decision,
    proposal_id: proposal.proposal_id,
    proposal_path: proposalPath,
    source_refs: proposal.source_refs,
    evidence_refs: proposal.evidence_refs,
  });
}

function createProposalTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-review-decision-eval-"));
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
  const cases = parseCases(readJson(resolve("docs/evals/krn-proposal-review-decision/cases.json")));
  const results: CaseResult[] = [];
  let storedDecisionPath: string | null = null;
  let generatedQueueState: string | null = null;

  const contractCase = caseById(cases, "decision-contract-valid-and-known-bad");
  try {
    const decision = parseKrnProposalReviewDecision(
      readJson(resolve("docs/specs/krn-proposal-review-decision/examples/proposal-review-decision.example.json")),
    );
    let knownBadRejected = false;
    try {
      parseKrnProposalReviewDecision(
        readJson(resolve("docs/specs/krn-proposal-review-decision/fixtures/bad-proposal-review-decision.example.json")),
      );
    } catch {
      knownBadRejected = true;
    }

    results.push(
      result(
        contractCase.id,
        decision.target_mutated === false && decision.promotion_state === "not_promoted" && knownBadRejected,
        ["valid decision fixture parses", "known-bad mutation fixture rejected", "decision does not mutate target"],
        contractCase.failure_mode,
        "Proposal review decision fixtures enforce no target mutation and no promotion.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        contractCase.id,
        false,
        ["decision contract fixtures"],
        contractCase.failure_mode,
        error instanceof Error ? error.message : "unknown decision contract error",
      ),
    );
  }

  const storeCase = caseById(cases, "append-only-review-decision-store");
  try {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    const storedProposal = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot, now });
    const beforeFiles = collectFiles(targetRoot);
    const storedDecision = storeKrnProposalReviewDecision(validDecisionFor(proposal, storedProposal.proposal_path), {
      targetInput: targetRoot,
      now,
    });
    storedDecisionPath = storedDecision.decision_path;
    const newFiles = collectFiles(targetRoot).filter((file) => !beforeFiles.includes(file));
    const targetMutated = proposal.target.target_type === "path" ? existsSync(join(targetRoot, proposal.target.path)) : false;

    results.push(
      result(
        storeCase.id,
        storedProposal.status === "stored" &&
          storedDecision.status === "stored" &&
          storedDecision.decision_path.startsWith(".krn/proposal-reviews/") &&
          newFiles.length === 1 &&
          newFiles[0] === storedDecision.decision_path &&
          !targetMutated,
        [
          "proposal stored first",
          "decision stored under .krn/proposal-reviews",
          "decision source refs validated",
          "target files outside review ledger unchanged",
        ],
        storeCase.failure_mode,
        "Review decision stored append-only under .krn/proposal-reviews for an existing proposal.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        storeCase.id,
        false,
        ["append-only review decision store"],
        storeCase.failure_mode,
        error instanceof Error ? error.message : "unknown review decision store error",
      ),
    );
  }

  const duplicateCase = caseById(cases, "duplicate-review-decision-idempotent");
  try {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    const storedProposal = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot, now });
    const decision = validDecisionFor(proposal, storedProposal.proposal_path);
    const first = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot, now });
    const second = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot, now });

    results.push(
      result(
        duplicateCase.id,
        first.status === "stored" && second.status === "already_stored" && first.decision_path === second.decision_path,
        [
          "first review decision stored",
          "duplicate review decision already stored",
          "duplicate review decision uses same path",
        ],
        duplicateCase.failure_mode,
        "Duplicate review decision write returned the existing path for the same idempotency key and content.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        duplicateCase.id,
        false,
        ["duplicate review decision idempotent"],
        duplicateCase.failure_mode,
        error instanceof Error ? error.message : "unknown duplicate review decision error",
      ),
    );
  }

  const missingProposalCase = caseById(cases, "missing-proposal-review-decision-rejected");
  try {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    const decision = validDecisionFor(proposal, ".krn/proposals/missing/proposal.json");
    let rejected = false;
    try {
      storeKrnProposalReviewDecision(decision, { targetInput: targetRoot, now });
    } catch {
      rejected = true;
    }

    results.push(
      result(
        missingProposalCase.id,
        rejected,
        ["missing proposal rejected"],
        missingProposalCase.failure_mode,
        "Review decision for a missing proposal was rejected before persistence.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        missingProposalCase.id,
        false,
        ["missing proposal rejection"],
        missingProposalCase.failure_mode,
        error instanceof Error ? error.message : "unknown missing proposal check error",
      ),
    );
  }

  const conflictCase = caseById(cases, "conflicting-terminal-review-decision-rejected");
  try {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    const storedProposal = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot, now });
    storeKrnProposalReviewDecision(validDecisionFor(proposal, storedProposal.proposal_path), { targetInput: targetRoot, now });
    const conflictingDecision = validDecisionFor(proposal, storedProposal.proposal_path);
    const conflictingInput = parseKrnProposalReviewDecision({
      ...conflictingDecision,
      decision_id: "decision-conflicting-terminal-review",
      decision: "rejected",
      rationale: "A second terminal decision for the same proposal must not be accepted.",
      write_policy: {
        default_effect: "no_target_mutation",
        allowed_persistence: "append_only",
        idempotency_key: "review-decision:conflicting-terminal-review:2026-06-20",
      },
    });
    let rejected = false;
    try {
      storeKrnProposalReviewDecision(conflictingInput, { targetInput: targetRoot, now });
    } catch {
      rejected = true;
    }

    results.push(
      result(
        conflictCase.id,
        rejected,
        ["conflicting terminal decision rejected"],
        conflictCase.failure_mode,
        "A second terminal review decision for the same proposal was rejected.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        conflictCase.id,
        false,
        ["conflicting terminal review decision"],
        conflictCase.failure_mode,
        error instanceof Error ? error.message : "unknown conflicting decision check error",
      ),
    );
  }

  const pendingReviewCase = caseById(cases, "pending-review-excludes-reviewed-proposal");
  try {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    const storedProposal = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot, now });
    storeKrnProposalReviewDecision(validDecisionFor(proposal, storedProposal.proposal_path), { targetInput: targetRoot, now });
    const viewModel = parseKrnPendingReviewViewModel(buildKrnPendingReviewViewModel(targetRoot, now));
    generatedQueueState = viewModel.queue_state;

    results.push(
      result(
        pendingReviewCase.id,
        viewModel.total_review_decisions === 1 &&
          viewModel.pending_proposals === 0 &&
          viewModel.reviewed_proposals === 1 &&
          viewModel.queue_state === "empty" &&
          viewModel.interpretation_caveat.includes("does not promote"),
        [
          "review decision present",
          "pending proposal count zero",
          "reviewed proposal count one",
          "queue state empty",
          "no promotion claimed",
        ],
        pendingReviewCase.failure_mode,
        "Pending Review excluded a proposal after a valid terminal review decision without claiming promotion.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        pendingReviewCase.id,
        false,
        ["pending review excludes reviewed proposal"],
        pendingReviewCase.failure_mode,
        error instanceof Error ? error.message : "unknown pending review exclusion error",
      ),
    );
  }

  const invalidDecisionCase = caseById(cases, "invalid-review-decision-blocks-readiness");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-invalid-review-decision-eval-"));
    writeText(join(targetRoot, ".krn/proposal-reviews/bad/decision.json"), "{\"bad\": true}\n");
    const viewModel = parseKrnPendingReviewViewModel(buildKrnPendingReviewViewModel(targetRoot, now));

    results.push(
      result(
        invalidDecisionCase.id,
        viewModel.invalid_review_decisions_count === 1 &&
          viewModel.queue_state === "blocked" &&
          viewModel.reviewed_proposals === 0 &&
          viewModel.next_allowed_action.target_surface === "proposal_review_store",
        [
          "invalid decision surfaced",
          "queue state blocked",
          "invalid decision not counted as reviewed",
          "repair action targets proposal review store",
        ],
        invalidDecisionCase.failure_mode,
        "Invalid review decision record blocked Pending Review readiness.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        invalidDecisionCase.id,
        false,
        ["invalid review decision blocks readiness"],
        invalidDecisionCase.failure_mode,
        error instanceof Error ? error.message : "unknown invalid decision check error",
      ),
    );
  }

  const manualConflictCase = caseById(cases, "manual-conflicting-review-decisions-block-readiness");
  try {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    const storedProposal = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot, now });
    storeKrnProposalReviewDecision(validDecisionFor(proposal, storedProposal.proposal_path), { targetInput: targetRoot, now });
    const conflictingDecision = parseKrnProposalReviewDecision({
      ...validDecisionFor(proposal, storedProposal.proposal_path),
      decision_id: "decision-manual-conflicting-review",
      decision: "rejected",
      rationale: "Manual conflicting terminal decision fixture.",
      write_policy: {
        default_effect: "no_target_mutation",
        allowed_persistence: "append_only",
        idempotency_key: "review-decision:manual-conflicting-review:2026-06-20",
      },
    });
    writeText(
      join(targetRoot, ".krn/proposal-reviews/manual-conflict/decision.json"),
      `${JSON.stringify(conflictingDecision, null, 2)}\n`,
    );
    const viewModel = parseKrnPendingReviewViewModel(buildKrnPendingReviewViewModel(targetRoot, now));

    results.push(
      result(
        manualConflictCase.id,
        viewModel.conflicting_review_decisions_count === 1 &&
          viewModel.queue_state === "blocked" &&
          viewModel.pending_proposals === 1 &&
          viewModel.next_allowed_action.target_surface === "proposal_review_store",
        [
          "conflict surfaced",
          "queue state blocked",
          "proposal remains pending",
          "repair action targets proposal review store",
        ],
        manualConflictCase.failure_mode,
        "Manual conflicting review decisions blocked Pending Review readiness and kept the proposal pending.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        manualConflictCase.id,
        false,
        ["manual conflicting review decisions block readiness"],
        manualConflictCase.failure_mode,
        error instanceof Error ? error.message : "unknown manual conflict check error",
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
    schema_version: "krn-proposal-review-decision-result.v1",
    kind: "krn_proposal_review_decision_eval_result",
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
    stored_decision_path: storedDecisionPath,
    generated_queue_state: generatedQueueState,
    interpretation_caveat:
      "This eval proves the local proposal review decision ledger and Pending Review consumption boundary only; it does not prove promotion correctness, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or productivity lift.",
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-proposal-review-decision", report.run_id);
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
