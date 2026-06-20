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

const ProposalTargetSchema = z.discriminatedUnion("target_type", [
  z
    .object({
      target_type: z.literal("path"),
      path: z.string().min(1),
    })
    .strict(),
  z
    .object({
      target_type: z.literal("resource_uri"),
      uri: z.string().min(1),
    })
    .strict(),
]);

const ProposalReviewGateSchema = z
  .object({
    required: z.literal(true),
    state: z.literal("not_reviewed"),
    reviewer: z.string().min(1).nullable(),
  })
  .strict();

const ProposalWritePolicySchema = z
  .object({
    default_effect: z.literal("no_mutation"),
    allowed_persistence: z.literal("append_only"),
    idempotency_key: z.string().min(1),
  })
  .strict();

const MemoryPromotionPayloadSchema = z
  .object({
    payload_type: z.literal("memory_entry"),
    target_path: z.string().min(1),
    write_mode: z.literal("exact_file_content"),
    file_content: z.string().min(1),
    content_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

const PromotionPayloadSchema = z.discriminatedUnion("payload_type", [MemoryPromotionPayloadSchema]);

export const KrnControlPlaneProposalSchema = z
  .object({
    schema_version: z.literal("krn-control-plane-proposal.v1"),
    kind: z.literal("krn_control_plane_proposal"),
    proposal_id: z.string().min(1),
    proposal_kind: ControlPlaneProposalKindSchema,
    status: z.literal("proposal_only"),
    title: z.string().min(1),
    rationale: z.string().min(1),
    proposed_change: z.string().min(1),
    promotion_payload: PromotionPayloadSchema.optional(),
    target: ProposalTargetSchema,
    write_policy: ProposalWritePolicySchema,
    review_gate: ProposalReviewGateSchema,
    evidence_refs: z.array(EvidenceRefSchema).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    blocked_surfaces: z.array(z.string().min(1)).min(1),
    created_at: z.string().min(1),
    created_by: z.string().min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((proposal, context) => {
    if (proposal.promotion_payload && proposal.proposal_kind !== "memory_update") {
      context.addIssue({
        code: "custom",
        path: ["promotion_payload"],
        message: "promotion_payload is currently supported only for memory_update proposals",
      });
    }

    if (
      proposal.promotion_payload?.payload_type === "memory_entry" &&
      proposal.target.target_type === "path" &&
      proposal.promotion_payload.target_path !== proposal.target.path
    ) {
      context.addIssue({
        code: "custom",
        path: ["promotion_payload", "target_path"],
        message: "memory promotion payload target_path must match proposal target.path",
      });
    }
  });

export type ControlPlaneProposalKind = z.infer<typeof ControlPlaneProposalKindSchema>;
export type ControlPlaneProposalTarget = z.infer<typeof ProposalTargetSchema>;
export type ControlPlanePromotionPayload = z.infer<typeof PromotionPayloadSchema>;
export type KrnControlPlaneProposal = z.infer<typeof KrnControlPlaneProposalSchema>;

export function parseKrnControlPlaneProposal(input: unknown): KrnControlPlaneProposal {
  return KrnControlPlaneProposalSchema.parse(input);
}

export const krnControlPlaneProposalJsonSchema = z.toJSONSchema(KrnControlPlaneProposalSchema, {
  target: "draft-2020-12",
});
