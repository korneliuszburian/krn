import { resolve } from "node:path";
import {
  parseKrnControlPlaneProposal,
  type ControlPlaneProposalKind,
  type InitManifest,
  type KrnControlPlaneProposal,
} from "@krn/contracts";
import { storeKrnControlPlaneProposal } from "@krn/mcp";
import { buildInitBootstrapPayload } from "./init-bootstrap.js";
import {
  initProposalTarget,
  type InitProposalCapability,
} from "./init-targets.js";

function manifestRuntimePath(manifest: InitManifest): string {
  const runtimeManifestFile = manifest.planned_files.find((file) => file.path.endsWith("/manifest.json"));
  if (!runtimeManifestFile) {
    throw new Error("Init manifest is missing its runtime manifest file entry");
  }
  return runtimeManifestFile.path;
}

export function buildInitProposal(manifest: InitManifest, capability: InitProposalCapability): KrnControlPlaneProposal {
  const target = initProposalTarget(capability);
  const bootstrapItem = manifest.bootstrap_plan.find((item) => item.capability === capability);
  if (!bootstrapItem) {
    throw new Error(`Init manifest is missing bootstrap capability: ${capability}`);
  }

  const proposalKind: ControlPlaneProposalKind = "init_bootstrap";
  const evidenceRef = manifestRuntimePath(manifest);
  const proposalId = `init-bootstrap-${capability}-${manifest.run_id}`;
  const actionSummary =
    bootstrapItem.action === "skip"
      ? "review the existing target file and preserve it unless a later explicit merge proposal is approved"
      : "review a future exact-file proposal before any target mutation";
  const promotionPayload =
    bootstrapItem.action === "skip" ? undefined : buildInitBootstrapPayload(capability, bootstrapItem.path);

  return parseKrnControlPlaneProposal({
    schema_version: "krn-control-plane-proposal.v1",
    kind: "krn_control_plane_proposal",
    proposal_id: proposalId,
    proposal_kind: proposalKind,
    status: "proposal_only",
    title: `Review KRN init ${target.label} bootstrap`,
    rationale: `KRN needs reviewed bootstrap targets before write mode. ${target.description}`,
    proposed_change: `For ${bootstrapItem.path}, ${actionSummary}. Capability purpose: ${bootstrapItem.purpose} Boundary: ${bootstrapItem.boundary}`,
    promotion_payload: promotionPayload,
    target: {
      target_type: "path",
      path: bootstrapItem.path,
    },
    write_policy: {
      default_effect: "no_mutation",
      allowed_persistence: "append_only",
      idempotency_key: `init-bootstrap:${capability}:${manifest.run_id}`,
    },
    review_gate: {
      required: true,
      state: "not_reviewed",
      reviewer: null,
    },
    evidence_refs: [evidenceRef],
    source_refs: [evidenceRef],
    blocked_surfaces: [
      "target_file_mutation",
      "memory_core_write",
      "source_ledger_mutation",
      "dashboard_event_publish",
      "broad_api_cloud_sync",
    ],
    created_at: manifest.created_at,
    created_by: "krn init",
    interpretation_caveat:
      "This init proposal is append-only review input for one bootstrap capability; it does not mutate target setup files, approve write mode, create memory core, publish a dashboard event, or prove productivity lift.",
  });
}

export function writeInitProposal(
  targetInput: string,
  manifest: InitManifest,
  capability: InitProposalCapability,
): string {
  const proposal = buildInitProposal(manifest, capability);
  const stored = storeKrnControlPlaneProposal(proposal, { targetInput, now: new Date(manifest.created_at) });
  return resolve(targetInput, stored.proposal_path);
}
