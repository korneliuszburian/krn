import { z } from "zod";

const SourceRefSchema = z.string().min(1);
const EvidenceRefSchema = z.string().min(1);
const ScoreSchema = z.number().min(0).max(1);
const DeltaSchema = z.number().min(-1).max(1);

const MeasurementModeSchema = z.enum(["fixture_contract", "score_artifacts", "live_codex_exec"]);
const LiftStatusSchema = z.enum(["positive_lift", "no_lift", "negative_lift", "no_lift_evidence"]);
const TaskStatusSchema = z.enum(["completed", "blocked", "failed"]);

const RepairTargetSchema = z
  .object({
    id: z.string().min(1),
    owner: z.string().min(1),
    next_action: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    failure_mode: z.string().min(1),
  })
  .strict();

const TaskRunSchema = z
  .object({
    label: z.string().min(1),
    score: ScoreSchema,
    evidence_refs: z.array(EvidenceRefSchema).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict();

const BenchmarkMetricSchema = z
  .object({
    metric_id: z.string().min(1),
    baseline_score: ScoreSchema,
    assisted_score: ScoreSchema,
    assisted_minus_baseline: DeltaSchema,
    weight: z.number().positive(),
    source_refs: z.array(SourceRefSchema).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict();

const BenchmarkTaskResultSchema = z
  .object({
    task_id: z.string().min(1),
    title: z.string().min(1),
    status: TaskStatusSchema,
    task_source_refs: z.array(SourceRefSchema).min(1),
    baseline: TaskRunSchema,
    assisted: TaskRunSchema,
    assisted_minus_baseline: DeltaSchema,
    metrics: z.array(BenchmarkMetricSchema).min(1),
    repair_targets: z.array(RepairTargetSchema),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((task, context) => {
    const expectedDelta = roundDelta(task.assisted.score - task.baseline.score);
    if (task.assisted_minus_baseline !== expectedDelta) {
      context.addIssue({
        code: "custom",
        path: ["assisted_minus_baseline"],
        message: `task delta must equal assisted.score - baseline.score (${expectedDelta})`,
      });
    }

    for (const [index, metric] of task.metrics.entries()) {
      const metricDelta = roundDelta(metric.assisted_score - metric.baseline_score);
      if (metric.assisted_minus_baseline !== metricDelta) {
        context.addIssue({
          code: "custom",
          path: ["metrics", index, "assisted_minus_baseline"],
          message: `metric delta must equal assisted_score - baseline_score (${metricDelta})`,
        });
      }
    }
  });

export const KrnBenchmarkReportSchema = z
  .object({
    schema_version: z.literal("krn-benchmark-report.v1"),
    kind: z.literal("krn_benchmark_report"),
    run_id: z.string().min(1),
    created_at: z.string().min(1),
    target_root: z.string().min(1),
    benchmark_id: z.string().min(1),
    suite_id: z.string().min(1),
    measurement_mode: MeasurementModeSchema,
    baseline_label: z.literal("baseline_codex"),
    assisted_label: z.literal("krn_assisted_codex"),
    minimum_task_count_for_lift_claim: z.number().int().positive(),
    productivity_lift_claimed: z.boolean(),
    lift_status: LiftStatusSchema,
    task_count: z.number().int().nonnegative(),
    completed_task_count: z.number().int().nonnegative(),
    blocked_task_count: z.number().int().nonnegative(),
    failed_task_count: z.number().int().nonnegative(),
    baseline_score: ScoreSchema,
    assisted_score: ScoreSchema,
    assisted_minus_baseline: DeltaSchema,
    tasks: z.array(BenchmarkTaskResultSchema).min(1),
    repair_targets: z.array(RepairTargetSchema),
    benchmark_report_path: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((report, context) => {
    if (report.task_count !== report.tasks.length) {
      context.addIssue({
        code: "custom",
        path: ["task_count"],
        message: "task_count must equal tasks.length",
      });
    }

    const completedTaskCount = report.tasks.filter((task) => task.status === "completed").length;
    const blockedTaskCount = report.tasks.filter((task) => task.status === "blocked").length;
    const failedTaskCount = report.tasks.filter((task) => task.status === "failed").length;
    if (report.completed_task_count !== completedTaskCount) {
      context.addIssue({
        code: "custom",
        path: ["completed_task_count"],
        message: "completed_task_count must match task statuses",
      });
    }
    if (report.blocked_task_count !== blockedTaskCount) {
      context.addIssue({
        code: "custom",
        path: ["blocked_task_count"],
        message: "blocked_task_count must match task statuses",
      });
    }
    if (report.failed_task_count !== failedTaskCount) {
      context.addIssue({
        code: "custom",
        path: ["failed_task_count"],
        message: "failed_task_count must match task statuses",
      });
    }

    const expectedBaselineScore = averageScore(report.tasks.map((task) => task.baseline.score));
    const expectedAssistedScore = averageScore(report.tasks.map((task) => task.assisted.score));
    const expectedDelta = roundDelta(expectedAssistedScore - expectedBaselineScore);

    if (report.baseline_score !== expectedBaselineScore) {
      context.addIssue({
        code: "custom",
        path: ["baseline_score"],
        message: `baseline_score must equal average task baseline score (${expectedBaselineScore})`,
      });
    }
    if (report.assisted_score !== expectedAssistedScore) {
      context.addIssue({
        code: "custom",
        path: ["assisted_score"],
        message: `assisted_score must equal average task assisted score (${expectedAssistedScore})`,
      });
    }
    if (report.assisted_minus_baseline !== expectedDelta) {
      context.addIssue({
        code: "custom",
        path: ["assisted_minus_baseline"],
        message: `assisted_minus_baseline must equal assisted_score - baseline_score (${expectedDelta})`,
      });
    }

    if (report.measurement_mode === "fixture_contract" && report.productivity_lift_claimed) {
      context.addIssue({
        code: "custom",
        path: ["productivity_lift_claimed"],
        message: "fixture_contract reports cannot claim productivity lift",
      });
    }

    if (report.measurement_mode === "fixture_contract" && report.lift_status !== "no_lift_evidence") {
      context.addIssue({
        code: "custom",
        path: ["lift_status"],
        message: "fixture_contract reports must use no_lift_evidence",
      });
    }

    const canHavePositiveLiftStatus =
      report.measurement_mode === "live_codex_exec" &&
      report.task_count >= report.minimum_task_count_for_lift_claim &&
      report.blocked_task_count === 0 &&
      report.failed_task_count === 0 &&
      report.assisted_minus_baseline > 0;

    if (report.lift_status === "positive_lift" && !canHavePositiveLiftStatus) {
      context.addIssue({
        code: "custom",
        path: ["lift_status"],
        message:
          "positive_lift requires live_codex_exec, enough tasks, no blocked/failed tasks, and positive delta",
      });
    }

    if (report.productivity_lift_claimed) {
      const canClaimLift = report.lift_status === "positive_lift" && canHavePositiveLiftStatus;

      if (!canClaimLift) {
        context.addIssue({
          code: "custom",
          path: ["productivity_lift_claimed"],
          message:
            "productivity_lift_claimed requires live_codex_exec, positive_lift, enough tasks, no blocked/failed tasks, and positive delta",
        });
      }
    }

    if (report.lift_status !== "positive_lift" && report.repair_targets.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["repair_targets"],
        message: "reports without positive lift must include repair targets",
      });
    }
  });

export type KrnBenchmarkReport = z.infer<typeof KrnBenchmarkReportSchema>;
export type BenchmarkMeasurementMode = z.infer<typeof MeasurementModeSchema>;
export type BenchmarkLiftStatus = z.infer<typeof LiftStatusSchema>;
export type BenchmarkTaskResult = z.infer<typeof BenchmarkTaskResultSchema>;
export type BenchmarkRepairTarget = z.infer<typeof RepairTargetSchema>;

export function parseKrnBenchmarkReport(input: unknown): KrnBenchmarkReport {
  return KrnBenchmarkReportSchema.parse(input);
}

export const krnBenchmarkReportJsonSchema = z.toJSONSchema(KrnBenchmarkReportSchema, {
  target: "draft-2020-12",
});

function roundDelta(value: number): number {
  return Number(value.toFixed(4));
}

function averageScore(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return roundDelta(values.reduce((sum, value) => sum + value, 0) / values.length);
}
