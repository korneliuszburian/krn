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

const dashboardRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = resolve(dashboardRoot, "../..");
const targetRoot = resolve(process.env.KRN_TARGET_ROOT ?? repoRoot);
const outputPath = resolve(
  process.env.KRN_DASHBOARD_DATA_OUT ?? resolve(dashboardRoot, "public/krn-dashboard-data.json"),
);

const now = new Date();
const dashboardData = parseKrnDashboardData({
  schema_version: "krn-dashboard-data.v1",
  kind: "krn_dashboard_data",
  target_root: targetRoot,
  generated_at: now.toISOString(),
  no_mock_state: true,
  pending_review: buildKrnPendingReviewViewModel(targetRoot, now),
  promotion_review: buildKrnPromotionReviewViewModel(targetRoot, now),
  eval_runs: buildKrnEvalRunsViewModel(targetRoot, now),
  benchmark_reports: buildKrnBenchmarkReportsViewModel(targetRoot, now),
  source_refs: [
    "docs/goals/goal-006.md",
    "docs/goals/goal-012.md",
    "docs/goals/goal-015.md",
    "docs/goals/goal-016.md",
    "docs/goals/goal-019.md",
    "docs/specs/krn-pending-review-view-model/README.md",
    "docs/specs/krn-promotion-review-view-model/README.md",
    "docs/specs/krn-eval-runs-view-model/README.md",
    "docs/specs/krn-benchmark-reports-view-model/README.md",
  ],
  interpretation_caveat:
    "This dashboard data file contains parsed KRN dashboard view models only; it does not approve proposals, apply promotions, expose HTTP/API commands, or prove productivity lift.",
});

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(dashboardData, null, 2)}\n`, "utf8");

console.log(`wrote ${outputPath}`);
