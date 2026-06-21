import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  parseKrnControlPlaneProposal,
  parseKrnProposalPromotion,
  parseKrnProposalReviewDecision,
  parseKrnPromotionReviewViewModel,
  type KrnControlPlaneProposal,
  type KrnProposalPromotion,
  type KrnProposalReviewDecision,
} from "@krn/contracts";
import { describe, expect, it } from "vitest";
import {
  buildKrnPromotionReviewViewModel,
  storeKrnControlPlaneProposal,
  storeKrnProposalPromotion,
  storeKrnProposalReviewDecision,
} from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function validProposal(): KrnControlPlaneProposal {
  return parseKrnControlPlaneProposal(
    readJson("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json"),
  );
}

function validDecisionFor(proposal: KrnControlPlaneProposal, proposalPath: string): KrnProposalReviewDecision {
  const decision = parseKrnProposalReviewDecision(
    readJson("docs/specs/krn-proposal-review-decision/examples/proposal-review-decision.example.json"),
  );

  return parseKrnProposalReviewDecision({
    ...decision,
    proposal_id: proposal.proposal_id,
    proposal_path: proposalPath,
    source_refs: proposal.source_refs,
    evidence_refs: proposal.evidence_refs,
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
    readJson("docs/specs/krn-proposal-promotion/examples/proposal-promotion.example.json"),
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
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-promotion-review-view-model-"));
  const proposal = validProposal();
  const promotion = parseKrnProposalPromotion(
    readJson("docs/specs/krn-proposal-promotion/examples/proposal-promotion.example.json"),
  );
  const sourceRefs = new Set([...proposal.source_refs, ...promotion.source_refs]);
  for (const sourceRef of sourceRefs) {
    writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
  }
  return targetRoot;
}

function storeApprovedPromotion(targetRoot: string, overrides: Partial<KrnProposalPromotion> = {}): KrnProposalPromotion {
  const proposal = validProposal();
  const storedProposal = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot });
  const decision = validDecisionFor(proposal, storedProposal.proposal_path);
  const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot });
  const promotion = validPromotionFor(proposal, storedProposal.proposal_path, decision, storedDecision.decision_path, overrides);

  storeKrnProposalPromotion(promotion, { targetInput: targetRoot });
  return promotion;
}

describe("KRN promotion review view model builder", () => {
  it("renders explicit zero state when the promotion store is empty", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-promotion-review-empty-"));
    const viewModel = buildKrnPromotionReviewViewModel(targetRoot, new Date("2026-06-20T03:00:00.000Z"));

    expect(viewModel.no_mock_state).toBe(true);
    expect(viewModel.source).toBe("explicit_zero_no_promotions");
    expect(viewModel.queue_state).toBe("empty");
    expect(viewModel.valid_promotions).toBe(0);
    expect(viewModel.next_allowed_action.action_id).toBe("wait-for-promotion-store-input");
    expect(viewModel.source_refs).toEqual([
      "docs/specs/krn-proposal-promotion/README.md",
      "docs/specs/krn-promotion-review-view-model/README.md",
    ]);
    expect(viewModel.next_allowed_action.source_refs).toEqual(viewModel.source_refs);
  });

  it("renders approved promotion records without mutating target files", () => {
    const targetRoot = createPromotionTarget();
    const promotion = storeApprovedPromotion(targetRoot);

    const viewModel = parseKrnPromotionReviewViewModel(
      buildKrnPromotionReviewViewModel(targetRoot, new Date("2026-06-20T03:01:00.000Z")),
    );

    expect(viewModel.source).toBe("promotion_store");
    expect(viewModel.queue_state).toBe("ready");
    expect(viewModel.valid_promotions).toBe(1);
    expect(viewModel.planned_promotions).toBe(1);
    expect(viewModel.promotions[0]).toMatchObject({
      promotion_id: promotion.promotion_id,
      reference_status: "validated",
      source_ref_status: "validated",
      target_file_state: "not_applied_target_absent",
    });
    expect(viewModel.source_refs).toEqual([
      ...promotion.source_refs,
      "docs/specs/krn-promotion-review-view-model/README.md",
    ]);
    expect(viewModel.next_allowed_action.source_refs).toEqual(viewModel.source_refs);
    expect(viewModel.source_refs).not.toContain("docs/goals/goal-006.md");
    expect(viewModel.source_refs).not.toContain("docs/goals/goal-015.md");
    expect(viewModel.blocked_actions).toContain("apply_promotion_from_dashboard");
  });

  it("blocks readiness when a promotion target file differs from the exact payload", () => {
    const targetRoot = createPromotionTarget();
    const promotion = storeApprovedPromotion(targetRoot);
    writeText(join(targetRoot, promotion.target.path), "different target content\n");

    const viewModel = buildKrnPromotionReviewViewModel(targetRoot, new Date("2026-06-20T03:02:00.000Z"));

    expect(viewModel.queue_state).toBe("blocked");
    expect(viewModel.target_conflict_promotions).toBe(1);
    expect(viewModel.promotions[0]?.target_file_state).toBe("not_applied_target_differs");
    expect(viewModel.next_allowed_action.action_id).toBe("inspect-promotion-target-conflicts");
  });

  it("surfaces invalid promotion files instead of counting them as audited", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-promotion-review-invalid-"));
    writeText(join(targetRoot, ".krn/promotions/bad/promotion.json"), "{\"bad\": true}\n");

    const viewModel = buildKrnPromotionReviewViewModel(targetRoot, new Date("2026-06-20T03:03:00.000Z"));

    expect(viewModel.source).toBe("promotion_store");
    expect(viewModel.queue_state).toBe("blocked");
    expect(viewModel.valid_promotions).toBe(0);
    expect(viewModel.invalid_records_count).toBe(1);
    expect(viewModel.invalid_records[0]?.promotion_path).toBe(".krn/promotions/bad/promotion.json");
    expect(viewModel.next_allowed_action.action_id).toBe("repair-invalid-promotion-records");
  });
});
