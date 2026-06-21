import { z } from "zod";

const SourceRefSchema = z.string().min(1);
const EvalLaneSchema = z.enum(["core", "current"]);
const ForbiddenDefaultLaneSchema = z.enum(["lab", "all"]);

const EvalBaselineCheckSchema = z
  .object({
    check_id: z.string().min(1),
    command: z.string().min(1),
    lane: EvalLaneSchema,
    purpose: z.string().min(1),
  })
  .strict();

const EvalBaselinePolicySchema = z
  .object({
    forbid_lab_by_default: z.literal(true),
    forbid_all_by_default: z.literal(true),
    require_interpretation_caveat: z.literal(true),
    productivity_lift_claimed: z.literal(false),
  })
  .strict();

export const KrnEvalBaselineSchema = z
  .object({
    schema_version: z.literal("krn-eval-baseline.v1"),
    kind: z.literal("krn_eval_baseline"),
    baseline_id: z.string().min(1),
    created_at: z.string().min(1),
    report_roots: z
      .object({
        aggregate: z.literal(".krn/eval"),
        module_reports: z.literal(".krn/evals"),
      })
      .strict(),
    default_lane: z.literal("current"),
    required_lanes: z.array(EvalLaneSchema).min(2),
    forbidden_default_lanes: z.array(ForbiddenDefaultLaneSchema).min(2),
    default_command: z.string().min(1),
    core_command: z.string().min(1),
    baseline_checks: z.array(EvalBaselineCheckSchema).min(1),
    policy: EvalBaselinePolicySchema,
    source_refs: z.array(SourceRefSchema).min(1),
    overclaim_boundary: z.string().min(1),
  })
  .strict()
  .superRefine((baseline, ctx) => {
    const requiredLanes = new Set(baseline.required_lanes);
    if (!requiredLanes.has("core") || !requiredLanes.has("current")) {
      ctx.addIssue({
        code: "custom",
        path: ["required_lanes"],
        message: "eval baseline must require core and current lanes",
      });
    }

    const forbiddenDefaultLanes = new Set(baseline.forbidden_default_lanes);
    if (!forbiddenDefaultLanes.has("lab") || !forbiddenDefaultLanes.has("all")) {
      ctx.addIssue({
        code: "custom",
        path: ["forbidden_default_lanes"],
        message: "eval baseline must keep lab and all lanes out of default bootstrap",
      });
    }

    if (baseline.default_command.includes("--lane lab") || baseline.default_command.includes("--lane all")) {
      ctx.addIssue({
        code: "custom",
        path: ["default_command"],
        message: "eval baseline default_command must not select lab or all lanes",
      });
    }

    if (!baseline.core_command.includes("--lane core")) {
      ctx.addIssue({
        code: "custom",
        path: ["core_command"],
        message: "eval baseline core_command must route through the core lane",
      });
    }

    baseline.baseline_checks.forEach((check, index) => {
      if (check.command.includes("--lane lab") || check.command.includes("--lane all")) {
        ctx.addIssue({
          code: "custom",
          path: ["baseline_checks", index, "command"],
          message: "eval baseline checks must not default to lab or all lanes",
        });
      }
    });

    if (!baseline.overclaim_boundary.toLowerCase().includes("does not prove")) {
      ctx.addIssue({
        code: "custom",
        path: ["overclaim_boundary"],
        message: "eval baseline overclaim boundary must name what the seed does not prove",
      });
    }
  });

export type KrnEvalBaseline = z.infer<typeof KrnEvalBaselineSchema>;

export function parseKrnEvalBaseline(input: unknown): KrnEvalBaseline {
  return KrnEvalBaselineSchema.parse(input);
}

export const krnEvalBaselineJsonSchema = z.toJSONSchema(KrnEvalBaselineSchema, {
  target: "draft-2020-12",
});
