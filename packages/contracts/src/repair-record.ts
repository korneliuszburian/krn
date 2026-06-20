import { z } from "zod";

const SourceRefSchema = z.string().min(1);
const EvidenceRefSchema = z.string().min(1);
const MetricValueSchema = z.number().nullable();

const RepairFailureSourceTypeSchema = z.enum([
  "benchmark_report",
  "eval_report",
  "review_comment",
  "trace",
  "source_conflict",
]);

const RepairClassificationSchema = z.enum([
  "benchmark_no_lift",
  "missing_requirement",
  "unreliable_instruction_following",
  "implementation_defect",
  "observability_defect",
  "stale_or_conflicting_memory",
]);

const RepairSurfaceSchema = z.enum([
  "prompt",
  "skill",
  "memory",
  "canonical_docs",
  "hook",
  "mcp_schema",
  "eval",
  "code",
  "benchmark_suite",
  "dashboard",
  "runtime_contract",
]);

const RepairChangedSurfaceSchema = z.enum([...RepairSurfaceSchema.options, "none"]);

const RepairStatusSchema = z.enum(["proposed", "in_progress", "validated", "stopped", "blocked"]);
const ValidatorStatusSchema = z.enum(["not_run", "passed", "failed", "blocked"]);
const ExpectedMetricDirectionSchema = z.enum(["increase", "decrease", "pass", "stable"]);
const RepairBlockedSurfaceSchema = z.enum([
  "productivity_lift_claim",
  "prompt_tuning_without_repair_record",
  "default_live_eval",
  "dashboard_auto_repair",
  "mcp_mutating_repair_tool",
  "memory_promotion_without_review",
]);

const RepairStopReasonSchema = z.enum([
  "record_created",
  "pass",
  "max_attempts",
  "no_meaningful_delta",
  "human_input_required",
  "scope_violation",
  "blocked",
]);

const RepairFailureSourceSchema = z
  .object({
    source_type: RepairFailureSourceTypeSchema,
    source_ref: z.string().min(1),
    summary: z.string().min(1),
    evidence_refs: z.array(EvidenceRefSchema).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    observed_metric_id: z.string().min(1),
    observed_metric_value: MetricValueSchema,
    expected_metric_direction: ExpectedMetricDirectionSchema,
  })
  .strict();

const RepairAttemptSchema = z
  .object({
    attempt_id: z.string().min(1),
    sequence: z.number().int().positive(),
    attempted_change: z.string().min(1),
    changed_surfaces: z.array(RepairChangedSurfaceSchema).min(1),
    validator_command: z.string().min(1),
    validator_report_path: z.string().min(1).nullable(),
    validator_status: ValidatorStatusSchema,
    metric_before: MetricValueSchema,
    metric_after: MetricValueSchema,
    metric_delta: MetricValueSchema,
    stop_reason: RepairStopReasonSchema,
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((attempt, context) => {
    if (attempt.validator_status === "passed" && attempt.validator_report_path === null) {
      context.addIssue({
        code: "custom",
        path: ["validator_report_path"],
        message: "passed validator attempts must include a validator_report_path",
      });
    }

    if (attempt.metric_before === null || attempt.metric_after === null) {
      if (attempt.metric_delta !== null) {
        context.addIssue({
          code: "custom",
          path: ["metric_delta"],
          message: "metric_delta must be null when metric_before or metric_after is null",
        });
      }
      return;
    }

    const expectedDelta = roundMetric(attempt.metric_after - attempt.metric_before);
    if (attempt.metric_delta !== expectedDelta) {
      context.addIssue({
        code: "custom",
        path: ["metric_delta"],
        message: `metric_delta must equal metric_after - metric_before (${expectedDelta})`,
      });
    }
  });

export const KrnRepairRecordSchema = z
  .object({
    schema_version: z.literal("krn-repair-record.v1"),
    kind: z.literal("krn_repair_record"),
    repair_id: z.string().min(1),
    created_at: z.string().min(1),
    owner: z.string().min(1),
    status: RepairStatusSchema,
    failure_source: RepairFailureSourceSchema,
    classification: RepairClassificationSchema,
    repair_surface: RepairSurfaceSchema,
    proposed_repair: z.string().min(1),
    next_action: z.string().min(1),
    attempts: z.array(RepairAttemptSchema).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    evidence_refs: z.array(EvidenceRefSchema).min(1),
    blocked_surfaces: z.array(RepairBlockedSurfaceSchema).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    const attemptIds = new Set<string>();
    const attemptSequences = new Set<number>();
    for (const [index, attempt] of record.attempts.entries()) {
      if (attemptIds.has(attempt.attempt_id)) {
        context.addIssue({
          code: "custom",
          path: ["attempts", index, "attempt_id"],
          message: `duplicate attempt_id ${attempt.attempt_id}`,
        });
      }
      attemptIds.add(attempt.attempt_id);

      if (attemptSequences.has(attempt.sequence)) {
        context.addIssue({
          code: "custom",
          path: ["attempts", index, "sequence"],
          message: `duplicate attempt sequence ${attempt.sequence}`,
        });
      }
      attemptSequences.add(attempt.sequence);
    }

    if (record.classification === "benchmark_no_lift") {
      if (record.failure_source.source_type !== "benchmark_report") {
        context.addIssue({
          code: "custom",
          path: ["failure_source", "source_type"],
          message: "benchmark_no_lift repairs must originate from a benchmark_report",
        });
      }
      if (record.failure_source.expected_metric_direction !== "increase") {
        context.addIssue({
          code: "custom",
          path: ["failure_source", "expected_metric_direction"],
          message: "benchmark_no_lift repairs must expect an increasing metric",
        });
      }
      if (
        record.failure_source.observed_metric_value === null ||
        record.failure_source.observed_metric_value > 0
      ) {
        context.addIssue({
          code: "custom",
          path: ["failure_source", "observed_metric_value"],
          message: "benchmark_no_lift repairs require a zero or negative observed metric value",
        });
      }
      if (!record.blocked_surfaces.includes("productivity_lift_claim")) {
        context.addIssue({
          code: "custom",
          path: ["blocked_surfaces"],
          message: "benchmark_no_lift repairs must block productivity_lift_claim",
        });
      }
    }

    if (record.status === "validated") {
      const lastAttempt = record.attempts.at(-1);
      const hasValidatedAttempt =
        lastAttempt?.validator_status === "passed" &&
        lastAttempt.stop_reason === "pass" &&
        lastAttempt.metric_after !== null &&
        lastAttempt.metric_delta !== null;

      if (!hasValidatedAttempt) {
        context.addIssue({
          code: "custom",
          path: ["attempts"],
          message:
            "validated repair records require a final passed validator attempt with metric_after, metric_delta, and stop_reason pass",
        });
      }
    }
  });

export type KrnRepairRecord = z.infer<typeof KrnRepairRecordSchema>;
export type RepairFailureSourceType = z.infer<typeof RepairFailureSourceTypeSchema>;
export type RepairClassification = z.infer<typeof RepairClassificationSchema>;
export type RepairSurface = z.infer<typeof RepairSurfaceSchema>;
export type RepairStatus = z.infer<typeof RepairStatusSchema>;
export type RepairAttempt = z.infer<typeof RepairAttemptSchema>;

export function parseKrnRepairRecord(input: unknown): KrnRepairRecord {
  return KrnRepairRecordSchema.parse(input);
}

export const krnRepairRecordJsonSchema = z.toJSONSchema(KrnRepairRecordSchema, {
  target: "draft-2020-12",
});

function roundMetric(value: number): number {
  return Number(value.toFixed(4));
}
