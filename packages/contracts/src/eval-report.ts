import { z } from "zod";

const SourceRefSchema = z.string().min(1);

const EvalModuleStatusSchema = z.enum(["passed", "failed", "error"]);

const EvalModuleResultSchema = z
  .object({
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
    modules: z.array(EvalModuleResultSchema).min(1),
    summary: EvalSummarySchema,
    runtime_report_path: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict();

export type KrnEvalReport = z.infer<typeof KrnEvalReportSchema>;
export type EvalModuleResult = z.infer<typeof EvalModuleResultSchema>;

export function parseKrnEvalReport(input: unknown): KrnEvalReport {
  return KrnEvalReportSchema.parse(input);
}

export const krnEvalReportJsonSchema = z.toJSONSchema(KrnEvalReportSchema, {
  target: "draft-2020-12",
});
