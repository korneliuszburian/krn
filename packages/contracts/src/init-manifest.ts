import { z } from "zod";

const SourceRefSchema = z.string().min(1);

const ProjectProfileSchema = z
  .object({
    schema_version: z.literal("product-spine.v1"),
    id: z.string().min(1),
    kind: z.literal("project_profile"),
    status: z.enum(["draft", "active", "stale", "superseded"]),
    project_name: z.string().min(1),
    identity: z.string().min(1),
    product_boundary: z.string().min(1),
    current_phase: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    guardrails: z.array(z.string().min(1)).min(1),
    next_allowed_surfaces: z.array(z.string().min(1)),
    blocked_surfaces: z.array(z.string().min(1)),
  })
  .strict();

const DetectedArtifactSchema = z
  .object({
    path: z.string().min(1),
    kind: z.enum(["file", "directory", "missing"]),
    exists: z.boolean(),
    reason: z.string().min(1),
  })
  .strict();

const PlannedFileSchema = z
  .object({
    path: z.string().min(1),
    action: z.enum(["create", "modify", "skip", "proposal_only"]),
    reason: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

const RuntimeDirSchema = z
  .object({
    path: z.string().min(1),
    purpose: z.string().min(1),
  })
  .strict();

const CollisionSchema = z
  .object({
    path: z.string().min(1),
    strategy: z.enum(["skip", "merge_required", "proposal_only"]),
    reason: z.string().min(1),
  })
  .strict();

const BootstrapCapabilitySchema = z
  .object({
    capability: z.enum([
      "agent_instructions",
      "local_config",
      "source_pointers",
      "context_pointers",
      "eval_baseline",
      "skill_wiring",
      "policy_boundaries",
    ]),
    path: z.string().min(1),
    action: z.enum(["create", "skip", "proposal_only", "merge_required"]),
    purpose: z.string().min(1),
    boundary: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

const ValidationSchema = z
  .object({
    status: z.enum(["valid", "invalid"]),
    checks: z.array(z.string().min(1)).min(1),
  })
  .strict();

export const InitManifestSchema = z
  .object({
    schema_version: z.literal("krn-init-manifest.v1"),
    kind: z.literal("krn_init_manifest"),
    run_id: z.string().min(1),
    created_at: z.string().min(1),
    target_root: z.string().min(1),
    mode: z.literal("dry-run"),
    project_profile: ProjectProfileSchema,
    detected_artifacts: z.array(DetectedArtifactSchema),
    planned_files: z.array(PlannedFileSchema),
    planned_runtime_dirs: z.array(RuntimeDirSchema),
    collisions: z.array(CollisionSchema),
    bootstrap_plan: z.array(BootstrapCapabilitySchema).min(1),
    no_touch_paths: z.array(z.string().min(1)).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    product_spine_refs: z.array(z.string().min(1)).min(1),
    validation: ValidationSchema,
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((manifest, ctx) => {
    const requiredCapabilities = [
      "agent_instructions",
      "local_config",
      "source_pointers",
      "context_pointers",
      "eval_baseline",
      "skill_wiring",
      "policy_boundaries",
    ] as const;
    const plannedCapabilities = new Set(manifest.bootstrap_plan.map((item) => item.capability));

    for (const capability of requiredCapabilities) {
      if (!plannedCapabilities.has(capability)) {
        ctx.addIssue({
          code: "custom",
          path: ["bootstrap_plan"],
          message: `bootstrap_plan is missing capability ${capability}`,
        });
      }
    }

    manifest.planned_files.forEach((plannedFile, index) => {
      if (plannedFile.action === "modify") {
        ctx.addIssue({
          code: "custom",
          path: ["planned_files", index, "action"],
          message: "krn init dry-run cannot plan direct modify actions",
        });
      }
    });
  });

export type InitManifest = z.infer<typeof InitManifestSchema>;

export function parseInitManifest(input: unknown): InitManifest {
  return InitManifestSchema.parse(input);
}

export const initManifestJsonSchema = z.toJSONSchema(InitManifestSchema, {
  target: "draft-2020-12",
});
