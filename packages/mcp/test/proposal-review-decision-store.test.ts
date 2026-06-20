import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  parseKrnControlPlaneProposal,
  parseKrnProposalReviewDecision,
  type KrnControlPlaneProposal,
  type KrnProposalReviewDecision,
} from "@krn/contracts";
import { describe, expect, it } from "vitest";
import {
  listKrnProposalReviewDecisionStoreRecords,
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

function createProposalTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-review-decision-store-"));
  const proposal = validProposal();
  for (const sourceRef of proposal.source_refs) {
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

describe("KRN proposal review decision store", () => {
  it("stores a review decision append-only after its proposal exists", () => {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    const storedProposal = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot });
    const beforeFiles = collectFiles(targetRoot);
    const result = storeKrnProposalReviewDecision(validDecisionFor(proposal, storedProposal.proposal_path), {
      targetInput: targetRoot,
      now: new Date("2026-06-20T01:00:00.000Z"),
    });
    const newFiles = collectFiles(targetRoot).filter((file) => !beforeFiles.includes(file));

    expect(result.status).toBe("stored");
    expect(result.decision_path).toMatch(/^\.krn\/proposal-reviews\/.+\/decision\.json$/);
    expect(existsSync(join(targetRoot, result.decision_path))).toBe(true);
    expect(newFiles).toEqual([result.decision_path]);
    if (proposal.target.target_type === "path") {
      expect(existsSync(join(targetRoot, proposal.target.path))).toBe(false);
    }
  });

  it("treats duplicate idempotency keys with identical content as already stored", () => {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    const storedProposal = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot });
    const decision = validDecisionFor(proposal, storedProposal.proposal_path);

    const first = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot });
    const second = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot });

    expect(first.status).toBe("stored");
    expect(second.status).toBe("already_stored");
    expect(second.decision_path).toBe(first.decision_path);
  });

  it("rejects a review decision when the referenced proposal is missing", () => {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    const decision = validDecisionFor(proposal, ".krn/proposals/missing/proposal.json");

    expect(() => storeKrnProposalReviewDecision(decision, { targetInput: targetRoot })).toThrow(/missing proposal/);
  });

  it("rejects conflicting terminal decisions for the same proposal", () => {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    const storedProposal = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot });
    const firstDecision = validDecisionFor(proposal, storedProposal.proposal_path);
    storeKrnProposalReviewDecision(firstDecision, { targetInput: targetRoot });

    const conflictingDecision = validDecisionFor(proposal, storedProposal.proposal_path, {
      decision_id: "decision-reject-proposal-memory-note-krn-mcp-stdio-transport",
      decision: "rejected",
      rationale: "A second terminal decision for the same proposal must not be accepted.",
      write_policy: {
        default_effect: "no_target_mutation",
        allowed_persistence: "append_only",
        idempotency_key: "review-decision:conflicting-proposal-memory-note-krn-mcp-stdio-transport:2026-06-20",
      },
    });

    expect(() => storeKrnProposalReviewDecision(conflictingDecision, { targetInput: targetRoot })).toThrow(
      /already has a review decision/,
    );
  });

  it("rejects unbacked review decision source refs", () => {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    const storedProposal = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot });
    const decision = validDecisionFor(proposal, storedProposal.proposal_path, {
      source_refs: ["docs/missing-source.md"],
    });

    expect(() => storeKrnProposalReviewDecision(decision, { targetInput: targetRoot })).toThrow(/source_refs/);
  });

  it("lists invalid manually written review decision records", () => {
    const targetRoot = createProposalTarget();
    writeText(join(targetRoot, ".krn/proposal-reviews/bad/decision.json"), "{\"bad\": true}\n");

    const records = listKrnProposalReviewDecisionStoreRecords(targetRoot);

    expect(records.total_records).toBe(1);
    expect(records.valid_records).toEqual([]);
    expect(records.invalid_records[0]?.decision_path).toBe(".krn/proposal-reviews/bad/decision.json");
  });
});
