import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import {
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

function assertInitAgentInstructionsPayload(proposal: KrnControlPlaneProposal): void {
  if (proposal.proposal_kind !== "init_bootstrap") {
    throw new Error(`krn init apply requires an init_bootstrap proposal: ${proposal.proposal_kind}`);
  }
  if (proposal.promotion_payload?.payload_type !== "init_agent_instructions") {
    throw new Error(`krn init apply requires an init_agent_instructions payload: ${proposal.proposal_id}`);
  }
}

export function buildInitPromotion(
  proposal: KrnControlPlaneProposal,
  proposalPath: string,
  decision: KrnProposalReviewDecision,
  decisionPath: string,
  now = new Date(),
): KrnProposalPromotion {
  assertInitAgentInstructionsPayload(proposal);
  const payload = proposal.promotion_payload;
  if (!payload || payload.payload_type !== "init_agent_instructions") {
    throw new Error(`krn init apply requires an init_agent_instructions payload: ${proposal.proposal_id}`);
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
      "This promotion applies one reviewed init agent-instructions payload only; it does not prove broad repo bootstrap, merge-mode safety, memory-core quality, dashboard/API readiness, or productivity lift.",
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
