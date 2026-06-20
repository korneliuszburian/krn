import { z } from "zod";

const SourceRefSchema = z.string().min(1);
const EvidenceRefSchema = z.string().min(1);

const ControlPlaneProposalKindSchema = z.enum([
  "memory_update",
  "source_claim_update",
  "goal_update",
  "eval_request",
  "repair_record",
  "dashboard_event",
]);

const PendingReviewQueueStateSchema = z.enum(["ready", "empty", "blocked"]);
const PendingReviewSourceSchema = z.enum(["proposal_store", "explicit_zero_no_proposals"]);
const PendingReviewTargetSurfaceSchema = z.enum(["proposal_store", "source_refs", "runtime_artifacts"]);
const ProposalTargetTypeSchema = z.enum(["path", "resource_uri"]);
const SourceRefStatusSchema = z.enum(["validated", "stale"]);

const PendingReviewMetricSourceSchema = z
  .object({
    owner: z.literal("krn"),
    source_refs: z.array(SourceRefSchema).min(1),
    next_action: z.string().min(1),
    failure_mode: z.string().min(1),
  })
  .strict();

const PendingReviewProposalSchema = PendingReviewMetricSourceSchema.extend({
  proposal_id: z.string().min(1),
  proposal_kind: ControlPlaneProposalKindSchema,
  status: z.literal("proposal_only"),
  title: z.string().min(1),
  proposal_path: z.string().min(1),
  target_type: ProposalTargetTypeSchema,
  target_label: z.string().min(1),
  idempotency_key: z.string().min(1),
  review_gate_state: z.literal("not_reviewed"),
  source_ref_status: SourceRefStatusSchema,
  evidence_refs: z.array(EvidenceRefSchema).min(1),
  created_at: z.string().min(1),
  interpretation_caveat: z.string().min(1),
}).strict();

const PendingReviewInvalidRecordSchema = z
  .object({
    proposal_path: z.string().min(1),
    error_summary: z.string().min(1),
  })
  .strict();

const PendingReviewNextActionSchema = z
  .object({
    action_id: z.string().min(1),
    target_surface: PendingReviewTargetSurfaceSchema,
    label: z.string().min(1),
    rationale: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

export const KrnPendingReviewViewModelSchema = z
  .object({
    schema_version: z.literal("krn-pending-review-view-model.v1"),
    kind: z.literal("krn_pending_review_view_model"),
    target_root: z.string().min(1),
    generated_at: z.string().min(1),
    no_mock_state: z.literal(true),
    source: PendingReviewSourceSchema,
    queue_state: PendingReviewQueueStateSchema,
    total_records: z.number().int().nonnegative(),
    pending_proposals: z.number().int().nonnegative(),
    invalid_records_count: z.number().int().nonnegative(),
    stale_source_ref_proposals: z.number().int().nonnegative(),
    proposals: z.array(PendingReviewProposalSchema),
    invalid_records: z.array(PendingReviewInvalidRecordSchema),
    next_allowed_action: PendingReviewNextActionSchema,
    blocked_actions: z.array(z.string().min(1)).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    failure_mode: z.string().min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict();

export type PendingReviewProposal = z.infer<typeof PendingReviewProposalSchema>;
export type PendingReviewInvalidRecord = z.infer<typeof PendingReviewInvalidRecordSchema>;
export type PendingReviewNextAction = z.infer<typeof PendingReviewNextActionSchema>;
export type KrnPendingReviewViewModel = z.infer<typeof KrnPendingReviewViewModelSchema>;

export function parseKrnPendingReviewViewModel(input: unknown): KrnPendingReviewViewModel {
  return KrnPendingReviewViewModelSchema.parse(input);
}

export const krnPendingReviewViewModelJsonSchema = z.toJSONSchema(KrnPendingReviewViewModelSchema, {
  target: "draft-2020-12",
});
