import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseKrnContextPacket } from "@krn/contracts";
import { writeMemoryStoreFixture } from "./memory-store-fixture.js";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function buildContextPacket(task: string, targetPath: string): {
  targetRoot: string;
  storePath: string;
  packet: ReturnType<typeof parseKrnContextPacket>;
} {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-context-target-"));
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
      "context",
      "build",
      "--target",
      targetRoot,
      "--task",
      task,
      "--path",
      targetPath,
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, KRN_MEMORY_STORE_PATH: storePath },
      encoding: "utf8",
    },
  );

  return {
    targetRoot,
    storePath,
    packet: parseKrnContextPacket(readJson(stdout.trim())),
  };
}

describe("krn context build", () => {
  it("writes a bounded context packet from selected MemoryStore IDs", () => {
    const { packet, storePath, targetRoot } = buildContextPacket(
      "Refactor context packet routing without keyword hints",
      "packages/contracts/src/context-packet.ts",
    );

    expect(packet.kind).toBe("krn_context_packet");
    expect(packet.command).toBe("krn context build");
    expect(packet.target_path).toBe("packages/contracts/src/context-packet.ts");
    expect(packet.selected_context.map((context) => context.ref)).toEqual([
      "memory:mem-goal-038-memory-boundary",
      "memory:mem-goal-038-simplify-cadence",
    ]);
    expect(packet.rejected_context.map((context) => context.ref)).toContain("docs/memory/** full scan");
    expect(packet.memory_application.surface).toBe("krn_context");
    expect(packet.source_refs).toEqual(["docs/goals/goal-038.md", "docs/plans/canonical/SOURCES.md#C061"]);
    expect(packet.required_skills.map((skill) => skill.name)).toContain("typescript-contract-engineer");
    expect(packet.required_skills.map((skill) => skill.name)).not.toContain("eval-designer");
    expect(JSON.stringify(packet)).not.toContain("KRN memory must be selected from a store boundary");
    expect(JSON.stringify(packet)).not.toContain("active final-product");
    expect(JSON.stringify(packet)).not.toContain("active goal evidence");
    expect(existsSync(join(targetRoot, ".krn", "context", packet.run_id, "context-packet.json"))).toBe(true);
    expect(readdirSync(targetRoot).sort()).toEqual([".krn"]);

    const storeAfterPacket = readJson(storePath) as { feedback?: unknown[] };
    expect(storeAfterPacket.feedback).toHaveLength(1);
  }, 30_000);

  it("routes eval-designer from eval target paths without task keywords", () => {
    const { packet } = buildContextPacket(
      "Refactor repeated bootstrap apply scaffolding without keyword hints",
      "packages/evals/src/validate-krn-init.ts",
    );

    const requiredSkillNames = packet.required_skills.map((skill) => skill.name);
    expect(requiredSkillNames).toContain("typescript-contract-engineer");
    expect(requiredSkillNames).toContain("eval-designer");
  }, 30_000);
});
