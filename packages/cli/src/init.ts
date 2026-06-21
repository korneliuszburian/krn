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
} from "./init-bootstrap.js";
import { parseInitArgs } from "./init-args.js";
import { buildInitDetectedArtifacts, initArtifactExists } from "./init-artifacts.js";
import {
  INIT_BOOTSTRAP_TARGETS,
  initProposalCapabilityUsage,
  initProposalTarget,
  type InitBootstrapTarget,
  type InitProposalCapability,
} from "./init-targets.js";
import { createRunId } from "./runtime-utils.js";

export { initProposalCapabilityUsage } from "./init-targets.js";
export { parseInitArgs } from "./init-args.js";

export type InitCliResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

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

  const detectedArtifacts = buildInitDetectedArtifacts(targetRoot);

  const agentsExists = initArtifactExists(detectedArtifacts, "AGENTS.md");
  const localConfigExists = initArtifactExists(detectedArtifacts, ".krn/config.toml");
  const sourcePointersExist = initArtifactExists(detectedArtifacts, ".krn/sources/index.json");
  const contextPointersExist = initArtifactExists(detectedArtifacts, ".krn/context/index.json");
  const evalBaselineExists = initArtifactExists(detectedArtifacts, ".krn/evals/baseline.json");
  const skillWiringExists = initArtifactExists(detectedArtifacts, ".agents/skills/README.md");
  const policyBoundariesExist = initArtifactExists(detectedArtifacts, ".krn/policies/boundaries.json");
  const memoryIndexExists = initArtifactExists(detectedArtifacts, "docs/memory/INDEX.md");
  const bootstrapTargetExists = (target: InitBootstrapTarget): boolean =>
    initArtifactExists(detectedArtifacts, target.path);

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
      next_allowed_surfaces: [
        "AGENTS.md proposal",
        ".krn/config.toml proposal",
        ".krn/sources",
        ".krn/context",
        ".krn/evals",
        ".krn/policies",
      ],
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
        path: ".agents/skills/README.md",
        action: skillWiringExists ? "skip" : "proposal_only",
        reason: skillWiringExists
          ? "Existing skill wiring seed is preserved; changes require a reviewed proposal."
          : "KRN would propose a minimal repo-local skill wiring seed in a reviewed write flow.",
        source_refs: ["docs/specs/krn-init/README.md"],
      },
      {
        path: ".krn/policies/boundaries.json",
        action: policyBoundariesExist ? "skip" : "proposal_only",
        reason: policyBoundariesExist
          ? "Existing policy boundary seed is preserved; changes require a reviewed proposal."
          : "KRN would propose a minimal local policy boundary seed in a reviewed write flow.",
        source_refs: ["docs/specs/krn-policy-boundaries/README.md", "docs/specs/krn-init/README.md"],
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
        path: ".agents/skills/README.md",
        strategy: collisionStrategy(skillWiringExists),
        reason: skillWiringExists
          ? "Existing skill wiring seed must be reviewed instead of overwritten."
          : "No skill wiring seed collision detected; future writes still require approved promotion.",
      },
      {
        path: ".krn/policies/boundaries.json",
        strategy: collisionStrategy(policyBoundariesExist),
        reason: policyBoundariesExist
          ? "Existing policy boundary seed must be reviewed instead of overwritten."
          : "No policy boundary seed collision detected; future writes still require approved promotion.",
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
      ...INIT_BOOTSTRAP_TARGETS.map((target) => ({
        capability: target.capability,
        path: target.path,
        action: bootstrapTargetExists(target) ? "skip" : "proposal_only",
        purpose: target.purpose,
        boundary: target.boundary,
        source_refs: target.sourceRefs,
      })),
    ],
    no_touch_paths: [
      ".git",
      "node_modules",
      "AGENTS.md",
      ".codex",
      ".agents/** except approved .agents/skills/README.md",
      "docs/memory",
    ],
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
