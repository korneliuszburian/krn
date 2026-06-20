import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseInitManifest } from "@krn/contracts";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

describe("krn init --dry-run", () => {
  it("writes a schema-backed manifest without mutating target setup files", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-init-target-"));

    const stdout = execFileSync(
      "pnpm",
      ["exec", "tsx", "packages/cli/src/main.ts", "--", "init", "--dry-run", "--target", targetRoot],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const manifestPath = stdout.trim();
    const manifest = parseInitManifest(readJson(manifestPath));

    expect(manifest.kind).toBe("krn_init_manifest");
    expect(manifest.mode).toBe("dry-run");
    expect(manifest.target_root).toBe(targetRoot);
    expect(manifest.interpretation_caveat).toContain("does not prove productivity lift");
    expect(manifest.project_profile.current_phase).toBe("Goal 038 Final Product Bootstrap");
    expect(manifest.bootstrap_plan.map((item) => item.capability)).toEqual([
      "agent_instructions",
      "local_config",
      "source_pointers",
      "context_pointers",
      "eval_baseline",
      "skill_wiring",
      "policy_boundaries",
    ]);
    expect(manifest.bootstrap_plan.find((item) => item.capability === "source_pointers")?.boundary).toContain(
      "not a copied bibliography",
    );
    expect(existsSync(join(targetRoot, ".krn", "init", manifest.run_id, "manifest.json"))).toBe(true);
    expect(existsSync(join(targetRoot, "AGENTS.md"))).toBe(false);
    expect(existsSync(join(targetRoot, ".codex"))).toBe(false);
    expect(existsSync(join(targetRoot, ".agents"))).toBe(false);

    const topLevelEntries = readdirSync(targetRoot).sort();
    expect(topLevelEntries).toEqual([".krn"]);
  }, 30_000);
});
