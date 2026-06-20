import { z } from "zod";

const SourceConfidenceSchema = z.enum(["low", "medium", "high"]);
const SourceFreshnessSchema = z.enum(["fresh", "aging", "stale", "unknown", "missing"]);
const SourceCheckActionSchema = z.enum(["pass", "warn", "block"]);
const SourceRecordStatusSchema = z.enum(["active", "unverified", "stale", "conflicting", "superseded"]);
const SourceCheckDecisionSchema = z.enum(["pass", "warn", "block"]);

const SourceRefSchema = z.string().min(1);

const SourceRecordSchema = z
  .object({
    schema_version: z.literal("krn-source-record.v1"),
    kind: z.literal("krn_source_record"),
    id: z.string().min(1),
    ref: SourceRefSchema,
    type: z.enum(["local_doc", "official_doc", "paper", "repo", "blog", "runtime_evidence"]),
    status: SourceRecordStatusSchema,
    freshness: SourceFreshnessSchema.exclude(["missing"]),
    confidence: SourceConfidenceSchema,
    owner: z.string().min(1),
    last_verified_at: z.string().min(1).nullable(),
    supports_decisions: z.array(z.string().min(1)),
    conflicts_with: z.array(SourceRefSchema),
    invalidation_rule: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

const CheckedSourceRefSchema = z
  .object({
    ref: SourceRefSchema,
    source_id: z.string().min(1).nullable(),
    status: z.enum(["active", "unverified", "stale", "conflicting", "superseded", "missing"]),
    freshness: SourceFreshnessSchema,
    confidence: SourceConfidenceSchema.nullable(),
    action: SourceCheckActionSchema,
    reason: z.string().min(1),
  })
  .strict();

export const KrnSourceGraphSchema = z
  .object({
    schema_version: z.literal("krn-source-graph.v1"),
    kind: z.literal("krn_source_graph"),
    graph_id: z.string().min(1),
    created_at: z.string().min(1),
    records: z.array(SourceRecordSchema).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    overclaim_boundary: z.string().min(1),
  })
  .strict()
  .superRefine((graph, ctx) => {
    const ids = new Set<string>();
    const refs = new Set<string>();

    for (const [index, record] of graph.records.entries()) {
      if (ids.has(record.id)) {
        ctx.addIssue({ code: "custom", path: ["records", index, "id"], message: `duplicate source id: ${record.id}` });
      }
      if (refs.has(record.ref)) {
        ctx.addIssue({ code: "custom", path: ["records", index, "ref"], message: `duplicate source ref: ${record.ref}` });
      }
      if (record.status === "conflicting" && record.conflicts_with.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["records", index, "conflicts_with"],
          message: "conflicting source records must name at least one conflict",
        });
      }

      ids.add(record.id);
      refs.add(record.ref);
    }
  });

export const KrnSourceCheckSchema = z
  .object({
    schema_version: z.literal("krn-source-check.v1"),
    kind: z.literal("krn_source_check"),
    run_id: z.string().min(1),
    created_at: z.string().min(1),
    target_root: z.string().min(1),
    command: z.literal("krn sources check"),
    context_packet_ref: z.string().min(1),
    source_graph_ref: z.string().min(1),
    checked_refs: z.array(CheckedSourceRefSchema).min(1),
    blocked_refs: z.array(SourceRefSchema),
    warning_refs: z.array(SourceRefSchema),
    missing_refs: z.array(SourceRefSchema),
    decision: SourceCheckDecisionSchema,
    required_actions: z.array(z.string().min(1)),
    runtime_report_path: z.string().min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    overclaim_boundary: z.string().min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((report, ctx) => {
    if (report.blocked_refs.length > 0 && report.decision !== "block") {
      ctx.addIssue({ code: "custom", path: ["decision"], message: "blocked refs require block decision" });
    }
    if (report.blocked_refs.length === 0 && report.warning_refs.length > 0 && report.decision !== "warn") {
      ctx.addIssue({ code: "custom", path: ["decision"], message: "warning refs require warn decision when no refs block" });
    }
    if (report.blocked_refs.length === 0 && report.warning_refs.length === 0 && report.decision !== "pass") {
      ctx.addIssue({ code: "custom", path: ["decision"], message: "clean source checks require pass decision" });
    }
    if (report.decision !== "pass" && report.required_actions.length === 0) {
      ctx.addIssue({ code: "custom", path: ["required_actions"], message: "warn or block decisions require action guidance" });
    }
  });

export type KrnSourceGraph = z.infer<typeof KrnSourceGraphSchema>;
export type KrnSourceCheck = z.infer<typeof KrnSourceCheckSchema>;
export type SourceCheckDecision = z.infer<typeof SourceCheckDecisionSchema>;

export function parseKrnSourceGraph(input: unknown): KrnSourceGraph {
  return KrnSourceGraphSchema.parse(input);
}

export function parseKrnSourceCheck(input: unknown): KrnSourceCheck {
  return KrnSourceCheckSchema.parse(input);
}

export const krnSourceGraphJsonSchema = z.toJSONSchema(KrnSourceGraphSchema, {
  target: "draft-2020-12",
});

export const krnSourceCheckJsonSchema = z.toJSONSchema(KrnSourceCheckSchema, {
  target: "draft-2020-12",
});
