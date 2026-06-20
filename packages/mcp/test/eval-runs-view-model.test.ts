import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { parseKrnEvalReport, parseKrnEvalRunsViewModel, type KrnEvalReport } from "@krn/contracts";
import { describe, expect, it } from "vitest";
import { buildKrnEvalRunsViewModel } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function validEvalReport(overrides: Partial<KrnEvalReport> = {}): KrnEvalReport {
  const report = parseKrnEvalReport(readJson("docs/specs/krn-eval/examples/krn-eval-report.example.json"));
  return parseKrnEvalReport({
    ...report,
    ...overrides,
  });
}

function writeEvalReport(targetRoot: string, report: KrnEvalReport | unknown, runId = "20260620T040000Z-test"): string {
  const reportPath = join(targetRoot, ".krn/eval", runId, "report.json");
  writeText(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  return reportPath;
}

describe("KRN eval runs view model builder", () => {
  it("renders explicit empty state when no aggregate eval report exists", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-eval-runs-empty-"));
    const viewModel = buildKrnEvalRunsViewModel(targetRoot, new Date("2026-06-20T04:00:00.000Z"));

    expect(viewModel.no_mock_state).toBe(true);
    expect(viewModel.source).toBe("missing_eval_report");
    expect(viewModel.eval_state).toBe("empty");
    expect(viewModel.total_modules).toBe(0);
    expect(viewModel.next_allowed_action.action_id).toBe("generate-eval-report");
    expect(viewModel.productivity_lift_claimed).toBe(false);
  });

  it("renders a parsed aggregate eval report as deterministic evidence only", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-eval-runs-ready-"));
    const report = validEvalReport({
      target_root: targetRoot,
      runtime_report_path: ".krn/eval/20260620T040000Z-test/report.json",
    });
    writeEvalReport(targetRoot, report);

    const viewModel = parseKrnEvalRunsViewModel(
      buildKrnEvalRunsViewModel(targetRoot, new Date("2026-06-20T04:01:00.000Z")),
    );

    expect(viewModel.source).toBe("eval_report");
    expect(viewModel.eval_state).toBe("ready");
    expect(viewModel.latest_report_path).toBe(".krn/eval/20260620T040000Z-test/report.json");
    expect(viewModel.total_modules).toBe(report.summary.total_modules);
    expect(viewModel.modules[0]).toMatchObject({
      owner: "krn",
      module_id: report.modules[0]?.module_id,
      status: "passed",
    });
    expect(viewModel.blocked_actions).toContain("claim_productivity_lift");
  });

  it("blocks readiness when the latest aggregate report contains failed modules", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-eval-runs-failed-"));
    const base = validEvalReport({
      target_root: targetRoot,
      overall_status: "failed",
      summary: {
        total_modules: 1,
        passed_modules: 0,
        failed_modules: 1,
        total_cases: 1,
        passed_cases: 0,
        failed_cases: 1,
        total_assertions: 2,
        passed_assertions: 1,
        failed_assertions: 1,
      },
    });
    const moduleResult = base.modules[0];
    if (!moduleResult) {
      throw new Error("fixture must include at least one module");
    }
    const report = validEvalReport({
      ...base,
      modules: [
        {
          ...moduleResult,
          status: "failed",
          total_cases: 1,
          passed_cases: 0,
          failed_cases: 1,
          case_pass_rate: 0,
          total_assertions: 2,
          passed_assertions: 1,
          failed_assertions: 1,
          assertion_pass_rate: 0.5,
        },
      ],
    });
    writeEvalReport(targetRoot, report);

    const viewModel = buildKrnEvalRunsViewModel(targetRoot, new Date("2026-06-20T04:02:00.000Z"));

    expect(viewModel.eval_state).toBe("blocked");
    expect(viewModel.eval_report_status).toBe("failed");
    expect(viewModel.failed_modules).toBe(1);
    expect(viewModel.modules[0]?.next_action).toContain("repair record");
    expect(viewModel.next_allowed_action.action_id).toBe("create-eval-repair-record");
  });

  it("surfaces invalid latest eval reports as blocked state", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-eval-runs-invalid-"));
    writeEvalReport(targetRoot, { bad: true });

    const viewModel = buildKrnEvalRunsViewModel(targetRoot, new Date("2026-06-20T04:03:00.000Z"));

    expect(viewModel.source).toBe("invalid_eval_report");
    expect(viewModel.eval_state).toBe("blocked");
    expect(viewModel.invalid_report?.report_path).toBe(".krn/eval/20260620T040000Z-test/report.json");
    expect(viewModel.next_allowed_action.action_id).toBe("repair-invalid-eval-report");
    expect(viewModel.modules).toEqual([]);
  });
});
