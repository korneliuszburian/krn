import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnEngineeringGateJsonSchema, parseKrnEngineeringGate } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KRN engineering gate contract", () => {
  it("parses the valid engineering gate fixture", () => {
    const gate = parseKrnEngineeringGate(
      readJson("docs/specs/krn-engineering-gate/examples/engineering-gate.example.json"),
    );

    expect(gate.command).toBe("krn gate");
    expect(gate.scope_classification).toBe("non_trivial");
    expect(gate.checks.map((check) => check.id)).toEqual([
      "mechanism",
      "scope_boundary",
      "consumer",
      "verification",
      "rollback_or_kill",
      "hardcoded_truth",
      "skill_routing",
      "simplify_cadence",
      "overclaim_boundary",
    ]);
    expect(gate.hardcoded_truth_policy.forbidden).toContain("live memory records");
  });

  it("rejects a non-trivial gate without a consumer check", () => {
    expect(() =>
      parseKrnEngineeringGate(
        readJson("docs/specs/krn-engineering-gate/fixtures/bad-engineering-gate-missing-consumer.example.json"),
      ),
    ).toThrow();
  });

  it("rejects a passing non-trivial gate that still has warnings", () => {
    expect(() =>
      parseKrnEngineeringGate(
        readJson("docs/specs/krn-engineering-gate/fixtures/bad-engineering-gate-pass-with-warning.example.json"),
      ),
    ).toThrow();
  });

  it("exports a JSON schema for hook and CLI consumers", () => {
    expect(krnEngineeringGateJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        checks: expect.any(Object),
        hardcoded_truth_policy: expect.any(Object),
      }),
    });
  });
});
