import type { InitManifest } from "@krn/contracts";
import type { InitBootstrapCapability } from "./init-bootstrap.js";

export type InitProposalCapability = InitBootstrapCapability;
type InitBootstrapPlanCapability = InitManifest["bootstrap_plan"][number]["capability"];

export type InitBootstrapTarget = {
  capability: InitBootstrapPlanCapability;
  path: string;
  proposalEnabled: boolean;
  label: string;
  description: string;
  purpose: string;
  boundary: string;
  sourceRefs: readonly string[];
};

export const INIT_BOOTSTRAP_TARGETS = [
  {
    capability: "agent_instructions",
    path: "AGENTS.md",
    proposalEnabled: true,
    label: "agent-instructions",
    description:
      "Agent instructions are the narrowest user-visible bootstrap surface and must stay a thin selector rather than a generated memory database.",
    purpose: "Create or preserve a thin Codex selector that points to active goal, memory index, and verification rules.",
    boundary: "AGENTS.md must stay a compact router, not a generated encyclopedia or memory database.",
    sourceRefs: ["docs/specs/krn-init/README.md"],
  },
  {
    capability: "local_config",
    path: ".krn/config.toml",
    proposalEnabled: true,
    label: "local-config",
    description:
      "Local config is a bootstrap boundary and must point at local-first stores/policies without embedding live memory, source lists, or current-goal truth.",
    purpose: "Describe local-first KRN project settings without requiring cloud/API sync.",
    boundary: "Config may point at stores and policies; it must not embed live memory records or current-goal truth.",
    sourceRefs: ["docs/specs/krn-init/README.md"],
  },
  {
    capability: "source_pointers",
    path: ".krn/sources/index.json",
    proposalEnabled: true,
    label: "source-pointers",
    description:
      "Source pointers must seed a source graph boundary without copying a bibliography, active source list, or KRN product truth into the target repo.",
    purpose: "Point Codex/KRN at source graph entries used for source-backed planning and stale/conflict checks.",
    boundary: "Source pointers are indexes and lineage, not a copied bibliography or hardcoded active source list.",
    sourceRefs: ["docs/specs/krn-source-graph/README.md", "docs/plans/canonical/SOURCES.md"],
  },
  {
    capability: "context_pointers",
    path: ".krn/context/index.json",
    proposalEnabled: true,
    label: "context-pointers",
    description:
      "Context pointers must seed a bounded packet index without copying memory bodies, task intent, active goal truth, or broad docs context into the target repo.",
    purpose: "Prepare the runtime directory for bounded context packets built from task intent, memory selection, and source refs.",
    boundary:
      "Context pointer index may point at bounded packet locations; it must not store memory bodies, active task truth, or broad docs context dumps.",
    sourceRefs: [
      "docs/specs/krn-context-pointer-index/README.md",
      "docs/specs/krn-context-packet/README.md",
      "docs/specs/krn-init/README.md",
    ],
  },
  {
    capability: "eval_baseline",
    path: ".krn/evals/baseline.json",
    proposalEnabled: true,
    label: "eval-baseline",
    description:
      "Eval baseline must seed lean core/current verification without copying live eval reports, enabling lab/all defaults, or claiming lift.",
    purpose: "Prepare a local eval baseline that uses the lean core/current path before explicit lab work.",
    boundary:
      "Eval baseline may point at core/current verification commands; it must not store live reports, enable lab/all defaults, or claim productivity lift.",
    sourceRefs: ["docs/specs/krn-eval-baseline/README.md", "docs/specs/krn-eval/README.md", "docs/evals/STANDARD.md"],
  },
  {
    capability: "skill_wiring",
    path: ".agents/skills/README.md",
    proposalEnabled: true,
    label: "skill-wiring",
    description:
      "Skill wiring seeds a reviewed repo-local skill index without copying active skill bodies, prompt sprawl, or runtime memory into the target repo.",
    purpose: "Reserve a bounded repo-local skill folder with owner, trigger, forbidden behavior, verification, and deletion criteria.",
    boundary:
      "Skill wiring writes a seed index only; it must not create active skills, copy skill bodies, store memory bodies, or claim skill quality.",
    sourceRefs: ["docs/specs/krn-init/README.md"],
  },
  {
    capability: "policy_boundaries",
    path: ".krn/policies/boundaries.json",
    proposalEnabled: true,
    label: "policy-boundaries",
    description:
      "Policy boundaries must seed local warn/block/approval rules without claiming hook enforcement, broad security quality, dashboard/API readiness, or cloud sync.",
    purpose: "Prepare local policy hooks and approval boundaries for unsafe writes, memory writes, source acceptance, and command use.",
    boundary: "Policies can warn/block/propose; broad write-capable API or cloud sync requires later explicit audit/idempotency work.",
    sourceRefs: [
      "docs/specs/krn-policy-boundaries/README.md",
      "docs/specs/krn-engineering-gate/README.md",
      "docs/specs/krn-init/README.md",
    ],
  },
] as const satisfies readonly InitBootstrapTarget[];

function isProposalTarget(
  target: InitBootstrapTarget,
): target is InitBootstrapTarget & { capability: InitProposalCapability; proposalEnabled: true } {
  return target.proposalEnabled;
}

const INIT_PROPOSAL_CAPABILITIES = INIT_BOOTSTRAP_TARGETS.filter(isProposalTarget).map(
  (target) => target.capability,
);

export function initCapabilityList(): string {
  return INIT_PROPOSAL_CAPABILITIES.join(", ");
}

export function initProposalCapabilityUsage(): string {
  return INIT_PROPOSAL_CAPABILITIES.join("|");
}

function initBootstrapTarget(capability: InitBootstrapPlanCapability): InitBootstrapTarget {
  const target = INIT_BOOTSTRAP_TARGETS.find((item) => item.capability === capability);
  if (!target) {
    throw new Error(`Unknown init bootstrap target: ${capability}`);
  }
  return target;
}

export function initProposalTarget(capability: InitProposalCapability): InitBootstrapTarget & {
  capability: InitProposalCapability;
  proposalEnabled: true;
} {
  const target = initBootstrapTarget(capability);
  if (!isProposalTarget(target)) {
    throw new Error(`krn init proposal is not enabled for capability: ${capability}`);
  }
  return target;
}

export function parseInitCapability(value: string, mode: "proposal" | "apply"): InitProposalCapability {
  if (INIT_PROPOSAL_CAPABILITIES.includes(value as InitProposalCapability)) {
    return value as InitProposalCapability;
  }
  throw new Error(`krn init ${mode} currently supports only: ${initCapabilityList()}`);
}
