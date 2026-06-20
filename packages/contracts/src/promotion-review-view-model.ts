import { z } from "zod";

const SourceRefSchema = z.string().min(1);
const EvidenceRefSchema = z.string().min(1);

const PromotionReviewQueueStateSchema = z.enum(["ready", "empty", "blocked"]);
const PromotionReviewSourceSchema = z.enum(["promotion_store", "explicit_zero_no_promotions"]);
const PromotionReviewTargetSurfaceSchema = z.enum([
  "promotion_store",
  "proposal_store",
  "proposal_review_store",
  "source_refs",
  "target_files",
]);
const PromotionReviewApplyModeSchema = z.enum(["record_only", "apply_exact_target_write"]);
const PromotionReviewPromotionStateSchema = z.enum(["planned", "applied"]);
const PromotionReviewReferenceStatusSchema = z.enum(["validated", "missing_or_unapproved"]);
const PromotionReviewSourceRefStatusSchema = z.enum(["validated", "stale"]);
const PromotionReviewTargetFileStateSchema = z.enum([
  "not_applied_target_absent",
  "not_applied_target_matches",
  "not_applied_target_differs",
  "applied_target_matches",
  "applied_target_missing",
  "applied_target_differs",
]);

const PromotionReviewMetricSourceSchema = z
  .object({
    owner: z.literal("krn"),
    source_refs: z.array(SourceRefSchema).min(1),
    next_action: z.string().min(1),
    failure_mode: z.string().min(1),
  })
  .strict();

const PromotionReviewPromotionSchema = PromotionReviewMetricSourceSchema.extend({
  promotion_id: z.string().min(1),
  proposal_id: z.string().min(1),
  decision_id: z.string().min(1),
  promotion_path: z.string().min(1),
  proposal_path: z.string().min(1),
  decision_path: z.string().min(1),
  apply_mode: PromotionReviewApplyModeSchema,
  promotion_state: PromotionReviewPromotionStateSchema,
  target_mutated: z.boolean(),
  target_path: z.string().min(1),
  target_content_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  target_file_state: PromotionReviewTargetFileStateSchema,
  reference_status: PromotionReviewReferenceStatusSchema,
  source_ref_status: PromotionReviewSourceRefStatusSchema,
  evidence_refs: z.array(EvidenceRefSchema).min(1),
  created_at: z.string().min(1),
  interpretation_caveat: z.string().min(1),
}).strict();

const PromotionReviewInvalidRecordSchema = z
  .object({
    promotion_path: z.string().min(1),
    error_summary: z.string().min(1),
  })
  .strict();

const PromotionReviewNextActionSchema = z
  .object({
    action_id: z.string().min(1),
    target_surface: PromotionReviewTargetSurfaceSchema,
    label: z.string().min(1),
    rationale: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

export const KrnPromotionReviewViewModelSchema = z
  .object({
    schema_version: z.literal("krn-promotion-review-view-model.v1"),
    kind: z.literal("krn_promotion_review_view_model"),
    target_root: z.string().min(1),
    generated_at: z.string().min(1),
    no_mock_state: z.literal(true),
    source: PromotionReviewSourceSchema,
    queue_state: PromotionReviewQueueStateSchema,
    total_records: z.number().int().nonnegative(),
    valid_promotions: z.number().int().nonnegative(),
    invalid_records_count: z.number().int().nonnegative(),
    planned_promotions: z.number().int().nonnegative(),
    applied_promotions: z.number().int().nonnegative(),
    missing_or_unapproved_reference_promotions: z.number().int().nonnegative(),
    stale_source_ref_promotions: z.number().int().nonnegative(),
    target_conflict_promotions: z.number().int().nonnegative(),
    promotions: z.array(PromotionReviewPromotionSchema),
    invalid_records: z.array(PromotionReviewInvalidRecordSchema),
    next_allowed_action: PromotionReviewNextActionSchema,
    blocked_actions: z.array(z.string().min(1)).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    failure_mode: z.string().min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict();

export type PromotionReviewPromotion = z.infer<typeof PromotionReviewPromotionSchema>;
export type PromotionReviewInvalidRecord = z.infer<typeof PromotionReviewInvalidRecordSchema>;
export type PromotionReviewNextAction = z.infer<typeof PromotionReviewNextActionSchema>;
export type KrnPromotionReviewViewModel = z.infer<typeof KrnPromotionReviewViewModelSchema>;

export function parseKrnPromotionReviewViewModel(input: unknown): KrnPromotionReviewViewModel {
  return KrnPromotionReviewViewModelSchema.parse(input);
}

export const krnPromotionReviewViewModelJsonSchema = z.toJSONSchema(KrnPromotionReviewViewModelSchema, {
  target: "draft-2020-12",
});
