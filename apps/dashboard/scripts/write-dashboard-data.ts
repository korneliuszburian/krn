import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseKrnDashboardData } from "@krn/contracts";
import {
  buildKrnBenchmarkReportsViewModel,
  buildKrnEvalRunsViewModel,
  buildKrnPendingReviewViewModel,
  buildKrnPromotionReviewViewModel,
} from "@krn/mcp";

const DASHBOARD_DATA_SPEC_SOURCE_REFS = ["docs/specs/krn-dashboard-data/README.md"] as const;

const dashboardRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = resolve(dashboardRoot, "../..");
const targetRoot = resolve(process.env.KRN_TARGET_ROOT ?? repoRoot);
const outputPath = resolve(
  process.env.KRN_DASHBOARD_DATA_OUT ?? resolve(dashboardRoot, "public/krn-dashboard-data.json"),
);

function sourceRefsWithDashboardDataSpec(sourceRefs: readonly string[]): string[] {
  return [...new Set([...sourceRefs, ...DASHBOARD_DATA_SPEC_SOURCE_REFS])];
}

const now = new Date();
const pendingReview = buildKrnPendingReviewViewModel(targetRoot, now);
const promotionReview = buildKrnPromotionReviewViewModel(targetRoot, now);
const evalRuns = buildKrnEvalRunsViewModel(targetRoot, now);
const benchmarkReports = buildKrnBenchmarkReportsViewModel(targetRoot, now);
const sourceRefs = sourceRefsWithDashboardDataSpec([
  ...pendingReview.source_refs,
  ...promotionReview.source_refs,
  ...evalRuns.source_refs,
  ...benchmarkReports.source_refs,
]);

const dashboardData = parseKrnDashboardData({
  schema_version: "krn-dashboard-data.v1",
  kind: "krn_dashboard_data",
  target_root: targetRoot,
  generated_at: now.toISOString(),
  no_mock_state: true,
  pending_review: pendingReview,
  promotion_review: promotionReview,
  eval_runs: evalRuns,
  benchmark_reports: benchmarkReports,
  source_refs: sourceRefs,
  interpretation_caveat:
    "This dashboard data file contains parsed KRN dashboard view models only; it does not approve proposals, apply promotions, expose HTTP/API commands, or prove productivity lift.",
});

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(dashboardData, null, 2)}\n`, "utf8");

console.log(`wrote ${outputPath}`);
