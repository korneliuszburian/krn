import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import {
  parseKrnControlPlaneProposal,
  parseInitManifest,
  type ControlPlaneProposalKind,
  type InitManifest,
  type KrnControlPlaneProposal,
} from "@krn/contracts";
import { storeKrnControlPlaneProposal } from "@krn/mcp";
import {
  applyInitProposal,
  buildInitBootstrapPayload,
  type InitBootstrapCapability,
} from "./init-bootstrap.js";
import { createRunId, pathKind } from "./runtime-utils.js";

type InitProposalCapability = InitBootstrapCapability;

const INIT_PROPOSAL_CAPABILITIES = [
  "agent_instructions",
  "local_config",
  "source_pointers",
  "context_pointers",
  "eval_baseline",
] as const satisfies readonly InitProposalCapability[];

type InitArgs = {
  target: string;
} & (
  | {
      mode: "dry-run";
    }
  | {
      mode: "proposal";
      capability: InitProposalCapability;
    }
  | {
      mode: "apply";
      capability: InitProposalCapability;
      proposalPath: string;
      decisionPath: string;
    }
);

export type InitCliResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

const DETECTED_PATHS = [
  { path: "AGENTS.md", expectedKind: "file" },
  { path: ".krn/config.toml", expectedKind: "file" },
  { path: ".krn/sources/index.json", expectedKind: "file" },
  { path: ".krn/context/index.json", expectedKind: "file" },
  { path: ".krn/evals/baseline.json", expectedKind: "file" },
  { path: ".codex", expectedKind: "directory" },
  { path: ".agents", expectedKind: "directory" },
  { path: "docs/memory/INDEX.md", expectedKind: "file" },
  { path: ".krn", expectedKind: "directory" },
] as const;

function initCapabilityList(): string {
  return INIT_PROPOSAL_CAPABILITIES.join(", ");
}

function parseInitCapability(value: string, mode: "proposal" | "apply"): InitProposalCapability {
  if (INIT_PROPOSAL_CAPABILITIES.includes(value as InitProposalCapability)) {
    return value as InitProposalCapability;
  }
  throw new Error(`krn init ${mode} currently supports only: ${initCapabilityList()}`);
}

export function parseInitArgs(argv: readonly string[]): InitArgs {
  if (argv[0] !== "init") {
    throw new Error("Expected command: init");
  }

  let target = ".";
  let sawDryRun = false;
  let proposalCapability: InitProposalCapability | null = null;
  let applyCapability: InitProposalCapability | null = null;
  let proposalPath: string | null = null;
  let decisionPath: string | null = null;

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      sawDryRun = true;
      continue;
    }

    if (arg === "--proposal") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --proposal");
      }
      proposalCapability = parseInitCapability(value, "proposal");
      index += 1;
      continue;
    }

    if (arg === "--apply") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --apply");
      }
      applyCapability = parseInitCapability(value, "apply");
      index += 1;
      continue;
    }

    if (arg === "--proposal-path") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --proposal-path");
      }
      proposalPath = value;
      index += 1;
      continue;
    }

    if (arg === "--decision-path") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --decision-path");
      }
      decisionPath = value;
      index += 1;
      continue;
    }

    if (arg === "--target") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --target");
      }
      target = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg ?? "<empty>"}`);
  }

  if (sawDryRun && proposalCapability) {
    throw new Error("krn init accepts either --dry-run or --proposal, not both");
  }

  if ((sawDryRun || proposalCapability) && applyCapability) {
    throw new Error("krn init accepts only one of --dry-run, --proposal, or --apply");
  }

  if ((proposalPath || decisionPath) && !applyCapability) {
    throw new Error("--proposal-path and --decision-path are only valid with --apply");
  }

  if (applyCapability) {
    if (!proposalPath || !decisionPath) {
      throw new Error("krn init --apply requires --proposal-path and --decision-path");
    }
    return { target, mode: "apply", capability: applyCapability, proposalPath, decisionPath };
  }

  if (proposalCapability) {
    return { target, mode: "proposal", capability: proposalCapability };
  }

  if (!sawDryRun) {
    throw new Error(`krn init currently requires --dry-run or --proposal ${initCapabilityList()}`);
  }

  return { target, mode: "dry-run" };
}

function artifactReason(relativePath: string, exists: boolean): string {
  if (!exists) {
    return `${relativePath} is absent and can be planned safely.`;
  }

  switch (relativePath) {
    case "AGENTS.md":
      return "Root Codex instructions already exist and must not be overwritten by dry-run init.";
    case ".krn/config.toml":
      return "KRN local config already exists and must not be overwritten by dry-run init.";
    case ".krn/sources/index.json":
      return "KRN source graph seed already exists and must not be overwritten by dry-run init.";
    case ".krn/context/index.json":
      return "KRN context pointer index already exists and must not be overwritten by dry-run init.";
    case ".krn/evals/baseline.json":
      return "KRN eval baseline seed already exists and must not be overwritten by dry-run init.";
    case ".codex":
      return "Project-local Codex config/hooks directory already exists.";
    case ".agents":
      return "Repo-local skill directory already exists.";
    case "docs/memory/INDEX.md":
      return "Reviewed memory index already exists.";
    case ".krn":
      return "KRN runtime artifact directory already exists.";
    default:
      return `${relativePath} exists in the target project.`;
  }
}

function plannedAction(exists: boolean): "create" | "skip" | "proposal_only" {
  return exists ? "skip" : "create";
}

function collisionStrategy(exists: boolean): "skip" | "merge_required" | "proposal_only" {
  return exists ? "skip" : "proposal_only";
}

export function buildInitManifest(targetInput: string, now = new Date()): InitManifest {
  const targetRoot = resolve(targetInput);
  const runId = createRunId(now);
  const runtimeManifestPath = `.krn/init/${runId}/manifest.json`;

  const detectedArtifacts = DETECTED_PATHS.map((artifact) => {
    const kind = pathKind(targetRoot, artifact.path);
    const exists = kind !== "missing";

    return {
      path: artifact.path,
      kind,
      exists,
      reason: artifactReason(artifact.path, exists),
    };
  });

  const agentsExists = detectedArtifacts.find((artifact) => artifact.path === "AGENTS.md")?.exists ?? false;
  const localConfigExists = detectedArtifacts.find((artifact) => artifact.path === ".krn/config.toml")?.exists ?? false;
  const sourcePointersExist =
    detectedArtifacts.find((artifact) => artifact.path === ".krn/sources/index.json")?.exists ?? false;
  const contextPointersExist =
    detectedArtifacts.find((artifact) => artifact.path === ".krn/context/index.json")?.exists ?? false;
  const evalBaselineExists =
    detectedArtifacts.find((artifact) => artifact.path === ".krn/evals/baseline.json")?.exists ?? false;
  const memoryIndexExists =
    detectedArtifacts.find((artifact) => artifact.path === "docs/memory/INDEX.md")?.exists ?? false;

  const candidateManifest: unknown = {
    schema_version: "krn-init-manifest.v1",
    kind: "krn_init_manifest",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    mode: "dry-run",
    project_profile: {
      schema_version: "product-spine.v1",
      id: basename(targetRoot) || "target-project",
      kind: "project_profile",
      status: "draft",
      project_name: basename(targetRoot) || "target-project",
      identity: "Target project inspected by KRN init dry-run.",
      product_boundary: "KRN init reports planned setup only; it does not mutate target project files.",
      current_phase: "KRN Init Bootstrap Planning",
      source_refs: ["docs/specs/krn-init/README.md"],
      guardrails: [
        "dry-run only",
        "schema-backed manifest",
        "no target setup mutation by default",
        "runtime artifacts stay under .krn/",
        "repo files are bootstrap/audit/export substrate, not memory core",
      ],
      next_allowed_surfaces: ["AGENTS.md proposal", ".krn/config.toml proposal", ".krn/sources", ".krn/context", ".krn/evals"],
      blocked_surfaces: ["dashboard", "broad API/cloud sync", "benchmark expansion", "repo-local memory core"],
    },
    detected_artifacts: detectedArtifacts,
    planned_files: [
      {
        path: "AGENTS.md",
        action: plannedAction(agentsExists),
        reason: agentsExists
          ? "Existing root instructions are preserved; KRN init must not overwrite them."
          : "KRN would propose a minimal AGENTS.md selector in a future reviewed write flow.",
        source_refs: ["docs/specs/krn-init/README.md"],
      },
      {
        path: ".krn/config.toml",
        action: localConfigExists ? "skip" : "proposal_only",
        reason: localConfigExists
          ? "Existing KRN local config is preserved; changes require a reviewed proposal."
          : "KRN would propose a minimal local-first config in a reviewed write flow.",
        source_refs: ["docs/specs/krn-init/README.md"],
      },
      {
        path: ".krn/sources/index.json",
        action: sourcePointersExist ? "skip" : "proposal_only",
        reason: sourcePointersExist
          ? "Existing source graph seed is preserved; changes require a reviewed proposal."
          : "KRN would propose a minimal source graph seed in a reviewed write flow.",
        source_refs: ["docs/specs/krn-source-graph/README.md", "docs/specs/krn-init/README.md"],
      },
      {
        path: ".krn/context/index.json",
        action: contextPointersExist ? "skip" : "proposal_only",
        reason: contextPointersExist
          ? "Existing context pointer index is preserved; changes require a reviewed proposal."
          : "KRN would propose a minimal context pointer index in a reviewed write flow.",
        source_refs: ["docs/specs/krn-context-pointer-index/README.md", "docs/specs/krn-init/README.md"],
      },
      {
        path: ".krn/evals/baseline.json",
        action: evalBaselineExists ? "skip" : "proposal_only",
        reason: evalBaselineExists
          ? "Existing eval baseline seed is preserved; changes require a reviewed proposal."
          : "KRN would propose a lean eval baseline seed in a reviewed write flow.",
        source_refs: ["docs/specs/krn-eval-baseline/README.md", "docs/specs/krn-init/README.md"],
      },
      {
        path: "docs/memory/INDEX.md",
        action: memoryIndexExists ? "proposal_only" : "create",
        reason: memoryIndexExists
          ? "Pattern-bank changes require review and are not authoritative memory-core writes."
          : "KRN would propose a reviewed pattern-bank index in a future write flow.",
        source_refs: ["docs/specs/krn-init/README.md"],
      },
      {
        path: runtimeManifestPath,
        action: "create",
        reason: "Dry-run runtime manifest is the only default write surface.",
        source_refs: ["docs/specs/krn-init/README.md"],
      },
    ],
    planned_runtime_dirs: [
      {
        path: ".krn/init",
        purpose: "Dry-run init manifests and local bootstrap runtime reports.",
      },
    ],
    collisions: [
      {
        path: "AGENTS.md",
        strategy: collisionStrategy(agentsExists),
        reason: agentsExists
          ? "Existing agent instructions must be reviewed instead of overwritten."
          : "No collision detected; future writes would still require an explicit write-mode contract.",
      },
      {
        path: ".krn/config.toml",
        strategy: collisionStrategy(localConfigExists),
        reason: localConfigExists
          ? "Existing local config must be reviewed instead of overwritten."
          : "No local config collision detected; future writes still require approved promotion.",
      },
      {
        path: ".krn/sources/index.json",
        strategy: collisionStrategy(sourcePointersExist),
        reason: sourcePointersExist
          ? "Existing source graph seed must be reviewed instead of overwritten."
          : "No source graph seed collision detected; future writes still require approved promotion.",
      },
      {
        path: ".krn/context/index.json",
        strategy: collisionStrategy(contextPointersExist),
        reason: contextPointersExist
          ? "Existing context pointer index must be reviewed instead of overwritten."
          : "No context pointer index collision detected; future writes still require approved promotion.",
      },
      {
        path: ".krn/evals/baseline.json",
        strategy: collisionStrategy(evalBaselineExists),
        reason: evalBaselineExists
          ? "Existing eval baseline seed must be reviewed instead of overwritten."
          : "No eval baseline seed collision detected; future writes still require approved promotion.",
      },
      {
        path: "docs/memory/INDEX.md",
        strategy: "proposal_only",
        reason: memoryIndexExists
          ? "Pattern-bank index changes are durable and require review."
          : "Pattern-bank index creation would require review before becoming durable project knowledge.",
      },
    ],
    bootstrap_plan: [
      {
        capability: "agent_instructions",
        path: "AGENTS.md",
        action: agentsExists ? "skip" : "proposal_only",
        purpose: "Create or preserve a thin Codex selector that points to active goal, memory index, and verification rules.",
        boundary: "AGENTS.md must stay a compact router, not a generated encyclopedia or memory database.",
        source_refs: ["docs/specs/krn-init/README.md"],
      },
      {
        capability: "local_config",
        path: ".krn/config.toml",
        action: localConfigExists ? "skip" : "proposal_only",
        purpose: "Describe local-first KRN project settings without requiring cloud/API sync.",
        boundary: "Config may point at stores and policies; it must not embed live memory records or current-goal truth.",
        source_refs: ["docs/specs/krn-init/README.md"],
      },
      {
        capability: "source_pointers",
        path: ".krn/sources/index.json",
        action: sourcePointersExist ? "skip" : "proposal_only",
        purpose: "Point Codex/KRN at source graph entries used for source-backed planning and stale/conflict checks.",
        boundary: "Source pointers are indexes and lineage, not a copied bibliography or hardcoded active source list.",
        source_refs: ["docs/specs/krn-source-graph/README.md", "docs/plans/canonical/SOURCES.md"],
      },
      {
        capability: "context_pointers",
        path: ".krn/context/index.json",
        action: contextPointersExist ? "skip" : "proposal_only",
        purpose: "Prepare the runtime directory for bounded context packets built from task intent, memory selection, and source refs.",
        boundary:
          "Context pointer index may point at bounded packet locations; it must not store memory bodies, active task truth, or broad docs context dumps.",
        source_refs: [
          "docs/specs/krn-context-pointer-index/README.md",
          "docs/specs/krn-context-packet/README.md",
          "docs/specs/krn-init/README.md",
        ],
      },
      {
        capability: "eval_baseline",
        path: ".krn/evals/baseline.json",
        action: evalBaselineExists ? "skip" : "proposal_only",
        purpose: "Prepare a local eval baseline that uses the lean core/current path before explicit lab work.",
        boundary:
          "Eval baseline may point at core/current verification commands; it must not store live reports, enable lab/all defaults, or claim productivity lift.",
        source_refs: ["docs/specs/krn-eval-baseline/README.md", "docs/specs/krn-eval/README.md", "docs/evals/STANDARD.md"],
      },
      {
        capability: "skill_wiring",
        path: ".agents/skills/",
        action: "proposal_only",
        purpose: "Wire only required operator skills with owners, triggers, forbidden behavior, and verification.",
        boundary: "Skills are not prompt sprawl; missing triggers should produce evals or deletion decisions, not endless markdown.",
        source_refs: ["docs/specs/krn-init/README.md"],
      },
      {
        capability: "policy_boundaries",
        path: ".krn/policies/",
        action: "proposal_only",
        purpose: "Prepare local policy hooks and approval boundaries for unsafe writes, memory writes, source acceptance, and command use.",
        boundary: "Policies can warn/block/propose; broad write-capable API or cloud sync requires later explicit audit/idempotency work.",
        source_refs: ["docs/specs/krn-engineering-gate/README.md", "docs/specs/krn-init/README.md"],
      },
    ],
    no_touch_paths: [".git", "node_modules", "AGENTS.md", ".codex", ".agents", "docs/memory"],
    source_refs: ["docs/specs/krn-init/README.md"],
    product_spine_refs: ["project_profile", "memory_entry", "source_claim", "eval_run", "proposal", "decision"],
    validation: {
      status: "valid",
      checks: [
        "schema-backed manifest",
        "dry-run mode only",
        "source refs present",
        "bootstrap capabilities present",
        "no-touch paths present",
      ],
    },
    interpretation_caveat:
      "This manifest proves dry-run bootstrap contract behavior only; it does not prove productivity lift, write-mode safety, memory-core quality, MCP readiness, dashboard readiness, or paper-research automation.",
  };

  return parseInitManifest(candidateManifest);
}

export function writeManifest(targetInput: string, manifest: InitManifest): string {
  const targetRoot = resolve(targetInput);
  const manifestDir = resolve(targetRoot, ".krn", "init", manifest.run_id);
  const manifestPath = resolve(manifestDir, "manifest.json");

  mkdirSync(manifestDir, { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  return manifestPath;
}

function manifestRuntimePath(manifest: InitManifest): string {
  const runtimeManifestFile = manifest.planned_files.find((file) => file.path.endsWith("/manifest.json"));
  if (!runtimeManifestFile) {
    throw new Error("Init manifest is missing its runtime manifest file entry");
  }
  return runtimeManifestFile.path;
}

export function buildInitProposal(manifest: InitManifest, capability: InitProposalCapability): KrnControlPlaneProposal {
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
  const targetLabel = bootstrapTargetLabel(capability);
  const targetDescription = bootstrapTargetDescription(capability);

  return parseKrnControlPlaneProposal({
    schema_version: "krn-control-plane-proposal.v1",
    kind: "krn_control_plane_proposal",
    proposal_id: proposalId,
    proposal_kind: proposalKind,
    status: "proposal_only",
    title: `Review KRN init ${targetLabel} bootstrap`,
    rationale: `KRN needs reviewed bootstrap targets before write mode. ${targetDescription}`,
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

function bootstrapTargetLabel(capability: InitProposalCapability): string {
  switch (capability) {
    case "agent_instructions":
      return "agent-instructions";
    case "local_config":
      return "local-config";
    case "source_pointers":
      return "source-pointers";
    case "context_pointers":
      return "context-pointers";
    case "eval_baseline":
      return "eval-baseline";
  }
}

function bootstrapTargetDescription(capability: InitProposalCapability): string {
  switch (capability) {
    case "agent_instructions":
      return "Agent instructions are the narrowest user-visible bootstrap surface and must stay a thin selector rather than a generated memory database.";
    case "local_config":
      return "Local config is a bootstrap boundary and must point at local-first stores/policies without embedding live memory, source lists, or current-goal truth.";
    case "source_pointers":
      return "Source pointers must seed a source graph boundary without copying a bibliography, active source list, or KRN product truth into the target repo.";
    case "context_pointers":
      return "Context pointers must seed a bounded packet index without copying memory bodies, task intent, active goal truth, or broad docs context into the target repo.";
    case "eval_baseline":
      return "Eval baseline must seed lean core/current verification without copying live eval reports, enabling lab/all defaults, or claiming lift.";
  }
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

export function runKrnInit(argv: readonly string[]): InitCliResult {
  const args = parseInitArgs(argv);
  if (args.mode === "apply") {
    const promotionPath = applyInitProposal(args.target, args.proposalPath, args.decisionPath);
    return { exitCode: 0, stdout: `${promotionPath}\n`, stderr: "" };
  }

  const manifest = buildInitManifest(args.target);
  const manifestPath = writeManifest(args.target, manifest);
  if (args.mode === "proposal") {
    const proposalPath = writeInitProposal(args.target, manifest, args.capability);
    return { exitCode: 0, stdout: `${proposalPath}\n`, stderr: "" };
  }
  return { exitCode: 0, stdout: `${manifestPath}\n`, stderr: "" };
}
