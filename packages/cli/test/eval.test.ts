import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseKrnEvalReport } from "@krn/contracts";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

describe("krn eval", () => {
  it("writes a schema-backed aggregate eval report through the public CLI", () => {
    const stdout = execFileSync("pnpm", ["exec", "tsx", "packages/cli/src/main.ts", "--", "eval"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    const reportPath = stdout.trim();
    const report = parseKrnEvalReport(readJson(reportPath));

    expect(report.kind).toBe("krn_eval_report");
    expect(report.command).toBe("krn eval");
    expect(report.overall_status).toBe("passed");
    expect(report.modules.map((moduleResult) => moduleResult.module_id)).toEqual([
      "krn-init-contracts",
      "krn-doctor-contracts",
    ]);
    expect(report.summary.total_modules).toBe(2);
    expect(report.summary.failed_modules).toBe(0);
    expect(report.summary.total_cases).toBeGreaterThanOrEqual(6);
    expect(existsSync(reportPath)).toBe(true);
    expect(report.modules.every((moduleResult) => moduleResult.report_path?.startsWith(".krn/evals/"))).toBe(true);
  });
});
