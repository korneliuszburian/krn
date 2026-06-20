import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseKrnEvalReport } from "@krn/contracts";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

describe("krn eval", () => {
  it("writes the default current-lane aggregate eval report through the public CLI", () => {
    const stdout = execFileSync("pnpm", ["exec", "tsx", "packages/cli/src/main.ts", "--", "eval"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    const reportPath = stdout.trim();
    const report = parseKrnEvalReport(readJson(reportPath));

    expect(report.kind).toBe("krn_eval_report");
    expect(report.command).toBe("krn eval");
    expect(report.lane_selection.requested_lane).toBe("current");
    expect(report.lane_selection.included_lanes).toEqual(["core", "current"]);
    expect(report.lane_selection.excluded_lanes).toEqual(["lab"]);
    expect(report.overall_status).toBe("passed");
    expect(report.modules.map((moduleResult) => moduleResult.module_id)).toEqual([
      "krn-init-contracts",
      "krn-doctor-contracts",
      "krn-review-contracts",
      "krn-mcp-read-model",
      "krn-mcp-transport",
      "krn-proposal-store",
      "krn-mcp-proposal-tool",
      "krn-pending-review-view-model",
      "krn-proposal-review-decision",
      "krn-proposal-promotion",
    ]);
    expect(report.modules.some((moduleResult) => moduleResult.lane === "lab")).toBe(false);
    expect(report.summary.total_modules).toBe(10);
    expect(report.summary.failed_modules).toBe(0);
    expect(report.summary.total_cases).toBeGreaterThanOrEqual(34);
    expect(existsSync(reportPath)).toBe(true);
    expect(report.modules.every((moduleResult) => moduleResult.report_path?.startsWith(".krn/evals/"))).toBe(true);
  }, 120_000);

  it("can run only the core eval lane", () => {
    const stdout = execFileSync("pnpm", ["exec", "tsx", "packages/cli/src/main.ts", "--", "eval", "--lane", "core"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    const report = parseKrnEvalReport(readJson(stdout.trim()));

    expect(report.lane_selection.requested_lane).toBe("core");
    expect(report.lane_selection.included_lanes).toEqual(["core"]);
    expect(report.modules.map((moduleResult) => moduleResult.module_id)).toEqual([
      "krn-init-contracts",
      "krn-doctor-contracts",
      "krn-review-contracts",
      "krn-mcp-read-model",
      "krn-mcp-transport",
    ]);
    expect(report.modules.every((moduleResult) => moduleResult.lane === "core")).toBe(true);
  }, 90_000);

  it("keeps explicit module selection as a custom lane report", () => {
    const stdout = execFileSync("pnpm", ["exec", "tsx", "packages/cli/src/main.ts", "--", "eval", "--module", "krn-research-pack"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    const report = parseKrnEvalReport(readJson(stdout.trim()));

    expect(report.lane_selection.requested_lane).toBe("custom");
    expect(report.lane_selection.module_filter).toEqual(["krn-research-pack"]);
    expect(report.lane_selection.included_lanes).toEqual(["lab"]);
    expect(report.modules.map((moduleResult) => moduleResult.module_id)).toEqual(["krn-research-pack"]);
    expect(report.modules[0]?.lane).toBe("lab");
  }, 60_000);
});
