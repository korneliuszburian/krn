import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnRepairRecordJsonSchema, parseKrnRepairRecord } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KrnRepairRecord contract", () => {
  it("parses the valid example through the public parser", () => {
    const record = parseKrnRepairRecord(
      readJson("docs/specs/krn-repair-record/examples/repair-record.example.json"),
    );

    expect(record.kind).toBe("krn_repair_record");
    expect(record.classification).toBe("benchmark_no_lift");
    expect(record.status).toBe("proposed");
    expect(record.failure_source.source_type).toBe("benchmark_report");
    expect(record.blocked_surfaces).toContain("productivity_lift_claim");
  });

  it("rejects a known-bad validated overclaim fixture", () => {
    expect(() =>
      parseKrnRepairRecord(readJson("docs/specs/krn-repair-record/fixtures/bad-repair-record.example.json")),
    ).toThrow();
  });

  it("rejects benchmark no-lift records with positive observed deltas", () => {
    const fixture = parseKrnRepairRecord(
      readJson("docs/specs/krn-repair-record/examples/repair-record.example.json"),
    );

    expect(() =>
      parseKrnRepairRecord({
        ...fixture,
        failure_source: {
          ...fixture.failure_source,
          observed_metric_value: 0.2,
        },
      }),
    ).toThrow();
  });

  it("rejects mismatched repair-attempt metric deltas", () => {
    const fixture = parseKrnRepairRecord(
      readJson("docs/specs/krn-repair-record/examples/repair-record.example.json"),
    );

    expect(() =>
      parseKrnRepairRecord({
        ...fixture,
        attempts: [
          {
            ...fixture.attempts[0],
            metric_before: -0.0033,
            metric_after: 0.02,
            metric_delta: 0.99,
          },
        ],
      }),
    ).toThrow();
  });

  it("exports a JSON schema for downstream tools", () => {
    expect(krnRepairRecordJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        failure_source: expect.any(Object),
        attempts: expect.any(Object),
      }),
    });
  });
});
