import { z } from "zod";
import { KrnMemoryApplicationSchema, KrnMemoryFeedbackSchema, KrnMemorySelectionSchema } from "./memory-store.js";

const ContextRefSchema = z
  .object({
    ref: z.string().min(1),
    reason: z.string().min(1),
    confidence: z.enum(["low", "medium", "high"]),
    source_lineage: z.array(z.string().min(1)).min(1),
  })
  .strict();

const RejectedContextSchema = z
  .object({
    ref: z.string().min(1),
    reason: z.string().min(1),
  })
  .strict();

const ContextSectionSchema = z
  .object({
    id: z.enum(["task", "memory", "policy", "verification"]),
    refs: z.array(z.string().min(1)).min(1),
    summary: z.string().min(1),
  })
  .strict();

const RequiredSkillSchema = z
  .object({
    name: z.string().min(1),
    reason: z.string().min(1),
  })
  .strict();

const VerificationSchema = z
  .object({
    command: z.string().min(1),
    artifact: z.string().min(1),
  })
  .strict();

function isBroadContextDumpRef(ref: string): boolean {
  const normalized = ref.toLowerCase();
  return (
    normalized.includes("*") ||
    normalized.includes(" full scan") ||
    /\bgoal-\d+\.md\.\.goal-\d+\.md\b/.test(normalized)
  );
}

export const KrnContextPacketSchema = z
  .object({
    schema_version: z.literal("krn-context-packet.v1"),
    kind: z.literal("krn_context_packet"),
    run_id: z.string().min(1),
    created_at: z.string().min(1),
    target_root: z.string().min(1),
    command: z.literal("krn context build"),
    task_intent: z.string().min(1),
    target_path: z.string().min(1).nullable(),
    context_budget: z
      .object({
        max_selected_context: z.number().int().positive().max(5),
        selected_context_count: z.number().int().nonnegative().max(5),
        rejected_context_count: z.number().int().positive(),
        policy: z.string().min(1),
      })
      .strict(),
    selected_context: z.array(ContextRefSchema).min(1).max(5),
    rejected_context: z.array(RejectedContextSchema).min(1),
    context_sections: z.array(ContextSectionSchema).min(4).max(4),
    required_skills: z.array(RequiredSkillSchema),
    blocked_actions: z.array(z.string().min(1)).min(1),
    memory_selection: KrnMemorySelectionSchema,
    memory_application: KrnMemoryApplicationSchema,
    memory_feedback: KrnMemoryFeedbackSchema,
    next_action: z.string().min(1),
    verification: VerificationSchema,
    runtime_report_path: z.string().min(1),
    source_refs: z.array(z.string().min(1)).min(1),
    overclaim_boundary: z.string().min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((packet, ctx) => {
    const selectedMemoryIds = new Set(packet.memory_selection.selected.map((selected) => selected.memory_id));
    for (const context of packet.selected_context) {
      if (isBroadContextDumpRef(context.ref)) {
        ctx.addIssue({
          code: "custom",
          path: ["selected_context"],
          message: `context packet selected a broad context dump: ${context.ref}`,
        });
      }

      const memoryId = context.ref.replace(/^memory:/, "");
      if (!selectedMemoryIds.has(memoryId)) {
        ctx.addIssue({
          code: "custom",
          path: ["selected_context"],
          message: `selected_context ref ${context.ref} is not backed by memory_selection.selected`,
        });
      }
    }

    if (packet.context_budget.selected_context_count !== packet.selected_context.length) {
      ctx.addIssue({
        code: "custom",
        path: ["context_budget", "selected_context_count"],
        message: "selected_context_count must match selected_context length",
      });
    }

    if (packet.memory_application.surface !== "krn_context") {
      ctx.addIssue({
        code: "custom",
        path: ["memory_application", "surface"],
        message: "context packets must apply memory through krn_context",
      });
    }

    const appliedMemoryIds = new Set(packet.memory_application.applied_memory_ids);
    for (const memoryId of selectedMemoryIds) {
      if (!appliedMemoryIds.has(memoryId)) {
        ctx.addIssue({
          code: "custom",
          path: ["memory_application", "applied_memory_ids"],
          message: `selected memory ${memoryId} must have application guidance`,
        });
      }
    }
  });

export type KrnContextPacket = z.infer<typeof KrnContextPacketSchema>;

export function parseKrnContextPacket(input: unknown): KrnContextPacket {
  return KrnContextPacketSchema.parse(input);
}

export const krnContextPacketJsonSchema = z.toJSONSchema(KrnContextPacketSchema, {
  target: "draft-2020-12",
});
