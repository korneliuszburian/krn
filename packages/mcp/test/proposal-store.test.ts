import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { parseKrnControlPlaneProposal, type KrnControlPlaneProposal } from "@krn/contracts";
import { describe, expect, it } from "vitest";
import { storeKrnControlPlaneProposal, validateProposalSourceRefs } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function createProposalTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-store-"));
  writeText(join(targetRoot, "docs/goals/goal-006.md"), "# Goal 006\n");
  writeText(join(targetRoot, "docs/goals/goal-008.md"), "# Goal 008\n");
  writeText(join(targetRoot, "docs/specs/krn-mcp-read-model/README.md"), "# MCP read model\n");
  writeText(
    join(targetRoot, "docs/plans/canonical/SOURCES.md"),
    [
      "# Canonical Sources",
      "",
      "| ID | Tier | Sector | Source | Use / caveat |",
      "|---|---|---|---|---|",
      "| S007 | A | MCP | https://developers.openai.com/codex/mcp | MCP resources/tools/prompts, config, auth, approvals. |",
      "",
      "| Claim ID | Claim | Source IDs | Evidence grade | Used for decision? | Risk if wrong |",
      "|---|---|---|---|---|---|",
      "| C004 | MCP/API writes need schemas, approvals, idempotency, and audit. | S007 | A | yes | Unsafe state mutation. |",
      "",
      "| ID | Evidence | Product implication |",
      "|---|---|---|",
      "| LOCAL015 | Control-plane proposal contract exists. | Proposal tools still need persistence and evals. |",
      "",
    ].join("\n"),
  );
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

function validProposalWithLedgerIds(): KrnControlPlaneProposal {
  const proposal = parseKrnControlPlaneProposal(
    readJson("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json"),
  );

  return parseKrnControlPlaneProposal({
    ...proposal,
    source_refs: [...proposal.source_refs, "S007", "C004", "LOCAL015", "https://developers.openai.com/codex/mcp"],
  });
}

describe("KRN proposal store", () => {
  it("validates source refs against local files and the source ledger", () => {
    const targetRoot = createProposalTarget();
    const validation = validateProposalSourceRefs(validProposalWithLedgerIds(), targetRoot);

    expect(validation.valid).toBe(true);
    expect(validation.rejected).toEqual([]);
    expect(validation.accepted.map((sourceRef) => sourceRef.ref)).toContain("S007");
    expect(validation.accepted.map((sourceRef) => sourceRef.ref)).toContain("C004");
    expect(validation.accepted.map((sourceRef) => sourceRef.ref)).toContain("LOCAL015");
    expect(validation.accepted.map((sourceRef) => sourceRef.status)).toContain("ledger_url");
  });

  it("stores a proposal append-only under .krn/proposals without mutating target files", () => {
    const targetRoot = createProposalTarget();
    const beforeFiles = collectFiles(targetRoot);
    const result = storeKrnControlPlaneProposal(validProposalWithLedgerIds(), {
      targetInput: targetRoot,
      now: new Date("2026-06-20T01:00:00.000Z"),
    });
    const afterFiles = collectFiles(targetRoot);
    const newFiles = afterFiles.filter((file) => !beforeFiles.includes(file));

    expect(result.status).toBe("stored");
    expect(result.proposal_path).toMatch(/^\.krn\/proposals\/.+\/proposal\.json$/);
    expect(existsSync(join(targetRoot, result.proposal_path))).toBe(true);
    expect(newFiles).toEqual([result.proposal_path]);
  });

  it("treats duplicate idempotency keys with identical content as already stored", () => {
    const targetRoot = createProposalTarget();
    const first = storeKrnControlPlaneProposal(validProposalWithLedgerIds(), { targetInput: targetRoot });
    const second = storeKrnControlPlaneProposal(validProposalWithLedgerIds(), { targetInput: targetRoot });

    expect(first.status).toBe("stored");
    expect(second.status).toBe("already_stored");
    expect(second.proposal_path).toBe(first.proposal_path);
  });

  it("rejects conflicting content for the same idempotency key", () => {
    const targetRoot = createProposalTarget();
    const proposal = validProposalWithLedgerIds();
    storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot });

    expect(() =>
      storeKrnControlPlaneProposal(
        {
          ...proposal,
          title: "Conflicting title for same idempotency key",
        },
        { targetInput: targetRoot },
      ),
    ).toThrow(/Conflicting proposal/);
  });

  it("rejects unbacked source refs even when the proposal schema parses", () => {
    const targetRoot = createProposalTarget();
    const badProposal = parseKrnControlPlaneProposal(
      readJson("docs/specs/krn-control-plane-proposal/fixtures/bad-unbacked-source-ref.example.json"),
    );

    expect(() => storeKrnControlPlaneProposal(badProposal, { targetInput: targetRoot })).toThrow(/source_refs/);
  });

  it("rejects target path traversal before persistence", () => {
    const targetRoot = createProposalTarget();
    const proposal = validProposalWithLedgerIds();

    expect(() =>
      storeKrnControlPlaneProposal(
        {
          ...proposal,
          target: {
            target_type: "path",
            path: "../outside.md",
          },
        },
        { targetInput: targetRoot },
      ),
    ).toThrow(/target path/);
  });
});
