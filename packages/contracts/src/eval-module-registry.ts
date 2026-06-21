import { z } from "zod";

const SourceRefSchema = z.string().min(1);
const EvalLaneSchema = z.enum(["core", "current", "lab"]);

export const EvalModuleDescriptorSchema = z
  .object({
    module_id: z.string().min(1),
    lane: EvalLaneSchema,
    command: z.array(z.string().min(1)).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

export const KrnEvalModuleRegistrySchema = z
  .object({
    schema_version: z.literal("krn-eval-module-registry.v1"),
    kind: z.literal("krn_eval_module_registry"),
    default_lane: z.literal("current"),
    modules: z.array(EvalModuleDescriptorSchema).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((registry, ctx) => {
    const seenModuleIds = new Set<string>();

    registry.modules.forEach((module, index) => {
      if (seenModuleIds.has(module.module_id)) {
        ctx.addIssue({
          code: "custom",
          path: ["modules", index, "module_id"],
          message: `duplicate eval module_id: ${module.module_id}`,
        });
      }
      seenModuleIds.add(module.module_id);
    });
  });

export type EvalModuleDescriptor = z.infer<typeof EvalModuleDescriptorSchema>;
export type KrnEvalModuleRegistry = z.infer<typeof KrnEvalModuleRegistrySchema>;

export function parseKrnEvalModuleRegistry(input: unknown): KrnEvalModuleRegistry {
  return KrnEvalModuleRegistrySchema.parse(input);
}

export const krnEvalModuleRegistryJsonSchema = z.toJSONSchema(KrnEvalModuleRegistrySchema, {
  target: "draft-2020-12",
});
