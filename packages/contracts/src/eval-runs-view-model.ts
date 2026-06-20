import { z } from "zod";

const SourceRefSchema = z.string().min(1);

const EvalRunsStateSchema = z.enum(["ready", "empty", "blocked"]);
const EvalRunsSourceSchema = z.enum(["eval_report", "missing_eval_report", "invalid_eval_report"]);
const EvalReportStatusSchema = z.enum(["passed", "failed", "error", "missing", "invalid"]);
const EvalModuleStatusSchema = z.enum(["passed", "failed", "error"]);
const EvalRunsTargetSurfaceSchema = z.enum(["eval_reports", "eval_modules", "repair_loop", "benchmark"]);

const EvalRunsMetricSourceSchema = z
  .object({
    owner: z.literal("krn"),
    source_refs: z.array(SourceRefSchema).min(1),
    next_action: z.string().min(1),
    failure_mode: z.string().min(1),
  })
  .strict();

const EvalRunModuleSchema = EvalRunsMetricSourceSchema.extend({
  module_id: z.string().min(1),
  command: z.array(z.string().min(1)).min(1),
  status: EvalModuleStatusSchema,
  report_path: z.string().min(1).nullable(),
  total_cases: z.number().int().nonnegative(),
  passed_cases: z.number().int().nonnegative(),
  failed_cases: z.number().int().nonnegative(),
  case_pass_rate: z.number().min(0).max(1),
  total_assertions: z.number().int().nonnegative(),
  passed_assertions: z.number().int().nonnegative(),
  failed_assertions: z.number().int().nonnegative(),
  assertion_pass_rate: z.number().min(0).max(1),
  interpretation_caveat: z.string().min(1),
}).strict();

const EvalRunsInvalidReportSchema = z
  .object({
    report_path: z.string().min(1),
    error_summary: z.string().min(1),
  })
  .strict();

const EvalRunsNextActionSchema = z
  .object({
    action_id: z.string().min(1),
    target_surface: EvalRunsTargetSurfaceSchema,
    label: z.string().min(1),
    rationale: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

export const KrnEvalRunsViewModelSchema = z
  .object({
    schema_version: z.literal("krn-eval-runs-view-model.v1"),
    kind: z.literal("krn_eval_runs_view_model"),
    target_root: z.string().min(1),
    generated_at: z.string().min(1),
    no_mock_state: z.literal(true),
    source: EvalRunsSourceSchema,
    eval_state: EvalRunsStateSchema,
    latest_report_path: z.string().min(1).nullable(),
    latest_run_id: z.string().min(1).nullable(),
    latest_created_at: z.string().min(1).nullable(),
    eval_report_status: EvalReportStatusSchema,
    total_modules: z.number().int().nonnegative(),
    passed_modules: z.number().int().nonnegative(),
    failed_modules: z.number().int().nonnegative(),
    total_cases: z.number().int().nonnegative(),
    passed_cases: z.number().int().nonnegative(),
    failed_cases: z.number().int().nonnegative(),
    total_assertions: z.number().int().nonnegative(),
    passed_assertions: z.number().int().nonnegative(),
    failed_assertions: z.number().int().nonnegative(),
    modules: z.array(EvalRunModuleSchema),
    invalid_report: EvalRunsInvalidReportSchema.nullable(),
    productivity_lift_claimed: z.literal(false),
    dashboard_commands_enabled: z.literal(false),
    benchmark_lift_status: z.literal("not_measured"),
    next_allowed_action: EvalRunsNextActionSchema,
    blocked_actions: z.array(z.string().min(1)).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    failure_mode: z.string().min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((viewModel, context) => {
    if (viewModel.source === "eval_report") {
      if (!viewModel.latest_report_path) {
        context.addIssue({
          code: "custom",
          path: ["latest_report_path"],
          message: "eval_report source requires latest_report_path",
        });
      }
      if (!viewModel.latest_run_id) {
        context.addIssue({
          code: "custom",
          path: ["latest_run_id"],
          message: "eval_report source requires latest_run_id",
        });
      }
      if (!viewModel.latest_created_at) {
        context.addIssue({
          code: "custom",
          path: ["latest_created_at"],
          message: "eval_report source requires latest_created_at",
        });
      }
      if (viewModel.modules.length !== viewModel.total_modules) {
        context.addIssue({
          code: "custom",
          path: ["modules"],
          message: "modules length must match total_modules",
        });
      }
    }

    if (viewModel.source !== "eval_report" && viewModel.modules.length > 0) {
      context.addIssue({
        code: "custom",
        path: ["modules"],
        message: "missing or invalid eval sources must not expose module rows",
      });
    }

    if (viewModel.source === "invalid_eval_report" && !viewModel.invalid_report) {
      context.addIssue({
        code: "custom",
        path: ["invalid_report"],
        message: "invalid_eval_report source requires invalid_report details",
      });
    }

    if (viewModel.eval_state === "ready" && viewModel.eval_report_status !== "passed") {
      context.addIssue({
        code: "custom",
        path: ["eval_report_status"],
        message: "ready eval state requires a passed eval report",
      });
    }

    if (viewModel.eval_report_status === "passed" && viewModel.failed_modules > 0) {
      context.addIssue({
        code: "custom",
        path: ["failed_modules"],
        message: "passed eval report cannot have failed modules",
      });
    }
  });

export type EvalRunModule = z.infer<typeof EvalRunModuleSchema>;
export type EvalRunsInvalidReport = z.infer<typeof EvalRunsInvalidReportSchema>;
export type EvalRunsNextAction = z.infer<typeof EvalRunsNextActionSchema>;
export type KrnEvalRunsViewModel = z.infer<typeof KrnEvalRunsViewModelSchema>;

export function parseKrnEvalRunsViewModel(input: unknown): KrnEvalRunsViewModel {
  return KrnEvalRunsViewModelSchema.parse(input);
}

export const krnEvalRunsViewModelJsonSchema = z.toJSONSchema(KrnEvalRunsViewModelSchema, {
  target: "draft-2020-12",
});
