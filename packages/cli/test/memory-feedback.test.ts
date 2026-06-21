import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseKrnLocalMemoryStore, parseKrnMemoryFeedback } from "@krn/contracts";
import { writeMemoryStoreFixture } from "./memory-store-fixture.js";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function runCli(args: readonly string[], storePath: string): string {
  return execFileSync("pnpm", ["exec", "tsx", "packages/cli/src/main.ts", "--", ...args], {
    cwd: process.cwd(),
    env: { ...process.env, KRN_MEMORY_STORE_PATH: storePath },
    encoding: "utf8",
  });
}

describe("krn memory feedback", () => {
  it("records reviewed MemoryStore outcomes from an existing runtime artifact", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-memory-feedback-target-"));
    const storeRoot = mkdtempSync(join(tmpdir(), "krn-memory-store-"));
    const storePath = join(storeRoot, "memory-store.json");
    writeMemoryStoreFixture(storePath);

    const briefPath = runCli(
      [
        "brief",
        "--target",
        targetRoot,
        "--task",
        "Implement MemoryStore feedback closure",
        "--path",
        "packages/cli/src/memory-feedback.ts",
      ],
      storePath,
    ).trim();

    const feedback = parseKrnMemoryFeedback(
      readJsonFromStdout(
        runCli(
          [
            "memory",
            "feedback",
            "--artifact",
            briefPath,
            "--outcome",
            "used",
            "--reason",
            "Selected memory changed the implementation boundary and prevented repo-local memory core writes.",
          ],
          storePath,
        ),
      ),
    );
    const store = parseKrnLocalMemoryStore(readJson(storePath));

    expect(feedback.overall_outcome).toBe("used");
    expect(feedback.memory_outcomes.map((outcome) => outcome.outcome)).toEqual(["used", "used"]);
    expect(feedback.feedback_sink_ref).toBe(`local-dev-json:${storePath}`);
    expect(store.feedback).toHaveLength(2);
    expect(store.feedback.at(-1)?.run_id).toBe(feedback.run_id);
    expect(store.records.filter((record) => record.last_used_at === feedback.created_at)).toHaveLength(2);
    expect(JSON.stringify(feedback)).not.toContain("KRN memory must be selected from a store boundary");
  }, 30_000);

  it("rejects unresolved pending_review as a final feedback outcome", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-memory-feedback-bad-target-"));
    const storeRoot = mkdtempSync(join(tmpdir(), "krn-memory-store-"));
    const storePath = join(storeRoot, "memory-store.json");
    writeMemoryStoreFixture(storePath);
    const briefPath = runCli(
      ["brief", "--target", targetRoot, "--task", "Keep feedback pending", "--path", "packages/cli/src/memory-store.ts"],
      storePath,
    ).trim();

    expect(() =>
      runCli(
        [
          "memory",
          "feedback",
          "--artifact",
          briefPath,
          "--outcome",
          "pending_review",
          "--reason",
          "This should not close the feedback loop.",
        ],
        storePath,
      ),
    ).toThrow();

    const store = parseKrnLocalMemoryStore(readJson(storePath));
    expect(store.feedback).toHaveLength(1);
  }, 30_000);
});

function readJsonFromStdout(stdout: string): unknown {
  return JSON.parse(stdout) as unknown;
}
