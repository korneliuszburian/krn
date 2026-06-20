import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import {
  parseKrnControlPlaneProposal,
  parseKrnProposalPromotion,
  parseKrnProposalReviewDecision,
  type KrnControlPlaneProposal,
  type KrnProposalPromotion,
  type KrnProposalReviewDecision,
} from "@krn/contracts";
import {
  listKrnProposalPromotionStoreRecords,
  storeKrnControlPlaneProposal,
  storeKrnProposalPromotion,
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
  schema_version: "krn-proposal-promotion-result.v1";
  kind: "krn_proposal_promotion_eval_result";
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
  stored_promotion_path: string | null;
  applied_target_path: string | null;
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

function validProposal(): KrnControlPlaneProposal {
  return parseKrnControlPlaneProposal(
    readJson(resolve("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json")),
  );
}

function proposalWithoutPromotionPayload(): KrnControlPlaneProposal {
  const proposal = validProposal();
  const { promotion_payload: _promotionPayload, ...rest } = proposal;
  return parseKrnControlPlaneProposal(rest);
}

function validDecisionFor(
  proposal: KrnControlPlaneProposal,
  proposalPath: string,
  overrides: Partial<KrnProposalReviewDecision> = {},
): KrnProposalReviewDecision {
  const decision = parseKrnProposalReviewDecision(
    readJson(resolve("docs/specs/krn-proposal-review-decision/examples/proposal-review-decision.example.json")),
  );

  return parseKrnProposalReviewDecision({
    ...decision,
    proposal_id: proposal.proposal_id,
    proposal_path: proposalPath,
    source_refs: proposal.source_refs,
    evidence_refs: proposal.evidence_refs,
    ...overrides,
  });
}

function validPromotionFor(
  proposal: KrnControlPlaneProposal,
  proposalPath: string,
  decision: KrnProposalReviewDecision,
  decisionPath: string,
  overrides: Partial<KrnProposalPromotion> = {},
): KrnProposalPromotion {
  const promotion = parseKrnProposalPromotion(
    readJson(resolve("docs/specs/krn-proposal-promotion/examples/proposal-promotion.example.json")),
  );

  return parseKrnProposalPromotion({
    ...promotion,
    proposal_id: proposal.proposal_id,
    proposal_path: proposalPath,
    decision_id: decision.decision_id,
    decision_path: decisionPath,
    proposal_kind: proposal.proposal_kind,
    target: {
      ...promotion.target,
      path: proposal.target.target_type === "path" ? proposal.target.path : promotion.target.path,
      file_content: proposal.promotion_payload?.file_content ?? promotion.target.file_content,
      content_sha256: proposal.promotion_payload?.content_sha256 ?? promotion.target.content_sha256,
    },
    evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
    ...overrides,
  });
}

function createPromotionTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-eval-"));
  const proposal = validProposal();
  const promotion = parseKrnProposalPromotion(
    readJson(resolve("docs/specs/krn-proposal-promotion/examples/proposal-promotion.example.json")),
  );
  const sourceRefs = new Set([...proposal.source_refs, ...promotion.source_refs]);
  for (const sourceRef of sourceRefs) {
    writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
  }
  return targetRoot;
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

function caseById(cases: EvalCase[], id: string): EvalCase {
  const found = cases.find((testCase) => testCase.id === id);
  if (!found) {
    throw new Error(`Missing case ${id}`);
  }
  return found;
}

function storeApprovedReview(targetRoot: string, proposal: KrnControlPlaneProposal): {
  proposalPath: string;
  decision: KrnProposalReviewDecision;
  decisionPath: string;
} {
  const storedProposal = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot });
  const decision = validDecisionFor(proposal, storedProposal.proposal_path);
  const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot });

  return {
    proposalPath: storedProposal.proposal_path,
    decision,
    decisionPath: storedDecision.decision_path,
  };
}

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-proposal-promotion/cases.json")));
  const results: CaseResult[] = [];
  let storedPromotionPath: string | null = null;
  let appliedTargetPath: string | null = null;

  const contractCase = caseById(cases, "promotion-contract-valid-and-known-bad");
  try {
    const promotion = parseKrnProposalPromotion(
      readJson(resolve("docs/specs/krn-proposal-promotion/examples/proposal-promotion.example.json")),
    );
    const proposal = parseKrnControlPlaneProposal(
      readJson(resolve("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json")),
    );
    let badPromotionRejected = false;
    let badPayloadRejected = false;
    try {
      parseKrnProposalPromotion(
        readJson(resolve("docs/specs/krn-proposal-promotion/fixtures/bad-proposal-promotion.example.json")),
      );
    } catch {
      badPromotionRejected = true;
    }
    try {
      parseKrnControlPlaneProposal(
        readJson(resolve("docs/specs/krn-control-plane-proposal/fixtures/bad-promotion-payload.example.json")),
      );
    } catch {
      badPayloadRejected = true;
    }

    results.push(
      result(
        contractCase.id,
        promotion.apply_mode === "record_only" &&
          promotion.target_mutated === false &&
          proposal.promotion_payload?.payload_type === "memory_entry" &&
          badPromotionRejected &&
          badPayloadRejected,
        [
          "valid promotion fixture parses",
          "known-bad promotion mutation fixture rejected",
          "valid proposal payload parses",
          "mismatched proposal payload rejected",
        ],
        contractCase.failure_mode,
        "Promotion contract and proposal payload fixtures enforce exact machine-applicable promotion semantics.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        contractCase.id,
        false,
        ["promotion contract fixtures"],
        contractCase.failure_mode,
        error instanceof Error ? error.message : "unknown promotion contract error",
      ),
    );
  }

  const recordOnlyCase = caseById(cases, "record-only-promotion-store");
  try {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal();
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const beforeFiles = collectFiles(targetRoot);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath);
    const stored = storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    storedPromotionPath = stored.promotion_path;
    const newFiles = collectFiles(targetRoot).filter((file) => !beforeFiles.includes(file));
    const targetMutated = proposal.target.target_type === "path" ? existsSync(join(targetRoot, proposal.target.path)) : false;

    results.push(
      result(
        recordOnlyCase.id,
        stored.status === "stored" &&
          stored.target_written === false &&
          stored.promotion_path.startsWith(".krn/promotions/") &&
          newFiles.length === 1 &&
          newFiles[0] === stored.promotion_path &&
          !targetMutated,
        ["proposal stored first", "approved decision stored first", "promotion stored under .krn/promotions", "target not mutated"],
        recordOnlyCase.failure_mode,
        "Record-only promotion stored append-only under .krn/promotions without target mutation.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        recordOnlyCase.id,
        false,
        ["record-only promotion store"],
        recordOnlyCase.failure_mode,
        error instanceof Error ? error.message : "unknown record-only promotion error",
      ),
    );
  }

  const applyCase = caseById(cases, "apply-exact-memory-promotion");
  try {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal();
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      promotion_id: "promotion-apply-memory-note-krn-mcp-stdio-transport",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "proposal-promotion:apply-memory-note-krn-mcp-stdio-transport:2026-06-20",
      },
    });
    const stored = storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    const targetPath = proposal.target.target_type === "path" ? join(targetRoot, proposal.target.path) : null;
    appliedTargetPath = proposal.target.target_type === "path" ? proposal.target.path : null;

    results.push(
      result(
        applyCase.id,
        stored.status === "stored" &&
          stored.target_written === true &&
          targetPath !== null &&
          readFileSync(targetPath, "utf8") === promotion.target.file_content &&
          existsSync(join(targetRoot, stored.promotion_path)),
        ["apply promotion stored", "target written in apply mode", "target content matches payload", "promotion record persisted"],
        applyCase.failure_mode,
        "Explicit apply mode wrote exact reviewed memory payload content after approved review.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        applyCase.id,
        false,
        ["apply exact memory promotion"],
        applyCase.failure_mode,
        error instanceof Error ? error.message : "unknown apply promotion error",
      ),
    );
  }

  const rejectedDecisionCase = caseById(cases, "rejected-decision-promotion-rejected");
  try {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal();
    const storedProposal = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot });
    const rejectedDecision = validDecisionFor(proposal, storedProposal.proposal_path, {
      decision_id: "decision-reject-proposal-memory-note-krn-mcp-stdio-transport",
      decision: "rejected",
      rationale: "Rejected decisions must not promote target content.",
      write_policy: {
        default_effect: "no_target_mutation",
        allowed_persistence: "append_only",
        idempotency_key: "review-decision:reject-memory-note-krn-mcp-stdio-transport:2026-06-20",
      },
    });
    const storedDecision = storeKrnProposalReviewDecision(rejectedDecision, { targetInput: targetRoot, now });
    const promotion = validPromotionFor(proposal, storedProposal.proposal_path, rejectedDecision, storedDecision.decision_path);
    let rejected = false;
    try {
      storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    } catch {
      rejected = true;
    }

    results.push(
      result(
        rejectedDecisionCase.id,
        storedDecision.status === "stored" && rejected,
        ["rejected decision stored", "promotion rejected"],
        rejectedDecisionCase.failure_mode,
        "Promotion was rejected for a terminal rejected review decision.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        rejectedDecisionCase.id,
        false,
        ["rejected decision promotion rejected"],
        rejectedDecisionCase.failure_mode,
        error instanceof Error ? error.message : "unknown rejected decision promotion error",
      ),
    );
  }

  const missingPayloadCase = caseById(cases, "missing-payload-promotion-rejected");
  try {
    const targetRoot = createPromotionTarget();
    const proposal = proposalWithoutPromotionPayload();
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(validProposal(), proposalPath, decision, decisionPath);
    let rejected = false;
    try {
      storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    } catch {
      rejected = true;
    }

    results.push(
      result(
        missingPayloadCase.id,
        decision.decision === "approved_for_promotion" && rejected,
        ["approved decision stored", "missing payload rejected"],
        missingPayloadCase.failure_mode,
        "Promotion was rejected because the approved proposal lacked machine-applicable payload.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        missingPayloadCase.id,
        false,
        ["missing payload promotion rejected"],
        missingPayloadCase.failure_mode,
        error instanceof Error ? error.message : "unknown missing payload promotion error",
      ),
    );
  }

  const duplicateCase = caseById(cases, "duplicate-promotion-idempotent");
  try {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal();
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath);
    const first = storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    const second = storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });

    results.push(
      result(
        duplicateCase.id,
        first.status === "stored" && second.status === "already_stored" && first.promotion_path === second.promotion_path,
        ["first promotion stored", "duplicate promotion already stored", "duplicate promotion uses same path"],
        duplicateCase.failure_mode,
        "Duplicate promotion write returned the existing path for the same idempotency key and content.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        duplicateCase.id,
        false,
        ["duplicate promotion idempotent"],
        duplicateCase.failure_mode,
        error instanceof Error ? error.message : "unknown duplicate promotion error",
      ),
    );
  }

  const unsafeTargetCase = caseById(cases, "unsafe-target-path-rejected");
  try {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal();
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      target: {
        target_type: "path",
        path: "../outside.md",
        write_mode: "exact_file_content",
        file_content: proposal.promotion_payload?.file_content ?? "",
        content_sha256: proposal.promotion_payload?.content_sha256 ?? "",
      },
    });
    let rejected = false;
    try {
      storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    } catch {
      rejected = true;
    }
    const promotionRecords = listKrnProposalPromotionStoreRecords(targetRoot);
    const outsidePath = resolve(targetRoot, "..", "outside.md");

    results.push(
      result(
        unsafeTargetCase.id,
        rejected && promotionRecords.total_records === 0 && !existsSync(outsidePath),
        ["unsafe target path rejected", "no promotion record created", "outside target not written"],
        unsafeTargetCase.failure_mode,
        "Unsafe promotion target path was rejected before persistence or target write.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        unsafeTargetCase.id,
        false,
        ["unsafe target path rejected"],
        unsafeTargetCase.failure_mode,
        error instanceof Error ? error.message : "unknown unsafe target promotion error",
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
    schema_version: "krn-proposal-promotion-result.v1",
    kind: "krn_proposal_promotion_eval_result",
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
    stored_promotion_path: storedPromotionPath,
    applied_target_path: appliedTargetPath,
    interpretation_caveat:
      "This eval proves the local approved proposal promotion boundary for exact memory_update payloads only; it does not prove general promotion correctness, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or productivity lift.",
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-proposal-promotion", report.run_id);
  const reportPath = resolve(reportDir, "report.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  console.log(`report: ${reportPath}`);

  if (report.failed_cases > 0) {
    process.exitCode = 1;
  }
}

main();
