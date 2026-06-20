import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseKrnPendingReviewViewModel, type KrnPendingReviewViewModel } from "@krn/contracts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { parseDashboardData } from "../src/dashboard-data.js";
import { PendingReviewDashboard } from "../src/PendingReviewDashboard.js";

const urlRepoRoot = resolve(fileURLToPath(new URL("../../..", import.meta.url)));
const repoRoot = process.cwd().endsWith("apps/dashboard") ? resolve(process.cwd(), "../..") : urlRepoRoot;

function fixtureViewModel(): KrnPendingReviewViewModel {
  const input: unknown = JSON.parse(
    readFileSync(
      resolve(repoRoot, "docs/specs/krn-pending-review-view-model/examples/pending-review-view-model.example.json"),
      "utf8",
    ),
  );

  return parseDashboardData({
    schema_version: "krn-dashboard-data.v1",
    kind: "krn_dashboard_data",
    target_root: parseKrnPendingReviewViewModel(input).target_root,
    generated_at: "2026-06-20T03:00:00.000Z",
    no_mock_state: true,
    pending_review: input,
    promotion_review: JSON.parse(
      readFileSync(
        resolve(repoRoot, "docs/specs/krn-promotion-review-view-model/examples/promotion-review-view-model.example.json"),
        "utf8",
      ),
    ) as unknown,
    eval_runs: JSON.parse(
      readFileSync(resolve(repoRoot, "docs/specs/krn-eval-runs-view-model/examples/eval-runs-view-model.example.json"), "utf8"),
    ) as unknown,
    source_refs: [
      "docs/goals/goal-006.md",
      "docs/specs/krn-pending-review-view-model/README.md",
      "docs/specs/krn-promotion-review-view-model/README.md",
      "docs/specs/krn-eval-runs-view-model/README.md",
    ],
    interpretation_caveat:
      "Dashboard test fixture contains parsed KRN dashboard view models only and does not mutate targets.",
  }).pending_review;
}

function render(viewModel: KrnPendingReviewViewModel): string {
  return renderToStaticMarkup(<PendingReviewDashboard viewModel={viewModel} />);
}

describe("Pending Review dashboard", () => {
  it("renders a source-backed proposal row without exposing mutation commands", () => {
    const html = render(fixtureViewModel());

    expect(html).toContain("Record KRN MCP STDIO transport boundary");
    expect(html).toContain("docs/goals/goal-006.md");
    expect(html).toContain("Next action");
    expect(html).toContain("Failure mode");
    expect(html).toContain("Validated");
    expect(html).not.toContain("approve_proposal");
    expect(html).not.toContain("reject_proposal");
    expect(html).not.toContain("mutate_target");
  });

  it("renders explicit empty state from a parsed Pending Review object", () => {
    const base = fixtureViewModel();
    const viewModel = parseKrnPendingReviewViewModel({
      ...base,
      source: "explicit_zero_no_proposals",
      queue_state: "empty",
      total_records: 0,
      pending_proposals: 0,
      proposals: [],
      next_allowed_action: {
        ...base.next_allowed_action,
        action_id: "wait-for-proposal-store-input",
        label: "Wait for proposal-store input",
      },
    });

    const html = render(viewModel);

    expect(html).toContain("Empty");
    expect(html).toContain("No proposal records");
    expect(html).not.toContain("Record KRN MCP STDIO transport boundary");
  });

  it("renders invalid proposal records as a blocked queue", () => {
    const base = fixtureViewModel();
    const viewModel = parseKrnPendingReviewViewModel({
      ...base,
      queue_state: "blocked",
      total_records: 1,
      pending_proposals: 0,
      invalid_records_count: 1,
      proposals: [],
      invalid_records: [
        {
          proposal_path: ".krn/proposals/bad/proposal.json",
          error_summary: "Invalid proposal record.",
        },
      ],
      next_allowed_action: {
        ...base.next_allowed_action,
        action_id: "repair-invalid-proposal-records",
        label: "Repair invalid proposal records",
      },
    });

    const html = render(viewModel);

    expect(html).toContain("Blocked");
    expect(html).toContain(".krn/proposals/bad/proposal.json");
    expect(html).toContain("Invalid proposal record.");
  });

  it("renders stale source refs as blocked row evidence", () => {
    const base = fixtureViewModel();
    const proposal = base.proposals[0];
    if (!proposal) {
      throw new Error("fixture must include one proposal");
    }
    const viewModel = parseKrnPendingReviewViewModel({
      ...base,
      queue_state: "blocked",
      stale_source_ref_proposals: 1,
      proposals: [
        {
          ...proposal,
          source_ref_status: "stale",
          next_action: "Repair this proposal's source refs before human review can promote it.",
        },
      ],
      next_allowed_action: {
        ...base.next_allowed_action,
        action_id: "repair-stale-source-refs",
        label: "Repair stale proposal source refs",
      },
    });

    const html = render(viewModel);

    expect(html).toContain("Blocked");
    expect(html).toContain("Stale");
    expect(html).toContain("Repair stale proposal source refs");
  });
});
