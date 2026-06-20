import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import {
  parseDoctorReport,
  parseInitManifest,
  parseKrnControlPlaneResource,
  parseKrnControlPlaneResourceIndex,
  parseKrnDashboardViewModel,
  parseKrnEvalReport,
  parseKrnReviewReport,
  type ControlPlaneResourceDescriptor,
  type ControlPlaneResourcePayload,
  type KrnControlPlaneResource,
  type KrnControlPlaneResourceIndex,
  type KrnDashboardViewModel,
} from "@krn/contracts";
import { buildKrnPendingReviewViewModel } from "./pending-review-view-model.js";

type ArtifactSpec = {
  uri: string;
  name: string;
  description: string;
  resourceKind: Exclude<ControlPlaneResourceDescriptor["resource_kind"], "runtime_summary">;
  runtimeDir: string;
  fileName: string;
  sourceRefs: readonly string[];
  parse: (input: unknown) => ControlPlaneResourcePayload;
};

const RESOURCE_SOURCE_REFS = [
  "docs/goals/goal-006.md",
  "docs/specs/krn-mcp-read-model/README.md",
  "docs/product/final-product-plan.md",
  "https://developers.openai.com/codex/mcp",
] as const;

const ARTIFACT_SPECS: readonly ArtifactSpec[] = [
  {
    uri: "krn://runtime/init/latest",
    name: "Latest KRN init manifest",
    description: "Latest schema-backed krn init --dry-run manifest.",
    resourceKind: "init_manifest",
    runtimeDir: ".krn/init",
    fileName: "manifest.json",
    sourceRefs: ["docs/specs/krn-init/README.md", "docs/goals/goal-006.md"],
    parse: parseInitManifest,
  },
  {
    uri: "krn://runtime/doctor/latest",
    name: "Latest KRN doctor report",
    description: "Latest schema-backed krn doctor readiness report.",
    resourceKind: "doctor_report",
    runtimeDir: ".krn/doctor",
    fileName: "report.json",
    sourceRefs: ["docs/specs/krn-doctor/README.md", "docs/goals/goal-006.md"],
    parse: parseDoctorReport,
  },
  {
    uri: "krn://runtime/eval/latest",
    name: "Latest KRN eval aggregate",
    description: "Latest schema-backed krn eval aggregate report.",
    resourceKind: "eval_report",
    runtimeDir: ".krn/eval",
    fileName: "report.json",
    sourceRefs: ["docs/specs/krn-eval/README.md", "docs/goals/goal-006.md"],
    parse: parseKrnEvalReport,
  },
  {
    uri: "krn://runtime/review/latest",
    name: "Latest KRN review report",
    description: "Latest schema-backed proposal-only krn review report.",
    resourceKind: "review_report",
    runtimeDir: ".krn/review",
    fileName: "report.json",
    sourceRefs: ["docs/specs/krn-review/README.md", "docs/goals/goal-006.md"],
    parse: parseKrnReviewReport,
  },
] as const;

function readJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function toTargetRelativePath(targetRoot: string, absolutePath: string): string {
  const relativePath = relative(targetRoot, absolutePath).replaceAll("\\", "/");
  if (relativePath.length > 0 && !relativePath.startsWith("..") && !relativePath.startsWith("/")) {
    return relativePath;
  }
  return absolutePath;
}

function latestRuntimeFile(targetRoot: string, runtimeDir: string, fileName: string): string | null {
  const absoluteRuntimeDir = resolve(targetRoot, runtimeDir);
  if (!existsSync(absoluteRuntimeDir) || !statSync(absoluteRuntimeDir).isDirectory()) {
    return null;
  }

  const candidates = readdirSync(absoluteRuntimeDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(absoluteRuntimeDir, entry.name, fileName))
    .filter((candidatePath) => existsSync(candidatePath) && statSync(candidatePath).isFile())
    .sort();

  return candidates.at(-1) ?? null;
}

function baseResource(
  targetRoot: string,
  uri: string,
  name: string,
  resourceKind: ControlPlaneResourceDescriptor["resource_kind"],
  latestReportPath: string | null,
  sourceRefs: readonly string[],
  now: Date,
): Omit<KrnControlPlaneResource, "status" | "payload" | "error_summary"> {
  return {
    schema_version: "krn-control-plane-resource.v1",
    kind: "krn_control_plane_resource",
    uri,
    name,
    target_root: targetRoot,
    generated_at: now.toISOString(),
    resource_kind: resourceKind,
    mime_type: "application/json",
    read_only: true,
    latest_report_path: latestReportPath,
    source_refs: [...sourceRefs],
    interpretation_caveat:
      "This resource exposes read-only local KRN runtime state only; it does not approve proposals, mutate memory/source ledgers, prove productivity lift, or enable destructive MCP/API behavior.",
  };
}

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

function descriptorFromResource(
  resource: KrnControlPlaneResource,
  description: string,
): ControlPlaneResourceDescriptor {
  return {
    uri: resource.uri,
    name: resource.name,
    description,
    resource_kind: resource.resource_kind,
    mime_type: resource.mime_type,
    read_only: resource.read_only,
    status: resource.status,
    latest_report_path: resource.latest_report_path,
    source_refs: resource.source_refs,
  };
}

function loadArtifactResource(targetRoot: string, spec: ArtifactSpec, now: Date): KrnControlPlaneResource {
  const latestPath = latestRuntimeFile(targetRoot, spec.runtimeDir, spec.fileName);
  const latestReportPath = latestPath ? toTargetRelativePath(targetRoot, latestPath) : null;
  const base = baseResource(targetRoot, spec.uri, spec.name, spec.resourceKind, latestReportPath, spec.sourceRefs, now);

  if (!latestPath) {
    return parseKrnControlPlaneResource({
      ...base,
      status: "missing",
      payload: null,
      error_summary: `No ${spec.fileName} found under ${spec.runtimeDir}.`,
    });
  }

  try {
    return parseKrnControlPlaneResource({
      ...base,
      status: "available",
      payload: spec.parse(readJsonFile(latestPath)),
      error_summary: null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown parse error";
    return parseKrnControlPlaneResource({
      ...base,
      status: "invalid",
      payload: null,
      error_summary: `Latest ${spec.resourceKind} resource failed to parse: ${message}`,
    });
  }
}

function summaryItems(resources: readonly KrnControlPlaneResource[]): ControlPlaneResourcePayload & { kind: "runtime_summary" } {
  const items = resources.map((resource) => ({
    uri: resource.uri,
    resource_kind: resource.resource_kind as Exclude<ControlPlaneResourceDescriptor["resource_kind"], "runtime_summary">,
    status: resource.status,
    report_path: resource.latest_report_path,
    summary:
      resource.status === "available"
        ? `${resource.name} is available.`
        : resource.error_summary ?? `${resource.name} is not available.`,
    source_refs: resource.source_refs,
  }));

  return {
    kind: "runtime_summary",
    target_root: resources[0]?.target_root ?? resolve("."),
    generated_at: resources[0]?.generated_at ?? new Date().toISOString(),
    resources: items,
    available_resources: resources.filter((resource) => resource.status === "available").length,
    missing_resources: resources.filter((resource) => resource.status === "missing").length,
    invalid_resources: resources.filter((resource) => resource.status === "invalid").length,
    write_tools_enabled: false,
    proposal_tools_enabled: false,
    next_allowed_surfaces: ["read-only MCP resources", "proposal-only tool contracts", "dashboard view models"],
    blocked_surfaces: ["destructive MCP tools", "unreviewed memory writes", "mocked dashboard state"],
    interpretation_caveat:
      "The summary is a read-only view over local runtime reports; it is not human approval, productivity proof, or permission for destructive tools.",
  };
}

function loadArtifactResources(targetRoot: string, now: Date): KrnControlPlaneResource[] {
  return ARTIFACT_SPECS.map((spec) => loadArtifactResource(targetRoot, spec, now));
}

export function listKrnControlPlaneResources(targetInput = ".", now = new Date()): KrnControlPlaneResourceIndex {
  const targetRoot = resolve(targetInput);
  const artifactResources = loadArtifactResources(targetRoot, now);
  const summaryResource = readKrnControlPlaneResource("krn://runtime/summary", targetRoot, now);
  const resources = [
    descriptorFromResource(summaryResource, "Read-only summary of latest KRN runtime reports."),
    ...artifactResources.map((resource) => {
      const spec = ARTIFACT_SPECS.find((candidate) => candidate.uri === resource.uri);
      return descriptorFromResource(resource, spec?.description ?? resource.name);
    }),
  ];

  const candidateIndex: unknown = {
    schema_version: "krn-control-plane-resource-index.v1",
    kind: "krn_control_plane_resource_index",
    target_root: targetRoot,
    generated_at: now.toISOString(),
    resources,
    summary: {
      total_resources: resources.length,
      available_resources: resources.filter((resource) => resource.status === "available").length,
      missing_resources: resources.filter((resource) => resource.status === "missing").length,
      invalid_resources: resources.filter((resource) => resource.status === "invalid").length,
      write_tools_enabled: false,
      proposal_tools_enabled: false,
    },
    allowlisted_uris: resources.map((resource) => resource.uri),
    source_refs: [...RESOURCE_SOURCE_REFS],
    interpretation_caveat:
      "This index lists read-only KRN control-plane resources only; it does not expose write tools, approve proposals, or prove productivity lift.",
  };

  return parseKrnControlPlaneResourceIndex(candidateIndex);
}

export function readKrnControlPlaneResource(
  uri: string,
  targetInput = ".",
  now = new Date(),
): KrnControlPlaneResource {
  const targetRoot = resolve(targetInput);

  if (uri === "krn://runtime/summary") {
    const artifactResources = loadArtifactResources(targetRoot, now);
    const payload = summaryItems(artifactResources);
    return parseKrnControlPlaneResource({
      ...baseResource(
        targetRoot,
        uri,
        "KRN runtime summary",
        "runtime_summary",
        null,
        RESOURCE_SOURCE_REFS,
        now,
      ),
      status: payload.invalid_resources > 0 ? "invalid" : payload.missing_resources > 0 ? "missing" : "available",
      payload,
      error_summary: null,
    });
  }

  const spec = ARTIFACT_SPECS.find((candidate) => candidate.uri === uri);
  if (!spec) {
    throw new Error(`Unknown KRN control-plane resource URI: ${uri}`);
  }

  return loadArtifactResource(targetRoot, spec, now);
}

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
      "docs/goals/goal-006.md",
      "docs/goals/goal-008.md",
      "docs/specs/krn-dashboard-view-model/README.md",
      "docs/specs/krn-mcp-read-model/README.md",
    ],
    failure_mode:
      "The dashboard view model becomes harmful if it is treated as UI readiness, approval, or productivity proof.",
    interpretation_caveat:
      "This view model is a typed dashboard input over real local KRN runtime resources only; it does not approve proposals, mutate ledgers, prove dashboard UI readiness, or prove productivity lift.",
  });
}
