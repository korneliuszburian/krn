import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseKrnOperatingBrief } from "@krn/contracts";
import { writeMemoryStoreFixture } from "./memory-store-fixture.js";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

describe("krn brief", () => {
  it("fails without an explicit MemoryStore path", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-brief-missing-store-target-"));
    const result = spawnSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "brief",
        "--target",
        targetRoot,
        "--task",
        "Build a memory-aware operating brief",
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, KRN_MEMORY_STORE_PATH: "" },
        encoding: "utf8",
      },
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("KRN_MEMORY_STORE_PATH must point to an explicit local MemoryStore file");
  }, 30_000);

  it("writes a schema-backed operating brief from the local MemoryStore without mutating target setup files", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-brief-target-"));
    const storeRoot = mkdtempSync(join(tmpdir(), "krn-memory-store-"));
    const storePath = join(storeRoot, "memory-store.json");
    writeMemoryStoreFixture(storePath);

    const stdout = execFileSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "brief",
        "--target",
        targetRoot,
        "--task",
        "Implement TypeScript MemoryStore contract and eval fixture",
        "--path",
        "packages/cli/src/memory-store.ts",
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, KRN_MEMORY_STORE_PATH: storePath },
        encoding: "utf8",
      },
    );

    const briefPath = stdout.trim();
    const brief = parseKrnOperatingBrief(readJson(briefPath));

    expect(brief.kind).toBe("krn_operating_brief");
    expect(brief.command).toBe("krn brief");
    expect(brief.target_path).toBe("packages/cli/src/memory-store.ts");
    expect(brief.selected_context.map((context) => context.ref)).toEqual([
      "memory:mem-goal-038-memory-boundary",
      "memory:mem-goal-038-simplify-cadence",
    ]);
    expect(brief.rejected_context.map((context) => context.ref)).toContain("docs/memory/** full scan");
    expect(brief.applied_kernel_terms).toContain("memory-operative");
    expect(brief.required_skills.map((skill) => skill.name)).toEqual([
      "goal-execplan",
      "typescript-contract-engineer",
      "eval-designer",
    ]);
    expect(brief.memory_application.applied_memory_ids).toEqual(
      brief.memory_selection.selected.map((selected) => selected.memory_id),
    );
    expect(brief.source_refs).toEqual([
      "docs/goals/goal-038.md",
      "docs/plans/canonical/SOURCES.md#C061",
    ]);
    expect(brief.source_refs).not.toContain("docs/plans/canonical/draft.md");
    expect(JSON.stringify(brief)).not.toContain("KRN memory must be selected from a store boundary");
    expect(JSON.stringify(brief)).not.toContain("active final-product");
    expect(JSON.stringify(brief)).not.toContain("active goal evidence");
    expect(JSON.stringify(brief.memory_application.review_questions)).not.toContain("goal-038");
    expect(existsSync(join(targetRoot, ".krn", "briefs", brief.run_id, "brief.json"))).toBe(true);
    expect(readdirSync(targetRoot).sort()).toEqual([".krn"]);

    const storeAfterBrief = readJson(storePath) as { feedback?: unknown[] };
    expect(storeAfterBrief.feedback).toHaveLength(1);
  }, 30_000);

  it("routes TypeScript skill from target path without task keywords", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-brief-path-skill-target-"));
    const storeRoot = mkdtempSync(join(tmpdir(), "krn-memory-store-"));
    const storePath = join(storeRoot, "memory-store.json");
    writeMemoryStoreFixture(storePath);

    const stdout = execFileSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "brief",
        "--target",
        targetRoot,
        "--task",
        "Simplify the touched cleanup surface without keyword hints",
        "--path",
        "packages/cli/src/brief.ts",
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, KRN_MEMORY_STORE_PATH: storePath },
        encoding: "utf8",
      },
    );

    const brief = parseKrnOperatingBrief(readJson(stdout.trim()));
    expect(brief.required_skills.map((skill) => skill.name)).toEqual([
      "goal-execplan",
      "typescript-contract-engineer",
    ]);
  }, 30_000);
});
