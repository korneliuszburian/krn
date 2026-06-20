import { z } from "zod";

const SourceRefSchema = z.string().min(1);
const EvidenceRefSchema = z.string().min(1);

const PromotionApplyModeSchema = z.enum(["record_only", "apply_exact_target_write"]);

const PromotionTargetSchema = z
  .object({
    target_type: z.literal("path"),
    path: z.string().min(1),
    write_mode: z.literal("exact_file_content"),
    file_content: z.string().min(1),
    content_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

const PromotionWritePolicySchema = z
  .object({
    default_effect: z.literal("record_only"),
    allowed_effects: z.array(z.enum(["append_promotion_record", "write_exact_target_content"])).min(1),
    idempotency_key: z.string().min(1),
  })
  .strict();

export const KrnProposalPromotionSchema = z
  .object({
    schema_version: z.literal("krn-proposal-promotion.v1"),
    kind: z.literal("krn_proposal_promotion"),
    promotion_id: z.string().min(1),
    proposal_id: z.string().min(1),
    proposal_path: z.string().min(1),
    decision_id: z.string().min(1),
    decision_path: z.string().min(1),
    proposal_kind: z.literal("memory_update"),
    promotion_scope: z.literal("approved_memory_update_only"),
    apply_mode: PromotionApplyModeSchema,
    promotion_state: z.enum(["planned", "applied"]),
    target_mutated: z.boolean(),
    target: PromotionTargetSchema,
    write_policy: PromotionWritePolicySchema,
    evidence_refs: z.array(EvidenceRefSchema).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    blocked_surfaces: z.array(z.string().min(1)).min(1),
    created_at: z.string().min(1),
    created_by: z.string().min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((promotion, context) => {
    if (promotion.apply_mode === "record_only") {
      if (promotion.promotion_state !== "planned") {
        context.addIssue({
          code: "custom",
          path: ["promotion_state"],
          message: "record_only promotions must use planned state",
        });
      }
      if (promotion.target_mutated !== false) {
        context.addIssue({
          code: "custom",
          path: ["target_mutated"],
          message: "record_only promotions must not claim target mutation",
        });
      }
    }

    if (promotion.apply_mode === "apply_exact_target_write") {
      if (promotion.promotion_state !== "applied") {
        context.addIssue({
          code: "custom",
          path: ["promotion_state"],
          message: "apply_exact_target_write promotions must use applied state",
        });
      }
      if (promotion.target_mutated !== true) {
        context.addIssue({
          code: "custom",
          path: ["target_mutated"],
          message: "apply_exact_target_write promotions must report target mutation",
        });
      }
      if (!promotion.write_policy.allowed_effects.includes("write_exact_target_content")) {
        context.addIssue({
          code: "custom",
          path: ["write_policy", "allowed_effects"],
          message: "apply_exact_target_write promotions must explicitly allow exact target writes",
        });
      }
    }
  });

export type ProposalPromotionApplyMode = z.infer<typeof PromotionApplyModeSchema>;
export type KrnProposalPromotion = z.infer<typeof KrnProposalPromotionSchema>;

export function parseKrnProposalPromotion(input: unknown): KrnProposalPromotion {
  return KrnProposalPromotionSchema.parse(input);
}

export const krnProposalPromotionJsonSchema = z.toJSONSchema(KrnProposalPromotionSchema, {
  target: "draft-2020-12",
});
