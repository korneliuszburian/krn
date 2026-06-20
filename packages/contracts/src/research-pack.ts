import { z } from "zod";

const SourceBudgetModeSchema = z.enum(["quick", "standard", "deep"]);
const SourceTierSchema = z.enum(["A", "B", "C", "D"]);
const EvidenceStrengthSchema = z.enum(["strong", "medium", "weak", "discovery_only"]);
const DecisionLabelSchema = z.enum(["FACT", "INFERENCE", "HYPOTHESIS", "DECISION", "BLOCKED"]);
const PromotionTargetTypeSchema = z.enum(["memory", "adr", "skill", "eval", "product_doc", "none"]);

const SourceUniverseKindSchema = z.enum([
  "local_source_bank",
  "repo_memory",
  "canonical_docs",
  "official_docs",
  "primary_papers",
  "practitioner_material",
]);

const ResearchPackStatusSchema = z.enum([
  "scaffolded",
  "in_progress",
  "ready_for_review",
  "promoted",
  "discarded",
]);

const SourceRefSchema = z.string().min(1);
const EvidenceRefSchema = z.string().min(1);

const SourceBudgetSchema = z
  .object({
    mode: SourceBudgetModeSchema,
    min_sources: z.number().int().positive(),
    max_sources: z.number().int().positive().nullable(),
    stop_condition: z.string().min(1),
  })
  .strict()
  .superRefine((budget, context) => {
    const expected = sourceBudgetRange(budget.mode);
    if (budget.min_sources !== expected.min) {
      context.addIssue({
        code: "custom",
        path: ["min_sources"],
        message: `${budget.mode} budget requires min_sources ${expected.min}`,
      });
    }

    if (budget.max_sources !== expected.max) {
      context.addIssue({
        code: "custom",
        path: ["max_sources"],
        message: `${budget.mode} budget requires max_sources ${String(expected.max)}`,
      });
    }
  });

const SourceUniverseEntrySchema = z
  .object({
    kind: SourceUniverseKindSchema,
    ref: z.string().min(1),
    inclusion_reason: z.string().min(1),
  })
  .strict();

const ResearchSourceSchema = z
  .object({
    id: z.string().min(1),
    tier: SourceTierSchema,
    title: z.string().min(1),
    source_ref: z.string().min(1),
    access_or_pin: z.string().min(1),
    why_included: z.string().min(1),
    local_cache_path: z.string().min(1).nullable(),
  })
  .strict();

const MechanismEntrySchema = z
  .object({
    mechanism: z.string().min(1),
    source_ids: z.array(z.string().min(1)).min(1),
    evidence_strength: EvidenceStrengthSchema,
    works_when: z.string().min(1),
    fails_when: z.string().min(1),
    krn_transfer: z.string().min(1),
    proof_surface: z.string().min(1),
  })
  .strict();

const ContradictionEntrySchema = z
  .object({
    conflict: z.string().min(1),
    source_ids: z.array(z.string().min(1)).min(1),
    resolution: z.string().min(1),
    krn_decision: z.string().min(1),
  })
  .strict();

const RejectedAlternativeSchema = z
  .object({
    alternative: z.string().min(1),
    why_rejected: z.string().min(1),
    review_trigger: z.string().min(1),
  })
  .strict();

const DecisionCandidateSchema = z
  .object({
    label: DecisionLabelSchema,
    text: z.string().min(1),
    source_ids: z.array(z.string().min(1)),
    promotion_target: PromotionTargetTypeSchema,
  })
  .strict();

const PromotionTargetSchema = z
  .object({
    target_type: PromotionTargetTypeSchema,
    target_ref: z.string().min(1),
    change: z.string().min(1),
    verification: z.string().min(1),
  })
  .strict();

export const KrnResearchPackSchema = z
  .object({
    schema_version: z.literal("krn-research-pack.v1"),
    kind: z.literal("krn_research_pack"),
    run_id: z.string().min(1),
    created_at: z.string().min(1),
    target_root: z.string().min(1),
    command: z.string().min(1),
    status: ResearchPackStatusSchema,
    research_question: z.string().min(1),
    krn_decision: z.string().min(1),
    source_budget: SourceBudgetSchema,
    source_universe: z.array(SourceUniverseEntrySchema).min(1),
    sources: z.array(ResearchSourceSchema),
    mechanism_matrix: z.array(MechanismEntrySchema),
    contradictions: z.array(ContradictionEntrySchema),
    rejected_alternatives: z.array(RejectedAlternativeSchema),
    decision_candidates: z.array(DecisionCandidateSchema),
    promotion_targets: z.array(PromotionTargetSchema),
    next_action: z.string().min(1),
    runtime_report_path: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    evidence_refs: z.array(EvidenceRefSchema).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((pack, context) => {
    const sourceIds = new Set<string>();
    for (const [index, source] of pack.sources.entries()) {
      if (sourceIds.has(source.id)) {
        context.addIssue({
          code: "custom",
          path: ["sources", index, "id"],
          message: `duplicate source id ${source.id}`,
        });
      }
      sourceIds.add(source.id);
    }

    for (const [index, mechanism] of pack.mechanism_matrix.entries()) {
      for (const sourceId of mechanism.source_ids) {
        if (!sourceIds.has(sourceId)) {
          context.addIssue({
            code: "custom",
            path: ["mechanism_matrix", index, "source_ids"],
            message: `mechanism references missing source id ${sourceId}`,
          });
        }
      }
    }

    for (const [index, contradiction] of pack.contradictions.entries()) {
      for (const sourceId of contradiction.source_ids) {
        if (!sourceIds.has(sourceId)) {
          context.addIssue({
            code: "custom",
            path: ["contradictions", index, "source_ids"],
            message: `contradiction references missing source id ${sourceId}`,
          });
        }
      }
    }

    for (const [index, decision] of pack.decision_candidates.entries()) {
      for (const sourceId of decision.source_ids) {
        if (!sourceIds.has(sourceId)) {
          context.addIssue({
            code: "custom",
            path: ["decision_candidates", index, "source_ids"],
            message: `decision candidate references missing source id ${sourceId}`,
          });
        }
      }
    }

    if (pack.status === "scaffolded") {
      if (pack.sources.length > 0 || pack.mechanism_matrix.length > 0 || pack.decision_candidates.length > 0) {
        context.addIssue({
          code: "custom",
          path: ["status"],
          message: "scaffolded research packs must not contain completed sources, mechanisms, or decisions",
        });
      }
      return;
    }

    if (pack.sources.length < pack.source_budget.min_sources) {
      context.addIssue({
        code: "custom",
        path: ["sources"],
        message: `${pack.status} packs require at least ${pack.source_budget.min_sources} sources`,
      });
    }

    if (pack.source_budget.max_sources !== null && pack.sources.length > pack.source_budget.max_sources) {
      context.addIssue({
        code: "custom",
        path: ["sources"],
        message: `${pack.source_budget.mode} packs may not exceed ${pack.source_budget.max_sources} sources`,
      });
    }

    if (pack.mechanism_matrix.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["mechanism_matrix"],
        message: "non-scaffolded research packs require at least one extracted mechanism",
      });
    }

    if (pack.rejected_alternatives.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["rejected_alternatives"],
        message: "non-scaffolded research packs require at least one rejected alternative",
      });
    }

    if (pack.decision_candidates.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["decision_candidates"],
        message: "non-scaffolded research packs require decision candidates",
      });
    }
  });

export type KrnResearchPack = z.infer<typeof KrnResearchPackSchema>;
export type ResearchPackStatus = z.infer<typeof ResearchPackStatusSchema>;
export type SourceBudgetMode = z.infer<typeof SourceBudgetModeSchema>;

export function parseKrnResearchPack(input: unknown): KrnResearchPack {
  return KrnResearchPackSchema.parse(input);
}

export const krnResearchPackJsonSchema = z.toJSONSchema(KrnResearchPackSchema, {
  target: "draft-2020-12",
});

function sourceBudgetRange(mode: SourceBudgetMode): { min: number; max: number | null } {
  switch (mode) {
    case "quick":
      return { min: 5, max: 8 };
    case "standard":
      return { min: 10, max: 20 };
    case "deep":
      return { min: 20, max: null };
  }
}
