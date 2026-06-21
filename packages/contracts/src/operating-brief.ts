import { z } from "zod";
import { KrnMemoryApplicationSchema, KrnMemoryFeedbackSchema, KrnMemorySelectionSchema } from "./memory-store.js";

const BriefSelectedContextSchema = z
  .object({
    ref: z.string().min(1),
    reason: z.string().min(1),
    confidence: z.enum(["low", "medium", "high"]),
    source_lineage: z.array(z.string().min(1)).min(1),
  })
  .strict();

const BriefRejectedContextSchema = z
  .object({
    ref: z.string().min(1),
    reason: z.string().min(1),
  })
  .strict();

const BriefSkillSchema = z
  .object({
    name: z.string().min(1),
    reason: z.string().min(1),
  })
  .strict();

const BriefVerificationSchema = z
  .object({
    command: z.string().min(1),
    artifact: z.string().min(1),
  })
  .strict();

export const KrnOperatingBriefSchema = z
  .object({
    schema_version: z.literal("krn-operating-brief.v1"),
    kind: z.literal("krn_operating_brief"),
    run_id: z.string().min(1),
    created_at: z.string().min(1),
    target_root: z.string().min(1),
    command: z.literal("krn brief"),
    task_intent: z.string().min(1),
    target_path: z.string().min(1).nullable(),
    selected_context: z.array(BriefSelectedContextSchema).min(1).max(5),
    rejected_context: z.array(BriefRejectedContextSchema).min(1),
    applied_kernel_terms: z.array(z.string().min(1)).min(1),
    required_skills: z.array(BriefSkillSchema),
    memory_selection: KrnMemorySelectionSchema,
    memory_application: KrnMemoryApplicationSchema,
    memory_feedback: KrnMemoryFeedbackSchema,
    next_action: z.string().min(1),
    verification: BriefVerificationSchema,
    runtime_report_path: z.string().min(1),
    source_refs: z.array(z.string().min(1)).min(1),
    overclaim_boundary: z.string().min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((brief, ctx) => {
    const selectedMemoryIds = new Set(brief.memory_selection.selected.map((selected) => selected.memory_id));
    for (const context of brief.selected_context) {
      const memoryId = context.ref.replace(/^memory:/, "");
      if (!selectedMemoryIds.has(memoryId)) {
        ctx.addIssue({
          code: "custom",
          path: ["selected_context"],
          message: `selected_context ref ${context.ref} is not backed by memory_selection.selected`,
        });
      }
    }

    const selectedSourceRefs = new Set(brief.selected_context.flatMap((context) => context.source_lineage));
    const sourceRefs = new Set(brief.source_refs);
    for (const sourceRef of brief.source_refs) {
      if (!selectedSourceRefs.has(sourceRef)) {
        ctx.addIssue({
          code: "custom",
          path: ["source_refs"],
          message: `source_refs entry ${sourceRef} is not backed by selected_context.source_lineage`,
        });
      }
    }
    for (const selectedSourceRef of selectedSourceRefs) {
      if (!sourceRefs.has(selectedSourceRef)) {
        ctx.addIssue({
          code: "custom",
          path: ["source_refs"],
          message: `selected_context.source_lineage entry ${selectedSourceRef} is missing from source_refs`,
        });
      }
    }

    if (brief.memory_application.applied_memory_ids.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["memory_application", "applied_memory_ids"],
        message: "selected memory without application guidance is not allowed",
      });
    }
  });

export type KrnOperatingBrief = z.infer<typeof KrnOperatingBriefSchema>;

export function parseKrnOperatingBrief(input: unknown): KrnOperatingBrief {
  return KrnOperatingBriefSchema.parse(input);
}

export const krnOperatingBriefJsonSchema = z.toJSONSchema(KrnOperatingBriefSchema, {
  target: "draft-2020-12",
});
