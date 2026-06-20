import { z } from "zod";

const SourceRefSchema = z.string().min(1);

const DashboardResourceStatusSchema = z.enum(["ready", "degraded", "blocked"]);
const RuntimeArtifactStatusSchema = z.enum(["available", "missing", "invalid"]);
const RuntimeArtifactKindSchema = z.enum(["init_manifest", "doctor_report", "eval_report", "review_report"]);
const PendingReviewSourceSchema = z.enum(["proposal_store", "explicit_zero_no_proposals"]);
const NextAllowedSurfaceSchema = z.enum([
  "runtime_artifacts",
  "pending_review",
  "dashboard_view_model",
  "proposal_tools",
]);

const DashboardMetricSourceSchema = z
  .object({
    owner: z.literal("krn"),
    source_refs: z.array(SourceRefSchema).min(1),
    next_action: z.string().min(1),
    failure_mode: z.string().min(1),
  })
  .strict();

const DashboardResourceHealthSchema = DashboardMetricSourceSchema.extend({
  status: DashboardResourceStatusSchema,
  total_resources: z.number().int().nonnegative(),
  available_resources: z.number().int().nonnegative(),
  missing_resources: z.number().int().nonnegative(),
  invalid_resources: z.number().int().nonnegative(),
}).strict();

const DashboardRuntimeArtifactSchema = DashboardMetricSourceSchema.extend({
  id: z.string().min(1),
  resource_uri: z.string().min(1),
  resource_kind: RuntimeArtifactKindSchema,
  status: RuntimeArtifactStatusSchema,
  latest_report_path: z.string().min(1).nullable(),
  title: z.string().min(1),
  summary: z.string().min(1),
}).strict();

const DashboardPendingReviewSchema = DashboardMetricSourceSchema.extend({
  pending_proposals: z.number().int().nonnegative(),
  source: PendingReviewSourceSchema,
}).strict();

const DashboardNextAllowedActionSchema = z
  .object({
    action_id: z.string().min(1),
    target_surface: NextAllowedSurfaceSchema,
    label: z.string().min(1),
    rationale: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

export const KrnDashboardViewModelSchema = z
  .object({
    schema_version: z.literal("krn-dashboard-view-model.v1"),
    kind: z.literal("krn_dashboard_view_model"),
    target_root: z.string().min(1),
    generated_at: z.string().min(1),
    no_mock_state: z.literal(true),
    resource_health: DashboardResourceHealthSchema,
    latest_runtime_artifacts: z.array(DashboardRuntimeArtifactSchema).min(1),
    pending_review: DashboardPendingReviewSchema,
    next_allowed_action: DashboardNextAllowedActionSchema,
    source_refs: z.array(SourceRefSchema).min(1),
    failure_mode: z.string().min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict();

export type DashboardResourceHealth = z.infer<typeof DashboardResourceHealthSchema>;
export type DashboardRuntimeArtifact = z.infer<typeof DashboardRuntimeArtifactSchema>;
export type DashboardPendingReview = z.infer<typeof DashboardPendingReviewSchema>;
export type DashboardNextAllowedAction = z.infer<typeof DashboardNextAllowedActionSchema>;
export type KrnDashboardViewModel = z.infer<typeof KrnDashboardViewModelSchema>;

export function parseKrnDashboardViewModel(input: unknown): KrnDashboardViewModel {
  return KrnDashboardViewModelSchema.parse(input);
}

export const krnDashboardViewModelJsonSchema = z.toJSONSchema(KrnDashboardViewModelSchema, {
  target: "draft-2020-12",
});
