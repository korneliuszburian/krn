import { z } from "zod";

const SourceLineageSchema = z.array(z.string().min(1)).min(1);
const MemoryConfidenceSchema = z.enum(["low", "medium", "high"]);
const MemoryFreshnessSchema = z.enum(["fresh", "aging", "stale"]);
const MemoryStatusSchema = z.enum(["active", "stale", "quarantined", "deprecated"]);
const MemoryScopeSchema = z.enum(["project", "cross_project", "user", "team"]);
const PrivacyLevelSchema = z.enum(["local", "team", "private"]);
const MemoryOutcomeSchema = z.enum(["pending_review", "used", "ignored", "harmful", "missed", "stale", "blocked_bad_action"]);

const MemorySelectorsSchema = z
  .object({
    task_kinds: z.array(z.enum(["review", "implementation", "repair", "planning", "source_refresh"])).min(1),
    failure_modes: z.array(z.string().min(1)).min(1),
    target_globs: z.array(z.string().min(1)),
    goal_refs: z.array(z.string().min(1)),
  })
  .strict();

export const KrnMemoryRecordSchema = z
  .object({
    schema_version: z.literal("krn-memory-record.v1"),
    kind: z.literal("krn_memory_record"),
    id: z.string().min(1),
    status: MemoryStatusSchema,
    scope: MemoryScopeSchema,
    owner: z.string().min(1),
    source_lineage: SourceLineageSchema,
    confidence: MemoryConfidenceSchema,
    freshness: MemoryFreshnessSchema,
    kernel_terms: z.array(z.string().min(1)).min(1),
    ttl_days: z.number().int().positive().nullable(),
    last_verified_at: z.string().min(1),
    last_used_at: z.string().min(1).nullable(),
    selectors: MemorySelectorsSchema,
    summary: z.string().min(1),
    action_rule: z.string().min(1),
    invalidation_rule: z.string().min(1),
    privacy_level: PrivacyLevelSchema,
  })
  .strict();

const SelectedMemoryRefSchema = z
  .object({
    memory_id: z.string().min(1),
    reason: z.string().min(1),
    confidence: MemoryConfidenceSchema,
    source_lineage: SourceLineageSchema,
    expected_use: z.string().min(1),
  })
  .strict();

const RejectedMemoryRefSchema = z
  .object({
    memory_id: z.string().min(1),
    reason: z.string().min(1),
  })
  .strict();

const RejectedContextRefSchema = z
  .object({
    ref: z.string().min(1),
    reason: z.string().min(1),
  })
  .strict();

export const KrnMemorySelectionSchema = z
  .object({
    schema_version: z.literal("krn-memory-selection.v1"),
    kind: z.literal("krn_memory_selection"),
    run_id: z.string().min(1),
    created_at: z.string().min(1),
    target_root: z.string().min(1),
    task_intent: z.string().min(1),
    task_kind: z.enum(["review", "implementation", "repair", "planning", "source_refresh"]),
    store_ref: z.string().min(1),
    selected: z.array(SelectedMemoryRefSchema).min(1).max(5),
    rejected: z.array(RejectedMemoryRefSchema),
    rejected_context: z.array(RejectedContextRefSchema).min(1),
    retrieval_budget: z
      .object({
        max_selected: z.number().int().positive().max(5),
        selection_policy: z.string().min(1),
      })
      .strict(),
    overclaim_boundary: z.string().min(1),
  })
  .strict();

export const KrnMemoryApplicationSchema = z
  .object({
    schema_version: z.literal("krn-memory-application.v1"),
    kind: z.literal("krn_memory_application"),
    run_id: z.string().min(1),
    created_at: z.string().min(1),
    target_root: z.string().min(1),
    surface: z.enum(["krn_review", "krn_brief", "krn_context"]),
    selection_run_id: z.string().min(1),
    applied_memory_ids: z.array(z.string().min(1)).min(1).max(5),
    blockers: z.array(z.string().min(1)).min(1),
    required_checks: z.array(z.string().min(1)).min(1),
    review_questions: z.array(z.string().min(1)).min(1),
    blocked_bad_actions: z.array(z.string().min(1)).min(1),
    next_action: z.string().min(1),
    overclaim_boundary: z.string().min(1),
  })
  .strict();

const MemoryFeedbackOutcomeSchema = z
  .object({
    memory_id: z.string().min(1),
    outcome: MemoryOutcomeSchema,
    reason: z.string().min(1),
  })
  .strict();

export const KrnMemoryFeedbackSchema = z
  .object({
    schema_version: z.literal("krn-memory-feedback.v1"),
    kind: z.literal("krn_memory_feedback"),
    run_id: z.string().min(1),
    created_at: z.string().min(1),
    target_root: z.string().min(1),
    selection_run_id: z.string().min(1),
    application_run_id: z.string().min(1),
    feedback_sink_ref: z.string().min(1),
    overall_outcome: MemoryOutcomeSchema,
    memory_outcomes: z.array(MemoryFeedbackOutcomeSchema).min(1).max(5),
    notes: z.string().min(1),
  })
  .strict();

export const KrnMemoryRetrievalPolicySchema = z
  .object({
    max_selected: z.number().int().positive().max(5),
    selection_policy: z.string().min(1),
    rejected_context: z.array(RejectedContextRefSchema).min(1),
  })
  .strict();

export const KrnLocalMemoryStoreSchema = z
  .object({
    schema_version: z.literal("krn-local-memory-store.v1"),
    policy: KrnMemoryRetrievalPolicySchema,
    records: z.array(KrnMemoryRecordSchema).min(1),
    feedback: z.array(KrnMemoryFeedbackSchema),
  })
  .strict();

export type KrnMemoryRecord = z.infer<typeof KrnMemoryRecordSchema>;
export type KrnMemorySelection = z.infer<typeof KrnMemorySelectionSchema>;
export type KrnMemoryApplication = z.infer<typeof KrnMemoryApplicationSchema>;
export type KrnMemoryFeedback = z.infer<typeof KrnMemoryFeedbackSchema>;
export type KrnMemoryRetrievalPolicy = z.infer<typeof KrnMemoryRetrievalPolicySchema>;
export type KrnLocalMemoryStore = z.infer<typeof KrnLocalMemoryStoreSchema>;
export type MemoryConfidence = z.infer<typeof MemoryConfidenceSchema>;
export type MemoryOutcome = z.infer<typeof MemoryOutcomeSchema>;

export function parseKrnMemoryRecord(input: unknown): KrnMemoryRecord {
  return KrnMemoryRecordSchema.parse(input);
}

export function parseKrnMemorySelection(input: unknown): KrnMemorySelection {
  return KrnMemorySelectionSchema.parse(input);
}

export function parseKrnMemoryApplication(input: unknown): KrnMemoryApplication {
  return KrnMemoryApplicationSchema.parse(input);
}

export function parseKrnMemoryFeedback(input: unknown): KrnMemoryFeedback {
  return KrnMemoryFeedbackSchema.parse(input);
}

export function parseKrnLocalMemoryStore(input: unknown): KrnLocalMemoryStore {
  return KrnLocalMemoryStoreSchema.parse(input);
}

export const krnMemoryRecordJsonSchema = z.toJSONSchema(KrnMemoryRecordSchema, {
  target: "draft-2020-12",
});

export const krnMemorySelectionJsonSchema = z.toJSONSchema(KrnMemorySelectionSchema, {
  target: "draft-2020-12",
});

export const krnMemoryApplicationJsonSchema = z.toJSONSchema(KrnMemoryApplicationSchema, {
  target: "draft-2020-12",
});

export const krnMemoryFeedbackJsonSchema = z.toJSONSchema(KrnMemoryFeedbackSchema, {
  target: "draft-2020-12",
});

export const krnLocalMemoryStoreJsonSchema = z.toJSONSchema(KrnLocalMemoryStoreSchema, {
  target: "draft-2020-12",
});
