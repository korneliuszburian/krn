import { z } from "zod";

const SourceRefSchema = z.string().min(1);
const EvidenceRefSchema = z.string().min(1);

const ProposalReviewDecisionValueSchema = z.enum(["approved_for_promotion", "rejected"]);

const ProposalReviewDecisionWritePolicySchema = z
  .object({
    default_effect: z.literal("no_target_mutation"),
    allowed_persistence: z.literal("append_only"),
    idempotency_key: z.string().min(1),
  })
  .strict();

export const KrnProposalReviewDecisionSchema = z
  .object({
    schema_version: z.literal("krn-proposal-review-decision.v1"),
    kind: z.literal("krn_proposal_review_decision"),
    decision_id: z.string().min(1),
    proposal_id: z.string().min(1),
    proposal_path: z.string().min(1),
    decision: ProposalReviewDecisionValueSchema,
    review_scope: z.literal("proposal_review_only"),
    target_mutated: z.literal(false),
    promotion_state: z.literal("not_promoted"),
    reviewer: z.string().min(1),
    rationale: z.string().min(1),
    write_policy: ProposalReviewDecisionWritePolicySchema,
    evidence_refs: z.array(EvidenceRefSchema).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    blocked_surfaces: z.array(z.string().min(1)).min(1),
    created_at: z.string().min(1),
    created_by: z.string().min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict();

export type ProposalReviewDecisionValue = z.infer<typeof ProposalReviewDecisionValueSchema>;
export type KrnProposalReviewDecision = z.infer<typeof KrnProposalReviewDecisionSchema>;

export function parseKrnProposalReviewDecision(input: unknown): KrnProposalReviewDecision {
  return KrnProposalReviewDecisionSchema.parse(input);
}

export const krnProposalReviewDecisionJsonSchema = z.toJSONSchema(KrnProposalReviewDecisionSchema, {
  target: "draft-2020-12",
});
