import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseKrnResearchPack } from "@krn/contracts";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

describe("krn research-pack", () => {
  it("writes a typed scaffold without promoting research conclusions", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-research-pack-target-"));

    const stdout = execFileSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "research-pack",
        "--question",
        "Which harness patterns should KRN inspect?",
        "--decision",
        "Decide whether a runner should be added after a typed pack exists.",
        "--budget",
        "quick",
        "--target",
        targetRoot,
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const packPath = stdout.trim();
    const pack = parseKrnResearchPack(readJson(packPath));

    expect(pack.kind).toBe("krn_research_pack");
    expect(pack.status).toBe("scaffolded");
    expect(pack.source_budget).toMatchObject({ mode: "quick", min_sources: 5, max_sources: 8 });
    expect(pack.sources).toEqual([]);
    expect(pack.mechanism_matrix).toEqual([]);
    expect(pack.source_refs).not.toContain("docs/goals/goal-038.md");
    expect(pack.source_refs).not.toContain("docs/plans/canonical/draft.md");
    expect(pack.interpretation_caveat).toContain("does not prove sources were read");
    expect(existsSync(join(targetRoot, ".krn", "research-packs", pack.run_id, "research-pack.json"))).toBe(true);
    expect(existsSync(join(targetRoot, "docs"))).toBe(false);

    const topLevelEntries = readdirSync(targetRoot).sort();
    expect(topLevelEntries).toEqual([".krn"]);
  }, 30_000);
});
