import { z } from "zod";

const SourceRefSchema = z.string().min(1);
const EvidenceRefSchema = z.string().min(1);
const ScoreSchema = z.number().min(0).max(1);
const DeltaSchema = z.number().min(-1).max(1);

const BenchmarkReportsStateSchema = z.enum(["ready", "empty", "blocked"]);
const BenchmarkReportsSourceSchema = z.enum([
  "benchmark_report_store",
  "missing_benchmark_reports",
  "invalid_benchmark_reports",
]);
const BenchmarkReportsTargetSurfaceSchema = z.enum([
  "benchmark_reports",
  "benchmark_suite",
  "repair_targets",
  "source_refs",
]);
const BenchmarkMeasurementModeSchema = z.enum(["fixture_contract", "score_artifacts", "live_codex_exec"]);
const BenchmarkLiftStatusSchema = z.enum(["positive_lift", "no_lift", "negative_lift", "no_lift_evidence"]);

const BenchmarkReportsMetricSourceSchema = z
  .object({
    owner: z.literal("krn"),
    source_refs: z.array(SourceRefSchema).min(1),
    next_action: z.string().min(1),
    failure_mode: z.string().min(1),
  })
  .strict();

const BenchmarkReportsRepairTargetSchema = z
  .object({
    id: z.string().min(1),
    owner: z.string().min(1),
    next_action: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    failure_mode: z.string().min(1),
  })
  .strict();

const BenchmarkReportRowSchema = BenchmarkReportsMetricSourceSchema.extend({
  report_path: z.string().min(1),
  run_id: z.string().min(1),
  created_at: z.string().min(1),
  benchmark_id: z.string().min(1),
  suite_id: z.string().min(1),
  measurement_mode: BenchmarkMeasurementModeSchema,
  lift_status: BenchmarkLiftStatusSchema,
  productivity_lift_claimed: z.boolean(),
  minimum_task_count_for_lift_claim: z.number().int().positive(),
  task_count: z.number().int().nonnegative(),
  completed_task_count: z.number().int().nonnegative(),
  blocked_task_count: z.number().int().nonnegative(),
  failed_task_count: z.number().int().nonnegative(),
  baseline_score: ScoreSchema,
  assisted_score: ScoreSchema,
  assisted_minus_baseline: DeltaSchema,
  repair_targets: z.array(BenchmarkReportsRepairTargetSchema),
  evidence_refs: z.array(EvidenceRefSchema).min(1),
  interpretation_caveat: z.string().min(1),
}).strict();

const BenchmarkReportsInvalidRecordSchema = z
  .object({
    report_path: z.string().min(1),
    error_summary: z.string().min(1),
  })
  .strict();

const BenchmarkReportsNextActionSchema = z
  .object({
    action_id: z.string().min(1),
    target_surface: BenchmarkReportsTargetSurfaceSchema,
    label: z.string().min(1),
    rationale: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

export const KrnBenchmarkReportsViewModelSchema = z
  .object({
    schema_version: z.literal("krn-benchmark-reports-view-model.v1"),
    kind: z.literal("krn_benchmark_reports_view_model"),
    target_root: z.string().min(1),
    generated_at: z.string().min(1),
    no_mock_state: z.literal(true),
    source: BenchmarkReportsSourceSchema,
    queue_state: BenchmarkReportsStateSchema,
    total_records: z.number().int().nonnegative(),
    valid_reports: z.number().int().nonnegative(),
    invalid_records_count: z.number().int().nonnegative(),
    live_codex_exec_reports: z.number().int().nonnegative(),
    no_lift_reports: z.number().int().nonnegative(),
    negative_delta_reports: z.number().int().nonnegative(),
    productivity_lift_claimed_reports: z.number().int().nonnegative(),
    latest_report_path: z.string().min(1).nullable(),
    reports: z.array(BenchmarkReportRowSchema),
    invalid_records: z.array(BenchmarkReportsInvalidRecordSchema),
    dashboard_commands_enabled: z.literal(false),
    next_allowed_action: BenchmarkReportsNextActionSchema,
    blocked_actions: z.array(z.string().min(1)).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    failure_mode: z.string().min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((viewModel, context) => {
    if (viewModel.valid_reports !== viewModel.reports.length) {
      context.addIssue({
        code: "custom",
        path: ["valid_reports"],
        message: "valid_reports must match reports.length",
      });
    }

    if (viewModel.invalid_records_count !== viewModel.invalid_records.length) {
      context.addIssue({
        code: "custom",
        path: ["invalid_records_count"],
        message: "invalid_records_count must match invalid_records.length",
      });
    }

    if (viewModel.total_records !== viewModel.valid_reports + viewModel.invalid_records_count) {
      context.addIssue({
        code: "custom",
        path: ["total_records"],
        message: "total_records must equal valid_reports + invalid_records_count",
      });
    }

    if (viewModel.source === "missing_benchmark_reports" && viewModel.total_records !== 0) {
      context.addIssue({
        code: "custom",
        path: ["source"],
        message: "missing_benchmark_reports requires total_records to be zero",
      });
    }

    if (viewModel.queue_state === "empty" && viewModel.total_records !== 0) {
      context.addIssue({
        code: "custom",
        path: ["queue_state"],
        message: "empty queue_state requires zero benchmark records",
      });
    }

    if (viewModel.queue_state === "ready" && viewModel.invalid_records_count > 0) {
      context.addIssue({
        code: "custom",
        path: ["invalid_records_count"],
        message: "ready queue_state cannot include invalid benchmark records",
      });
    }

    if (viewModel.reports.length > 0 && !viewModel.latest_report_path) {
      context.addIssue({
        code: "custom",
        path: ["latest_report_path"],
        message: "benchmark report rows require latest_report_path",
      });
    }
  });

export type BenchmarkReportsInvalidRecord = z.infer<typeof BenchmarkReportsInvalidRecordSchema>;
export type BenchmarkReportsNextAction = z.infer<typeof BenchmarkReportsNextActionSchema>;
export type BenchmarkReportRow = z.infer<typeof BenchmarkReportRowSchema>;
export type KrnBenchmarkReportsViewModel = z.infer<typeof KrnBenchmarkReportsViewModelSchema>;

export function parseKrnBenchmarkReportsViewModel(input: unknown): KrnBenchmarkReportsViewModel {
  return KrnBenchmarkReportsViewModelSchema.parse(input);
}

export const krnBenchmarkReportsViewModelJsonSchema = z.toJSONSchema(KrnBenchmarkReportsViewModelSchema, {
  target: "draft-2020-12",
});
