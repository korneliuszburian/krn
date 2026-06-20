import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnProposalReviewDecisionJsonSchema, parseKrnProposalReviewDecision } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KRN proposal review decision contract", () => {
  it("parses the valid proposal review decision example through the public parser", () => {
    const decision = parseKrnProposalReviewDecision(
      readJson("docs/specs/krn-proposal-review-decision/examples/proposal-review-decision.example.json"),
    );

    expect(decision.kind).toBe("krn_proposal_review_decision");
    expect(decision.decision).toBe("approved_for_promotion");
    expect(decision.review_scope).toBe("proposal_review_only");
    expect(decision.target_mutated).toBe(false);
    expect(decision.promotion_state).toBe("not_promoted");
    expect(decision.write_policy.default_effect).toBe("no_target_mutation");
    expect(decision.write_policy.allowed_persistence).toBe("append_only");
  });

  it("rejects the known-bad approval-like mutation fixture", () => {
    expect(() =>
      parseKrnProposalReviewDecision(
        readJson("docs/specs/krn-proposal-review-decision/fixtures/bad-proposal-review-decision.example.json"),
      ),
    ).toThrow();
  });

  it("exports a JSON schema for downstream tools", () => {
    expect(krnProposalReviewDecisionJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        decision: expect.any(Object),
        write_policy: expect.any(Object),
        target_mutated: expect.any(Object),
      }),
    });
  });
});
