import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  krnPromotionReviewViewModelJsonSchema,
  parseKrnPromotionReviewViewModel,
} from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KrnPromotionReviewViewModel contract", () => {
  it("parses the valid promotion-review view-model example through the public parser", () => {
    const viewModel = parseKrnPromotionReviewViewModel(
      readJson("docs/specs/krn-promotion-review-view-model/examples/promotion-review-view-model.example.json"),
    );

    expect(viewModel.kind).toBe("krn_promotion_review_view_model");
    expect(viewModel.no_mock_state).toBe(true);
    expect(viewModel.source).toBe("promotion_store");
    expect(viewModel.queue_state).toBe("ready");
    expect(viewModel.valid_promotions).toBe(1);
    expect(viewModel.planned_promotions).toBe(1);
    expect(viewModel.promotions[0]?.reference_status).toBe("validated");
    expect(viewModel.promotions[0]?.target_file_state).toBe("not_applied_target_absent");
  });

  it("rejects the known-bad promotion command-like fixture", () => {
    expect(() =>
      parseKrnPromotionReviewViewModel(
        readJson("docs/specs/krn-promotion-review-view-model/fixtures/bad-promotion-review-view-model.example.json"),
      ),
    ).toThrow();
  });

  it("exports a JSON schema for downstream dashboard/API consumers", () => {
    expect(krnPromotionReviewViewModelJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        promotions: expect.any(Object),
        invalid_records: expect.any(Object),
      }),
    });
  });
});
