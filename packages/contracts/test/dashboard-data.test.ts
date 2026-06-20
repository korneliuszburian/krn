import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnDashboardDataJsonSchema, parseKrnDashboardData } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KrnDashboardData contract", () => {
  it("parses a dashboard data envelope with pending, promotion, and eval views", () => {
    const dashboardData = parseKrnDashboardData(
      readJson("docs/specs/krn-dashboard-data/examples/dashboard-data.example.json"),
    );

    expect(dashboardData.kind).toBe("krn_dashboard_data");
    expect(dashboardData.no_mock_state).toBe(true);
    expect(dashboardData.pending_review.kind).toBe("krn_pending_review_view_model");
    expect(dashboardData.promotion_review.kind).toBe("krn_promotion_review_view_model");
    expect(dashboardData.eval_runs.kind).toBe("krn_eval_runs_view_model");
  });

  it("rejects the known-bad dashboard-data fixture", () => {
    expect(() =>
      parseKrnDashboardData(readJson("docs/specs/krn-dashboard-data/fixtures/bad-dashboard-data.example.json")),
    ).toThrow();
  });

  it("exports a JSON schema for generated dashboard data", () => {
    expect(krnDashboardDataJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        pending_review: expect.any(Object),
        promotion_review: expect.any(Object),
        eval_runs: expect.any(Object),
      }),
    });
  });
});
