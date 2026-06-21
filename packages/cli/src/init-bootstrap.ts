import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import {
  parseKrnContextPointerIndex,
  parseKrnControlPlaneProposal,
  parseKrnProposalPromotion,
  parseKrnProposalReviewDecision,
  type ControlPlanePromotionPayload,
  type KrnControlPlaneProposal,
  type KrnProposalPromotion,
  type KrnProposalReviewDecision,
} from "@krn/contracts";
import { storeKrnProposalPromotion } from "@krn/mcp";
import { createRunId } from "./runtime-utils.js";

type InitAgentInstructionsPayload = Extract<
  ControlPlanePromotionPayload,
  { payload_type: "init_agent_instructions" }
>;
type InitLocalConfigPayload = Extract<ControlPlanePromotionPayload, { payload_type: "init_local_config" }>;
type InitSourcePointersPayload = Extract<ControlPlanePromotionPayload, { payload_type: "init_source_pointers" }>;
type InitContextPointersPayload = Extract<ControlPlanePromotionPayload, { payload_type: "init_context_pointers" }>;
type InitBootstrapPayload =
  | InitAgentInstructionsPayload
  | InitLocalConfigPayload
  | InitSourcePointersPayload
  | InitContextPointersPayload;
export type InitBootstrapCapability = InitBootstrapPayload["bootstrap_capability"];

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function readJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function toTargetRelativePath(targetRoot: string, inputPath: string): string {
  return relative(targetRoot, resolve(targetRoot, inputPath)).replaceAll("\\", "/");
}

function resolveTargetLocalPath(targetRoot: string, inputPath: string): string {
  const candidatePath = resolve(targetRoot, inputPath);
  const relativePath = relative(targetRoot, candidatePath);
  if (relativePath.length > 0 && (relativePath.startsWith("..") || relativePath.startsWith("/"))) {
    throw new Error(`krn init apply path must stay inside target root: ${inputPath}`);
  }
  return candidatePath;
}

function agentInstructionsFileContent(): string {
  return `# Agent Instructions

This repository is KRN-enabled.

## Operating Rules

- Newest user message wins over repo-local instructions.
- Treat \`.krn/**\` as runtime evidence/cache/ledger, not authoritative memory.
- Before non-trivial agent work, use KRN gate/context commands when available and keep generated artifacts as runtime evidence.
- Keep changes surgical, verify through existing repo tests/checks, and do not overwrite unrelated files.
- Do not store secrets, private raw transcripts, or unreviewed claims in agent context.
`;
}

function localConfigFileContent(): string {
  return `schema_version = "krn-local-config.v1"
mode = "local-first"

[runtime]
root = ".krn"
evidence_root = ".krn"
source_graph = ".krn/sources/index.json"
context_root = ".krn/context"
eval_lane = "current"
memory_store_env = "KRN_MEMORY_STORE_PATH"

[boundaries]
docs_memory = "pattern_bank_audit_export"
krn_runtime = "evidence_cache_ledger"
memory_core = "external_local_store"
target_writes = "reviewed_promotion_only"
api_sync = "disabled"
dashboard = "disabled"
`;
}

function sourcePointersFileContent(): string {
  return `${JSON.stringify(
    {
      schema_version: "krn-source-graph.v1",
      kind: "krn_source_graph",
      graph_id: "krn-init-source-graph-seed",
      created_at: "1970-01-01T00:00:00.000Z",
      records: [
        {
          schema_version: "krn-source-record.v1",
          kind: "krn_source_record",
          id: "bootstrap-source-policy",
          ref: "krn://source/bootstrap-policy",
          type: "runtime_evidence",
          status: "unverified",
          freshness: "unknown",
          confidence: "medium",
          owner: "krn init",
          last_verified_at: null,
          supports_decisions: ["source_graph_seed"],
          conflicts_with: [],
          invalidation_rule: "Replace this seed with reviewed project sources before claiming source-backed decisions.",
          source_refs: ["krn://source/bootstrap-policy"],
        },
      ],
      source_refs: ["krn://source/bootstrap-policy"],
      overclaim_boundary:
        "This seed is a source graph boundary only; it is not a copied bibliography, active source list, or proof of source freshness.",
    },
    null,
    2,
  )}\n`;
}

function contextPointersFileContent(): string {
  return `${JSON.stringify(
    parseKrnContextPointerIndex({
      schema_version: "krn-context-pointer-index.v1",
      kind: "krn_context_pointer_index",
      pointer_id: "krn-init-context-pointer-seed",
      created_at: "1970-01-01T00:00:00.000Z",
      runtime_root: ".krn/context",
      packet_glob: ".krn/context/*/context-packet.json",
      latest_packet_ref: null,
      build_command: "krn context build --task <text> [--path <path>]",
      memory_policy: {
        store_memory_bodies: false,
        require_selected_memory_ids: true,
        require_application_guidance: true,
        max_selected_context: 5,
      },
      rejected_context_refs: ["docs/memory/** full scan", "historical benchmark/lab goals by default"],
      source_refs: ["krn://context/bootstrap-policy"],
      overclaim_boundary:
        "This seed points to bounded context packet runtime locations only; it is not an active context packet, memory body store, task intent, or proof of context quality.",
    }),
    null,
    2,
  )}\n`;
}

export function buildInitAgentInstructionsPayload(targetPath: string): InitAgentInstructionsPayload {
  const fileContent = agentInstructionsFileContent();
  return {
    payload_type: "init_agent_instructions",
    bootstrap_capability: "agent_instructions",
    target_path: targetPath,
    write_mode: "exact_file_content",
    file_content: fileContent,
    content_sha256: sha256(fileContent),
  };
}

export function buildInitLocalConfigPayload(targetPath: string): InitLocalConfigPayload {
  const fileContent = localConfigFileContent();
  return {
    payload_type: "init_local_config",
    bootstrap_capability: "local_config",
    target_path: targetPath,
    write_mode: "exact_file_content",
    file_content: fileContent,
    content_sha256: sha256(fileContent),
  };
}

export function buildInitSourcePointersPayload(targetPath: string): InitSourcePointersPayload {
  const fileContent = sourcePointersFileContent();
  return {
    payload_type: "init_source_pointers",
    bootstrap_capability: "source_pointers",
    target_path: targetPath,
    write_mode: "exact_file_content",
    file_content: fileContent,
    content_sha256: sha256(fileContent),
  };
}

export function buildInitContextPointersPayload(targetPath: string): InitContextPointersPayload {
  const fileContent = contextPointersFileContent();
  return {
    payload_type: "init_context_pointers",
    bootstrap_capability: "context_pointers",
    target_path: targetPath,
    write_mode: "exact_file_content",
    file_content: fileContent,
    content_sha256: sha256(fileContent),
  };
}

export function buildInitBootstrapPayload(capability: InitBootstrapCapability, targetPath: string): InitBootstrapPayload {
  switch (capability) {
    case "agent_instructions":
      return buildInitAgentInstructionsPayload(targetPath);
    case "local_config":
      return buildInitLocalConfigPayload(targetPath);
    case "source_pointers":
      return buildInitSourcePointersPayload(targetPath);
    case "context_pointers":
      return buildInitContextPointersPayload(targetPath);
  }
}

function assertInitBootstrapPayload(proposal: KrnControlPlaneProposal): void {
  if (proposal.proposal_kind !== "init_bootstrap") {
    throw new Error(`krn init apply requires an init_bootstrap proposal: ${proposal.proposal_kind}`);
  }
  if (
    proposal.promotion_payload?.payload_type !== "init_agent_instructions" &&
    proposal.promotion_payload?.payload_type !== "init_local_config" &&
    proposal.promotion_payload?.payload_type !== "init_source_pointers" &&
    proposal.promotion_payload?.payload_type !== "init_context_pointers"
  ) {
    throw new Error(`krn init apply requires an init bootstrap payload: ${proposal.proposal_id}`);
  }
}

export function buildInitPromotion(
  proposal: KrnControlPlaneProposal,
  proposalPath: string,
  decision: KrnProposalReviewDecision,
  decisionPath: string,
  now = new Date(),
): KrnProposalPromotion {
  assertInitBootstrapPayload(proposal);
  const payload = proposal.promotion_payload;
  if (
    !payload ||
    (payload.payload_type !== "init_agent_instructions" &&
      payload.payload_type !== "init_local_config" &&
      payload.payload_type !== "init_source_pointers" &&
      payload.payload_type !== "init_context_pointers")
  ) {
    throw new Error(`krn init apply requires an init bootstrap payload: ${proposal.proposal_id}`);
  }

  return parseKrnProposalPromotion({
    schema_version: "krn-proposal-promotion.v1",
    kind: "krn_proposal_promotion",
    promotion_id: `promotion-${proposal.proposal_id}-${createRunId(now)}`,
    proposal_id: proposal.proposal_id,
    proposal_path: proposalPath,
    decision_id: decision.decision_id,
    decision_path: decisionPath,
    proposal_kind: "init_bootstrap",
    promotion_scope: "approved_init_bootstrap_only",
    apply_mode: "apply_exact_target_write",
    promotion_state: "applied",
    target_mutated: true,
    target: {
      target_type: "path",
      path: payload.target_path,
      write_mode: "exact_file_content",
      file_content: payload.file_content,
      content_sha256: payload.content_sha256,
    },
    write_policy: {
      default_effect: "record_only",
      allowed_effects: ["append_promotion_record", "write_exact_target_content"],
      idempotency_key: `init-bootstrap-apply:${proposal.proposal_id}:${decision.decision_id}`,
    },
    evidence_refs: [...new Set([...proposal.evidence_refs, ...decision.evidence_refs])],
    source_refs: [...new Set([...proposal.source_refs, ...decision.source_refs])],
    blocked_surfaces: [
      "target_overwrite",
      "memory_core_write",
      "source_ledger_mutation",
      "dashboard_event_publish",
      "broad_api_cloud_sync",
    ],
    created_at: now.toISOString(),
    created_by: "krn init",
    interpretation_caveat:
      "This promotion applies one reviewed init bootstrap payload only; it does not prove broad repo bootstrap, merge-mode safety, memory-core quality, dashboard/API readiness, or productivity lift.",
  });
}

export function applyInitProposal(
  targetInput: string,
  proposalPathInput: string,
  decisionPathInput: string,
  now = new Date(),
): string {
  const targetRoot = resolve(targetInput);
  const absoluteProposalPath = resolveTargetLocalPath(targetRoot, proposalPathInput);
  const absoluteDecisionPath = resolveTargetLocalPath(targetRoot, decisionPathInput);
  const proposal = parseKrnControlPlaneProposal(readJsonFile(absoluteProposalPath));
  const decision = parseKrnProposalReviewDecision(readJsonFile(absoluteDecisionPath));
  const promotion = buildInitPromotion(
    proposal,
    toTargetRelativePath(targetRoot, proposalPathInput),
    decision,
    toTargetRelativePath(targetRoot, decisionPathInput),
    now,
  );
  const stored = storeKrnProposalPromotion(promotion, { targetInput, now });
  return resolve(targetInput, stored.promotion_path);
}
