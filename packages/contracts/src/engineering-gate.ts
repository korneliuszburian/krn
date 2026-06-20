import { z } from "zod";

const GateStatusSchema = z.enum(["pass", "needs_plan", "blocked"]);
const GateCheckStatusSchema = z.enum(["pass", "warn", "fail"]);
const ScopeClassificationSchema = z.enum(["trivial", "non_trivial"]);
const GateCheckIdSchema = z.enum([
  "mechanism",
  "scope_boundary",
  "consumer",
  "verification",
  "rollback_or_kill",
  "hardcoded_truth",
  "skill_routing",
  "simplify_cadence",
  "overclaim_boundary",
]);

const REQUIRED_NON_TRIVIAL_CHECKS = [
  "mechanism",
  "scope_boundary",
  "consumer",
  "verification",
  "rollback_or_kill",
  "hardcoded_truth",
  "skill_routing",
  "simplify_cadence",
  "overclaim_boundary",
] as const;

const EngineeringGateCheckSchema = z
  .object({
    id: GateCheckIdSchema,
    status: GateCheckStatusSchema,
    requirement: z.string().min(1),
    action: z.string().min(1),
    evidence: z.string().min(1),
  })
  .strict();

const EngineeringGateSkillSchema = z
  .object({
    name: z.string().min(1),
    reason: z.string().min(1),
  })
  .strict();

const HardcodedTruthPolicySchema = z
  .object({
    allowed: z.array(z.string().min(1)).min(1),
    forbidden: z.array(z.string().min(1)).min(1),
  })
  .strict();

const EngineeringGateNextStepSchema = z
  .object({
    step: z.string().min(1),
    verification: z.string().min(1),
  })
  .strict();

export const KrnEngineeringGateSchema = z
  .object({
    schema_version: z.literal("krn-engineering-gate.v1"),
    kind: z.literal("krn_engineering_gate"),
    run_id: z.string().min(1),
    created_at: z.string().min(1),
    target_root: z.string().min(1),
    command: z.literal("krn gate"),
    task_intent: z.string().min(1),
    target_path: z.string().min(1).nullable(),
    scope_classification: ScopeClassificationSchema,
    gate_status: GateStatusSchema,
    checks: z.array(EngineeringGateCheckSchema).min(1),
    required_skills: z.array(EngineeringGateSkillSchema),
    blocked_actions: z.array(z.string().min(1)).min(1),
    hardcoded_truth_policy: HardcodedTruthPolicySchema,
    next_steps: z.array(EngineeringGateNextStepSchema).min(1),
    runtime_report_path: z.string().min(1),
    source_refs: z.array(z.string().min(1)).min(1),
    overclaim_boundary: z.string().min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((gate, ctx) => {
    if (gate.scope_classification !== "non_trivial") {
      return;
    }

    const checkIds = new Set(gate.checks.map((check) => check.id));
    for (const requiredCheck of REQUIRED_NON_TRIVIAL_CHECKS) {
      if (!checkIds.has(requiredCheck)) {
        ctx.addIssue({
          code: "custom",
          path: ["checks"],
          message: `non-trivial engineering gate is missing required check: ${requiredCheck}`,
        });
      }
    }

    if (gate.gate_status === "pass") {
      for (const check of gate.checks) {
        if (check.status !== "pass") {
          ctx.addIssue({
            code: "custom",
            path: ["checks", check.id],
            message: `passing non-trivial engineering gate cannot include ${check.status} check: ${check.id}`,
          });
        }
      }
    }
  });

export type KrnEngineeringGate = z.infer<typeof KrnEngineeringGateSchema>;
export type EngineeringGateStatus = z.infer<typeof GateStatusSchema>;
export type EngineeringGateCheckStatus = z.infer<typeof GateCheckStatusSchema>;
export type EngineeringGateCheckId = z.infer<typeof GateCheckIdSchema>;
export type ScopeClassification = z.infer<typeof ScopeClassificationSchema>;

export function parseKrnEngineeringGate(input: unknown): KrnEngineeringGate {
  return KrnEngineeringGateSchema.parse(input);
}

export const krnEngineeringGateJsonSchema = z.toJSONSchema(KrnEngineeringGateSchema, {
  target: "draft-2020-12",
});
