import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  parseKrnControlPlaneProposal,
  parseKrnProposalPromotion,
  parseKrnProposalReviewDecision,
  type KrnControlPlaneProposal,
  type KrnProposalPromotion,
  type KrnProposalReviewDecision,
} from "@krn/contracts";
import { describe, expect, it } from "vitest";
import {
  listKrnProposalPromotionStoreRecords,
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

function validProposal(overrides: Partial<KrnControlPlaneProposal> = {}): KrnControlPlaneProposal {
  const proposal = parseKrnControlPlaneProposal(
    readJson("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json"),
  );

  return parseKrnControlPlaneProposal({
    ...proposal,
    ...overrides,
  });
}

function validDecisionFor(
  proposal: KrnControlPlaneProposal,
  proposalPath: string,
  overrides: Partial<KrnProposalReviewDecision> = {},
): KrnProposalReviewDecision {
  const decision = parseKrnProposalReviewDecision(
    readJson("docs/specs/krn-proposal-review-decision/examples/proposal-review-decision.example.json"),
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
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-store-"));
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

describe("KRN proposal promotion store", () => {
  it("stores a record-only promotion without mutating the proposal target", () => {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal();
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath);
    const beforeFiles = collectFiles(targetRoot);

    const result = storeKrnProposalPromotion(promotion, {
      targetInput: targetRoot,
      now: new Date("2026-06-20T02:00:00.000Z"),
    });
    const newFiles = collectFiles(targetRoot).filter((file) => !beforeFiles.includes(file));

    expect(result.status).toBe("stored");
    expect(result.target_written).toBe(false);
    expect(result.promotion_path).toMatch(/^\.krn\/promotions\/.+\/promotion\.json$/);
    expect(newFiles).toEqual([result.promotion_path]);
    expect(proposal.target.target_type === "path" && existsSync(join(targetRoot, proposal.target.path))).toBe(false);
  });

  it("applies exact memory content only in explicit apply mode", () => {
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

    const result = storeKrnProposalPromotion(promotion, { targetInput: targetRoot });

    expect(result.status).toBe("stored");
    expect(result.target_written).toBe(true);
    if (proposal.target.target_type === "path") {
      expect(readFileSync(join(targetRoot, proposal.target.path), "utf8")).toBe(promotion.target.file_content);
    }
  });

  it("treats duplicate promotion records as already stored", () => {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal();
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath);

    const first = storeKrnProposalPromotion(promotion, { targetInput: targetRoot });
    const second = storeKrnProposalPromotion(promotion, { targetInput: targetRoot });

    expect(first.status).toBe("stored");
    expect(second.status).toBe("already_stored");
    expect(second.promotion_path).toBe(first.promotion_path);
  });

  it("rejects promotion when the review decision rejected the proposal", () => {
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
    const storedDecision = storeKrnProposalReviewDecision(rejectedDecision, { targetInput: targetRoot });
    const promotion = validPromotionFor(proposal, storedProposal.proposal_path, rejectedDecision, storedDecision.decision_path);

    expect(() => storeKrnProposalPromotion(promotion, { targetInput: targetRoot })).toThrow(/approved_for_promotion/);
  });

  it("rejects promotion when the proposal lacks machine-applicable payload", () => {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal({ promotion_payload: undefined });
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(validProposal(), proposalPath, decision, decisionPath);

    expect(() => storeKrnProposalPromotion(promotion, { targetInput: targetRoot })).toThrow(/machine-applicable/);
  });

  it("lists invalid manually written promotion records", () => {
    const targetRoot = createPromotionTarget();
    writeText(join(targetRoot, ".krn/promotions/bad/promotion.json"), "{\"bad\": true}\n");

    const records = listKrnProposalPromotionStoreRecords(targetRoot);

    expect(records.total_records).toBe(1);
    expect(records.valid_records).toEqual([]);
    expect(records.invalid_records[0]?.promotion_path).toBe(".krn/promotions/bad/promotion.json");
  });
});
