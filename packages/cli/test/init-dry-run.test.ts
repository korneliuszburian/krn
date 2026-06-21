import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
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
import { storeKrnProposalReviewDecision } from "@krn/mcp";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

const reviewedBootstrapCapabilities = [
  "agent_instructions",
  "local_config",
  "source_pointers",
  "context_pointers",
  "eval_baseline",
  "skill_wiring",
  "policy_boundaries",
] as const;

type ReviewedBootstrapCapability = (typeof reviewedBootstrapCapabilities)[number];

const bootstrapTargetPathByCapability: Record<ReviewedBootstrapCapability, string> = {
  agent_instructions: "AGENTS.md",
  local_config: ".krn/config.toml",
  source_pointers: ".krn/sources/index.json",
  context_pointers: ".krn/context/index.json",
  eval_baseline: ".krn/evals/baseline.json",
  skill_wiring: ".agents/skills/README.md",
  policy_boundaries: ".krn/policies/boundaries.json",
};

function applyReviewedBootstrapCapability(targetRoot: string, capability: ReviewedBootstrapCapability): string {
  const proposalStdout = execFileSync(
    "pnpm",
    ["exec", "tsx", "packages/cli/src/main.ts", "--", "init", "--proposal", capability, "--target", targetRoot],
    {
      cwd: process.cwd(),
      encoding: "utf8",
    },
  );
  const proposalPath = proposalStdout.trim();
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
    reviewer: "krn-init-test",
    rationale: `The generated ${capability} seed is narrow, target is absent, and the exact payload is safe to apply.`,
    write_policy: {
      default_effect: "no_target_mutation",
      allowed_persistence: "append_only",
      idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
    },
    evidence_refs: proposal.evidence_refs,
    source_refs: proposal.source_refs,
    blocked_surfaces: ["target_file_mutation_without_promotion", "memory_core_write"],
    created_at: "2026-06-21T00:00:00.000Z",
    created_by: "krn init test",
    interpretation_caveat:
      "This decision approves promotion input only; the exact target write still requires explicit init apply mode.",
  });
  const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot });

  const promotionStdout = execFileSync(
    "pnpm",
    [
      "exec",
      "tsx",
      "packages/cli/src/main.ts",
      "--",
      "init",
      "--apply",
      capability,
      "--proposal-path",
      proposalPath,
      "--decision-path",
      join(targetRoot, storedDecision.decision_path),
      "--target",
      targetRoot,
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
    },
  );
  const promotionPath = promotionStdout.trim();
  const promotion = parseKrnProposalPromotion(readJson(promotionPath));

  expect(proposal.target).toEqual({ target_type: "path", path: bootstrapTargetPathByCapability[capability] });
  expect(promotion.proposal_kind).toBe("init_bootstrap");
  expect(promotion.promotion_scope).toBe("approved_init_bootstrap_only");
  expect(promotion.apply_mode).toBe("apply_exact_target_write");
  expect(promotion.target.path).toBe(bootstrapTargetPathByCapability[capability]);
  expect(readFileSync(join(targetRoot, promotion.target.path), "utf8")).toBe(promotion.target.file_content);

  return promotionPath;
}

describe("krn init --dry-run", () => {
  it("writes a schema-backed manifest without mutating target setup files", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-init-target-"));

    const stdout = execFileSync(
      "pnpm",
      ["exec", "tsx", "packages/cli/src/main.ts", "--", "init", "--dry-run", "--target", targetRoot],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const manifestPath = stdout.trim();
    const manifest = parseInitManifest(readJson(manifestPath));

    expect(manifest.kind).toBe("krn_init_manifest");
    expect(manifest.mode).toBe("dry-run");
    expect(manifest.target_root).toBe(targetRoot);
    expect(manifest.interpretation_caveat).toContain("does not prove productivity lift");
    expect(manifest.project_profile.current_phase).toBe("KRN Init Bootstrap Planning");
    expect(manifest.bootstrap_plan.map((item) => item.capability)).toEqual([
      "agent_instructions",
      "local_config",
      "source_pointers",
      "context_pointers",
      "eval_baseline",
      "skill_wiring",
      "policy_boundaries",
    ]);
    expect(manifest.bootstrap_plan.find((item) => item.capability === "source_pointers")?.boundary).toContain(
      "not a copied bibliography",
    );
    expect(manifest.bootstrap_plan.find((item) => item.capability === "context_pointers")?.path).toBe(
      ".krn/context/index.json",
    );
    expect(manifest.bootstrap_plan.find((item) => item.capability === "eval_baseline")?.path).toBe(
      ".krn/evals/baseline.json",
    );
    expect(manifest.bootstrap_plan.find((item) => item.capability === "eval_baseline")?.boundary).toContain(
      "must not store live reports",
    );
    expect(manifest.bootstrap_plan.find((item) => item.capability === "skill_wiring")?.path).toBe(
      ".agents/skills/README.md",
    );
    expect(manifest.bootstrap_plan.find((item) => item.capability === "skill_wiring")?.boundary).toContain(
      "must not create active skills",
    );
    expect(manifest.bootstrap_plan.find((item) => item.capability === "policy_boundaries")?.path).toBe(
      ".krn/policies/boundaries.json",
    );
    expect(existsSync(join(targetRoot, ".krn", "init", manifest.run_id, "manifest.json"))).toBe(true);
    expect(existsSync(join(targetRoot, "AGENTS.md"))).toBe(false);
    expect(existsSync(join(targetRoot, ".codex"))).toBe(false);
    expect(existsSync(join(targetRoot, ".agents"))).toBe(false);

    const topLevelEntries = readdirSync(targetRoot).sort();
    expect(topLevelEntries).toEqual([".krn"]);
  }, 30_000);

  it("applies reviewed skill-wiring proposal through an approved decision without copying skill bodies", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-init-skill-wiring-target-"));
    const proposalStdout = execFileSync(
      "pnpm",
      ["exec", "tsx", "packages/cli/src/main.ts", "--", "init", "--proposal", "skill_wiring", "--target", targetRoot],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    const proposalPath = proposalStdout.trim();
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
      reviewer: "krn-init-test",
      rationale: "The generated skill wiring seed is minimal, target is absent, and the exact payload is safe to apply.",
      write_policy: {
        default_effect: "no_target_mutation",
        allowed_persistence: "append_only",
        idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
      },
      evidence_refs: proposal.evidence_refs,
      source_refs: proposal.source_refs,
      blocked_surfaces: ["target_file_mutation_without_promotion", "memory_core_write", "copied_skill_body"],
      created_at: "2026-06-20T22:50:00.000Z",
      created_by: "krn init test",
      interpretation_caveat:
        "This decision approves promotion input only; the exact target write still requires explicit init apply mode.",
    });
    const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot });

    const promotionStdout = execFileSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "init",
        "--apply",
        "skill_wiring",
        "--proposal-path",
        proposalPath,
        "--decision-path",
        join(targetRoot, storedDecision.decision_path),
        "--target",
        targetRoot,
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const promotionPath = promotionStdout.trim();
    const promotion = parseKrnProposalPromotion(readJson(promotionPath));
    const skillWiringContent = readFileSync(join(targetRoot, ".agents", "skills", "README.md"), "utf8");

    expect(proposal.target).toEqual({ target_type: "path", path: ".agents/skills/README.md" });
    expect(proposal.promotion_payload).toMatchObject({
      payload_type: "init_skill_wiring",
      bootstrap_capability: "skill_wiring",
      target_path: ".agents/skills/README.md",
    });
    expect(promotion.proposal_kind).toBe("init_bootstrap");
    expect(promotion.promotion_scope).toBe("approved_init_bootstrap_only");
    expect(promotion.apply_mode).toBe("apply_exact_target_write");
    expect(promotion.target_mutated).toBe(true);
    expect(skillWiringContent).toBe(promotion.target.file_content);
    expect(skillWiringContent).toContain("Do not copy active skill bodies");
    expect(skillWiringContent).toContain("does not create active skills");
    expect(skillWiringContent).not.toContain("goal-038");
    expect(skillWiringContent).not.toContain("docs/plans/canonical/draft.md");
    expect(skillWiringContent).not.toContain("typescript-contract-engineer");
  }, 30_000);

  it("stores a reviewed agent-instructions proposal without mutating the target file", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-init-proposal-target-"));

    const stdout = execFileSync(
      "pnpm",
      ["exec", "tsx", "packages/cli/src/main.ts", "--", "init", "--proposal", "agent_instructions", "--target", targetRoot],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const proposalPath = stdout.trim();
    const proposal = parseKrnControlPlaneProposal(readJson(proposalPath));

    expect(proposal.proposal_kind).toBe("init_bootstrap");
    expect(proposal.status).toBe("proposal_only");
    expect(proposal.target).toEqual({ target_type: "path", path: "AGENTS.md" });
    expect(proposal.write_policy.default_effect).toBe("no_mutation");
    expect(proposal.write_policy.allowed_persistence).toBe("append_only");
    expect(proposal.source_refs[0]).toMatch(/^\.krn\/init\/.+\/manifest\.json$/);
    expect(proposal.blocked_surfaces).toContain("target_file_mutation");
    expect(existsSync(proposalPath)).toBe(true);
    expect(existsSync(join(targetRoot, "AGENTS.md"))).toBe(false);
    expect(existsSync(join(targetRoot, ".krn", "proposals"))).toBe(true);

    const topLevelEntries = readdirSync(targetRoot).sort();
    expect(topLevelEntries).toEqual([".krn"]);
  }, 30_000);

  it("applies reviewed agent-instructions proposal through an approved decision", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-init-apply-target-"));
    const proposalStdout = execFileSync(
      "pnpm",
      ["exec", "tsx", "packages/cli/src/main.ts", "--", "init", "--proposal", "agent_instructions", "--target", targetRoot],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    const proposalPath = proposalStdout.trim();
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
      reviewer: "krn-init-test",
      rationale: "The generated AGENTS.md is thin, target is absent, and the exact payload is safe to apply.",
      write_policy: {
        default_effect: "no_target_mutation",
        allowed_persistence: "append_only",
        idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
      },
      evidence_refs: proposal.evidence_refs,
      source_refs: proposal.source_refs,
      blocked_surfaces: ["target_file_mutation_without_promotion", "memory_core_write"],
      created_at: "2026-06-20T22:50:00.000Z",
      created_by: "krn init test",
      interpretation_caveat:
        "This decision approves promotion input only; the exact target write still requires explicit init apply mode.",
    });
    const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot });

    const promotionStdout = execFileSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "init",
        "--apply",
        "agent_instructions",
        "--proposal-path",
        proposalPath,
        "--decision-path",
        join(targetRoot, storedDecision.decision_path),
        "--target",
        targetRoot,
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const promotionPath = promotionStdout.trim();
    const promotion = parseKrnProposalPromotion(readJson(promotionPath));

    expect(promotion.proposal_kind).toBe("init_bootstrap");
    expect(promotion.promotion_scope).toBe("approved_init_bootstrap_only");
    expect(promotion.apply_mode).toBe("apply_exact_target_write");
    expect(promotion.target_mutated).toBe(true);
    expect(readFileSync(join(targetRoot, "AGENTS.md"), "utf8")).toBe(promotion.target.file_content);
    expect(existsSync(join(targetRoot, ".krn", "promotions"))).toBe(true);
  }, 30_000);

  it("applies reviewed local-config proposal through an approved decision", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-init-config-apply-target-"));
    const proposalStdout = execFileSync(
      "pnpm",
      ["exec", "tsx", "packages/cli/src/main.ts", "--", "init", "--proposal", "local_config", "--target", targetRoot],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    const proposalPath = proposalStdout.trim();
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
      reviewer: "krn-init-test",
      rationale: "The generated local config is minimal, target is absent, and the exact payload is safe to apply.",
      write_policy: {
        default_effect: "no_target_mutation",
        allowed_persistence: "append_only",
        idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
      },
      evidence_refs: proposal.evidence_refs,
      source_refs: proposal.source_refs,
      blocked_surfaces: ["target_file_mutation_without_promotion", "memory_core_write"],
      created_at: "2026-06-20T22:50:00.000Z",
      created_by: "krn init test",
      interpretation_caveat:
        "This decision approves promotion input only; the exact target write still requires explicit init apply mode.",
    });
    const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot });

    const promotionStdout = execFileSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "init",
        "--apply",
        "local_config",
        "--proposal-path",
        proposalPath,
        "--decision-path",
        join(targetRoot, storedDecision.decision_path),
        "--target",
        targetRoot,
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const promotionPath = promotionStdout.trim();
    const promotion = parseKrnProposalPromotion(readJson(promotionPath));
    const configContent = readFileSync(join(targetRoot, ".krn", "config.toml"), "utf8");

    expect(proposal.target).toEqual({ target_type: "path", path: ".krn/config.toml" });
    expect(proposal.promotion_payload).toMatchObject({
      payload_type: "init_local_config",
      bootstrap_capability: "local_config",
      target_path: ".krn/config.toml",
    });
    expect(promotion.proposal_kind).toBe("init_bootstrap");
    expect(promotion.promotion_scope).toBe("approved_init_bootstrap_only");
    expect(promotion.apply_mode).toBe("apply_exact_target_write");
    expect(promotion.target_mutated).toBe(true);
    expect(configContent).toBe(promotion.target.file_content);
    expect(configContent).toContain('memory_store_env = "KRN_MEMORY_STORE_PATH"');
    expect(configContent).not.toContain("goal-038");
    expect(configContent).not.toContain("docs/plans/canonical/draft.md");
  }, 30_000);

  it("applies reviewed source-pointers proposal through an approved decision", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-init-sources-apply-target-"));
    const proposalStdout = execFileSync(
      "pnpm",
      ["exec", "tsx", "packages/cli/src/main.ts", "--", "init", "--proposal", "source_pointers", "--target", targetRoot],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    const proposalPath = proposalStdout.trim();
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
      reviewer: "krn-init-test",
      rationale: "The generated source graph seed is minimal, target is absent, and the exact payload is safe to apply.",
      write_policy: {
        default_effect: "no_target_mutation",
        allowed_persistence: "append_only",
        idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
      },
      evidence_refs: proposal.evidence_refs,
      source_refs: proposal.source_refs,
      blocked_surfaces: ["target_file_mutation_without_promotion", "memory_core_write", "copied_source_truth"],
      created_at: "2026-06-20T22:50:00.000Z",
      created_by: "krn init test",
      interpretation_caveat:
        "This decision approves promotion input only; the exact target write still requires explicit init apply mode.",
    });
    const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot });

    const promotionStdout = execFileSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "init",
        "--apply",
        "source_pointers",
        "--proposal-path",
        proposalPath,
        "--decision-path",
        join(targetRoot, storedDecision.decision_path),
        "--target",
        targetRoot,
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const promotionPath = promotionStdout.trim();
    const promotion = parseKrnProposalPromotion(readJson(promotionPath));
    const sourceGraphContent = readFileSync(join(targetRoot, ".krn", "sources", "index.json"), "utf8");
    const sourceGraph = parseKrnSourceGraph(JSON.parse(sourceGraphContent) as unknown);

    expect(proposal.target).toEqual({ target_type: "path", path: ".krn/sources/index.json" });
    expect(proposal.promotion_payload).toMatchObject({
      payload_type: "init_source_pointers",
      bootstrap_capability: "source_pointers",
      target_path: ".krn/sources/index.json",
    });
    expect(promotion.proposal_kind).toBe("init_bootstrap");
    expect(promotion.promotion_scope).toBe("approved_init_bootstrap_only");
    expect(promotion.apply_mode).toBe("apply_exact_target_write");
    expect(promotion.target_mutated).toBe(true);
    expect(sourceGraphContent).toBe(promotion.target.file_content);
    expect(sourceGraph.records).toHaveLength(1);
    expect(sourceGraph.records[0]?.ref).toBe("krn://source/bootstrap-policy");
    expect(sourceGraph.overclaim_boundary).toContain("not a copied bibliography");
    expect(sourceGraphContent).not.toContain("docs/plans/canonical/SOURCES.md");
    expect(sourceGraphContent).not.toContain("goal-038");
  }, 30_000);

  it("applies reviewed context-pointers proposal through an approved decision", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-init-context-apply-target-"));
    const proposalStdout = execFileSync(
      "pnpm",
      ["exec", "tsx", "packages/cli/src/main.ts", "--", "init", "--proposal", "context_pointers", "--target", targetRoot],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    const proposalPath = proposalStdout.trim();
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
      reviewer: "krn-init-test",
      rationale: "The generated context pointer index is minimal, target is absent, and the exact payload is safe to apply.",
      write_policy: {
        default_effect: "no_target_mutation",
        allowed_persistence: "append_only",
        idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
      },
      evidence_refs: proposal.evidence_refs,
      source_refs: proposal.source_refs,
      blocked_surfaces: ["target_file_mutation_without_promotion", "memory_core_write", "context_dump"],
      created_at: "2026-06-20T22:50:00.000Z",
      created_by: "krn init test",
      interpretation_caveat:
        "This decision approves promotion input only; the exact target write still requires explicit init apply mode.",
    });
    const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot });

    const promotionStdout = execFileSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "init",
        "--apply",
        "context_pointers",
        "--proposal-path",
        proposalPath,
        "--decision-path",
        join(targetRoot, storedDecision.decision_path),
        "--target",
        targetRoot,
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const promotionPath = promotionStdout.trim();
    const promotion = parseKrnProposalPromotion(readJson(promotionPath));
    const contextIndexContent = readFileSync(join(targetRoot, ".krn", "context", "index.json"), "utf8");
    const contextIndex = parseKrnContextPointerIndex(JSON.parse(contextIndexContent) as unknown);

    expect(proposal.target).toEqual({ target_type: "path", path: ".krn/context/index.json" });
    expect(proposal.promotion_payload).toMatchObject({
      payload_type: "init_context_pointers",
      bootstrap_capability: "context_pointers",
      target_path: ".krn/context/index.json",
    });
    expect(promotion.proposal_kind).toBe("init_bootstrap");
    expect(promotion.promotion_scope).toBe("approved_init_bootstrap_only");
    expect(promotion.apply_mode).toBe("apply_exact_target_write");
    expect(promotion.target_mutated).toBe(true);
    expect(contextIndexContent).toBe(promotion.target.file_content);
    expect(contextIndex.runtime_root).toBe(".krn/context");
    expect(contextIndex.packet_glob).toBe(".krn/context/*/context-packet.json");
    expect(contextIndex.memory_policy.store_memory_bodies).toBe(false);
    expect(contextIndex.memory_policy.require_selected_memory_ids).toBe(true);
    expect(contextIndex.memory_policy.require_application_guidance).toBe(true);
    expect(contextIndex.rejected_context_refs).toContain("docs/memory/** full scan");
    expect(contextIndexContent).not.toContain("goal-038");
    expect(contextIndexContent).not.toContain("docs/plans/canonical/draft.md");
  }, 30_000);

  it("applies reviewed eval-baseline proposal through an approved decision", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-init-eval-apply-target-"));
    const proposalStdout = execFileSync(
      "pnpm",
      ["exec", "tsx", "packages/cli/src/main.ts", "--", "init", "--proposal", "eval_baseline", "--target", targetRoot],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    const proposalPath = proposalStdout.trim();
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
      reviewer: "krn-init-test",
      rationale: "The generated eval baseline seed is minimal, target is absent, and the exact payload is safe to apply.",
      write_policy: {
        default_effect: "no_target_mutation",
        allowed_persistence: "append_only",
        idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
      },
      evidence_refs: proposal.evidence_refs,
      source_refs: proposal.source_refs,
      blocked_surfaces: ["target_file_mutation_without_promotion", "memory_core_write", "lab_default", "lift_claim"],
      created_at: "2026-06-20T22:50:00.000Z",
      created_by: "krn init test",
      interpretation_caveat:
        "This decision approves promotion input only; the exact target write still requires explicit init apply mode.",
    });
    const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot });

    const promotionStdout = execFileSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "init",
        "--apply",
        "eval_baseline",
        "--proposal-path",
        proposalPath,
        "--decision-path",
        join(targetRoot, storedDecision.decision_path),
        "--target",
        targetRoot,
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const promotionPath = promotionStdout.trim();
    const promotion = parseKrnProposalPromotion(readJson(promotionPath));
    const evalBaselineContent = readFileSync(join(targetRoot, ".krn", "evals", "baseline.json"), "utf8");
    const evalBaseline = parseKrnEvalBaseline(JSON.parse(evalBaselineContent) as unknown);

    expect(proposal.target).toEqual({ target_type: "path", path: ".krn/evals/baseline.json" });
    expect(proposal.promotion_payload).toMatchObject({
      payload_type: "init_eval_baseline",
      bootstrap_capability: "eval_baseline",
      target_path: ".krn/evals/baseline.json",
    });
    expect(promotion.proposal_kind).toBe("init_bootstrap");
    expect(promotion.promotion_scope).toBe("approved_init_bootstrap_only");
    expect(promotion.apply_mode).toBe("apply_exact_target_write");
    expect(promotion.target_mutated).toBe(true);
    expect(evalBaselineContent).toBe(promotion.target.file_content);
    expect(evalBaseline.default_lane).toBe("current");
    expect(evalBaseline.required_lanes).toEqual(["core", "current"]);
    expect(evalBaseline.forbidden_default_lanes).toEqual(["lab", "all"]);
    expect(evalBaseline.policy.productivity_lift_claimed).toBe(false);
    expect(evalBaselineContent).not.toContain("goal-038");
    expect(evalBaselineContent).not.toContain("docs/plans/canonical/draft.md");
  }, 30_000);

  it("applies reviewed policy-boundaries proposal through an approved decision", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-init-policy-apply-target-"));
    const proposalStdout = execFileSync(
      "pnpm",
      ["exec", "tsx", "packages/cli/src/main.ts", "--", "init", "--proposal", "policy_boundaries", "--target", targetRoot],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    const proposalPath = proposalStdout.trim();
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
      reviewer: "krn-init-test",
      rationale: "The generated policy boundary seed is minimal, target is absent, and the exact payload is safe to apply.",
      write_policy: {
        default_effect: "no_target_mutation",
        allowed_persistence: "append_only",
        idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
      },
      evidence_refs: proposal.evidence_refs,
      source_refs: proposal.source_refs,
      blocked_surfaces: ["target_file_mutation_without_promotion", "memory_core_write", "cloud_sync_default"],
      created_at: "2026-06-20T22:50:00.000Z",
      created_by: "krn init test",
      interpretation_caveat:
        "This decision approves promotion input only; the exact target write still requires explicit init apply mode.",
    });
    const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot });

    const promotionStdout = execFileSync(
      "pnpm",
      [
        "exec",
        "tsx",
        "packages/cli/src/main.ts",
        "--",
        "init",
        "--apply",
        "policy_boundaries",
        "--proposal-path",
        proposalPath,
        "--decision-path",
        join(targetRoot, storedDecision.decision_path),
        "--target",
        targetRoot,
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const promotionPath = promotionStdout.trim();
    const promotion = parseKrnProposalPromotion(readJson(promotionPath));
    const policyContent = readFileSync(join(targetRoot, ".krn", "policies", "boundaries.json"), "utf8");
    const policy = parseKrnPolicyBoundaries(JSON.parse(policyContent) as unknown);

    expect(proposal.target).toEqual({ target_type: "path", path: ".krn/policies/boundaries.json" });
    expect(proposal.promotion_payload).toMatchObject({
      payload_type: "init_policy_boundaries",
      bootstrap_capability: "policy_boundaries",
      target_path: ".krn/policies/boundaries.json",
    });
    expect(promotion.proposal_kind).toBe("init_bootstrap");
    expect(promotion.promotion_scope).toBe("approved_init_bootstrap_only");
    expect(promotion.apply_mode).toBe("apply_exact_target_write");
    expect(promotion.target_mutated).toBe(true);
    expect(policyContent).toBe(promotion.target.file_content);
    expect(policy.boundaries.find((boundary) => boundary.surface === "memory_core_write")?.enforcement).toBe("block");
    expect(policy.boundaries.find((boundary) => boundary.surface === "target_file_mutation")?.enforcement).toBe(
      "require_approval",
    );
    expect(policy.forbidden_defaults).toContain("cloud_sync_default");
    expect(policy.forbidden_defaults).toContain("productivity_lift_claim");
    expect(policyContent).not.toContain("goal-038");
    expect(policyContent).not.toContain("docs/plans/canonical/draft.md");
  }, 30_000);

  it("composes all reviewed bootstrap targets into one isolated repo readiness surface", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-init-compose-target-"));

    const initialManifestStdout = execFileSync(
      "pnpm",
      ["exec", "tsx", "packages/cli/src/main.ts", "--", "init", "--dry-run", "--target", targetRoot],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    const initialManifest = parseInitManifest(readJson(initialManifestStdout.trim()));

    expect(initialManifest.bootstrap_plan.map((item) => item.capability)).toEqual([...reviewedBootstrapCapabilities]);
    expect(initialManifest.bootstrap_plan.every((item) => item.action === "proposal_only")).toBe(true);

    const promotionPaths = reviewedBootstrapCapabilities.map((capability) =>
      applyReviewedBootstrapCapability(targetRoot, capability),
    );

    const postApplyManifestStdout = execFileSync(
      "pnpm",
      ["exec", "tsx", "packages/cli/src/main.ts", "--", "init", "--dry-run", "--target", targetRoot],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    const postApplyManifest = parseInitManifest(readJson(postApplyManifestStdout.trim()));
    const targetContents = Object.values(bootstrapTargetPathByCapability)
      .map((targetPath) => readFileSync(join(targetRoot, targetPath), "utf8"))
      .join("\n");
    const sourceGraph = parseKrnSourceGraph(readJson(join(targetRoot, ".krn", "sources", "index.json")));
    const contextIndex = parseKrnContextPointerIndex(readJson(join(targetRoot, ".krn", "context", "index.json")));
    const evalBaseline = parseKrnEvalBaseline(readJson(join(targetRoot, ".krn", "evals", "baseline.json")));
    const policy = parseKrnPolicyBoundaries(readJson(join(targetRoot, ".krn", "policies", "boundaries.json")));

    expect(promotionPaths).toHaveLength(reviewedBootstrapCapabilities.length);
    expect(new Set(promotionPaths).size).toBe(reviewedBootstrapCapabilities.length);
    expect(postApplyManifest.bootstrap_plan.map((item) => item.capability)).toEqual([...reviewedBootstrapCapabilities]);
    expect(postApplyManifest.bootstrap_plan.every((item) => item.action === "skip")).toBe(true);
    expect(readdirSync(join(targetRoot, ".krn", "promotions"))).toHaveLength(reviewedBootstrapCapabilities.length);
    expect(sourceGraph.records[0]?.ref).toBe("krn://source/bootstrap-policy");
    expect(contextIndex.memory_policy.store_memory_bodies).toBe(false);
    expect(contextIndex.memory_policy.require_application_guidance).toBe(true);
    expect(evalBaseline.policy.productivity_lift_claimed).toBe(false);
    expect(policy.boundaries.find((boundary) => boundary.surface === "memory_core_write")?.enforcement).toBe("block");
    expect(existsSync(join(targetRoot, "docs", "memory"))).toBe(false);
    expect(existsSync(join(targetRoot, ".krn", "memory"))).toBe(false);
    expect(existsSync(join(targetRoot, ".krn", "dashboard"))).toBe(false);
    expect(existsSync(join(targetRoot, ".krn", "api"))).toBe(false);
    expect(targetContents).not.toContain("goal-038");
    expect(targetContents).not.toContain("docs/plans/canonical/draft.md");
  }, 90_000);

  it("rejects apply paths outside the target root before reading them", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-init-apply-outside-target-"));

    expect(() =>
      execFileSync(
        "pnpm",
        [
          "exec",
          "tsx",
          "packages/cli/src/main.ts",
          "--",
          "init",
          "--apply",
          "agent_instructions",
          "--proposal-path",
          join(tmpdir(), "outside-proposal.json"),
          "--decision-path",
          join(tmpdir(), "outside-decision.json"),
          "--target",
          targetRoot,
        ],
        {
          cwd: process.cwd(),
          encoding: "utf8",
        },
      ),
    ).toThrow();
    expect(existsSync(join(targetRoot, "AGENTS.md"))).toBe(false);
  }, 30_000);
});
