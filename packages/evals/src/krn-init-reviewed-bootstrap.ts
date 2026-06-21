import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import {
  parseInitManifest,
  parseKrnContextPointerIndex,
  parseKrnControlPlaneProposal,
  parseKrnEvalBaseline,
  parseKrnPolicyBoundaries,
  parseKrnProposalPromotion,
  parseKrnProposalReviewDecision,
  parseKrnSourceGraph,
} from "@krn/contracts";
import { runKrnCli } from "@krn/cli";
import { storeKrnProposalReviewDecision } from "@krn/mcp";

export const REQUIRED_BOOTSTRAP_CAPABILITIES = [
  "agent_instructions",
  "local_config",
  "source_pointers",
  "context_pointers",
  "eval_baseline",
  "skill_wiring",
  "policy_boundaries",
] as const;

export type BootstrapCapability = (typeof REQUIRED_BOOTSTRAP_CAPABILITIES)[number];

const BOOTSTRAP_TARGET_PATH_BY_CAPABILITY: Record<BootstrapCapability, string> = {
  agent_instructions: "AGENTS.md",
  local_config: ".krn/config.toml",
  source_pointers: ".krn/sources/index.json",
  context_pointers: ".krn/context/index.json",
  eval_baseline: ".krn/evals/baseline.json",
  skill_wiring: ".agents/skills/README.md",
  policy_boundaries: ".krn/policies/boundaries.json",
};

export type ReviewedBootstrapCompositionResult = {
  passed: boolean;
  assertions: string[];
  message: string;
};

export type ReviewedBootstrapCapabilityResult = {
  promotionPath: string;
  promotion: ReturnType<typeof parseKrnProposalPromotion>;
  targetPath: string;
  targetContent: string;
};

type ApplyReviewedBootstrapCapabilityOptions = {
  rationale?: string;
  blockedSurfaces?: readonly string[];
};

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

export function hasRequiredBootstrapCapabilities(manifest: ReturnType<typeof parseInitManifest>): boolean {
  const capabilities = new Set(manifest.bootstrap_plan.map((item) => item.capability));
  return REQUIRED_BOOTSTRAP_CAPABILITIES.every((capability) => capabilities.has(capability));
}

export function applyReviewedBootstrapCapability(
  targetRoot: string,
  capability: BootstrapCapability,
  now: Date,
  options: ApplyReviewedBootstrapCapabilityOptions = {},
): ReviewedBootstrapCapabilityResult {
  const proposalResult = runKrnCli(["init", "--proposal", capability, "--target", targetRoot]);
  if (proposalResult.exitCode !== 0) {
    throw new Error(proposalResult.stderr);
  }

  const proposalPath = proposalResult.stdout.trim();
  const proposal = parseKrnControlPlaneProposal(readJson(proposalPath));
  const proposalRelativePath = relative(targetRoot, proposalPath).replaceAll("\\", "/");
  const decision = parseKrnProposalReviewDecision({
    schema_version: "krn-proposal-review-decision.v1",
    kind: "krn_proposal_review_decision",
    decision_id: `decision-${proposal.proposal_id}`,
    proposal_id: proposal.proposal_id,
    proposal_path: proposalRelativePath,
    decision: "approved_for_promotion",
    review_scope: "proposal_review_only",
    target_mutated: false,
    promotion_state: "not_promoted",
    reviewer: "krn-init-eval",
    rationale:
      options.rationale ??
      `The generated ${capability} seed is narrow, target is absent, and the exact payload is safe to apply.`,
    write_policy: {
      default_effect: "no_target_mutation",
      allowed_persistence: "append_only",
      idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
    },
    evidence_refs: proposal.evidence_refs,
    source_refs: proposal.source_refs,
    blocked_surfaces: options.blockedSurfaces ?? ["target_file_mutation_without_promotion", "memory_core_write"],
    created_at: now.toISOString(),
    created_by: "krn init eval",
    interpretation_caveat:
      "This decision approves promotion input only; exact target write still requires explicit init apply mode.",
  });
  const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot, now });
  const applyResult = runKrnCli([
    "init",
    "--apply",
    capability,
    "--proposal-path",
    proposalPath,
    "--decision-path",
    join(targetRoot, storedDecision.decision_path),
    "--target",
    targetRoot,
  ]);
  if (applyResult.exitCode !== 0) {
    throw new Error(applyResult.stderr);
  }

  const promotionPath = applyResult.stdout.trim();
  const promotion = parseKrnProposalPromotion(readJson(promotionPath));
  const targetPath = BOOTSTRAP_TARGET_PATH_BY_CAPABILITY[capability];
  const targetContent = readFileSync(join(targetRoot, targetPath), "utf8");

  if (
    promotion.proposal_kind !== "init_bootstrap" ||
    promotion.promotion_scope !== "approved_init_bootstrap_only" ||
    promotion.apply_mode !== "apply_exact_target_write" ||
    promotion.target.path !== targetPath ||
    promotion.target.file_content !== targetContent
  ) {
    throw new Error(`Capability ${capability} did not apply through the exact init bootstrap promotion boundary.`);
  }

  return {
    promotionPath,
    promotion,
    targetPath,
    targetContent,
  };
}

export function evaluateReviewedBootstrapComposition(now: Date): ReviewedBootstrapCompositionResult {
  const composedTarget = mkdtempSync(join(tmpdir(), "krn-init-composed-bootstrap-eval-"));
  const initialManifestResult = runKrnCli(["init", "--dry-run", "--target", composedTarget]);
  if (initialManifestResult.exitCode !== 0) {
    throw new Error(initialManifestResult.stderr);
  }
  const initialManifest = parseInitManifest(readJson(initialManifestResult.stdout.trim()));
  const promotionPaths = REQUIRED_BOOTSTRAP_CAPABILITIES.map((capability) =>
    applyReviewedBootstrapCapability(composedTarget, capability, now).promotionPath,
  );
  const postApplyManifestResult = runKrnCli(["init", "--dry-run", "--target", composedTarget]);
  if (postApplyManifestResult.exitCode !== 0) {
    throw new Error(postApplyManifestResult.stderr);
  }

  const postApplyManifest = parseInitManifest(readJson(postApplyManifestResult.stdout.trim()));
  const targetContents = Object.values(BOOTSTRAP_TARGET_PATH_BY_CAPABILITY)
    .map((targetPath) => readFileSync(join(composedTarget, targetPath), "utf8"))
    .join("\n");
  const sourceGraph = parseKrnSourceGraph(readJson(join(composedTarget, ".krn", "sources", "index.json")));
  const contextIndex = parseKrnContextPointerIndex(readJson(join(composedTarget, ".krn", "context", "index.json")));
  const evalBaseline = parseKrnEvalBaseline(readJson(join(composedTarget, ".krn", "evals", "baseline.json")));
  const policy = parseKrnPolicyBoundaries(readJson(join(composedTarget, ".krn", "policies", "boundaries.json")));

  return {
    passed:
      hasRequiredBootstrapCapabilities(initialManifest) &&
      initialManifest.bootstrap_plan.every((item) => item.action === "proposal_only") &&
      promotionPaths.length === REQUIRED_BOOTSTRAP_CAPABILITIES.length &&
      new Set(promotionPaths).size === REQUIRED_BOOTSTRAP_CAPABILITIES.length &&
      readdirSync(join(composedTarget, ".krn", "promotions")).length === REQUIRED_BOOTSTRAP_CAPABILITIES.length &&
      hasRequiredBootstrapCapabilities(postApplyManifest) &&
      postApplyManifest.bootstrap_plan.every((item) => item.action === "skip") &&
      sourceGraph.records[0]?.ref === "krn://source/bootstrap-policy" &&
      contextIndex.memory_policy.store_memory_bodies === false &&
      contextIndex.memory_policy.require_application_guidance === true &&
      evalBaseline.policy.productivity_lift_claimed === false &&
      policy.boundaries.find((boundary) => boundary.surface === "memory_core_write")?.enforcement === "block" &&
      !existsSync(join(composedTarget, "docs", "memory")) &&
      !existsSync(join(composedTarget, ".krn", "memory")) &&
      !existsSync(join(composedTarget, ".krn", "dashboard")) &&
      !existsSync(join(composedTarget, ".krn", "api")) &&
      !targetContents.includes("goal-038") &&
      !targetContents.includes("docs/plans/canonical/draft.md"),
    assertions: [
      "initial dry-run exposes all reviewed bootstrap capabilities",
      "all reviewed bootstrap targets apply through approved decisions",
      "post-apply dry-run marks reviewed bootstrap targets as skip",
      "typed source/context/eval/policy seeds parse after composition",
      "composed bootstrap avoids repo-local memory core and hardcoded product truth",
    ],
    message: "Generated init bootstrap targets composed in one isolated repo without broad scaffold writes.",
  };
}
