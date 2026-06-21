import { z } from "zod";

const SourceRefSchema = z.string().min(1);

const InitReadinessCapabilitySchema = z.enum([
  "agent_instructions",
  "local_config",
  "source_pointers",
  "context_pointers",
  "eval_baseline",
  "skill_wiring",
  "policy_boundaries",
]);

const RequiredCapabilitySchema = z
  .object({
    capability: InitReadinessCapabilitySchema,
    path: z.string().min(1),
    status: z.enum(["present", "missing", "invalid"]),
    reason: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

const ForbiddenStateSchema = z
  .object({
    id: z.string().min(1),
    path: z.string().min(1),
    status: z.enum(["clear", "present"]),
    reason: z.string().min(1),
  })
  .strict();

const ReadinessSummarySchema = z
  .object({
    required_capabilities: z.number().int().nonnegative(),
    present_capabilities: z.number().int().nonnegative(),
    missing_capabilities: z.number().int().nonnegative(),
    invalid_capabilities: z.number().int().nonnegative(),
    forbidden_state_present: z.number().int().nonnegative(),
  })
  .strict();

export const KrnInitReadinessReportSchema = z
  .object({
    schema_version: z.literal("krn-init-readiness-report.v1"),
    kind: z.literal("krn_init_readiness_report"),
    run_id: z.string().min(1),
    created_at: z.string().min(1),
    target_root: z.string().min(1),
    command: z.literal("krn init --readiness"),
    readiness_status: z.enum(["ready", "blocked"]),
    required_capabilities: z.array(RequiredCapabilitySchema).min(1),
    forbidden_state: z.array(ForbiddenStateSchema),
    summary: ReadinessSummarySchema,
    next_action: z.string().min(1),
    blocked_surfaces: z.array(z.string().min(1)),
    source_refs: z.array(SourceRefSchema).min(1),
    overclaim_boundary: z.string().min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((report, ctx) => {
    const requiredCapabilities = [
      "agent_instructions",
      "local_config",
      "source_pointers",
      "context_pointers",
      "eval_baseline",
      "skill_wiring",
      "policy_boundaries",
    ] as const;
    const seenCapabilities = new Set(report.required_capabilities.map((item) => item.capability));

    for (const capability of requiredCapabilities) {
      if (!seenCapabilities.has(capability)) {
        ctx.addIssue({
          code: "custom",
          path: ["required_capabilities"],
          message: `required_capabilities is missing ${capability}`,
        });
      }
    }

    const summary = {
      required_capabilities: report.required_capabilities.length,
      present_capabilities: report.required_capabilities.filter((item) => item.status === "present").length,
      missing_capabilities: report.required_capabilities.filter((item) => item.status === "missing").length,
      invalid_capabilities: report.required_capabilities.filter((item) => item.status === "invalid").length,
      forbidden_state_present: report.forbidden_state.filter((item) => item.status === "present").length,
    };

    for (const [key, value] of Object.entries(summary)) {
      if (report.summary[key as keyof typeof summary] !== value) {
        ctx.addIssue({
          code: "custom",
          path: ["summary", key],
          message: `summary.${key} must equal ${value}`,
        });
      }
    }

    const hasMissingOrInvalid = summary.missing_capabilities > 0 || summary.invalid_capabilities > 0;
    const hasForbiddenState = summary.forbidden_state_present > 0;

    if (report.readiness_status === "ready" && (hasMissingOrInvalid || hasForbiddenState)) {
      ctx.addIssue({
        code: "custom",
        path: ["readiness_status"],
        message: "ready reports cannot contain missing, invalid, or forbidden state",
      });
    }

    if (report.readiness_status === "blocked" && !hasMissingOrInvalid && !hasForbiddenState) {
      ctx.addIssue({
        code: "custom",
        path: ["readiness_status"],
        message: "blocked reports must name missing, invalid, or forbidden state",
      });
    }

    if (report.readiness_status === "ready" && report.blocked_surfaces.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["blocked_surfaces"],
        message: "ready reports cannot list blocked surfaces",
      });
    }

    if (report.readiness_status === "blocked" && report.blocked_surfaces.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["blocked_surfaces"],
        message: "blocked reports must list blocked surfaces",
      });
    }
  });

export type KrnInitReadinessReport = z.infer<typeof KrnInitReadinessReportSchema>;

export function parseKrnInitReadinessReport(input: unknown): KrnInitReadinessReport {
  return KrnInitReadinessReportSchema.parse(input);
}

export const krnInitReadinessReportJsonSchema = z.toJSONSchema(KrnInitReadinessReportSchema, {
  target: "draft-2020-12",
});
