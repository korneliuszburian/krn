import { z } from "zod";
import { KrnEvalRunsViewModelSchema } from "./eval-runs-view-model.js";
import { KrnPendingReviewViewModelSchema } from "./pending-review-view-model.js";
import { KrnPromotionReviewViewModelSchema } from "./promotion-review-view-model.js";

const SourceRefSchema = z.string().min(1);

export const KrnDashboardDataSchema = z
  .object({
    schema_version: z.literal("krn-dashboard-data.v1"),
    kind: z.literal("krn_dashboard_data"),
    target_root: z.string().min(1),
    generated_at: z.string().min(1),
    no_mock_state: z.literal(true),
    pending_review: KrnPendingReviewViewModelSchema,
    promotion_review: KrnPromotionReviewViewModelSchema,
    eval_runs: KrnEvalRunsViewModelSchema,
    source_refs: z.array(SourceRefSchema).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((dashboardData, context) => {
    if (dashboardData.pending_review.target_root !== dashboardData.target_root) {
      context.addIssue({
        code: "custom",
        path: ["pending_review", "target_root"],
        message: "pending_review target_root must match dashboard target_root",
      });
    }

    if (dashboardData.promotion_review.target_root !== dashboardData.target_root) {
      context.addIssue({
        code: "custom",
        path: ["promotion_review", "target_root"],
        message: "promotion_review target_root must match dashboard target_root",
      });
    }

    if (dashboardData.eval_runs.target_root !== dashboardData.target_root) {
      context.addIssue({
        code: "custom",
        path: ["eval_runs", "target_root"],
        message: "eval_runs target_root must match dashboard target_root",
      });
    }
  });

export type KrnDashboardData = z.infer<typeof KrnDashboardDataSchema>;

export function parseKrnDashboardData(input: unknown): KrnDashboardData {
  return KrnDashboardDataSchema.parse(input);
}

export const krnDashboardDataJsonSchema = z.toJSONSchema(KrnDashboardDataSchema, {
  target: "draft-2020-12",
});
