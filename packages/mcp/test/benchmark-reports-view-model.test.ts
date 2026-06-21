import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { parseKrnBenchmarkReport, parseKrnBenchmarkReportsViewModel } from "@krn/contracts";
import { describe, expect, it } from "vitest";
import { buildKrnBenchmarkReportsViewModel } from "../src/index.js";

const root = process.cwd();

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function copyJsonFixture(targetRoot: string, fixturePath: string, runtimePath: string): void {
  const absoluteRuntimePath = join(targetRoot, runtimePath);
  mkdirSync(dirname(absoluteRuntimePath), { recursive: true });
  writeFileSync(absoluteRuntimePath, readFileSync(join(root, fixturePath), "utf8"), "utf8");
}

function readJsonFixture(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

function createTarget(): string {
  return mkdtempSync(join(tmpdir(), "krn-benchmark-reports-view-model-"));
}

describe("KRN Benchmark Reports view model", () => {
  it("builds a parsed no-lift benchmark review model from real benchmark reports", () => {
    const targetRoot = createTarget();
    copyJsonFixture(
      targetRoot,
      "docs/specs/krn-benchmark-report/examples/benchmark-report.example.json",
      ".krn/benchmarks/krn-benchmark-spine/20260620T060000Z-test/report.json",
    );
    const report = parseKrnBenchmarkReport(
      readJsonFixture("docs/specs/krn-benchmark-report/examples/benchmark-report.example.json"),
    );

    const viewModel = parseKrnBenchmarkReportsViewModel(
      buildKrnBenchmarkReportsViewModel(targetRoot, new Date("2026-06-20T06:30:00.000Z")),
    );

    expect(viewModel.kind).toBe("krn_benchmark_reports_view_model");
    expect(viewModel.source).toBe("benchmark_report_store");
    expect(viewModel.queue_state).toBe("ready");
    expect(viewModel.valid_reports).toBe(1);
    expect(viewModel.no_lift_reports).toBe(1);
    expect(viewModel.productivity_lift_claimed_reports).toBe(0);
    expect(viewModel.reports[0]?.report_path).toBe(
      ".krn/benchmarks/krn-benchmark-spine/20260620T060000Z-test/report.json",
    );
    expect(viewModel.reports[0]?.repair_targets).toHaveLength(1);
    expect(viewModel.dashboard_commands_enabled).toBe(false);
    expect(viewModel.blocked_actions).toContain("dashboard_run_benchmark");
    expect(viewModel.source_refs).toEqual([
      ...report.source_refs,
      "docs/specs/krn-benchmark-reports-view-model/README.md",
    ]);
    expect(viewModel.next_allowed_action.source_refs).toEqual(viewModel.source_refs);
    expect(viewModel.source_refs).not.toContain("docs/goals/goal-018.md");
    expect(viewModel.source_refs).not.toContain("docs/goals/goal-019.md");
  });

  it("renders missing benchmark reports as explicit empty state", () => {
    const viewModel = buildKrnBenchmarkReportsViewModel(createTarget(), new Date("2026-06-20T06:31:00.000Z"));

    expect(viewModel.source).toBe("missing_benchmark_reports");
    expect(viewModel.queue_state).toBe("empty");
    expect(viewModel.total_records).toBe(0);
    expect(viewModel.reports).toEqual([]);
    expect(viewModel.next_allowed_action.action_id).toBe("wait-for-benchmark-report-input");
    expect(viewModel.source_refs).toEqual([
      "docs/specs/krn-benchmark-report/README.md",
      "docs/specs/krn-benchmark-reports-view-model/README.md",
    ]);
    expect(viewModel.next_allowed_action.source_refs).toEqual(viewModel.source_refs);
    expect(viewModel.source_refs).not.toContain("docs/goals/goal-006.md");
    expect(viewModel.source_refs).not.toContain("docs/goals/goal-018.md");
    expect(viewModel.source_refs).not.toContain("docs/goals/goal-019.md");
  });

  it("surfaces invalid benchmark reports as blocked state", () => {
    const targetRoot = createTarget();
    writeText(join(targetRoot, ".krn/benchmarks/bad-run/report.json"), "{ \"bad\": true }\n");
    const viewModel = buildKrnBenchmarkReportsViewModel(targetRoot, new Date("2026-06-20T06:32:00.000Z"));

    expect(viewModel.source).toBe("invalid_benchmark_reports");
    expect(viewModel.queue_state).toBe("blocked");
    expect(viewModel.invalid_records_count).toBe(1);
    expect(viewModel.invalid_records[0]?.report_path).toBe(".krn/benchmarks/bad-run/report.json");
    expect(viewModel.next_allowed_action.action_id).toBe("repair-invalid-benchmark-report");
    expect(viewModel.source_refs).toEqual([
      "docs/specs/krn-benchmark-report/README.md",
      "docs/specs/krn-benchmark-reports-view-model/README.md",
    ]);
    expect(viewModel.next_allowed_action.source_refs).toEqual(viewModel.source_refs);
  });
});
