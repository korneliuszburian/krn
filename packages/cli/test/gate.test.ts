import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseKrnEngineeringGate } from "@krn/contracts";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

describe("krn gate", () => {
  it("writes a schema-backed engineering gate without mutating target setup files", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-gate-target-"));

    const stdout = execFileSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "gate",
        "--target",
        targetRoot,
        "--task",
        "Implement TypeScript contracts for the pre-edit engineering gate and known-bad validation",
        "--path",
        "packages/contracts/src/engineering-gate.ts",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const gatePath = stdout.trim();
    const gate = parseKrnEngineeringGate(readJson(gatePath));

    expect(gate.kind).toBe("krn_engineering_gate");
    expect(gate.command).toBe("krn gate");
    expect(gate.target_path).toBe("packages/contracts/src/engineering-gate.ts");
    expect(gate.scope_classification).toBe("non_trivial");
    expect(gate.gate_status).toBe("pass");
    expect(gate.checks.every((check) => check.status === "pass")).toBe(true);
    expect(gate.checks.map((check) => check.id)).toContain("hardcoded_truth");
    expect(gate.required_skills.map((skill) => skill.name)).toEqual([
      "typescript-contract-engineer",
      "eval-designer",
    ]);
    expect(gate.hardcoded_truth_policy.forbidden).toContain("live memory records");
    expect(existsSync(join(targetRoot, ".krn", "gates", gate.run_id, "engineering-gate.json"))).toBe(true);
    expect(readdirSync(targetRoot).sort()).toEqual([".krn"]);
  }, 30_000);

  it("blocks broad dashboard work when no typed consumer is named", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-gate-blocked-target-"));

    const result = spawnSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "gate",
        "--target",
        targetRoot,
        "--task",
        "Add another dashboard panel for product progress",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    expect(result.status).toBe(1);
    const gate = parseKrnEngineeringGate(readJson(result.stdout.trim()));
    expect(gate.gate_status).toBe("blocked");
    expect(gate.checks.map((check) => check.status)).toContain("fail");
    expect(gate.next_steps[0]?.step).toContain("Rewrite the task");
  }, 30_000);

  it("does not block forbidden surfaces when they are explicitly negated", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-gate-negated-surface-target-"));

    const stdout = execFileSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "gate",
        "--target",
        targetRoot,
        "--task",
        "mechanism: simplify init target registry. scope: packages/cli/src/init.ts. consumer: krn init help and apply routing. verification: focused tests. rollback: revert registry. hardcoded truth: no cloud sync, no dashboard state, no benchmark default, no live-full runner. skills: typescript-contract-engineer loaded. simplify: reduce duplication. overclaim: proves cleanup only.",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const gate = parseKrnEngineeringGate(readJson(stdout.trim()));
    expect(gate.gate_status).toBe("pass");
    expect(gate.checks.every((check) => check.status === "pass")).toBe(true);
  }, 30_000);

  it("routes TypeScript skill from target path even when task wording is generic", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-gate-path-skill-target-"));

    const stdout = execFileSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "gate",
        "--target",
        targetRoot,
        "--task",
        "Simplify the touched cleanup surface without adding dashboard benchmark API or passive docs",
        "--path",
        "packages/cli/src/gate.ts",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const gate = parseKrnEngineeringGate(readJson(stdout.trim()));
    expect(gate.gate_status).toBe("pass");
    expect(gate.required_skills.map((skill) => skill.name)).toContain("typescript-contract-engineer");
  }, 30_000);

  it("routes eval skill from eval target path even when task wording is generic", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-gate-eval-path-skill-target-"));

    const stdout = execFileSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "gate",
        "--target",
        targetRoot,
        "--task",
        "Simplify the touched cleanup surface without adding dashboard benchmark API or passive docs",
        "--path",
        "docs/evals/registry.json",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const gate = parseKrnEngineeringGate(readJson(stdout.trim()));
    expect(gate.gate_status).toBe("pass");
    expect(gate.required_skills.map((skill) => skill.name)).toContain("eval-designer");
  }, 30_000);
});
