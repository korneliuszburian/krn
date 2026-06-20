import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseKrnPromotionReviewViewModel, type KrnPromotionReviewViewModel } from "@krn/contracts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PromotionReviewDashboard } from "../src/PromotionReviewDashboard.js";

const urlRepoRoot = resolve(fileURLToPath(new URL("../../..", import.meta.url)));
const repoRoot = process.cwd().endsWith("apps/dashboard") ? resolve(process.cwd(), "../..") : urlRepoRoot;

function fixtureViewModel(): KrnPromotionReviewViewModel {
  const input: unknown = JSON.parse(
    readFileSync(
      resolve(repoRoot, "docs/specs/krn-promotion-review-view-model/examples/promotion-review-view-model.example.json"),
      "utf8",
    ),
  );

  return parseKrnPromotionReviewViewModel(input);
}

function render(viewModel: KrnPromotionReviewViewModel): string {
  return renderToStaticMarkup(<PromotionReviewDashboard viewModel={viewModel} />);
}

describe("Promotion Review dashboard", () => {
  it("renders promotion records without exposing promotion/apply commands", () => {
    const html = render(fixtureViewModel());

    expect(html).toContain("Promotion Review");
    expect(html).toContain("promotion-memory-note-krn-mcp-stdio-transport");
    expect(html).toContain("Audit promotion records");
    expect(html).toContain("Failure mode");
    expect(html).not.toContain("apply_promotion_from_dashboard");
    expect(html).not.toContain("dashboard_promote_button");
    expect(html).not.toContain("write_memory");
  });

  it("renders target drift as blocked promotion evidence", () => {
    const base = fixtureViewModel();
    const promotion = base.promotions[0];
    if (!promotion) {
      throw new Error("fixture must include one promotion");
    }
    const viewModel = parseKrnPromotionReviewViewModel({
      ...base,
      queue_state: "blocked",
      target_conflict_promotions: 1,
      promotions: [
        {
          ...promotion,
          target_file_state: "not_applied_target_differs",
          next_action: "Inspect target file drift before any exact apply or promotion audit claim.",
        },
      ],
      next_allowed_action: {
        ...base.next_allowed_action,
        action_id: "inspect-promotion-target-conflicts",
        label: "Inspect promotion target conflicts",
        target_surface: "target_files",
      },
    });

    const html = render(viewModel);

    expect(html).toContain("Blocked");
    expect(html).toContain("Target differs");
    expect(html).toContain("Inspect promotion target conflicts");
  });

  it("renders invalid promotion records as blocked state", () => {
    const base = fixtureViewModel();
    const viewModel = parseKrnPromotionReviewViewModel({
      ...base,
      queue_state: "blocked",
      total_records: 1,
      valid_promotions: 0,
      invalid_records_count: 1,
      planned_promotions: 0,
      promotions: [],
      invalid_records: [
        {
          promotion_path: ".krn/promotions/bad/promotion.json",
          error_summary: "Invalid promotion record.",
        },
      ],
      next_allowed_action: {
        ...base.next_allowed_action,
        action_id: "repair-invalid-promotion-records",
        label: "Repair invalid promotion records",
      },
    });

    const html = render(viewModel);

    expect(html).toContain("Blocked");
    expect(html).toContain(".krn/promotions/bad/promotion.json");
    expect(html).toContain("Invalid promotion record.");
  });
});
