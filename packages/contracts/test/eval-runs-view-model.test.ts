import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnEvalRunsViewModelJsonSchema, parseKrnEvalRunsViewModel } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KrnEvalRunsViewModel contract", () => {
  it("parses the valid eval-runs view-model example through the public parser", () => {
    const viewModel = parseKrnEvalRunsViewModel(
      readJson("docs/specs/krn-eval-runs-view-model/examples/eval-runs-view-model.example.json"),
    );

    expect(viewModel.kind).toBe("krn_eval_runs_view_model");
    expect(viewModel.no_mock_state).toBe(true);
    expect(viewModel.source).toBe("eval_report");
    expect(viewModel.eval_state).toBe("ready");
    expect(viewModel.productivity_lift_claimed).toBe(false);
    expect(viewModel.dashboard_commands_enabled).toBe(false);
    expect(viewModel.benchmark_lift_status).toBe("not_measured");
    expect(viewModel.modules[0]?.owner).toBe("krn");
  });

  it("rejects the known-bad productivity-lift fixture", () => {
    expect(() =>
      parseKrnEvalRunsViewModel(
        readJson("docs/specs/krn-eval-runs-view-model/fixtures/bad-eval-runs-view-model.example.json"),
      ),
    ).toThrow();
  });

  it("exports a JSON schema for downstream dashboard/API consumers", () => {
    expect(krnEvalRunsViewModelJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        modules: expect.any(Object),
        productivity_lift_claimed: expect.any(Object),
      }),
    });
  });
});
