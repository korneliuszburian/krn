import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import {
  parseKrnControlPlaneProposal,
  parseKrnProposalPromotion,
  parseKrnProposalReviewDecision,
  parseKrnPromotionReviewViewModel,
  type KrnControlPlaneProposal,
  type KrnProposalPromotion,
  type KrnProposalReviewDecision,
} from "@krn/contracts";
import { parseDashboardData, PromotionReviewDashboard } from "@krn/dashboard";
import {
  buildKrnPromotionReviewViewModel,
  storeKrnControlPlaneProposal,
  storeKrnProposalPromotion,
  storeKrnProposalReviewDecision,
} from "@krn/mcp";
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
  schema_version: "krn-dashboard-promotion-review-ui-result.v1";
  kind: "krn_dashboard_promotion_review_ui_result";
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

function validProposal(): KrnControlPlaneProposal {
  return parseKrnControlPlaneProposal(
    readJson(resolve("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json")),
  );
}

function validDecisionFor(proposal: KrnControlPlaneProposal, proposalPath: string): KrnProposalReviewDecision {
  const decision = parseKrnProposalReviewDecision(
    readJson(resolve("docs/specs/krn-proposal-review-decision/examples/proposal-review-decision.example.json")),
  );

  return parseKrnProposalReviewDecision({
    ...decision,
    proposal_id: proposal.proposal_id,
    proposal_path: proposalPath,
    source_refs: proposal.source_refs,
    evidence_refs: proposal.evidence_refs,
  });
}

function validPromotionFor(
  proposal: KrnControlPlaneProposal,
  proposalPath: string,
  decision: KrnProposalReviewDecision,
  decisionPath: string,
  overrides: Partial<KrnProposalPromotion> = {},
): KrnProposalPromotion {
  const promotion = parseKrnProposalPromotion(
    readJson(resolve("docs/specs/krn-proposal-promotion/examples/proposal-promotion.example.json")),
  );

  return parseKrnProposalPromotion({
    ...promotion,
    proposal_id: proposal.proposal_id,
    proposal_path: proposalPath,
    decision_id: decision.decision_id,
    decision_path: decisionPath,
    proposal_kind: proposal.proposal_kind,
    target: {
      ...promotion.target,
      path: proposal.target.target_type === "path" ? proposal.target.path : promotion.target.path,
      file_content: proposal.promotion_payload?.file_content ?? promotion.target.file_content,
      content_sha256: proposal.promotion_payload?.content_sha256 ?? promotion.target.content_sha256,
    },
    evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
    ...overrides,
  });
}

function createPromotionTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-promotion-review-"));
  const proposal = validProposal();
  const promotion = parseKrnProposalPromotion(
    readJson(resolve("docs/specs/krn-proposal-promotion/examples/proposal-promotion.example.json")),
  );
  const sourceRefs = new Set([...proposal.source_refs, ...promotion.source_refs]);
  for (const sourceRef of sourceRefs) {
    writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
  }
  return targetRoot;
}

function storeApprovedPromotion(targetRoot: string): KrnProposalPromotion {
  const proposal = validProposal();
  const storedProposal = storeKrnControlPlaneProposal(proposal, {
    targetInput: targetRoot,
    now: new Date("2026-06-20T03:00:00.000Z"),
  });
  const decision = validDecisionFor(proposal, storedProposal.proposal_path);
  const storedDecision = storeKrnProposalReviewDecision(decision, {
    targetInput: targetRoot,
    now: new Date("2026-06-20T03:01:00.000Z"),
  });
  const promotion = validPromotionFor(proposal, storedProposal.proposal_path, decision, storedDecision.decision_path);
  storeKrnProposalPromotion(promotion, {
    targetInput: targetRoot,
    now: new Date("2026-06-20T03:02:00.000Z"),
  });
  return promotion;
}

function caseById(cases: EvalCase[], id: string): EvalCase {
  const found = cases.find((testCase) => testCase.id === id);
  if (!found) {
    throw new Error(`Missing case ${id}`);
  }
  return found;
}

function renderPromotionReview(input: unknown): string {
  return renderToStaticMarkup(
    createElement(PromotionReviewDashboard, { viewModel: parseKrnPromotionReviewViewModel(input) }),
  );
}

function containsPromotionCommand(html: string): boolean {
  return (
    html.includes("apply_promotion_from_dashboard") ||
    html.includes("dashboard_promote_button") ||
    html.includes("http_api_write_route") ||
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
  const cases = parseCases(readJson(resolve("docs/evals/krn-dashboard-promotion-review-ui/cases.json")));
  const results: CaseResult[] = [];
  let generatedDataPath: string | null = null;
  let readyViewModel = parseKrnPromotionReviewViewModel(
    readJson(resolve("docs/specs/krn-promotion-review-view-model/examples/promotion-review-view-model.example.json")),
  );

  const dataCase = caseById(cases, "dashboard-data-generation-includes-promotion-review");
  try {
    const targetRoot = createPromotionTarget();
    const promotion = storeApprovedPromotion(targetRoot);
    const outputPath = join(mkdtempSync(join(tmpdir(), "krn-dashboard-promotion-data-out-")), "krn-dashboard-data.json");
    runDashboardDataCommand(targetRoot, outputPath);
    generatedDataPath = outputPath;
    const dashboardData = parseDashboardData(readJson(outputPath));
    readyViewModel = dashboardData.promotion_review;
    const targetMutated = existsSync(join(targetRoot, promotion.target.path));

    results.push(
      result(
        dataCase.id,
        existsSync(outputPath) && dashboardData.kind === "krn_dashboard_data" && readyViewModel.valid_promotions === 1 && !targetMutated,
        [
          "dashboard data command exits",
          "generated data file exists",
          "generated dashboard data parses",
          "promotion review row present",
          "record-only target path not mutated",
        ],
        dataCase.failure_mode,
        "Dashboard data command generated a parsed Promotion Review object from a source-backed promotion store.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        dataCase.id,
        false,
        ["dashboard data promotion generation"],
        dataCase.failure_mode,
        error instanceof Error ? error.message : "unknown dashboard data generation error",
      ),
    );
  }

  const readyCase = caseById(cases, "promotion-row-renders-audit-evidence");
  try {
    const html = renderPromotionReview(readyViewModel);
    const promotion = readyViewModel.promotions[0];
    results.push(
      result(
        readyCase.id,
        Boolean(promotion) &&
          html.includes(promotion?.promotion_id ?? "") &&
          html.includes(promotion?.source_refs[0] ?? "") &&
          html.includes("Next action") &&
          html.includes("Failure mode") &&
          !containsPromotionCommand(html),
        [
          "promotion id rendered",
          "source ref rendered",
          "next action rendered",
          "failure mode rendered",
          "promotion commands absent",
        ],
        readyCase.failure_mode,
        "Dashboard static render preserved promotion evidence without apply/write commands.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        readyCase.id,
        false,
        ["ready promotion row render"],
        readyCase.failure_mode,
        error instanceof Error ? error.message : "unknown ready promotion render error",
      ),
    );
  }

  const emptyCase = caseById(cases, "empty-promotion-store-renders-explicit-zero");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-promotion-empty-"));
    const viewModel = buildKrnPromotionReviewViewModel(targetRoot, new Date("2026-06-20T03:00:00.000Z"));
    const html = renderPromotionReview(viewModel);

    results.push(
      result(
        emptyCase.id,
        viewModel.queue_state === "empty" && html.includes("Empty") && !html.includes("promotion-memory-note"),
        ["empty source parses", "empty label rendered", "no promotion rows invented"],
        emptyCase.failure_mode,
        "Dashboard static render displayed the explicit empty promotion-store state.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        emptyCase.id,
        false,
        ["empty promotion state render"],
        emptyCase.failure_mode,
        error instanceof Error ? error.message : "unknown empty promotion render error",
      ),
    );
  }

  const invalidCase = caseById(cases, "invalid-promotion-record-renders-blocked");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-promotion-invalid-"));
    writeText(join(targetRoot, ".krn/promotions/bad/promotion.json"), "{\"bad\": true}\n");
    const viewModel = buildKrnPromotionReviewViewModel(targetRoot, new Date("2026-06-20T03:00:00.000Z"));
    const html = renderPromotionReview(viewModel);

    results.push(
      result(
        invalidCase.id,
        viewModel.invalid_records_count === 1 &&
          html.includes("Blocked") &&
          html.includes(".krn/promotions/bad/promotion.json"),
        ["invalid promotion surfaced", "blocked state rendered", "invalid promotion path rendered"],
        invalidCase.failure_mode,
        "Dashboard static render surfaced the invalid promotion record as blocked state.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        invalidCase.id,
        false,
        ["invalid promotion record render"],
        invalidCase.failure_mode,
        error instanceof Error ? error.message : "unknown invalid promotion render error",
      ),
    );
  }

  const driftCase = caseById(cases, "target-drift-renders-blocked");
  try {
    const targetRoot = createPromotionTarget();
    const promotion = storeApprovedPromotion(targetRoot);
    writeText(join(targetRoot, promotion.target.path), "different target content\n");
    const viewModel = buildKrnPromotionReviewViewModel(targetRoot, new Date("2026-06-20T03:00:00.000Z"));
    const html = renderPromotionReview(viewModel);
    rmSync(join(targetRoot, promotion.target.path), { force: true });

    results.push(
      result(
        driftCase.id,
        viewModel.target_conflict_promotions === 1 && html.includes("Blocked") && html.includes("Target differs"),
        ["target drift parsed", "blocked state rendered", "target drift status rendered"],
        driftCase.failure_mode,
        "Dashboard static render surfaced target drift as blocked promotion evidence.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        driftCase.id,
        false,
        ["target drift render"],
        driftCase.failure_mode,
        error instanceof Error ? error.message : "unknown target drift render error",
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
    schema_version: "krn-dashboard-promotion-review-ui-result.v1",
    kind: "krn_dashboard_promotion_review_ui_result",
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
      "This eval proves the local dashboard can render typed Promotion Review product objects only; it does not prove dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, broad promotion correctness, safe overwrite semantics, or productivity lift.",
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-dashboard-promotion-review-ui", report.run_id);
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
