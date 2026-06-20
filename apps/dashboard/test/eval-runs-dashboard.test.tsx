import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseKrnEvalRunsViewModel, type KrnEvalRunsViewModel } from "@krn/contracts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EvalRunsDashboard } from "../src/EvalRunsDashboard.js";

const urlRepoRoot = resolve(fileURLToPath(new URL("../../..", import.meta.url)));
const repoRoot = process.cwd().endsWith("apps/dashboard") ? resolve(process.cwd(), "../..") : urlRepoRoot;

function fixtureViewModel(): KrnEvalRunsViewModel {
  const input: unknown = JSON.parse(
    readFileSync(resolve(repoRoot, "docs/specs/krn-eval-runs-view-model/examples/eval-runs-view-model.example.json"), "utf8"),
  );

  return parseKrnEvalRunsViewModel(input);
}

function render(viewModel: KrnEvalRunsViewModel): string {
  return renderToStaticMarkup(<EvalRunsDashboard viewModel={viewModel} />);
}

describe("Eval Runs dashboard", () => {
  it("renders eval module evidence without exposing lift or repair command names", () => {
    const html = render(fixtureViewModel());

    expect(html).toContain("Eval Runs");
    expect(html).toContain("krn-init-contracts");
    expect(html).toContain("Review eval run evidence");
    expect(html).toContain("not measured");
    expect(html).toContain("Failure mode");
    expect(html).not.toContain("claim_productivity_lift");
    expect(html).not.toContain("dashboard_rerun_eval");
    expect(html).not.toContain("auto_repair_from_dashboard");
  });

  it("renders failed modules as blocked eval evidence", () => {
    const base = fixtureViewModel();
    const module = base.modules[0];
    if (!module) {
      throw new Error("fixture must include one module");
    }
    const viewModel = parseKrnEvalRunsViewModel({
      ...base,
      eval_state: "blocked",
      eval_report_status: "failed",
      passed_modules: 0,
      failed_modules: 1,
      passed_cases: 0,
      failed_cases: module.total_cases,
      passed_assertions: 0,
      failed_assertions: module.total_assertions,
      total_modules: 1,
      modules: [
        {
          ...module,
          status: "failed",
          passed_cases: 0,
          failed_cases: module.total_cases,
          case_pass_rate: 0,
          passed_assertions: 0,
          failed_assertions: module.total_assertions,
          assertion_pass_rate: 0,
          next_action: "Create a repair record before changing prompts, skills, hooks, or product code for this eval failure.",
        },
      ],
      next_allowed_action: {
        ...base.next_allowed_action,
        action_id: "create-eval-repair-record",
        target_surface: "repair_loop",
        label: "Create eval repair record",
      },
    });

    const html = render(viewModel);

    expect(html).toContain("Blocked");
    expect(html).toContain("Failed");
    expect(html).toContain("Create eval repair record");
  });

  it("renders invalid latest eval reports as blocked state", () => {
    const base = fixtureViewModel();
    const viewModel = parseKrnEvalRunsViewModel({
      ...base,
      source: "invalid_eval_report",
      eval_state: "blocked",
      latest_run_id: null,
      latest_created_at: null,
      eval_report_status: "invalid",
      total_modules: 0,
      passed_modules: 0,
      failed_modules: 0,
      total_cases: 0,
      passed_cases: 0,
      failed_cases: 0,
      total_assertions: 0,
      passed_assertions: 0,
      failed_assertions: 0,
      modules: [],
      invalid_report: {
        report_path: ".krn/eval/bad/report.json",
        error_summary: "Latest krn eval report failed to parse.",
      },
      next_allowed_action: {
        ...base.next_allowed_action,
        action_id: "repair-invalid-eval-report",
        label: "Repair invalid eval report",
      },
    });

    const html = render(viewModel);

    expect(html).toContain("Blocked");
    expect(html).toContain(".krn/eval/bad/report.json");
    expect(html).toContain("Latest krn eval report failed to parse.");
  });
});
