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

describe("krn context build", () => {
  it("writes a bounded context packet from selected MemoryStore IDs", () => {
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
        "Refactor context packet routing without keyword hints",
        "--path",
        "packages/contracts/src/context-packet.ts",
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, KRN_MEMORY_STORE_PATH: storePath },
        encoding: "utf8",
      },
    );

    const packetPath = stdout.trim();
    const packet = parseKrnContextPacket(readJson(packetPath));

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
    expect(existsSync(join(targetRoot, ".krn", "context", packet.run_id, "context-packet.json"))).toBe(true);
    expect(readdirSync(targetRoot).sort()).toEqual([".krn"]);

    const storeAfterPacket = readJson(storePath) as { feedback?: unknown[] };
    expect(storeAfterPacket.feedback).toHaveLength(1);
  }, 30_000);
});
