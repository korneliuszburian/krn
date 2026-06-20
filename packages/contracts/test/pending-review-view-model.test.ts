import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  krnPendingReviewViewModelJsonSchema,
  parseKrnPendingReviewViewModel,
} from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KrnPendingReviewViewModel contract", () => {
  it("parses the valid pending-review view-model example through the public parser", () => {
    const viewModel = parseKrnPendingReviewViewModel(
      readJson("docs/specs/krn-pending-review-view-model/examples/pending-review-view-model.example.json"),
    );

    expect(viewModel.kind).toBe("krn_pending_review_view_model");
    expect(viewModel.no_mock_state).toBe(true);
    expect(viewModel.source).toBe("proposal_store");
    expect(viewModel.queue_state).toBe("ready");
    expect(viewModel.pending_proposals).toBe(1);
    expect(viewModel.reviewed_proposals).toBe(0);
    expect(viewModel.total_review_decisions).toBe(0);
    expect(viewModel.invalid_review_decisions_count).toBe(0);
    expect(viewModel.proposals[0]?.review_gate_state).toBe("not_reviewed");
  });

  it("rejects the known-bad approval-like fixture", () => {
    expect(() =>
      parseKrnPendingReviewViewModel(
        readJson("docs/specs/krn-pending-review-view-model/fixtures/bad-pending-review-view-model.example.json"),
      ),
    ).toThrow();
  });

  it("exports a JSON schema for downstream dashboard/API consumers", () => {
    expect(krnPendingReviewViewModelJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        proposals: expect.any(Object),
        invalid_records: expect.any(Object),
      }),
    });
  });
});
