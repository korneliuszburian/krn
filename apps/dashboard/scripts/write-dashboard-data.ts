import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseKrnPendingReviewViewModel } from "@krn/contracts";
import { buildKrnPendingReviewViewModel } from "@krn/mcp";

const dashboardRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = resolve(dashboardRoot, "../..");
const targetRoot = resolve(process.env.KRN_TARGET_ROOT ?? repoRoot);
const outputPath = resolve(
  process.env.KRN_DASHBOARD_DATA_OUT ?? resolve(dashboardRoot, "public/krn-dashboard-data.json"),
);

const viewModel = parseKrnPendingReviewViewModel(buildKrnPendingReviewViewModel(targetRoot));

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(viewModel, null, 2)}\n`, "utf8");

console.log(`wrote ${outputPath}`);
