import { z } from "zod";
import { DoctorReportSchema } from "./doctor-report.js";
import { KrnEvalReportSchema } from "./eval-report.js";
import { InitManifestSchema } from "./init-manifest.js";
import { KrnReviewReportSchema } from "./review-report.js";

const SourceRefSchema = z.string().min(1);

const ControlPlaneResourceKindSchema = z.enum([
  "runtime_summary",
  "init_manifest",
  "doctor_report",
  "eval_report",
  "review_report",
]);
const ControlPlaneResourceStatusSchema = z.enum(["available", "missing", "invalid"]);

const RuntimeSummaryItemSchema = z
  .object({
    uri: z.string().min(1),
    resource_kind: ControlPlaneResourceKindSchema.exclude(["runtime_summary"]),
    status: ControlPlaneResourceStatusSchema,
    report_path: z.string().min(1).nullable(),
    summary: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

const RuntimeSummaryPayloadSchema = z
  .object({
    kind: z.literal("runtime_summary"),
    target_root: z.string().min(1),
    generated_at: z.string().min(1),
    resources: z.array(RuntimeSummaryItemSchema).min(1),
    available_resources: z.number().int().nonnegative(),
    missing_resources: z.number().int().nonnegative(),
    invalid_resources: z.number().int().nonnegative(),
    write_tools_enabled: z.literal(false),
    proposal_tools_enabled: z.literal(false),
    next_allowed_surfaces: z.array(z.string().min(1)).min(1),
    blocked_surfaces: z.array(z.string().min(1)).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict();

const ControlPlaneResourcePayloadSchema = z.union([
  RuntimeSummaryPayloadSchema,
  InitManifestSchema,
  DoctorReportSchema,
  KrnEvalReportSchema,
  KrnReviewReportSchema,
]);

const ControlPlaneResourceDescriptorSchema = z
  .object({
    uri: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    resource_kind: ControlPlaneResourceKindSchema,
    mime_type: z.literal("application/json"),
    read_only: z.literal(true),
    status: ControlPlaneResourceStatusSchema,
    latest_report_path: z.string().min(1).nullable(),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

const ControlPlaneResourceIndexSummarySchema = z
  .object({
    total_resources: z.number().int().nonnegative(),
    available_resources: z.number().int().nonnegative(),
    missing_resources: z.number().int().nonnegative(),
    invalid_resources: z.number().int().nonnegative(),
    write_tools_enabled: z.literal(false),
    proposal_tools_enabled: z.literal(false),
  })
  .strict();

export const KrnControlPlaneResourceIndexSchema = z
  .object({
    schema_version: z.literal("krn-control-plane-resource-index.v1"),
    kind: z.literal("krn_control_plane_resource_index"),
    target_root: z.string().min(1),
    generated_at: z.string().min(1),
    resources: z.array(ControlPlaneResourceDescriptorSchema).min(1),
    summary: ControlPlaneResourceIndexSummarySchema,
    allowlisted_uris: z.array(z.string().min(1)).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict();

export const KrnControlPlaneResourceSchema = z
  .object({
    schema_version: z.literal("krn-control-plane-resource.v1"),
    kind: z.literal("krn_control_plane_resource"),
    uri: z.string().min(1),
    name: z.string().min(1),
    target_root: z.string().min(1),
    generated_at: z.string().min(1),
    resource_kind: ControlPlaneResourceKindSchema,
    mime_type: z.literal("application/json"),
    read_only: z.literal(true),
    status: ControlPlaneResourceStatusSchema,
    latest_report_path: z.string().min(1).nullable(),
    payload: ControlPlaneResourcePayloadSchema.nullable(),
    error_summary: z.string().min(1).nullable(),
    source_refs: z.array(SourceRefSchema).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict();

export type ControlPlaneResourceDescriptor = z.infer<typeof ControlPlaneResourceDescriptorSchema>;
export type ControlPlaneResourcePayload = z.infer<typeof ControlPlaneResourcePayloadSchema>;
export type KrnControlPlaneResource = z.infer<typeof KrnControlPlaneResourceSchema>;
export type KrnControlPlaneResourceIndex = z.infer<typeof KrnControlPlaneResourceIndexSchema>;

export function parseKrnControlPlaneResource(input: unknown): KrnControlPlaneResource {
  return KrnControlPlaneResourceSchema.parse(input);
}

export function parseKrnControlPlaneResourceIndex(input: unknown): KrnControlPlaneResourceIndex {
  return KrnControlPlaneResourceIndexSchema.parse(input);
}

export const krnControlPlaneResourceJsonSchema = z.toJSONSchema(KrnControlPlaneResourceSchema, {
  target: "draft-2020-12",
});

export const krnControlPlaneResourceIndexJsonSchema = z.toJSONSchema(KrnControlPlaneResourceIndexSchema, {
  target: "draft-2020-12",
});
