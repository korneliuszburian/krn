import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseKrnBenchmarkReportsViewModel, type KrnBenchmarkReportsViewModel } from "@krn/contracts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BenchmarkReportsDashboard } from "../src/BenchmarkReportsDashboard.js";

const urlRepoRoot = resolve(fileURLToPath(new URL("../../..", import.meta.url)));
const repoRoot = process.cwd().endsWith("apps/dashboard") ? resolve(process.cwd(), "../..") : urlRepoRoot;

function fixtureViewModel(): KrnBenchmarkReportsViewModel {
  const input: unknown = JSON.parse(
    readFileSync(
      resolve(
        repoRoot,
        "docs/specs/krn-benchmark-reports-view-model/examples/benchmark-reports-view-model.example.json",
      ),
      "utf8",
    ),
  );

  return parseKrnBenchmarkReportsViewModel(input);
}

function render(viewModel: KrnBenchmarkReportsViewModel): string {
  return renderToStaticMarkup(<BenchmarkReportsDashboard viewModel={viewModel} />);
}

describe("Benchmark Reports dashboard", () => {
  it("renders no-lift and negative-delta benchmark evidence without command names", () => {
    const html = render(fixtureViewModel());

    expect(html).toContain("Benchmark Reports");
    expect(html).toContain("krn-benchmark-live-pilot");
    expect(html).toContain("-0.1");
    expect(html).toContain("no lift evidence");
    expect(html).toContain("Expand live benchmark suite");
    expect(html).toContain("Failure mode");
    expect(html).not.toContain("claim_productivity_lift_from_one_task");
    expect(html).not.toContain("dashboard_run_benchmark");
    expect(html).not.toContain("dashboard_auto_repair");
  });

  it("renders missing benchmark reports as explicit empty state", () => {
    const base = fixtureViewModel();
    const viewModel = parseKrnBenchmarkReportsViewModel({
      ...base,
      source: "missing_benchmark_reports",
      queue_state: "empty",
      total_records: 0,
      valid_reports: 0,
      invalid_records_count: 0,
      live_codex_exec_reports: 0,
      no_lift_reports: 0,
      negative_delta_reports: 0,
      productivity_lift_claimed_reports: 0,
      latest_report_path: null,
      reports: [],
      invalid_records: [],
      next_allowed_action: {
        ...base.next_allowed_action,
        action_id: "wait-for-benchmark-report-input",
        label: "Wait for benchmark report input",
      },
    });

    const html = render(viewModel);

    expect(html).toContain("Empty");
    expect(html).toContain("No benchmark reports");
  });

  it("renders invalid benchmark reports as blocked state", () => {
    const base = fixtureViewModel();
    const viewModel = parseKrnBenchmarkReportsViewModel({
      ...base,
      source: "invalid_benchmark_reports",
      queue_state: "blocked",
      total_records: 1,
      valid_reports: 0,
      invalid_records_count: 1,
      live_codex_exec_reports: 0,
      no_lift_reports: 0,
      negative_delta_reports: 0,
      productivity_lift_claimed_reports: 0,
      latest_report_path: null,
      reports: [],
      invalid_records: [
        {
          report_path: ".krn/benchmarks/bad/report.json",
          error_summary: "Benchmark report failed to parse.",
        },
      ],
      next_allowed_action: {
        ...base.next_allowed_action,
        action_id: "repair-invalid-benchmark-report",
        label: "Repair invalid benchmark report",
      },
    });

    const html = render(viewModel);

    expect(html).toContain("Blocked");
    expect(html).toContain(".krn/benchmarks/bad/report.json");
    expect(html).toContain("Benchmark report failed to parse.");
  });
});
