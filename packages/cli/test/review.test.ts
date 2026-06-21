import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseKrnReviewReport } from "@krn/contracts";
import { writeMemoryStoreFixture } from "./memory-store-fixture.js";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

describe("krn review", () => {
  it("writes a proposal-only review report without mutating target setup files", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-review-target-"));
    const storeRoot = mkdtempSync(join(tmpdir(), "krn-memory-store-"));
    const storePath = join(storeRoot, "memory-store.json");
    writeMemoryStoreFixture(storePath);

    const stdout = execFileSync("pnpm", ["exec", "tsx", "packages/cli/src/main.ts", "--", "review", "--target", targetRoot], {
      cwd: process.cwd(),
      env: { ...process.env, KRN_MEMORY_STORE_PATH: storePath },
      encoding: "utf8",
    });

    const reportPath = stdout.trim();
    const report = parseKrnReviewReport(readJson(reportPath));

    expect(report.kind).toBe("krn_review_report");
    expect(report.command).toBe("krn review");
    expect(report.mode).toBe("proposal-only");
    expect(report.overall_status).toBe("needs_attention");
    expect(report.artifacts.map((artifact) => artifact.status)).toEqual(["missing", "missing", "missing"]);
    expect(report.proposals.every((proposal) => proposal.status === "proposal_only")).toBe(true);
    expect(report.memory_selection.selected.map((selected) => selected.memory_id)).toEqual([
      "mem-goal-038-memory-boundary",
      "mem-goal-038-simplify-cadence",
    ]);
    expect(report.memory_selection.rejected_context.map((context) => context.ref)).toContain("docs/memory/** full scan");
    expect(report.memory_application.applied_memory_ids).toEqual(report.memory_selection.selected.map((selected) => selected.memory_id));
    expect(report.memory_feedback.feedback_sink_ref).toBe(`local-dev-json:${storePath}`);
    expect(report.artifacts.flatMap((artifact) => artifact.source_refs)).not.toContain("docs/goals/goal-038.md");
    expect(report.source_refs).toEqual([
      "docs/specs/krn-review/README.md",
      "docs/evals/STANDARD.md",
      "docs/goals/goal-038.md",
      "docs/plans/canonical/SOURCES.md#C061",
    ]);
    expect(report.source_refs).not.toContain("docs/plans/canonical/draft.md");
    expect(report.findings.find((finding) => finding.id === "memory-selection-applied")?.source_refs).toEqual([
      "docs/goals/goal-038.md",
      "docs/plans/canonical/SOURCES.md#C061",
    ]);
    expect(report.proposals.find((proposal) => proposal.id === "apply-memory-store-boundary")?.source_refs).toEqual([
      "docs/goals/goal-038.md",
      "docs/plans/canonical/SOURCES.md#C061",
    ]);
    expect(JSON.stringify(report)).not.toContain("KRN memory must be selected from a store boundary");
    expect(existsSync(join(targetRoot, ".krn", "review", report.run_id, "report.json"))).toBe(true);
    expect(existsSync(join(targetRoot, "AGENTS.md"))).toBe(false);
    expect(existsSync(join(targetRoot, ".codex"))).toBe(false);
    expect(existsSync(join(targetRoot, ".agents"))).toBe(false);
    expect(existsSync(join(targetRoot, "docs"))).toBe(false);

    const topLevelEntries = readdirSync(targetRoot).sort();
    expect(topLevelEntries).toEqual([".krn"]);

    const storeAfterReview = readJson(storePath) as { feedback?: unknown[]; records?: Array<{ last_used_at?: string | null }> };
    expect(storeAfterReview.feedback).toHaveLength(1);
    expect(storeAfterReview.records?.filter((record) => record.last_used_at !== null)).toHaveLength(2);
  }, 30_000);
});
