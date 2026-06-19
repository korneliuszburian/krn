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
  .strict();

export type ControlPlaneProposalKind = z.infer<typeof ControlPlaneProposalKindSchema>;
export type ControlPlaneProposalTarget = z.infer<typeof ProposalTargetSchema>;
export type KrnControlPlaneProposal = z.infer<typeof KrnControlPlaneProposalSchema>;

export function parseKrnControlPlaneProposal(input: unknown): KrnControlPlaneProposal {
  return KrnControlPlaneProposalSchema.parse(input);
}

export const krnControlPlaneProposalJsonSchema = z.toJSONSchema(KrnControlPlaneProposalSchema, {
  target: "draft-2020-12",
});
