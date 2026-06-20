import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseKrnSourceCheck } from "@krn/contracts";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

const contextFixture = "docs/specs/krn-context-packet/examples/context-packet.example.json";
const graphFixture = "docs/specs/krn-source-graph/examples/source-graph.example.json";
const blockingGraphFixture = "docs/specs/krn-source-graph/fixtures/source-graph-blocking.example.json";

describe("krn sources check", () => {
  it("writes a passing source check for fresh selected context sources", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-sources-target-"));
    const stdout = execFileSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "sources",
        "check",
        "--target",
        targetRoot,
        "--context",
        contextFixture,
        "--graph",
        graphFixture,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    const reportPath = stdout.trim();
    const report = parseKrnSourceCheck(readJson(reportPath));

    expect(report.decision).toBe("pass");
    expect(report.checked_refs.map((checked) => checked.ref)).toEqual([
      "docs/goals/goal-038.md",
      "docs/plans/canonical/SOURCES.md#C061",
    ]);
    expect(existsSync(join(targetRoot, ".krn", "sources", report.run_id, "source-check.json"))).toBe(true);
  }, 30_000);

  it("blocks stale or conflicting sources selected by a context packet", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-sources-target-"));
    const result = spawnSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "sources",
        "check",
        "--target",
        targetRoot,
        "--context",
        contextFixture,
        "--graph",
        blockingGraphFixture,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    expect(result.status).toBe(1);
    const report = parseKrnSourceCheck(readJson(result.stdout.trim()));
    expect(report.decision).toBe("block");
    expect(report.blocked_refs).toEqual(["docs/goals/goal-038.md", "docs/plans/canonical/SOURCES.md#C061"]);
    expect(report.required_actions).toHaveLength(2);
  }, 30_000);
});
