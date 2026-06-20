import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
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
      "runtime",
    ]);
    expect(existsSync(join(targetRoot, ".krn", "doctor", report.run_id, "report.json"))).toBe(true);
    expect(existsSync(join(targetRoot, "AGENTS.md"))).toBe(false);
    expect(existsSync(join(targetRoot, ".codex"))).toBe(false);
    expect(existsSync(join(targetRoot, ".agents"))).toBe(false);
    expect(existsSync(join(targetRoot, "docs"))).toBe(false);

    const topLevelEntries = readdirSync(targetRoot).sort();
    expect(topLevelEntries).toEqual([".krn"]);
  }, 30_000);
});
