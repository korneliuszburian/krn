import { z } from "zod";

const SourceRefSchema = z.string().min(1);

const DoctorSurfaceSchema = z.enum(["agents", "memory", "skills", "hooks", "evals", "runtime"]);
const DoctorStatusSchema = z.enum(["ready", "warning", "blocked"]);

const DoctorCheckSchema = z
  .object({
    id: z.string().min(1),
    surface: DoctorSurfaceSchema,
    path: z.string().min(1),
    status: DoctorStatusSchema,
    exists: z.boolean(),
    summary: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

const DoctorSummarySchema = z
  .object({
    ready: z.number().int().nonnegative(),
    warning: z.number().int().nonnegative(),
    blocked: z.number().int().nonnegative(),
  })
  .strict();

export const DoctorReportSchema = z
  .object({
    schema_version: z.literal("krn-doctor-report.v1"),
    kind: z.literal("krn_doctor_report"),
    run_id: z.string().min(1),
    created_at: z.string().min(1),
    target_root: z.string().min(1),
    command: z.literal("krn doctor"),
    overall_status: DoctorStatusSchema,
    checks: z.array(DoctorCheckSchema).min(1),
    summary: DoctorSummarySchema,
    runtime_report_path: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict();

export type DoctorReport = z.infer<typeof DoctorReportSchema>;
export type DoctorCheck = z.infer<typeof DoctorCheckSchema>;

export function parseDoctorReport(input: unknown): DoctorReport {
  return DoctorReportSchema.parse(input);
}

export const doctorReportJsonSchema = z.toJSONSchema(DoctorReportSchema, {
  target: "draft-2020-12",
});
