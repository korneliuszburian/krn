import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { parseKrnControlPlaneProposal, parseKrnPendingReviewViewModel } from "@krn/contracts";
import { describe, expect, it } from "vitest";
import { buildKrnPendingReviewViewModel, storeKrnControlPlaneProposal } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function validProposal(): ReturnType<typeof parseKrnControlPlaneProposal> {
  return parseKrnControlPlaneProposal(
    readJson("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json"),
  );
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
    expect(reparsed.invalid_records_count).toBe(0);
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
    expect(viewModel.invalid_records[0]?.proposal_path).toBe(".krn/proposals/bad/proposal.json");
    expect(viewModel.next_allowed_action.action_id).toBe("repair-invalid-proposal-records");
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
    expect(viewModel.stale_source_ref_proposals).toBe(1);
    expect(viewModel.proposals[0]?.source_ref_status).toBe("stale");
    expect(viewModel.next_allowed_action.action_id).toBe("repair-stale-source-refs");
  });
});
