import { z } from "zod";

const SourceRefSchema = z.string().min(1);

const EvalModuleStatusSchema = z.enum(["passed", "failed", "error"]);
const EvalLaneSchema = z.enum(["core", "current", "lab"]);
const EvalLaneSelectionSchema = z.enum(["core", "current", "lab", "all", "custom"]);

const EvalModuleResultSchema = z
  .object({
    module_id: z.string().min(1),
    lane: EvalLaneSchema,
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
    source_refs: z.array(SourceRefSchema).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict();

const EvalSummarySchema = z
  .object({
    total_modules: z.number().int().nonnegative(),
    passed_modules: z.number().int().nonnegative(),
    failed_modules: z.number().int().nonnegative(),
    total_cases: z.number().int().nonnegative(),
    passed_cases: z.number().int().nonnegative(),
    failed_cases: z.number().int().nonnegative(),
    total_assertions: z.number().int().nonnegative(),
    passed_assertions: z.number().int().nonnegative(),
    failed_assertions: z.number().int().nonnegative(),
  })
  .strict();

const EvalLaneSelectionMetadataSchema = z
  .object({
    requested_lane: EvalLaneSelectionSchema,
    default_lane: z.literal("current"),
    included_lanes: z.array(EvalLaneSchema).min(1),
    excluded_lanes: z.array(EvalLaneSchema),
    module_filter: z.array(z.string().min(1)),
    policy: z.string().min(1),
  })
  .strict();

const EvalLaneSummarySchema = z
  .object({
    lane: EvalLaneSchema,
    total_modules: z.number().int().nonnegative(),
    passed_modules: z.number().int().nonnegative(),
    failed_modules: z.number().int().nonnegative(),
    error_modules: z.number().int().nonnegative(),
  })
  .strict();

export const KrnEvalReportSchema = z
  .object({
    schema_version: z.literal("krn-eval-report.v1"),
    kind: z.literal("krn_eval_report"),
    run_id: z.string().min(1),
    created_at: z.string().min(1),
    target_root: z.string().min(1),
    command: z.literal("krn eval"),
    mode: z.literal("validate"),
    overall_status: EvalModuleStatusSchema,
    lane_selection: EvalLaneSelectionMetadataSchema,
    modules: z.array(EvalModuleResultSchema).min(1),
    lane_summary: z.array(EvalLaneSummarySchema).min(1),
    summary: EvalSummarySchema,
    runtime_report_path: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((report, ctx) => {
    const includedLanes = new Set(report.lane_selection.included_lanes);
    const excludedLanes = new Set(report.lane_selection.excluded_lanes);

    for (const lane of includedLanes) {
      if (excludedLanes.has(lane)) {
        ctx.addIssue({
          code: "custom",
          path: ["lane_selection", "excluded_lanes"],
          message: `lane ${lane} cannot be both included and excluded`,
        });
      }
    }

    if (report.lane_selection.requested_lane === "custom" && report.lane_selection.module_filter.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["lane_selection", "module_filter"],
        message: "custom lane selection requires at least one module filter",
      });
    }

    if (report.lane_selection.requested_lane !== "custom" && report.lane_selection.module_filter.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["lane_selection", "module_filter"],
        message: "module filters are allowed only for custom lane selection",
      });
    }

    report.modules.forEach((moduleResult, index) => {
      if (!includedLanes.has(moduleResult.lane)) {
        ctx.addIssue({
          code: "custom",
          path: ["modules", index, "lane"],
          message: `module lane ${moduleResult.lane} is not included by lane_selection`,
        });
      }
      if (excludedLanes.has(moduleResult.lane)) {
        ctx.addIssue({
          code: "custom",
          path: ["modules", index, "lane"],
          message: `module lane ${moduleResult.lane} is excluded by lane_selection`,
        });
      }
    });

    const laneSummaryByLane = new Map(report.lane_summary.map((summary) => [summary.lane, summary]));
    if (laneSummaryByLane.size !== report.lane_summary.length) {
      ctx.addIssue({
        code: "custom",
        path: ["lane_summary"],
        message: "lane_summary cannot contain duplicate lanes",
      });
    }

    for (const lane of includedLanes) {
      if (!laneSummaryByLane.has(lane)) {
        ctx.addIssue({
          code: "custom",
          path: ["lane_summary"],
          message: `lane_summary is missing included lane ${lane}`,
        });
      }
    }

    report.lane_summary.forEach((laneSummary, index) => {
      const laneModules = report.modules.filter((moduleResult) => moduleResult.lane === laneSummary.lane);
      const expectedPassed = laneModules.filter((moduleResult) => moduleResult.status === "passed").length;
      const expectedFailed = laneModules.filter((moduleResult) => moduleResult.status === "failed").length;
      const expectedErrors = laneModules.filter((moduleResult) => moduleResult.status === "error").length;

      if (
        laneSummary.total_modules !== laneModules.length ||
        laneSummary.passed_modules !== expectedPassed ||
        laneSummary.failed_modules !== expectedFailed ||
        laneSummary.error_modules !== expectedErrors
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["lane_summary", index],
          message: `lane_summary counts do not match modules for lane ${laneSummary.lane}`,
        });
      }
    });

    if (report.summary.total_modules !== report.modules.length) {
      ctx.addIssue({
        code: "custom",
        path: ["summary", "total_modules"],
        message: "summary.total_modules must match modules length",
      });
    }

    const expectedOverallStatus = report.modules.some((moduleResult) => moduleResult.status === "error")
      ? "error"
      : report.modules.some((moduleResult) => moduleResult.status === "failed")
        ? "failed"
        : "passed";

    if (report.overall_status !== expectedOverallStatus) {
      ctx.addIssue({
        code: "custom",
        path: ["overall_status"],
        message: `overall_status must be ${expectedOverallStatus} for the included modules`,
      });
    }
  });

export type KrnEvalReport = z.infer<typeof KrnEvalReportSchema>;
export type EvalModuleResult = z.infer<typeof EvalModuleResultSchema>;
export type EvalLane = z.infer<typeof EvalLaneSchema>;
export type EvalLaneSelection = z.infer<typeof EvalLaneSelectionSchema>;

export function parseKrnEvalReport(input: unknown): KrnEvalReport {
  return KrnEvalReportSchema.parse(input);
}

export const krnEvalReportJsonSchema = z.toJSONSchema(KrnEvalReportSchema, {
  target: "draft-2020-12",
});
