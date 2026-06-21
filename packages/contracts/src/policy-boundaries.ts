import { z } from "zod";

const SourceRefSchema = z.string().min(1);

const PolicySurfaceSchema = z.enum([
  "target_file_mutation",
  "memory_core_write",
  "source_acceptance",
  "command_execution",
  "dashboard_or_api_expansion",
]);

const PolicyEnforcementSchema = z.enum(["warn", "block", "require_approval"]);

const ForbiddenPolicyDefaultSchema = z.enum([
  "unreviewed_target_write",
  "memory_body_repo_write",
  "dashboard_first",
  "benchmark_default",
  "cloud_sync_default",
  "productivity_lift_claim",
]);

const PolicyBoundarySchema = z
  .object({
    boundary_id: z.string().min(1),
    surface: PolicySurfaceSchema,
    enforcement: PolicyEnforcementSchema,
    trigger: z.string().min(1),
    required_consumer: z.string().min(1),
    rollback_or_kill: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

export const KrnPolicyBoundariesSchema = z
  .object({
    schema_version: z.literal("krn-policy-boundaries.v1"),
    kind: z.literal("krn_policy_boundaries"),
    policy_id: z.string().min(1),
    created_at: z.string().min(1),
    mode: z.literal("local_first_reviewed_seed"),
    default_effect: z.literal("warn_or_block_by_boundary"),
    boundaries: z.array(PolicyBoundarySchema).min(1),
    forbidden_defaults: z.array(ForbiddenPolicyDefaultSchema).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    overclaim_boundary: z.string().min(1),
  })
  .strict()
  .superRefine((policy, ctx) => {
    const boundaryIds = new Set<string>();
    const surfaces = new Map(policy.boundaries.map((boundary) => [boundary.surface, boundary.enforcement]));

    policy.boundaries.forEach((boundary, index) => {
      if (boundaryIds.has(boundary.boundary_id)) {
        ctx.addIssue({
          code: "custom",
          path: ["boundaries", index, "boundary_id"],
          message: `duplicate policy boundary id: ${boundary.boundary_id}`,
        });
      }
      boundaryIds.add(boundary.boundary_id);
    });

    if (surfaces.get("target_file_mutation") !== "require_approval") {
      ctx.addIssue({
        code: "custom",
        path: ["boundaries"],
        message: "policy boundaries must require approval for target file mutation",
      });
    }

    if (surfaces.get("memory_core_write") !== "block") {
      ctx.addIssue({
        code: "custom",
        path: ["boundaries"],
        message: "policy boundaries must block repo-local memory core writes",
      });
    }

    if (!surfaces.has("source_acceptance")) {
      ctx.addIssue({
        code: "custom",
        path: ["boundaries"],
        message: "policy boundaries must include source acceptance handling",
      });
    }

    if (!surfaces.has("command_execution")) {
      ctx.addIssue({
        code: "custom",
        path: ["boundaries"],
        message: "policy boundaries must include command execution handling",
      });
    }

    if (!surfaces.has("dashboard_or_api_expansion")) {
      ctx.addIssue({
        code: "custom",
        path: ["boundaries"],
        message: "policy boundaries must include dashboard/API expansion handling",
      });
    }

    const forbiddenDefaults = new Set(policy.forbidden_defaults);
    for (const requiredDefault of [
      "unreviewed_target_write",
      "memory_body_repo_write",
      "dashboard_first",
      "benchmark_default",
      "cloud_sync_default",
      "productivity_lift_claim",
    ] as const) {
      if (!forbiddenDefaults.has(requiredDefault)) {
        ctx.addIssue({
          code: "custom",
          path: ["forbidden_defaults"],
          message: `policy boundaries must forbid ${requiredDefault}`,
        });
      }
    }

    if (!policy.overclaim_boundary.toLowerCase().includes("does not prove")) {
      ctx.addIssue({
        code: "custom",
        path: ["overclaim_boundary"],
        message: "policy boundaries overclaim boundary must name what the seed does not prove",
      });
    }
  });

export type KrnPolicyBoundaries = z.infer<typeof KrnPolicyBoundariesSchema>;

export function parseKrnPolicyBoundaries(input: unknown): KrnPolicyBoundaries {
  return KrnPolicyBoundariesSchema.parse(input);
}

export const krnPolicyBoundariesJsonSchema = z.toJSONSchema(KrnPolicyBoundariesSchema, {
  target: "draft-2020-12",
});
