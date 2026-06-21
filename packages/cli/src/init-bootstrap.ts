import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import {
  parseKrnControlPlaneProposal,
  parseKrnProposalPromotion,
  parseKrnProposalReviewDecision,
  type KrnControlPlaneProposal,
  type KrnProposalPromotion,
  type KrnProposalReviewDecision,
} from "@krn/contracts";
import { storeKrnProposalPromotion } from "@krn/mcp";
import { createRunId } from "./runtime-utils.js";

export { buildInitBootstrapPayload, type InitBootstrapCapability } from "./init-bootstrap-payloads.js";

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

function assertInitBootstrapPayload(proposal: KrnControlPlaneProposal): void {
  if (proposal.proposal_kind !== "init_bootstrap") {
    throw new Error(`krn init apply requires an init_bootstrap proposal: ${proposal.proposal_kind}`);
  }
  if (
    proposal.promotion_payload?.payload_type !== "init_agent_instructions" &&
    proposal.promotion_payload?.payload_type !== "init_local_config" &&
    proposal.promotion_payload?.payload_type !== "init_source_pointers" &&
    proposal.promotion_payload?.payload_type !== "init_context_pointers" &&
    proposal.promotion_payload?.payload_type !== "init_eval_baseline" &&
    proposal.promotion_payload?.payload_type !== "init_skill_wiring" &&
    proposal.promotion_payload?.payload_type !== "init_policy_boundaries"
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
      payload.payload_type !== "init_context_pointers" &&
      payload.payload_type !== "init_eval_baseline" &&
      payload.payload_type !== "init_skill_wiring" &&
      payload.payload_type !== "init_policy_boundaries")
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
