import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnProposalPromotionJsonSchema, parseKrnProposalPromotion } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KRN proposal promotion contract", () => {
  it("parses the valid proposal promotion example through the public parser", () => {
    const promotion = parseKrnProposalPromotion(
      readJson("docs/specs/krn-proposal-promotion/examples/proposal-promotion.example.json"),
    );

    expect(promotion.kind).toBe("krn_proposal_promotion");
    expect(promotion.proposal_kind).toBe("memory_update");
    expect(promotion.promotion_scope).toBe("approved_memory_update_only");
    expect(promotion.apply_mode).toBe("record_only");
    expect(promotion.promotion_state).toBe("planned");
    expect(promotion.target_mutated).toBe(false);
    expect(promotion.write_policy.default_effect).toBe("record_only");
    expect(promotion.write_policy.allowed_effects).toContain("append_promotion_record");
  });

  it("rejects the known-bad record-only mutation fixture", () => {
    expect(() =>
      parseKrnProposalPromotion(
        readJson("docs/specs/krn-proposal-promotion/fixtures/bad-proposal-promotion.example.json"),
      ),
    ).toThrow();
  });

  it("exports a JSON schema for downstream promotion tools", () => {
    expect(krnProposalPromotionJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        apply_mode: expect.any(Object),
        promotion_state: expect.any(Object),
        target: expect.any(Object),
        write_policy: expect.any(Object),
      }),
    });
  });
});
