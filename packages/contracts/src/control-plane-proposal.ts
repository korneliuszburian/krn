import { z } from "zod";

const SourceRefSchema = z.string().min(1);
const EvidenceRefSchema = z.string().min(1);

const ControlPlaneProposalKindSchema = z.enum([
  "init_bootstrap",
  "memory_update",
  "source_claim_update",
  "goal_update",
  "eval_request",
  "repair_record",
  "dashboard_event",
]);

const ProposalTargetSchema = z.discriminatedUnion("target_type", [
  z
    .object({
      target_type: z.literal("path"),
      path: z.string().min(1),
    })
    .strict(),
  z
    .object({
      target_type: z.literal("resource_uri"),
      uri: z.string().min(1),
    })
    .strict(),
]);

const ProposalReviewGateSchema = z
  .object({
    required: z.literal(true),
    state: z.literal("not_reviewed"),
    reviewer: z.string().min(1).nullable(),
  })
  .strict();

const ProposalWritePolicySchema = z
  .object({
    default_effect: z.literal("no_mutation"),
    allowed_persistence: z.literal("append_only"),
    idempotency_key: z.string().min(1),
  })
  .strict();

const MemoryPromotionPayloadSchema = z
  .object({
    payload_type: z.literal("memory_entry"),
    target_path: z.string().min(1),
    write_mode: z.literal("exact_file_content"),
    file_content: z.string().min(1),
    content_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

const InitAgentInstructionsPromotionPayloadSchema = z
  .object({
    payload_type: z.literal("init_agent_instructions"),
    bootstrap_capability: z.literal("agent_instructions"),
    target_path: z.string().min(1),
    write_mode: z.literal("exact_file_content"),
    file_content: z.string().min(1),
    content_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

const InitLocalConfigPromotionPayloadSchema = z
  .object({
    payload_type: z.literal("init_local_config"),
    bootstrap_capability: z.literal("local_config"),
    target_path: z.string().min(1),
    write_mode: z.literal("exact_file_content"),
    file_content: z.string().min(1),
    content_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

const InitSourcePointersPromotionPayloadSchema = z
  .object({
    payload_type: z.literal("init_source_pointers"),
    bootstrap_capability: z.literal("source_pointers"),
    target_path: z.string().min(1),
    write_mode: z.literal("exact_file_content"),
    file_content: z.string().min(1),
    content_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

const InitContextPointersPromotionPayloadSchema = z
  .object({
    payload_type: z.literal("init_context_pointers"),
    bootstrap_capability: z.literal("context_pointers"),
    target_path: z.string().min(1),
    write_mode: z.literal("exact_file_content"),
    file_content: z.string().min(1),
    content_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

const InitEvalBaselinePromotionPayloadSchema = z
  .object({
    payload_type: z.literal("init_eval_baseline"),
    bootstrap_capability: z.literal("eval_baseline"),
    target_path: z.string().min(1),
    write_mode: z.literal("exact_file_content"),
    file_content: z.string().min(1),
    content_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

const PromotionPayloadSchema = z.discriminatedUnion("payload_type", [
  MemoryPromotionPayloadSchema,
  InitAgentInstructionsPromotionPayloadSchema,
  InitLocalConfigPromotionPayloadSchema,
  InitSourcePointersPromotionPayloadSchema,
  InitContextPointersPromotionPayloadSchema,
  InitEvalBaselinePromotionPayloadSchema,
]);

export const KrnControlPlaneProposalSchema = z
  .object({
    schema_version: z.literal("krn-control-plane-proposal.v1"),
    kind: z.literal("krn_control_plane_proposal"),
    proposal_id: z.string().min(1),
    proposal_kind: ControlPlaneProposalKindSchema,
    status: z.literal("proposal_only"),
    title: z.string().min(1),
    rationale: z.string().min(1),
    proposed_change: z.string().min(1),
    promotion_payload: PromotionPayloadSchema.optional(),
    target: ProposalTargetSchema,
    write_policy: ProposalWritePolicySchema,
    review_gate: ProposalReviewGateSchema,
    evidence_refs: z.array(EvidenceRefSchema).min(1),
    source_refs: z.array(SourceRefSchema).min(1),
    blocked_surfaces: z.array(z.string().min(1)).min(1),
    created_at: z.string().min(1),
    created_by: z.string().min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict()
  .superRefine((proposal, context) => {
    if (proposal.promotion_payload?.payload_type === "memory_entry" && proposal.proposal_kind !== "memory_update") {
      context.addIssue({
        code: "custom",
        path: ["promotion_payload"],
        message: "memory_entry promotion payload is supported only for memory_update proposals",
      });
    }

    if (
      (proposal.promotion_payload?.payload_type === "init_agent_instructions" ||
        proposal.promotion_payload?.payload_type === "init_local_config" ||
        proposal.promotion_payload?.payload_type === "init_source_pointers" ||
        proposal.promotion_payload?.payload_type === "init_context_pointers" ||
        proposal.promotion_payload?.payload_type === "init_eval_baseline") &&
      proposal.proposal_kind !== "init_bootstrap"
    ) {
      context.addIssue({
        code: "custom",
        path: ["promotion_payload"],
        message: "init bootstrap promotion payloads are supported only for init_bootstrap proposals",
      });
    }

    if (
      proposal.promotion_payload?.payload_type === "init_eval_baseline" &&
      proposal.promotion_payload.target_path !== ".krn/evals/baseline.json"
    ) {
      context.addIssue({
        code: "custom",
        path: ["promotion_payload", "target_path"],
        message: "init eval baseline payload must target .krn/evals/baseline.json",
      });
    }

    if (
      proposal.promotion_payload?.payload_type === "init_context_pointers" &&
      proposal.promotion_payload.target_path !== ".krn/context/index.json"
    ) {
      context.addIssue({
        code: "custom",
        path: ["promotion_payload", "target_path"],
        message: "init context pointers payload must target .krn/context/index.json",
      });
    }

    if (
      proposal.promotion_payload?.payload_type === "init_source_pointers" &&
      proposal.promotion_payload.target_path !== ".krn/sources/index.json"
    ) {
      context.addIssue({
        code: "custom",
        path: ["promotion_payload", "target_path"],
        message: "init source pointers payload must target .krn/sources/index.json",
      });
    }

    if (
      proposal.promotion_payload?.payload_type === "init_agent_instructions" &&
      proposal.promotion_payload.target_path !== "AGENTS.md"
    ) {
      context.addIssue({
        code: "custom",
        path: ["promotion_payload", "target_path"],
        message: "init agent instructions payload must target AGENTS.md",
      });
    }

    if (
      proposal.promotion_payload?.payload_type === "init_local_config" &&
      proposal.promotion_payload.target_path !== ".krn/config.toml"
    ) {
      context.addIssue({
        code: "custom",
        path: ["promotion_payload", "target_path"],
        message: "init local config payload must target .krn/config.toml",
      });
    }

    if (
      proposal.promotion_payload &&
      proposal.target.target_type === "path" &&
      proposal.promotion_payload.target_path !== proposal.target.path
    ) {
      context.addIssue({
        code: "custom",
        path: ["promotion_payload", "target_path"],
        message: "promotion payload target_path must match proposal target.path",
      });
    }
  });

export type ControlPlaneProposalKind = z.infer<typeof ControlPlaneProposalKindSchema>;
export type ControlPlaneProposalTarget = z.infer<typeof ProposalTargetSchema>;
export type ControlPlanePromotionPayload = z.infer<typeof PromotionPayloadSchema>;
export type KrnControlPlaneProposal = z.infer<typeof KrnControlPlaneProposalSchema>;

export function parseKrnControlPlaneProposal(input: unknown): KrnControlPlaneProposal {
  return KrnControlPlaneProposalSchema.parse(input);
}

export const krnControlPlaneProposalJsonSchema = z.toJSONSchema(KrnControlPlaneProposalSchema, {
  target: "draft-2020-12",
});
