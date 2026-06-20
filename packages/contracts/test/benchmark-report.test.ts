import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnBenchmarkReportJsonSchema, parseKrnBenchmarkReport } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KrnBenchmarkReport contract", () => {
  it("parses the valid example through the public parser", () => {
    const report = parseKrnBenchmarkReport(
      readJson("docs/specs/krn-benchmark-report/examples/benchmark-report.example.json"),
    );

    expect(report.kind).toBe("krn_benchmark_report");
    expect(report.measurement_mode).toBe("fixture_contract");
    expect(report.lift_status).toBe("no_lift_evidence");
    expect(report.productivity_lift_claimed).toBe(false);
    expect(report.repair_targets).toHaveLength(1);
  });

  it("rejects the known-bad lift claim fixture", () => {
    expect(() =>
      parseKrnBenchmarkReport(readJson("docs/specs/krn-benchmark-report/fixtures/bad-benchmark-report.example.json")),
    ).toThrow();
  });

  it("rejects mismatched task totals and aggregate deltas", () => {
    const fixture = parseKrnBenchmarkReport(
      readJson("docs/specs/krn-benchmark-report/examples/benchmark-report.example.json"),
    );

    expect(() =>
      parseKrnBenchmarkReport({
        ...fixture,
        task_count: 999,
      }),
    ).toThrow();

    expect(() =>
      parseKrnBenchmarkReport({
        ...fixture,
        assisted_minus_baseline: 0.99,
      }),
    ).toThrow();
  });

  it("exports a JSON schema for downstream tools", () => {
    expect(krnBenchmarkReportJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        tasks: expect.any(Object),
      }),
    });
  });
});
