import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseKrnReviewReport } from "@krn/contracts";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

describe("krn review", () => {
  it("writes a proposal-only review report without mutating target setup files", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-review-target-"));

    const stdout = execFileSync("pnpm", ["exec", "tsx", "packages/cli/src/main.ts", "--", "review", "--target", targetRoot], {
      cwd: process.cwd(),
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
    expect(existsSync(join(targetRoot, ".krn", "review", report.run_id, "report.json"))).toBe(true);
    expect(existsSync(join(targetRoot, "AGENTS.md"))).toBe(false);
    expect(existsSync(join(targetRoot, ".codex"))).toBe(false);
    expect(existsSync(join(targetRoot, ".agents"))).toBe(false);
    expect(existsSync(join(targetRoot, "docs"))).toBe(false);

    const topLevelEntries = readdirSync(targetRoot).sort();
    expect(topLevelEntries).toEqual([".krn"]);
  });
});
