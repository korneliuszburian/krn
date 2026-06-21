import { describe, expect, it } from "vitest";
import { krnEvalBaselineJsonSchema, parseKrnEvalBaseline } from "../src/index.js";

function validEvalBaseline(overrides: Record<string, unknown> = {}): unknown {
  return {
    schema_version: "krn-eval-baseline.v1",
    kind: "krn_eval_baseline",
    baseline_id: "krn-init-eval-baseline-seed",
    created_at: "1970-01-01T00:00:00.000Z",
    report_roots: {
      aggregate: ".krn/eval",
      module_reports: ".krn/evals",
    },
    default_lane: "current",
    required_lanes: ["core", "current"],
    forbidden_default_lanes: ["lab", "all"],
    default_command: "krn eval",
    core_command: "krn eval --lane core",
    baseline_checks: [
      {
        check_id: "core-contracts",
        command: "krn eval --lane core",
        lane: "core",
        purpose: "Verify stable contract and CLI foundations before claiming repo bootstrap readiness.",
      },
      {
        check_id: "current-product-path",
        command: "krn eval",
        lane: "current",
        purpose: "Verify the active product path without pulling historical lab checks into default bootstrap.",
      },
    ],
    policy: {
      forbid_lab_by_default: true,
      forbid_all_by_default: true,
      require_interpretation_caveat: true,
      productivity_lift_claimed: false,
    },
    source_refs: ["krn://eval/bootstrap-policy"],
    overclaim_boundary:
      "This seed defines a lean local eval baseline only; it does not prove eval quality, broad repo bootstrap readiness, human review quality, or productivity lift.",
    ...overrides,
  };
}

describe("KRN eval baseline contract", () => {
  it("parses a lean core/current eval baseline seed", () => {
    const baseline = parseKrnEvalBaseline(validEvalBaseline());

    expect(baseline.kind).toBe("krn_eval_baseline");
    expect(baseline.default_lane).toBe("current");
    expect(baseline.required_lanes).toEqual(["core", "current"]);
    expect(baseline.forbidden_default_lanes).toEqual(["lab", "all"]);
    expect(baseline.policy.productivity_lift_claimed).toBe(false);
    expect(baseline.report_roots.aggregate).toBe(".krn/eval");
    expect(baseline.overclaim_boundary).toContain("does not prove");
  });

  it("rejects lab or all as a default lane", () => {
    expect(() => parseKrnEvalBaseline(validEvalBaseline({ default_lane: "lab" }))).toThrow();
    expect(() => parseKrnEvalBaseline(validEvalBaseline({ default_lane: "all" }))).toThrow();
  });

  it("rejects baselines missing core or current lanes", () => {
    expect(() => parseKrnEvalBaseline(validEvalBaseline({ required_lanes: ["core", "core"] }))).toThrow(
      /core and current/,
    );
    expect(() => parseKrnEvalBaseline(validEvalBaseline({ required_lanes: ["current", "current"] }))).toThrow(
      /core and current/,
    );
  });

  it("rejects lab or all commands in the baseline checks", () => {
    expect(() => parseKrnEvalBaseline(validEvalBaseline({ default_command: "krn eval --lane all" }))).toThrow(
      /default_command/,
    );
    expect(() =>
      parseKrnEvalBaseline(
        validEvalBaseline({
          baseline_checks: [
            {
              check_id: "lab-default",
              command: "krn eval --lane lab",
              lane: "core",
              purpose: "Bad fixture.",
            },
          ],
        }),
      ),
    ).toThrow(/lab or all/);
  });

  it("rejects productivity lift claims in the bootstrap seed", () => {
    expect(() =>
      parseKrnEvalBaseline(
        validEvalBaseline({
          policy: {
            forbid_lab_by_default: true,
            forbid_all_by_default: true,
            require_interpretation_caveat: true,
            productivity_lift_claimed: true,
          },
        }),
      ),
    ).toThrow();
  });

  it("exports a JSON schema for downstream eval baseline consumers", () => {
    expect(krnEvalBaselineJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        default_lane: expect.any(Object),
        baseline_checks: expect.any(Object),
        policy: expect.any(Object),
      }),
    });
  });
});
