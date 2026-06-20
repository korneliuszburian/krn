import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnEvalReportJsonSchema, parseKrnEvalReport } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KrnEvalReport contract", () => {
  it("parses the valid example through the public parser", () => {
    const report = parseKrnEvalReport(readJson("docs/specs/krn-eval/examples/krn-eval-report.example.json"));

    expect(report.kind).toBe("krn_eval_report");
    expect(report.command).toBe("krn eval");
    expect(report.modules.map((moduleResult) => moduleResult.module_id)).toEqual([
      "krn-init-contracts",
      "krn-doctor-contracts",
      "krn-review-contracts",
      "krn-mcp-read-model",
      "krn-mcp-transport",
      "krn-proposal-store",
      "krn-mcp-proposal-tool",
      "krn-pending-review-view-model",
      "krn-dashboard-pending-review-ui",
      "krn-dashboard-promotion-review-ui",
      "krn-dashboard-eval-runs-ui",
      "krn-proposal-review-decision",
      "krn-proposal-promotion",
    ]);
  });

  it("rejects the known-bad fixture", () => {
    expect(() => parseKrnEvalReport(readJson("docs/specs/krn-eval/fixtures/bad-krn-eval-report.example.json"))).toThrow();
  });

  it("exports a JSON schema for downstream tools", () => {
    expect(krnEvalReportJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        modules: expect.any(Object),
      }),
    });
  });
});
