import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseKrnEvalModuleRegistry, parseKrnEvalReport } from "@krn/contracts";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function registryModuleIdsFor(lanes: readonly string[]): string[] {
  const registry = parseKrnEvalModuleRegistry(readJson("docs/evals/registry.json"));
  return registry.modules.filter((module) => lanes.includes(module.lane)).map((module) => module.module_id);
}

describe("krn eval", () => {
  it("writes the default current-lane aggregate eval report through the public CLI", () => {
    const expectedModuleIds = registryModuleIdsFor(["core", "current"]);
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
    expect(report.modules.map((moduleResult) => moduleResult.module_id)).toEqual(expectedModuleIds);
    expect(report.modules.some((moduleResult) => moduleResult.lane === "lab")).toBe(false);
    expect(report.summary.total_modules).toBe(expectedModuleIds.length);
    expect(report.summary.failed_modules).toBe(0);
    expect(report.summary.total_cases).toBeGreaterThanOrEqual(34);
    expect(existsSync(reportPath)).toBe(true);
    expect(report.modules.every((moduleResult) => moduleResult.report_path?.startsWith(".krn/evals/"))).toBe(true);
  }, 120_000);

  it("can run only the core eval lane", () => {
    const expectedModuleIds = registryModuleIdsFor(["core"]);
    const stdout = execFileSync("pnpm", ["exec", "tsx", "packages/cli/src/main.ts", "--", "eval", "--lane", "core"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    const report = parseKrnEvalReport(readJson(stdout.trim()));

    expect(report.lane_selection.requested_lane).toBe("core");
    expect(report.lane_selection.included_lanes).toEqual(["core"]);
    expect(report.modules.map((moduleResult) => moduleResult.module_id)).toEqual(expectedModuleIds);
    expect(report.modules.every((moduleResult) => moduleResult.lane === "core")).toBe(true);
  }, 90_000);

  it("keeps explicit module selection as a custom lane report", () => {
    const registry = parseKrnEvalModuleRegistry(readJson("docs/evals/registry.json"));
    const explicitLabModule = registry.modules.find((module) => module.module_id === "krn-research-pack");
    if (!explicitLabModule) {
      throw new Error("Expected krn-research-pack in eval registry");
    }

    const stdout = execFileSync("pnpm", ["exec", "tsx", "packages/cli/src/main.ts", "--", "eval", "--module", explicitLabModule.module_id], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    const report = parseKrnEvalReport(readJson(stdout.trim()));

    expect(report.lane_selection.requested_lane).toBe("custom");
    expect(report.lane_selection.module_filter).toEqual([explicitLabModule.module_id]);
    expect(report.lane_selection.included_lanes).toEqual(["lab"]);
    expect(report.modules.map((moduleResult) => moduleResult.module_id)).toEqual([explicitLabModule.module_id]);
    expect(report.modules[0]?.lane).toBe(explicitLabModule.lane);
  }, 60_000);
});
