import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { doctorReportJsonSchema, parseDoctorReport } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("DoctorReport contract", () => {
  it("parses the valid example through the public parser", () => {
    const report = parseDoctorReport(readJson("docs/specs/krn-doctor/examples/doctor-report.example.json"));

    expect(report.kind).toBe("krn_doctor_report");
    expect(report.command).toBe("krn doctor");
    expect(report.checks.map((check) => check.surface)).toEqual([
      "agents",
      "memory",
      "skills",
      "hooks",
      "evals",
      "specs",
      "runtime",
    ]);
  });

  it("rejects the known-bad fixture", () => {
    expect(() => parseDoctorReport(readJson("docs/specs/krn-doctor/fixtures/bad-doctor-report.example.json"))).toThrow();
  });

  it("exports a JSON schema for downstream tools", () => {
    expect(doctorReportJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        checks: expect.any(Object),
      }),
    });
  });
});
