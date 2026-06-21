import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnInitReadinessReportJsonSchema, parseKrnInitReadinessReport } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KrnInitReadinessReport contract", () => {
  it("parses the valid example through the public parser", () => {
    const report = parseKrnInitReadinessReport(
      readJson("docs/specs/krn-init/examples/init-readiness-report.example.json"),
    );

    expect(report.kind).toBe("krn_init_readiness_report");
    expect(report.command).toBe("krn init --readiness");
    expect(report.readiness_status).toBe("ready");
    expect(report.summary.present_capabilities).toBe(7);
    expect(report.forbidden_state.every((item) => item.status === "clear")).toBe(true);
  });

  it("rejects ready reports with missing capabilities", () => {
    const valid = readJson("docs/specs/krn-init/examples/init-readiness-report.example.json") as Record<string, unknown>;
    const requiredCapabilities = valid.required_capabilities as Array<Record<string, unknown>>;

    expect(() =>
      parseKrnInitReadinessReport(
        {
          ...valid,
          required_capabilities: requiredCapabilities.map((item, index) =>
            index === 0 ? { ...item, status: "missing", reason: "AGENTS.md is absent." } : item,
          ),
          summary: {
            required_capabilities: 7,
            present_capabilities: 6,
            missing_capabilities: 1,
            invalid_capabilities: 0,
            forbidden_state_present: 0,
          },
        },
      ),
    ).toThrow();
  });

  it("rejects summary counts that do not match report rows", () => {
    const valid = readJson("docs/specs/krn-init/examples/init-readiness-report.example.json") as Record<string, unknown>;
    expect(() =>
      parseKrnInitReadinessReport({
        ...valid,
        summary: {
          required_capabilities: 7,
          present_capabilities: 6,
          missing_capabilities: 0,
          invalid_capabilities: 0,
          forbidden_state_present: 0,
        },
      }),
    ).toThrow();
  });

  it("exports a JSON schema for downstream tools", () => {
    expect(krnInitReadinessReportJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        required_capabilities: expect.any(Object),
      }),
    });
  });
});
