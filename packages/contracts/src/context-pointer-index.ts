import { z } from "zod";

const SourceRefSchema = z.string().min(1);

const ContextPointerMemoryPolicySchema = z
  .object({
    store_memory_bodies: z.literal(false),
    require_selected_memory_ids: z.literal(true),
    require_application_guidance: z.literal(true),
    max_selected_context: z.number().int().min(1).max(5),
  })
  .strict();

export const KrnContextPointerIndexSchema = z
  .object({
    schema_version: z.literal("krn-context-pointer-index.v1"),
    kind: z.literal("krn_context_pointer_index"),
    pointer_id: z.string().min(1),
    created_at: z.string().min(1),
    runtime_root: z.literal(".krn/context"),
    packet_glob: z.literal(".krn/context/*/context-packet.json"),
    latest_packet_ref: z.string().min(1).nullable(),
    build_command: z.string().min(1),
    memory_policy: ContextPointerMemoryPolicySchema,
    rejected_context_refs: z.array(z.string().min(1)).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    overclaim_boundary: z.string().min(1),
  })
  .strict()
  .superRefine((index, ctx) => {
    if (index.latest_packet_ref?.startsWith("docs/memory/")) {
      ctx.addIssue({
        code: "custom",
        path: ["latest_packet_ref"],
        message: "context pointer latest_packet_ref must not point at docs/memory as memory core",
      });
    }

    if (!index.build_command.includes("krn context build")) {
      ctx.addIssue({
        code: "custom",
        path: ["build_command"],
        message: "context pointer build_command must route through krn context build",
      });
    }

    if (!index.rejected_context_refs.some((ref) => ref.includes("docs/memory"))) {
      ctx.addIssue({
        code: "custom",
        path: ["rejected_context_refs"],
        message: "context pointer index must explicitly reject broad docs/memory context dumps",
      });
    }
  });

export type KrnContextPointerIndex = z.infer<typeof KrnContextPointerIndexSchema>;

export function parseKrnContextPointerIndex(input: unknown): KrnContextPointerIndex {
  return KrnContextPointerIndexSchema.parse(input);
}

export const krnContextPointerIndexJsonSchema = z.toJSONSchema(KrnContextPointerIndexSchema, {
  target: "draft-2020-12",
});
