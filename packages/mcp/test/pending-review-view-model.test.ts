import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  parseKrnControlPlaneProposal,
  parseKrnPendingReviewViewModel,
  parseKrnProposalReviewDecision,
  type KrnControlPlaneProposal,
  type KrnProposalReviewDecision,
} from "@krn/contracts";
import { describe, expect, it } from "vitest";
import {
  buildKrnPendingReviewViewModel,
  storeKrnControlPlaneProposal,
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

function createProposalTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-pending-review-view-model-"));
  const proposal = validProposal();
  for (const sourceRef of proposal.source_refs) {
    writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
  }
  return targetRoot;
}

describe("KRN pending review view model builder", () => {
  it("renders proposal-store records as pending review rows without mutating target paths", () => {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    const stored = storeKrnControlPlaneProposal(proposal, {
      targetInput: targetRoot,
      now: new Date("2026-06-20T00:00:00.000Z"),
    });

    const viewModel = buildKrnPendingReviewViewModel(targetRoot, new Date("2026-06-20T00:01:00.000Z"));
    const reparsed = parseKrnPendingReviewViewModel(viewModel);

    expect(stored.status).toBe("stored");
    expect(reparsed.no_mock_state).toBe(true);
    expect(reparsed.source).toBe("proposal_store");
    expect(reparsed.queue_state).toBe("ready");
    expect(reparsed.pending_proposals).toBe(1);
    expect(reparsed.reviewed_proposals).toBe(0);
    expect(reparsed.total_review_decisions).toBe(0);
    expect(reparsed.invalid_records_count).toBe(0);
    expect(reparsed.invalid_review_decisions_count).toBe(0);
    expect(reparsed.proposals[0]).toMatchObject({
      proposal_id: proposal.proposal_id,
      proposal_path: stored.proposal_path,
      review_gate_state: "not_reviewed",
      source_ref_status: "validated",
    });
    if (proposal.target.target_type === "path") {
      expect(existsSync(join(targetRoot, proposal.target.path))).toBe(false);
    }
  });

  it("renders explicit zero state when the proposal store is empty", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-pending-review-empty-"));
    const viewModel = buildKrnPendingReviewViewModel(targetRoot, new Date("2026-06-20T00:00:00.000Z"));

    expect(viewModel.no_mock_state).toBe(true);
    expect(viewModel.source).toBe("explicit_zero_no_proposals");
    expect(viewModel.queue_state).toBe("empty");
    expect(viewModel.pending_proposals).toBe(0);
    expect(viewModel.reviewed_proposals).toBe(0);
    expect(viewModel.total_review_decisions).toBe(0);
    expect(viewModel.proposals).toEqual([]);
    expect(viewModel.next_allowed_action.action_id).toBe("wait-for-proposal-store-input");
  });

  it("excludes proposals with valid terminal review decisions from the pending queue", () => {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    const storedProposal = storeKrnControlPlaneProposal(proposal, {
      targetInput: targetRoot,
      now: new Date("2026-06-20T00:00:00.000Z"),
    });
    storeKrnProposalReviewDecision(validDecisionFor(proposal, storedProposal.proposal_path), {
      targetInput: targetRoot,
      now: new Date("2026-06-20T00:02:00.000Z"),
    });

    const viewModel = buildKrnPendingReviewViewModel(targetRoot, new Date("2026-06-20T00:03:00.000Z"));

    expect(viewModel.source).toBe("proposal_store");
    expect(viewModel.queue_state).toBe("empty");
    expect(viewModel.total_records).toBe(1);
    expect(viewModel.total_review_decisions).toBe(1);
    expect(viewModel.pending_proposals).toBe(0);
    expect(viewModel.reviewed_proposals).toBe(1);
    expect(viewModel.proposals).toEqual([]);
    expect(viewModel.next_allowed_action.action_id).toBe("wait-for-proposal-store-input");
  });

  it("surfaces invalid proposal files instead of counting them as pending", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-pending-review-invalid-"));
    writeText(join(targetRoot, ".krn/proposals/bad/proposal.json"), "{\"bad\": true}\n");

    const viewModel = buildKrnPendingReviewViewModel(targetRoot, new Date("2026-06-20T00:00:00.000Z"));

    expect(viewModel.source).toBe("proposal_store");
    expect(viewModel.queue_state).toBe("blocked");
    expect(viewModel.pending_proposals).toBe(0);
    expect(viewModel.invalid_records_count).toBe(1);
    expect(viewModel.invalid_review_decisions_count).toBe(0);
    expect(viewModel.invalid_records[0]?.proposal_path).toBe(".krn/proposals/bad/proposal.json");
    expect(viewModel.next_allowed_action.action_id).toBe("repair-invalid-proposal-records");
  });

  it("surfaces invalid review decision files and blocks readiness", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-pending-review-invalid-decision-"));
    writeText(join(targetRoot, ".krn/proposal-reviews/bad/decision.json"), "{\"bad\": true}\n");

    const viewModel = buildKrnPendingReviewViewModel(targetRoot, new Date("2026-06-20T00:00:00.000Z"));

    expect(viewModel.source).toBe("proposal_store");
    expect(viewModel.queue_state).toBe("blocked");
    expect(viewModel.pending_proposals).toBe(0);
    expect(viewModel.total_review_decisions).toBe(1);
    expect(viewModel.invalid_review_decisions_count).toBe(1);
    expect(viewModel.invalid_review_decisions[0]?.decision_path).toBe(".krn/proposal-reviews/bad/decision.json");
    expect(viewModel.next_allowed_action.action_id).toBe("repair-invalid-review-decisions");
  });

  it("keeps a proposal pending and blocks readiness when manual review decisions conflict", () => {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    const storedProposal = storeKrnControlPlaneProposal(proposal, {
      targetInput: targetRoot,
      now: new Date("2026-06-20T00:00:00.000Z"),
    });
    storeKrnProposalReviewDecision(validDecisionFor(proposal, storedProposal.proposal_path), {
      targetInput: targetRoot,
      now: new Date("2026-06-20T00:02:00.000Z"),
    });
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

    const viewModel = buildKrnPendingReviewViewModel(targetRoot, new Date("2026-06-20T00:03:00.000Z"));

    expect(viewModel.queue_state).toBe("blocked");
    expect(viewModel.pending_proposals).toBe(1);
    expect(viewModel.reviewed_proposals).toBe(0);
    expect(viewModel.conflicting_review_decisions_count).toBe(1);
    expect(viewModel.review_decision_conflicts[0]?.proposal_id).toBe(proposal.proposal_id);
    expect(viewModel.next_allowed_action.action_id).toBe("repair-conflicting-review-decisions");
  });

  it("blocks readiness when a stored proposal source ref becomes stale", () => {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    storeKrnControlPlaneProposal(proposal, {
      targetInput: targetRoot,
      now: new Date("2026-06-20T00:00:00.000Z"),
    });
    rmSync(join(targetRoot, proposal.source_refs[0] ?? ""), { force: true });

    const viewModel = buildKrnPendingReviewViewModel(targetRoot, new Date("2026-06-20T00:01:00.000Z"));

    expect(viewModel.queue_state).toBe("blocked");
    expect(viewModel.pending_proposals).toBe(1);
    expect(viewModel.reviewed_proposals).toBe(0);
    expect(viewModel.stale_source_ref_proposals).toBe(1);
    expect(viewModel.proposals[0]?.source_ref_status).toBe("stale");
    expect(viewModel.next_allowed_action.action_id).toBe("repair-stale-source-refs");
  });
});
