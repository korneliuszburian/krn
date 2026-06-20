import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnDashboardViewModelJsonSchema, parseKrnDashboardViewModel } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KRN dashboard view-model contract", () => {
  it("parses the valid dashboard view-model example through the public parser", () => {
    const viewModel = parseKrnDashboardViewModel(
      readJson("docs/specs/krn-dashboard-view-model/examples/dashboard-view-model.example.json"),
    );

    expect(viewModel.kind).toBe("krn_dashboard_view_model");
    expect(viewModel.no_mock_state).toBe(true);
    expect(viewModel.resource_health.status).toBe("ready");
    expect(viewModel.latest_runtime_artifacts).toHaveLength(5);
    expect(viewModel.pending_review.pending_proposals).toBe(1);
    expect(viewModel.pending_review.source).toBe("proposal_store");
  });

  it("rejects the known-bad mock-state fixture", () => {
    expect(() =>
      parseKrnDashboardViewModel(
        readJson("docs/specs/krn-dashboard-view-model/fixtures/bad-dashboard-view-model.example.json"),
      ),
    ).toThrow();
  });

  it("exports a JSON schema for downstream dashboard/API consumers", () => {
    expect(krnDashboardViewModelJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        resource_health: expect.any(Object),
        latest_runtime_artifacts: expect.any(Object),
        pending_review: expect.any(Object),
      }),
    });
  });
});
