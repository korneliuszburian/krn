import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { parseKrnControlPlaneProposal, parseKrnPendingReviewViewModel } from "@krn/contracts";
import { PendingReviewDashboard, parseDashboardData } from "@krn/dashboard";
import { buildKrnPendingReviewViewModel, storeKrnControlPlaneProposal } from "@krn/mcp";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

type EvalCase = {
  id: string;
  expected_behavior: string;
  metrics: string[];
  failure_mode: string;
};

type CaseResult = {
  id: string;
  passed: boolean;
  assertions: string[];
  failure_mode: string;
  message: string;
};

type EvalReport = {
  schema_version: "krn-dashboard-pending-review-ui-result.v1";
  kind: "krn_dashboard_pending_review_ui_result";
  run_id: string;
  created_at: string;
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  case_pass_rate: number;
  total_assertions: number;
  passed_assertions: number;
  failed_assertions: number;
  assertion_pass_rate: number;
  cases: CaseResult[];
  generated_data_path: string | null;
  interpretation_caveat: string;
};

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function parseCases(input: unknown): EvalCase[] {
  if (!Array.isArray(input)) {
    throw new Error("cases.json must be an array");
  }

  return input.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`case ${index} must be an object`);
    }

    const record = item as Record<string, unknown>;
    const id = record.id;
    const expectedBehavior = record.expected_behavior;
    const metrics = record.metrics;
    const failureMode = record.failure_mode;

    if (typeof id !== "string" || id.length === 0) {
      throw new Error(`case ${index} missing id`);
    }
    if (typeof expectedBehavior !== "string" || expectedBehavior.length === 0) {
      throw new Error(`case ${id} missing expected_behavior`);
    }
    if (!Array.isArray(metrics) || !metrics.every((metric) => typeof metric === "string" && metric.length > 0)) {
      throw new Error(`case ${id} missing metrics`);
    }
    if (typeof failureMode !== "string" || failureMode.length === 0) {
      throw new Error(`case ${id} missing failure_mode`);
    }

    return {
      id,
      expected_behavior: expectedBehavior,
      metrics,
      failure_mode: failureMode,
    };
  });
}

function result(id: string, passed: boolean, assertions: string[], failureMode: string, message: string): CaseResult {
  return { id, passed, assertions, failure_mode: failureMode, message };
}

function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}`;
}

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function validProposal(): ReturnType<typeof parseKrnControlPlaneProposal> {
  return parseKrnControlPlaneProposal(
    readJson(resolve("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json")),
  );
}

function createProposalTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-pending-review-"));
  const proposal = validProposal();
  for (const sourceRef of proposal.source_refs) {
    writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
  }
  return targetRoot;
}

function caseById(cases: EvalCase[], id: string): EvalCase {
  const found = cases.find((testCase) => testCase.id === id);
  if (!found) {
    throw new Error(`Missing case ${id}`);
  }
  return found;
}

function renderPendingReview(input: unknown): string {
  return renderToStaticMarkup(createElement(PendingReviewDashboard, { viewModel: parseKrnPendingReviewViewModel(input) }));
}

function containsMutationCommand(html: string): boolean {
  return (
    html.includes("approve_proposal") ||
    html.includes("reject_proposal") ||
    html.includes("mutate_target") ||
    html.includes("write_memory")
  );
}

function runDashboardDataCommand(targetRoot: string, outputPath: string): void {
  execFileSync("pnpm", ["--filter", "@krn/dashboard", "data"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      KRN_TARGET_ROOT: targetRoot,
      KRN_DASHBOARD_DATA_OUT: outputPath,
    },
    stdio: "pipe",
  });
}

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-dashboard-pending-review-ui/cases.json")));
  const results: CaseResult[] = [];
  let generatedDataPath: string | null = null;
  let readyViewModel = parseKrnPendingReviewViewModel(
    readJson(resolve("docs/specs/krn-pending-review-view-model/examples/pending-review-view-model.example.json")),
  );

  const dataCase = caseById(cases, "dashboard-data-generation-real-product-object");
  try {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    storeKrnControlPlaneProposal(proposal, {
      targetInput: targetRoot,
      now: new Date("2026-06-20T00:00:00.000Z"),
    });
    const outputPath = join(mkdtempSync(join(tmpdir(), "krn-dashboard-data-out-")), "krn-dashboard-data.json");
    runDashboardDataCommand(targetRoot, outputPath);
    generatedDataPath = outputPath;
    readyViewModel = parseDashboardData(readJson(outputPath)).pending_review;
    const targetMutated =
      proposal.target.target_type === "path" ? existsSync(join(targetRoot, proposal.target.path)) : false;

    results.push(
      result(
        dataCase.id,
        existsSync(outputPath) && readyViewModel.pending_proposals === 1 && !targetMutated,
        [
          "dashboard data command exits",
          "generated data file exists",
          "generated data parses",
          "proposal store row present",
          "target path not mutated",
        ],
        dataCase.failure_mode,
        "Dashboard data command generated a parsed Pending Review object from a source-backed proposal store.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        dataCase.id,
        false,
        ["dashboard data generation"],
        dataCase.failure_mode,
        error instanceof Error ? error.message : "unknown dashboard data generation error",
      ),
    );
  }

  const readyCase = caseById(cases, "ready-proposal-row-renders-review-evidence");
  try {
    const html = renderPendingReview(readyViewModel);
    const proposal = readyViewModel.proposals[0];
    results.push(
      result(
        readyCase.id,
        Boolean(proposal) &&
          html.includes(proposal?.title ?? "") &&
          html.includes(proposal?.source_refs[0] ?? "") &&
          html.includes("Next action") &&
          html.includes("Failure mode") &&
          !containsMutationCommand(html),
        [
          "proposal title rendered",
          "source ref rendered",
          "next action rendered",
          "failure mode rendered",
          "mutation commands absent",
        ],
        readyCase.failure_mode,
        "Dashboard static render preserved proposal evidence without mutation commands.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        readyCase.id,
        false,
        ["ready proposal row render"],
        readyCase.failure_mode,
        error instanceof Error ? error.message : "unknown ready-row render error",
      ),
    );
  }

  const emptyCase = caseById(cases, "empty-proposal-store-renders-explicit-zero");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-empty-"));
    const viewModel = buildKrnPendingReviewViewModel(targetRoot, new Date("2026-06-20T00:00:00.000Z"));
    const html = renderPendingReview(viewModel);

    results.push(
      result(
        emptyCase.id,
        viewModel.queue_state === "empty" && html.includes("Empty") && !html.includes("Record KRN MCP STDIO transport"),
        ["empty source parses", "empty label rendered", "no proposal rows invented"],
        emptyCase.failure_mode,
        "Dashboard static render displayed the explicit empty proposal-store state.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        emptyCase.id,
        false,
        ["empty state render"],
        emptyCase.failure_mode,
        error instanceof Error ? error.message : "unknown empty-state render error",
      ),
    );
  }

  const invalidCase = caseById(cases, "invalid-proposal-record-renders-blocked");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-invalid-"));
    writeText(join(targetRoot, ".krn/proposals/bad/proposal.json"), "{\"bad\": true}\n");
    const viewModel = buildKrnPendingReviewViewModel(targetRoot, new Date("2026-06-20T00:00:00.000Z"));
    const html = renderPendingReview(viewModel);

    results.push(
      result(
        invalidCase.id,
        viewModel.invalid_records_count === 1 &&
          html.includes("Blocked") &&
          html.includes(".krn/proposals/bad/proposal.json"),
        ["invalid record surfaced", "blocked state rendered", "invalid path rendered"],
        invalidCase.failure_mode,
        "Dashboard static render surfaced the invalid proposal record as blocked state.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        invalidCase.id,
        false,
        ["invalid record render"],
        invalidCase.failure_mode,
        error instanceof Error ? error.message : "unknown invalid-record render error",
      ),
    );
  }

  const staleCase = caseById(cases, "stale-source-ref-renders-blocked");
  try {
    const targetRoot = createProposalTarget();
    const proposal = validProposal();
    storeKrnControlPlaneProposal(proposal, {
      targetInput: targetRoot,
      now: new Date("2026-06-20T00:00:00.000Z"),
    });
    rmSync(join(targetRoot, proposal.source_refs[0] ?? ""), { force: true });
    const viewModel = buildKrnPendingReviewViewModel(targetRoot, new Date("2026-06-20T00:01:00.000Z"));
    const html = renderPendingReview(viewModel);

    results.push(
      result(
        staleCase.id,
        viewModel.stale_source_ref_proposals === 1 && html.includes("Blocked") && html.includes("Stale"),
        ["stale proposal parsed", "blocked state rendered", "stale status rendered"],
        staleCase.failure_mode,
        "Dashboard static render surfaced stale source refs as blocked proposal evidence.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        staleCase.id,
        false,
        ["stale source ref render"],
        staleCase.failure_mode,
        error instanceof Error ? error.message : "unknown stale-source render error",
      ),
    );
  }

  const totalCases = results.length;
  const passedCases = results.filter((caseResult) => caseResult.passed).length;
  const totalAssertions = results.reduce((count, caseResult) => count + caseResult.assertions.length, 0);
  const passedAssertions = results.reduce(
    (count, caseResult) => count + (caseResult.passed ? caseResult.assertions.length : 0),
    0,
  );

  return {
    schema_version: "krn-dashboard-pending-review-ui-result.v1",
    kind: "krn_dashboard_pending_review_ui_result",
    run_id: runId,
    created_at: now.toISOString(),
    total_cases: totalCases,
    passed_cases: passedCases,
    failed_cases: totalCases - passedCases,
    case_pass_rate: totalCases === 0 ? 0 : passedCases / totalCases,
    total_assertions: totalAssertions,
    passed_assertions: passedAssertions,
    failed_assertions: totalAssertions - passedAssertions,
    assertion_pass_rate: totalAssertions === 0 ? 0 : passedAssertions / totalAssertions,
    cases: results,
    generated_data_path: generatedDataPath,
    interpretation_caveat:
      "This eval proves the first local dashboard UI can render typed Pending Review product objects only; it does not prove approval workflow quality, HTTP/API readiness, ChatGPT connector behavior, complete dashboard coverage, human review quality, or productivity lift.",
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-dashboard-pending-review-ui", report.run_id);
  const reportPath = resolve(reportDir, "report.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`report: ${reportPath}\n`);

  if (report.failed_cases > 0) {
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
