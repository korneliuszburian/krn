import { z } from "zod";
import { KrnMemoryApplicationSchema, KrnMemoryFeedbackSchema, KrnMemorySelectionSchema } from "./memory-store.js";

const SourceRefSchema = z.string().min(1);

const ReviewArtifactKindSchema = z.enum(["init_manifest", "doctor_report", "eval_report"]);
const ReviewArtifactStatusSchema = z.enum(["present", "missing", "invalid"]);
const ReviewFindingSeveritySchema = z.enum(["info", "warning", "blocking"]);
const ReviewProposalTypeSchema = z.enum([
  "memory_update",
  "source_claim_update",
  "goal_update",
  "repair_record",
  "next_action",
]);

const ReviewArtifactSchema = z
  .object({
    id: z.string().min(1),
    kind: ReviewArtifactKindSchema,
    status: ReviewArtifactStatusSchema,
    path: z.string().min(1).nullable(),
    summary: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

const ReviewFindingSchema = z
  .object({
    id: z.string().min(1),
    severity: ReviewFindingSeveritySchema,
    artifact_id: z.string().min(1).nullable(),
    summary: z.string().min(1),
    evidence_refs: z.array(z.string().min(1)),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

const ReviewProposalSchema = z
  .object({
    id: z.string().min(1),
    proposal_type: ReviewProposalTypeSchema,
    status: z.literal("proposal_only"),
    title: z.string().min(1),
    rationale: z.string().min(1),
    evidence_refs: z.array(z.string().min(1)).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    blocked_surfaces: z.array(z.string().min(1)),
  })
  .strict();

const ReviewSummarySchema = z
  .object({
    total_artifacts: z.number().int().nonnegative(),
    present_artifacts: z.number().int().nonnegative(),
    missing_artifacts: z.number().int().nonnegative(),
    invalid_artifacts: z.number().int().nonnegative(),
    findings: z.number().int().nonnegative(),
    blocking_findings: z.number().int().nonnegative(),
    proposals: z.number().int().nonnegative(),
  })
  .strict();

export const KrnReviewReportSchema = z
  .object({
    schema_version: z.literal("krn-review-report.v1"),
    kind: z.literal("krn_review_report"),
    run_id: z.string().min(1),
    created_at: z.string().min(1),
    target_root: z.string().min(1),
    command: z.literal("krn review"),
    mode: z.literal("proposal-only"),
    overall_status: z.enum(["ready_for_human_review", "needs_attention", "blocked"]),
    artifacts: z.array(ReviewArtifactSchema).min(1),
    findings: z.array(ReviewFindingSchema),
    proposals: z.array(ReviewProposalSchema).min(1),
    memory_selection: KrnMemorySelectionSchema,
    memory_application: KrnMemoryApplicationSchema,
    memory_feedback: KrnMemoryFeedbackSchema,
    summary: ReviewSummarySchema,
    no_touch_paths: z.array(z.string().min(1)).min(1),
    runtime_report_path: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((report, ctx) => {
    const appliedMemoryIds = new Set(report.memory_application.applied_memory_ids);
    for (const selected of report.memory_selection.selected) {
      if (!appliedMemoryIds.has(selected.memory_id)) {
        ctx.addIssue({
          code: "custom",
          path: ["memory_application", "applied_memory_ids"],
          message: `selected memory ${selected.memory_id} is missing application guidance`,
        });
      }
    }

    const reportSourceRefs = new Set(report.source_refs);
    for (const selected of report.memory_selection.selected) {
      for (const sourceRef of selected.source_lineage) {
        if (!reportSourceRefs.has(sourceRef)) {
          ctx.addIssue({
            code: "custom",
            path: ["source_refs"],
            message: `selected memory source lineage ${sourceRef} is missing from review source_refs`,
          });
        }
      }
    }
  });

export type KrnReviewReport = z.infer<typeof KrnReviewReportSchema>;
export type ReviewArtifact = z.infer<typeof ReviewArtifactSchema>;
export type ReviewFinding = z.infer<typeof ReviewFindingSchema>;
export type ReviewProposal = z.infer<typeof ReviewProposalSchema>;

export function parseKrnReviewReport(input: unknown): KrnReviewReport {
  return KrnReviewReportSchema.parse(input);
}

export const krnReviewReportJsonSchema = z.toJSONSchema(KrnReviewReportSchema, {
  target: "draft-2020-12",
});
