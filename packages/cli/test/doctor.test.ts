import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseDoctorReport } from "@krn/contracts";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

describe("krn doctor", () => {
  it("writes a schema-backed readiness report without mutating target setup files", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-doctor-target-"));

    const stdout = execFileSync("pnpm", ["exec", "tsx", "packages/cli/src/main.ts", "--", "doctor", "--target", targetRoot], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    const reportPath = stdout.trim();
    const report = parseDoctorReport(readJson(reportPath));

    expect(report.kind).toBe("krn_doctor_report");
    expect(report.command).toBe("krn doctor");
    expect(report.overall_status).toBe("warning");
    expect(report.checks.map((check) => check.surface)).toEqual([
      "agents",
      "memory",
      "skills",
      "hooks",
      "evals",
      "specs",
      "runtime",
    ]);
    expect(JSON.stringify(report)).not.toContain("docs/goals/goal-038.md");
    expect(report.source_refs).toEqual(["docs/specs/krn-doctor/README.md"]);
    expect(existsSync(join(targetRoot, ".krn", "doctor", report.run_id, "report.json"))).toBe(true);
    expect(existsSync(join(targetRoot, "AGENTS.md"))).toBe(false);
    expect(existsSync(join(targetRoot, ".codex"))).toBe(false);
    expect(existsSync(join(targetRoot, ".agents"))).toBe(false);
    expect(existsSync(join(targetRoot, "docs"))).toBe(false);

    const topLevelEntries = readdirSync(targetRoot).sort();
    expect(topLevelEntries).toEqual([".krn"]);
  }, 30_000);

  it("blocks when checked-in spec examples contain user-specific local paths", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-doctor-spec-portability-"));
    const specsRoot = join(targetRoot, "docs", "specs", "example");
    mkdirSync(specsRoot, { recursive: true });
    writeFileSync(join(specsRoot, "bad.example.json"), '{ "target_root": "/home/alice/coding/example" }\n', "utf8");

    const stdout = execFileSync("pnpm", ["exec", "tsx", "packages/cli/src/main.ts", "--", "doctor", "--target", targetRoot], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    const report = parseDoctorReport(readJson(stdout.trim()));
    const specCheck = report.checks.find((check) => check.id === "spec-portability");

    expect(report.overall_status).toBe("blocked");
    expect(specCheck).toMatchObject({
      surface: "specs",
      path: "docs/specs",
      status: "blocked",
      exists: true,
    });
    expect(specCheck?.summary).toContain("docs/specs/example/bad.example.json");
  }, 30_000);

  it("blocks when the eval registry cannot be parsed", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-doctor-eval-registry-"));
    const registryRoot = join(targetRoot, "docs", "evals");
    mkdirSync(registryRoot, { recursive: true });
    writeFileSync(join(registryRoot, "registry.json"), '{ "kind": "not-a-registry" }\n', "utf8");

    const stdout = execFileSync("pnpm", ["exec", "tsx", "packages/cli/src/main.ts", "--", "doctor", "--target", targetRoot], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    const report = parseDoctorReport(readJson(stdout.trim()));
    const evalCheck = report.checks.find((check) => check.id === "eval-modules");

    expect(report.overall_status).toBe("blocked");
    expect(evalCheck).toMatchObject({
      surface: "evals",
      path: "docs/evals/registry.json",
      status: "blocked",
      exists: true,
    });
    expect(evalCheck?.summary).toContain("Eval module registry is invalid");
  }, 30_000);
});
