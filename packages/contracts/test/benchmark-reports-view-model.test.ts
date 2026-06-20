import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  krnBenchmarkReportsViewModelJsonSchema,
  parseKrnBenchmarkReportsViewModel,
} from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KrnBenchmarkReportsViewModel contract", () => {
  it("parses the valid benchmark-reports view-model example through the public parser", () => {
    const viewModel = parseKrnBenchmarkReportsViewModel(
      readJson("docs/specs/krn-benchmark-reports-view-model/examples/benchmark-reports-view-model.example.json"),
    );

    expect(viewModel.kind).toBe("krn_benchmark_reports_view_model");
    expect(viewModel.no_mock_state).toBe(true);
    expect(viewModel.source).toBe("benchmark_report_store");
    expect(viewModel.queue_state).toBe("ready");
    expect(viewModel.live_codex_exec_reports).toBe(1);
    expect(viewModel.negative_delta_reports).toBe(1);
    expect(viewModel.reports[0]?.productivity_lift_claimed).toBe(false);
    expect(viewModel.dashboard_commands_enabled).toBe(false);
  });

  it("rejects the known-bad command-like benchmark fixture", () => {
    expect(() =>
      parseKrnBenchmarkReportsViewModel(
        readJson("docs/specs/krn-benchmark-reports-view-model/fixtures/bad-benchmark-reports-view-model.example.json"),
      ),
    ).toThrow();
  });

  it("exports a JSON schema for dashboard and MCP consumers", () => {
    expect(krnBenchmarkReportsViewModelJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        reports: expect.any(Object),
        invalid_records: expect.any(Object),
      }),
    });
  });
});
