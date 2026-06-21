import { resolve } from "node:path";
import {
  parseKrnDashboardViewModel,
  type ControlPlaneResourceDescriptor,
  type KrnControlPlaneResourceIndex,
  type KrnDashboardViewModel,
} from "@krn/contracts";
import { buildKrnPendingReviewViewModel } from "./pending-review-view-model.js";
import { listKrnControlPlaneResources } from "./read-model.js";

export { listKrnControlPlaneResources, readKrnControlPlaneResource } from "./read-model.js";

export {
  listKrnProposalStoreRecords,
  storeKrnControlPlaneProposal,
  validateSourceRefs,
  validateProposalSourceRefs,
  type InvalidProposalStoreRecord,
  type ProposalStoreRecordList,
  type ProposalStoreResult,
  type SourceRefValidationResult,
  type ValidProposalStoreRecord,
} from "./proposal-store.js";
export {
  listKrnProposalReviewDecisionStoreRecords,
  storeKrnProposalReviewDecision,
  type InvalidProposalReviewDecisionStoreRecord,
  type ProposalReviewDecisionStoreRecordList,
  type ProposalReviewDecisionStoreResult,
  type ValidProposalReviewDecisionStoreRecord,
} from "./proposal-review-decision-store.js";
export {
  listKrnProposalPromotionStoreRecords,
  storeKrnProposalPromotion,
  type InvalidProposalPromotionStoreRecord,
  type ProposalPromotionStoreRecordList,
  type ProposalPromotionStoreResult,
  type ValidProposalPromotionStoreRecord,
} from "./proposal-promotion-store.js";
export { buildKrnPendingReviewViewModel } from "./pending-review-view-model.js";
export { buildKrnPromotionReviewViewModel } from "./promotion-review-view-model.js";
export { buildKrnEvalRunsViewModel } from "./eval-runs-view-model.js";
export { buildKrnBenchmarkReportsViewModel } from "./benchmark-reports-view-model.js";

export {
  KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
  KrnControlPlaneProposalSchema,
  KrnMcpProposalToolResultSchema,
  parseKrnMcpProposalToolResult,
  type KrnMcpProposalToolResult,
} from "@krn/contracts";

function dashboardResourceHealthStatus(summary: KrnControlPlaneResourceIndex["summary"]): "ready" | "degraded" | "blocked" {
  if (summary.invalid_resources > 0) {
    return "blocked";
  }
  if (summary.missing_resources > 0) {
    return "degraded";
  }
  return "ready";
}

function runtimeArtifactId(uri: string): string {
  return uri.replace(/^krn:\/\/runtime\//, "runtime-").replaceAll("/", "-");
}

function runtimeArtifactSummary(descriptor: ControlPlaneResourceDescriptor): string {
  if (descriptor.status === "available") {
    return `${descriptor.name} is available.`;
  }
  if (descriptor.status === "missing") {
    return `${descriptor.name} is missing.`;
  }
  return `${descriptor.name} is invalid.`;
}

function pendingReviewFromStore(targetRoot: string, now: Date): {
  pendingProposals: number;
  source: "proposal_store" | "explicit_zero_no_proposals";
  sourceRefs: string[];
} {
  const pendingReview = buildKrnPendingReviewViewModel(targetRoot, now);
  return {
    pendingProposals: pendingReview.pending_proposals,
    source: pendingReview.source,
    sourceRefs: pendingReview.source_refs,
  };
}

function dashboardNextAllowedAction(
  summary: KrnControlPlaneResourceIndex["summary"],
  pendingProposals: number,
  sourceRefs: readonly string[],
): KrnDashboardViewModel["next_allowed_action"] {
  if (summary.invalid_resources > 0 || summary.missing_resources > 0) {
    return {
      action_id: "repair-runtime-artifacts",
      target_surface: "runtime_artifacts",
      label: "Repair missing or invalid runtime artifacts",
      rationale: "The dashboard view model must not render missing or invalid runtime artifacts as ready.",
      source_refs: [...sourceRefs],
    };
  }

  if (pendingProposals > 0) {
    return {
      action_id: "review-pending-proposals",
      target_surface: "pending_review",
      label: "Review pending proposal records",
      rationale: "The proposal store contains proposal-only items that require human review before promotion.",
      source_refs: [...sourceRefs],
    };
  }

  return {
    action_id: "continue-dashboard-view-model-contract",
    target_surface: "dashboard_view_model",
    label: "Continue dashboard view-model contract work",
    rationale: "Runtime artifacts are ready and no pending review proposals are available from the proposal store.",
    source_refs: [...sourceRefs],
  };
}

export function buildKrnDashboardViewModel(targetInput = ".", now = new Date()): KrnDashboardViewModel {
  const targetRoot = resolve(targetInput);
  const index = listKrnControlPlaneResources(targetRoot, now);
  const pendingReview = pendingReviewFromStore(targetRoot, now);
  const artifactDescriptors = index.resources.filter((resource) => resource.resource_kind !== "runtime_summary");

  return parseKrnDashboardViewModel({
    schema_version: "krn-dashboard-view-model.v1",
    kind: "krn_dashboard_view_model",
    target_root: targetRoot,
    generated_at: now.toISOString(),
    no_mock_state: true,
    resource_health: {
      owner: "krn",
      source_refs: index.source_refs,
      next_action:
        index.summary.invalid_resources > 0 || index.summary.missing_resources > 0
          ? "Repair runtime artifacts before rendering dashboard readiness."
          : "Use the available runtime artifacts as dashboard source rows.",
      failure_mode:
        "Dashboard resource health is overclaimed if any count is invented or detached from the MCP read model.",
      status: dashboardResourceHealthStatus(index.summary),
      total_resources: index.summary.total_resources,
      available_resources: index.summary.available_resources,
      missing_resources: index.summary.missing_resources,
      invalid_resources: index.summary.invalid_resources,
    },
    latest_runtime_artifacts: artifactDescriptors.map((descriptor) => ({
      owner: "krn",
      source_refs: descriptor.source_refs,
      next_action:
        descriptor.status === "available"
          ? "Keep this runtime artifact read-only until a proposal tool contract exists."
          : "Repair this runtime artifact before relying on it in dashboard review.",
      failure_mode:
        "Dashboard artifact rows become misleading if missing or invalid reports are rendered as ready.",
      id: runtimeArtifactId(descriptor.uri),
      resource_uri: descriptor.uri,
      resource_kind: descriptor.resource_kind,
      status: descriptor.status,
      latest_report_path: descriptor.latest_report_path,
      title: descriptor.name,
      summary: runtimeArtifactSummary(descriptor),
    })),
    pending_review: {
      owner: "krn",
      source_refs: pendingReview.sourceRefs,
      next_action:
        pendingReview.pendingProposals > 0
          ? "Review proposal-store records before promoting any memory or source changes."
          : "Keep pending review count explicit until proposal-store records exist.",
      failure_mode:
        "Pending review count is unsafe if it is inferred from chat or hidden state instead of the proposal store.",
      pending_proposals: pendingReview.pendingProposals,
      source: pendingReview.source,
    },
    next_allowed_action: dashboardNextAllowedAction(index.summary, pendingReview.pendingProposals, pendingReview.sourceRefs),
    source_refs: [
      "docs/specs/krn-dashboard-view-model/README.md",
      "docs/specs/krn-mcp-read-model/README.md",
    ],
    failure_mode:
      "The dashboard view model becomes harmful if it is treated as UI readiness, approval, or productivity proof.",
    interpretation_caveat:
      "This view model is a typed dashboard input over real local KRN runtime resources only; it does not approve proposals, mutate ledgers, prove dashboard UI readiness, or prove productivity lift.",
  });
}
