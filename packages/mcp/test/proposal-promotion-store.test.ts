import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  parseKrnControlPlaneProposal,
  parseKrnContextPointerIndex,
  parseKrnEvalBaseline,
  parseKrnPolicyBoundaries,
  parseKrnProposalPromotion,
  parseKrnProposalReviewDecision,
  type KrnControlPlaneProposal,
  type KrnProposalPromotion,
  type KrnProposalReviewDecision,
} from "@krn/contracts";
import { describe, expect, it } from "vitest";
import {
  listKrnProposalPromotionStoreRecords,
  storeKrnControlPlaneProposal,
  storeKrnProposalPromotion,
  storeKrnProposalReviewDecision,
} from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function initAgentInstructionsContent(): string {
  return "# Agent Instructions\n\nThis repository is KRN-enabled.\n";
}

function initLocalConfigContent(): string {
  return "schema_version = \"krn-local-config.v1\"\n";
}

function initSourcePointersContent(): string {
  return `${JSON.stringify(
    {
      schema_version: "krn-source-graph.v1",
      kind: "krn_source_graph",
      graph_id: "krn-init-source-graph-seed",
      created_at: "1970-01-01T00:00:00.000Z",
      records: [
        {
          schema_version: "krn-source-record.v1",
          kind: "krn_source_record",
          id: "bootstrap-source-policy",
          ref: "krn://source/bootstrap-policy",
          type: "runtime_evidence",
          status: "unverified",
          freshness: "unknown",
          confidence: "medium",
          owner: "krn init",
          last_verified_at: null,
          supports_decisions: ["source_graph_seed"],
          conflicts_with: [],
          invalidation_rule: "Replace this seed with reviewed project sources before claiming source-backed decisions.",
          source_refs: ["krn://source/bootstrap-policy"],
        },
      ],
      source_refs: ["krn://source/bootstrap-policy"],
      overclaim_boundary:
        "This seed is a source graph boundary only; it is not a copied bibliography, active source list, or proof of source freshness.",
    },
    null,
    2,
  )}\n`;
}

function initContextPointersContent(): string {
  return `${JSON.stringify(
    {
      schema_version: "krn-context-pointer-index.v1",
      kind: "krn_context_pointer_index",
      pointer_id: "krn-init-context-pointer-seed",
      created_at: "1970-01-01T00:00:00.000Z",
      runtime_root: ".krn/context",
      packet_glob: ".krn/context/*/context-packet.json",
      latest_packet_ref: null,
      build_command: "krn context build --task <text> [--path <path>]",
      memory_policy: {
        store_memory_bodies: false,
        require_selected_memory_ids: true,
        require_application_guidance: true,
        max_selected_context: 5,
      },
      rejected_context_refs: ["docs/memory/** full scan", "historical benchmark/lab goals by default"],
      source_refs: ["krn://context/bootstrap-policy"],
      overclaim_boundary:
        "This seed points to bounded context packet runtime locations only; it is not an active context packet, memory body store, task intent, or proof of context quality.",
    },
    null,
    2,
  )}\n`;
}

function initEvalBaselineContent(): string {
  return `${JSON.stringify(
    {
      schema_version: "krn-eval-baseline.v1",
      kind: "krn_eval_baseline",
      baseline_id: "krn-init-eval-baseline-seed",
      created_at: "1970-01-01T00:00:00.000Z",
      report_roots: {
        aggregate: ".krn/eval",
        module_reports: ".krn/evals",
      },
      default_lane: "current",
      required_lanes: ["core", "current"],
      forbidden_default_lanes: ["lab", "all"],
      default_command: "krn eval",
      core_command: "krn eval --lane core",
      baseline_checks: [
        {
          check_id: "core-contracts",
          command: "krn eval --lane core",
          lane: "core",
          purpose: "Verify stable contract and CLI foundations before claiming repo bootstrap readiness.",
        },
        {
          check_id: "current-product-path",
          command: "krn eval",
          lane: "current",
          purpose: "Verify the active product path without pulling historical lab checks into default bootstrap.",
        },
      ],
      policy: {
        forbid_lab_by_default: true,
        forbid_all_by_default: true,
        require_interpretation_caveat: true,
        productivity_lift_claimed: false,
      },
      source_refs: ["krn://eval/bootstrap-policy"],
      overclaim_boundary:
        "This seed defines a lean local eval baseline only; it does not prove eval quality, broad repo bootstrap readiness, human review quality, or productivity lift.",
    },
    null,
    2,
  )}\n`;
}

function initSkillWiringContent(): string {
  return "# KRN Skill Wiring\n\nThis folder is reserved for reviewed repo-local Codex/KRN skills.\n";
}

function initPolicyBoundariesContent(): string {
  return `${JSON.stringify(
    {
      schema_version: "krn-policy-boundaries.v1",
      kind: "krn_policy_boundaries",
      policy_id: "krn-init-policy-boundaries-seed",
      created_at: "1970-01-01T00:00:00.000Z",
      mode: "local_first_reviewed_seed",
      default_effect: "warn_or_block_by_boundary",
      boundaries: [
        {
          boundary_id: "review-target-file-mutation",
          surface: "target_file_mutation",
          enforcement: "require_approval",
          trigger: "Any KRN bootstrap target write outside runtime evidence.",
          required_consumer: "krn init --apply <capability> with approved proposal review decision",
          rollback_or_kill: "Remove the target and promotion record if the exact reviewed payload cannot be reproduced.",
          source_refs: ["krn://policy/bootstrap-boundaries"],
        },
        {
          boundary_id: "block-repo-local-memory-core",
          surface: "memory_core_write",
          enforcement: "block",
          trigger: "Any attempt to store authoritative memory bodies in docs/memory/** or .krn/**.",
          required_consumer: "KRN MemoryStore adapter selected through KRN_MEMORY_STORE_PATH",
          rollback_or_kill: "Move durable memory body to a reviewed store-backed record or delete the repo-local copy.",
          source_refs: ["krn://policy/bootstrap-boundaries"],
        },
        {
          boundary_id: "review-source-acceptance",
          surface: "source_acceptance",
          enforcement: "require_approval",
          trigger: "Any source claim promoted from candidate status to reusable project guidance.",
          required_consumer: "krn sources check and reviewed source graph update",
          rollback_or_kill: "Downgrade the source to unverified or quarantine conflicting lineage until source graph passes.",
          source_refs: ["krn://policy/bootstrap-boundaries"],
        },
        {
          boundary_id: "warn-command-execution",
          surface: "command_execution",
          enforcement: "warn",
          trigger: "Any command that changes files, external services, permissions, or network state.",
          required_consumer: "pre-edit engineering gate plus command-specific verification evidence",
          rollback_or_kill: "Stop the slice if verification cannot prove the command stayed within scope.",
          source_refs: ["krn://policy/bootstrap-boundaries"],
        },
        {
          boundary_id: "block-dashboard-api-expansion",
          surface: "dashboard_or_api_expansion",
          enforcement: "block",
          trigger: "Any dashboard, benchmark, broad API, cloud sync, or live-full expansion before a typed consumed behavior exists.",
          required_consumer: "typed consumer with source/eval/review evidence",
          rollback_or_kill: "Park the surface as a later decision until a consumed product object exists.",
          source_refs: ["krn://policy/bootstrap-boundaries"],
        },
      ],
      forbidden_defaults: [
        "unreviewed_target_write",
        "memory_body_repo_write",
        "dashboard_first",
        "benchmark_default",
        "cloud_sync_default",
        "productivity_lift_claim",
      ],
      source_refs: ["krn://policy/bootstrap-boundaries"],
      overclaim_boundary:
        "This seed defines local policy boundary IDs and approval rules only; it does not prove hook enforcement, security quality, broad API readiness, dashboard usefulness, or productivity lift.",
    },
    null,
    2,
  )}\n`;
}

function validProposal(overrides: Partial<KrnControlPlaneProposal> = {}): KrnControlPlaneProposal {
  const proposal = parseKrnControlPlaneProposal(
    readJson("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json"),
  );

  return parseKrnControlPlaneProposal({
    ...proposal,
    ...overrides,
  });
}

function validInitProposal(overrides: Partial<KrnControlPlaneProposal> = {}): KrnControlPlaneProposal {
  const fileContent = initAgentInstructionsContent();
  return parseKrnControlPlaneProposal({
    schema_version: "krn-control-plane-proposal.v1",
    kind: "krn_control_plane_proposal",
    proposal_id: "init-bootstrap-agent-instructions-test",
    proposal_kind: "init_bootstrap",
    status: "proposal_only",
    title: "Review KRN init agent-instructions bootstrap",
    rationale: "The first init write target must be reviewed before target mutation.",
    proposed_change: "Write a thin AGENTS.md only after approved review.",
    promotion_payload: {
      payload_type: "init_agent_instructions",
      bootstrap_capability: "agent_instructions",
      target_path: "AGENTS.md",
      write_mode: "exact_file_content",
      file_content: fileContent,
      content_sha256: sha256(fileContent),
    },
    target: {
      target_type: "path",
      path: "AGENTS.md",
    },
    write_policy: {
      default_effect: "no_mutation",
      allowed_persistence: "append_only",
      idempotency_key: "init-bootstrap:agent_instructions:test",
    },
    review_gate: {
      required: true,
      state: "not_reviewed",
      reviewer: null,
    },
    evidence_refs: [".krn/init/test/manifest.json"],
    source_refs: [".krn/init/test/manifest.json"],
    blocked_surfaces: ["target_file_mutation", "memory_core_write"],
    created_at: "2026-06-20T22:45:00.000Z",
    created_by: "krn init",
    interpretation_caveat:
      "This init proposal is append-only review input and does not mutate AGENTS.md until explicit apply mode.",
    ...overrides,
  });
}

function validInitLocalConfigProposal(overrides: Partial<KrnControlPlaneProposal> = {}): KrnControlPlaneProposal {
  const fileContent = initLocalConfigContent();
  return parseKrnControlPlaneProposal({
    schema_version: "krn-control-plane-proposal.v1",
    kind: "krn_control_plane_proposal",
    proposal_id: "init-bootstrap-local-config-test",
    proposal_kind: "init_bootstrap",
    status: "proposal_only",
    title: "Review KRN init local-config bootstrap",
    rationale: "The local config target must be reviewed before target mutation.",
    proposed_change: "Write minimal local config only after approved review.",
    promotion_payload: {
      payload_type: "init_local_config",
      bootstrap_capability: "local_config",
      target_path: ".krn/config.toml",
      write_mode: "exact_file_content",
      file_content: fileContent,
      content_sha256: sha256(fileContent),
    },
    target: {
      target_type: "path",
      path: ".krn/config.toml",
    },
    write_policy: {
      default_effect: "no_mutation",
      allowed_persistence: "append_only",
      idempotency_key: "init-bootstrap:local_config:test",
    },
    review_gate: {
      required: true,
      state: "not_reviewed",
      reviewer: null,
    },
    evidence_refs: [".krn/init/test/manifest.json"],
    source_refs: [".krn/init/test/manifest.json"],
    blocked_surfaces: ["target_file_mutation", "memory_core_write"],
    created_at: "2026-06-20T22:45:00.000Z",
    created_by: "krn init",
    interpretation_caveat:
      "This init proposal is append-only review input and does not mutate .krn/config.toml until explicit apply mode.",
    ...overrides,
  });
}

function validInitSourcePointersProposal(overrides: Partial<KrnControlPlaneProposal> = {}): KrnControlPlaneProposal {
  const fileContent = initSourcePointersContent();
  return parseKrnControlPlaneProposal({
    schema_version: "krn-control-plane-proposal.v1",
    kind: "krn_control_plane_proposal",
    proposal_id: "init-bootstrap-source-pointers-test",
    proposal_kind: "init_bootstrap",
    status: "proposal_only",
    title: "Review KRN init source-pointers bootstrap",
    rationale: "The source pointers target must be reviewed before target mutation.",
    proposed_change: "Write minimal source graph seed only after approved review.",
    promotion_payload: {
      payload_type: "init_source_pointers",
      bootstrap_capability: "source_pointers",
      target_path: ".krn/sources/index.json",
      write_mode: "exact_file_content",
      file_content: fileContent,
      content_sha256: sha256(fileContent),
    },
    target: {
      target_type: "path",
      path: ".krn/sources/index.json",
    },
    write_policy: {
      default_effect: "no_mutation",
      allowed_persistence: "append_only",
      idempotency_key: "init-bootstrap:source_pointers:test",
    },
    review_gate: {
      required: true,
      state: "not_reviewed",
      reviewer: null,
    },
    evidence_refs: [".krn/init/test/manifest.json"],
    source_refs: [".krn/init/test/manifest.json"],
    blocked_surfaces: ["target_file_mutation", "memory_core_write", "copied_source_truth"],
    created_at: "2026-06-20T22:45:00.000Z",
    created_by: "krn init",
    interpretation_caveat:
      "This init proposal is append-only review input and does not mutate .krn/sources/index.json until explicit apply mode.",
    ...overrides,
  });
}

function validInitContextPointersProposal(overrides: Partial<KrnControlPlaneProposal> = {}): KrnControlPlaneProposal {
  const fileContent = initContextPointersContent();
  return parseKrnControlPlaneProposal({
    schema_version: "krn-control-plane-proposal.v1",
    kind: "krn_control_plane_proposal",
    proposal_id: "init-bootstrap-context-pointers-test",
    proposal_kind: "init_bootstrap",
    status: "proposal_only",
    title: "Review KRN init context-pointers bootstrap",
    rationale: "The context pointers target must be reviewed before target mutation.",
    proposed_change: "Write minimal context pointer index only after approved review.",
    promotion_payload: {
      payload_type: "init_context_pointers",
      bootstrap_capability: "context_pointers",
      target_path: ".krn/context/index.json",
      write_mode: "exact_file_content",
      file_content: fileContent,
      content_sha256: sha256(fileContent),
    },
    target: {
      target_type: "path",
      path: ".krn/context/index.json",
    },
    write_policy: {
      default_effect: "no_mutation",
      allowed_persistence: "append_only",
      idempotency_key: "init-bootstrap:context_pointers:test",
    },
    review_gate: {
      required: true,
      state: "not_reviewed",
      reviewer: null,
    },
    evidence_refs: [".krn/init/test/manifest.json"],
    source_refs: [".krn/init/test/manifest.json"],
    blocked_surfaces: ["target_file_mutation", "memory_core_write", "context_dump"],
    created_at: "2026-06-20T22:45:00.000Z",
    created_by: "krn init",
    interpretation_caveat:
      "This init proposal is append-only review input and does not mutate .krn/context/index.json until explicit apply mode.",
    ...overrides,
  });
}

function validInitEvalBaselineProposal(overrides: Partial<KrnControlPlaneProposal> = {}): KrnControlPlaneProposal {
  const fileContent = initEvalBaselineContent();
  return parseKrnControlPlaneProposal({
    schema_version: "krn-control-plane-proposal.v1",
    kind: "krn_control_plane_proposal",
    proposal_id: "init-bootstrap-eval-baseline-test",
    proposal_kind: "init_bootstrap",
    status: "proposal_only",
    title: "Review KRN init eval-baseline bootstrap",
    rationale: "The eval baseline target must be reviewed before target mutation.",
    proposed_change: "Write minimal eval baseline seed only after approved review.",
    promotion_payload: {
      payload_type: "init_eval_baseline",
      bootstrap_capability: "eval_baseline",
      target_path: ".krn/evals/baseline.json",
      write_mode: "exact_file_content",
      file_content: fileContent,
      content_sha256: sha256(fileContent),
    },
    target: {
      target_type: "path",
      path: ".krn/evals/baseline.json",
    },
    write_policy: {
      default_effect: "no_mutation",
      allowed_persistence: "append_only",
      idempotency_key: "init-bootstrap:eval_baseline:test",
    },
    review_gate: {
      required: true,
      state: "not_reviewed",
      reviewer: null,
    },
    evidence_refs: [".krn/init/test/manifest.json"],
    source_refs: [".krn/init/test/manifest.json"],
    blocked_surfaces: ["target_file_mutation", "memory_core_write", "lab_default", "lift_claim"],
    created_at: "2026-06-20T22:45:00.000Z",
    created_by: "krn init",
    interpretation_caveat:
      "This init proposal is append-only review input and does not mutate .krn/evals/baseline.json until explicit apply mode.",
    ...overrides,
  });
}

function validInitSkillWiringProposal(overrides: Partial<KrnControlPlaneProposal> = {}): KrnControlPlaneProposal {
  const fileContent = initSkillWiringContent();
  return parseKrnControlPlaneProposal({
    schema_version: "krn-control-plane-proposal.v1",
    kind: "krn_control_plane_proposal",
    proposal_id: "init-bootstrap-skill-wiring-test",
    proposal_kind: "init_bootstrap",
    status: "proposal_only",
    title: "Review KRN init skill-wiring bootstrap",
    rationale: "The skill wiring target must be reviewed before target mutation.",
    proposed_change: "Write minimal repo-local skill wiring seed only after approved review.",
    promotion_payload: {
      payload_type: "init_skill_wiring",
      bootstrap_capability: "skill_wiring",
      target_path: ".agents/skills/README.md",
      write_mode: "exact_file_content",
      file_content: fileContent,
      content_sha256: sha256(fileContent),
    },
    target: {
      target_type: "path",
      path: ".agents/skills/README.md",
    },
    write_policy: {
      default_effect: "no_mutation",
      allowed_persistence: "append_only",
      idempotency_key: "init-bootstrap:skill_wiring:test",
    },
    review_gate: {
      required: true,
      state: "not_reviewed",
      reviewer: null,
    },
    evidence_refs: [".krn/init/test/manifest.json"],
    source_refs: [".krn/init/test/manifest.json"],
    blocked_surfaces: ["target_file_mutation", "memory_core_write", "copied_skill_body"],
    created_at: "2026-06-20T22:45:00.000Z",
    created_by: "krn init",
    interpretation_caveat:
      "This init proposal is append-only review input and does not mutate .agents/skills/README.md until explicit apply mode.",
    ...overrides,
  });
}

function validInitPolicyBoundariesProposal(overrides: Partial<KrnControlPlaneProposal> = {}): KrnControlPlaneProposal {
  const fileContent = initPolicyBoundariesContent();
  return parseKrnControlPlaneProposal({
    schema_version: "krn-control-plane-proposal.v1",
    kind: "krn_control_plane_proposal",
    proposal_id: "init-bootstrap-policy-boundaries-test",
    proposal_kind: "init_bootstrap",
    status: "proposal_only",
    title: "Review KRN init policy-boundaries bootstrap",
    rationale: "The policy boundaries target must be reviewed before target mutation.",
    proposed_change: "Write minimal policy boundary seed only after approved review.",
    promotion_payload: {
      payload_type: "init_policy_boundaries",
      bootstrap_capability: "policy_boundaries",
      target_path: ".krn/policies/boundaries.json",
      write_mode: "exact_file_content",
      file_content: fileContent,
      content_sha256: sha256(fileContent),
    },
    target: {
      target_type: "path",
      path: ".krn/policies/boundaries.json",
    },
    write_policy: {
      default_effect: "no_mutation",
      allowed_persistence: "append_only",
      idempotency_key: "init-bootstrap:policy_boundaries:test",
    },
    review_gate: {
      required: true,
      state: "not_reviewed",
      reviewer: null,
    },
    evidence_refs: [".krn/init/test/manifest.json"],
    source_refs: [".krn/init/test/manifest.json"],
    blocked_surfaces: ["target_file_mutation", "memory_core_write", "cloud_sync_default"],
    created_at: "2026-06-20T22:45:00.000Z",
    created_by: "krn init",
    interpretation_caveat:
      "This init proposal is append-only review input and does not mutate .krn/policies/boundaries.json until explicit apply mode.",
    ...overrides,
  });
}

function validDecisionFor(
  proposal: KrnControlPlaneProposal,
  proposalPath: string,
  overrides: Partial<KrnProposalReviewDecision> = {},
): KrnProposalReviewDecision {
  const decision = parseKrnProposalReviewDecision(
    readJson("docs/specs/krn-proposal-review-decision/examples/proposal-review-decision.example.json"),
  );

  return parseKrnProposalReviewDecision({
    ...decision,
    proposal_id: proposal.proposal_id,
    proposal_path: proposalPath,
    source_refs: proposal.source_refs,
    evidence_refs: proposal.evidence_refs,
    ...overrides,
  });
}

function validPromotionFor(
  proposal: KrnControlPlaneProposal,
  proposalPath: string,
  decision: KrnProposalReviewDecision,
  decisionPath: string,
  overrides: Partial<KrnProposalPromotion> = {},
): KrnProposalPromotion {
  const promotion = parseKrnProposalPromotion(
    readJson("docs/specs/krn-proposal-promotion/examples/proposal-promotion.example.json"),
  );

  return parseKrnProposalPromotion({
    ...promotion,
    proposal_id: proposal.proposal_id,
    proposal_path: proposalPath,
    decision_id: decision.decision_id,
    decision_path: decisionPath,
    proposal_kind: proposal.proposal_kind,
    target: {
      ...promotion.target,
      path: proposal.target.target_type === "path" ? proposal.target.path : promotion.target.path,
      file_content: proposal.promotion_payload?.file_content ?? promotion.target.file_content,
      content_sha256: proposal.promotion_payload?.content_sha256 ?? promotion.target.content_sha256,
    },
    evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
    ...overrides,
  });
}

function createPromotionTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-store-"));
  const proposal = validProposal();
  const promotion = parseKrnProposalPromotion(
    readJson("docs/specs/krn-proposal-promotion/examples/proposal-promotion.example.json"),
  );
  const sourceRefs = new Set([...proposal.source_refs, ...promotion.source_refs]);
  for (const sourceRef of sourceRefs) {
    writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
  }
  return targetRoot;
}

function collectFiles(targetRoot: string, prefix = ""): string[] {
  const absoluteRoot = join(targetRoot, prefix);
  return readdirSync(absoluteRoot, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(prefix, entry.name);
    if (entry.isDirectory()) {
      return collectFiles(targetRoot, entryPath);
    }
    return entryPath.replaceAll("\\", "/");
  });
}

function storeApprovedReview(targetRoot: string, proposal: KrnControlPlaneProposal): {
  proposalPath: string;
  decision: KrnProposalReviewDecision;
  decisionPath: string;
} {
  const storedProposal = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot });
  const decision = validDecisionFor(proposal, storedProposal.proposal_path);
  const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: targetRoot });

  return {
    proposalPath: storedProposal.proposal_path,
    decision,
    decisionPath: storedDecision.decision_path,
  };
}

describe("KRN proposal promotion store", () => {
  it("stores a record-only promotion without mutating the proposal target", () => {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal();
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath);
    const beforeFiles = collectFiles(targetRoot);

    const result = storeKrnProposalPromotion(promotion, {
      targetInput: targetRoot,
      now: new Date("2026-06-20T02:00:00.000Z"),
    });
    const newFiles = collectFiles(targetRoot).filter((file) => !beforeFiles.includes(file));

    expect(result.status).toBe("stored");
    expect(result.target_written).toBe(false);
    expect(result.promotion_path).toMatch(/^\.krn\/promotions\/.+\/promotion\.json$/);
    expect(newFiles).toEqual([result.promotion_path]);
    expect(proposal.target.target_type === "path" && existsSync(join(targetRoot, proposal.target.path))).toBe(false);
  });

  it("applies exact memory content only in explicit apply mode", () => {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal();
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      promotion_id: "promotion-apply-memory-note-krn-mcp-stdio-transport",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "proposal-promotion:apply-memory-note-krn-mcp-stdio-transport:2026-06-20",
      },
    });

    const result = storeKrnProposalPromotion(promotion, { targetInput: targetRoot });

    expect(result.status).toBe("stored");
    expect(result.target_written).toBe(true);
    if (proposal.target.target_type === "path") {
      expect(readFileSync(join(targetRoot, proposal.target.path), "utf8")).toBe(promotion.target.file_content);
    }
  });

  it("applies exact init agent instructions only after an approved review decision", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-init-store-"));
    const proposal = validInitProposal();
    for (const sourceRef of proposal.source_refs) {
      writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
    }
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      promotion_id: "promotion-apply-init-bootstrap-agent-instructions",
      promotion_scope: "approved_init_bootstrap_only",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
      source_refs: [...proposal.source_refs, ...decision.source_refs],
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "init-bootstrap-apply:init-bootstrap-agent-instructions-test:decision",
      },
    });

    const result = storeKrnProposalPromotion(promotion, { targetInput: targetRoot });

    expect(result.status).toBe("stored");
    expect(result.target_written).toBe(true);
    expect(readFileSync(join(targetRoot, "AGENTS.md"), "utf8")).toBe(initAgentInstructionsContent());
    expect(existsSync(join(targetRoot, result.promotion_path))).toBe(true);
  });

  it("applies exact init local config only after an approved review decision", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-init-config-store-"));
    const proposal = validInitLocalConfigProposal();
    for (const sourceRef of proposal.source_refs) {
      writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
    }
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      promotion_id: "promotion-apply-init-bootstrap-local-config",
      promotion_scope: "approved_init_bootstrap_only",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
      source_refs: [...proposal.source_refs, ...decision.source_refs],
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "init-bootstrap-apply:init-bootstrap-local-config-test:decision",
      },
    });

    const result = storeKrnProposalPromotion(promotion, { targetInput: targetRoot });

    expect(result.status).toBe("stored");
    expect(result.target_written).toBe(true);
    expect(readFileSync(join(targetRoot, ".krn", "config.toml"), "utf8")).toBe(initLocalConfigContent());
    expect(existsSync(join(targetRoot, result.promotion_path))).toBe(true);
  });

  it("applies exact init source pointers only after an approved review decision", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-init-sources-store-"));
    const proposal = validInitSourcePointersProposal();
    for (const sourceRef of proposal.source_refs) {
      writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
    }
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      promotion_id: "promotion-apply-init-bootstrap-source-pointers",
      promotion_scope: "approved_init_bootstrap_only",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
      source_refs: [...proposal.source_refs, ...decision.source_refs],
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "init-bootstrap-apply:init-bootstrap-source-pointers-test:decision",
      },
    });

    const result = storeKrnProposalPromotion(promotion, { targetInput: targetRoot });

    expect(result.status).toBe("stored");
    expect(result.target_written).toBe(true);
    expect(readFileSync(join(targetRoot, ".krn", "sources", "index.json"), "utf8")).toBe(initSourcePointersContent());
    expect(existsSync(join(targetRoot, result.promotion_path))).toBe(true);
  });

  it("applies exact init context pointers only after an approved review decision", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-init-context-store-"));
    const proposal = validInitContextPointersProposal();
    for (const sourceRef of proposal.source_refs) {
      writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
    }
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      promotion_id: "promotion-apply-init-bootstrap-context-pointers",
      promotion_scope: "approved_init_bootstrap_only",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
      source_refs: [...proposal.source_refs, ...decision.source_refs],
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "init-bootstrap-apply:init-bootstrap-context-pointers-test:decision",
      },
    });

    const result = storeKrnProposalPromotion(promotion, { targetInput: targetRoot });
    const contextContent = readFileSync(join(targetRoot, ".krn", "context", "index.json"), "utf8");
    const contextIndex = parseKrnContextPointerIndex(JSON.parse(contextContent) as unknown);

    expect(result.status).toBe("stored");
    expect(result.target_written).toBe(true);
    expect(contextContent).toBe(initContextPointersContent());
    expect(contextIndex.memory_policy.store_memory_bodies).toBe(false);
    expect(existsSync(join(targetRoot, result.promotion_path))).toBe(true);
  });

  it("applies exact init eval baseline only after an approved review decision", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-init-eval-store-"));
    const proposal = validInitEvalBaselineProposal();
    for (const sourceRef of proposal.source_refs) {
      writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
    }
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      promotion_id: "promotion-apply-init-bootstrap-eval-baseline",
      promotion_scope: "approved_init_bootstrap_only",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
      source_refs: [...proposal.source_refs, ...decision.source_refs],
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "init-bootstrap-apply:init-bootstrap-eval-baseline-test:decision",
      },
    });

    const result = storeKrnProposalPromotion(promotion, { targetInput: targetRoot });
    const evalBaselineContent = readFileSync(join(targetRoot, ".krn", "evals", "baseline.json"), "utf8");
    const evalBaseline = parseKrnEvalBaseline(JSON.parse(evalBaselineContent) as unknown);

    expect(result.status).toBe("stored");
    expect(result.target_written).toBe(true);
    expect(evalBaselineContent).toBe(initEvalBaselineContent());
    expect(evalBaseline.default_lane).toBe("current");
    expect(evalBaseline.forbidden_default_lanes).toEqual(["lab", "all"]);
    expect(evalBaseline.policy.productivity_lift_claimed).toBe(false);
    expect(existsSync(join(targetRoot, result.promotion_path))).toBe(true);
  });

  it("applies exact init skill wiring only after an approved review decision", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-init-skill-store-"));
    const proposal = validInitSkillWiringProposal();
    for (const sourceRef of proposal.source_refs) {
      writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
    }
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      promotion_id: "promotion-apply-init-bootstrap-skill-wiring",
      promotion_scope: "approved_init_bootstrap_only",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
      source_refs: [...proposal.source_refs, ...decision.source_refs],
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "init-bootstrap-apply:init-bootstrap-skill-wiring-test:decision",
      },
    });

    const result = storeKrnProposalPromotion(promotion, { targetInput: targetRoot });
    const skillWiringContent = readFileSync(join(targetRoot, ".agents", "skills", "README.md"), "utf8");

    expect(result.status).toBe("stored");
    expect(result.target_written).toBe(true);
    expect(skillWiringContent).toBe(initSkillWiringContent());
    expect(skillWiringContent).not.toContain("goal-038");
    expect(existsSync(join(targetRoot, result.promotion_path))).toBe(true);
  });

  it("applies exact init policy boundaries only after an approved review decision", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-init-policy-store-"));
    const proposal = validInitPolicyBoundariesProposal();
    for (const sourceRef of proposal.source_refs) {
      writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
    }
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      promotion_id: "promotion-apply-init-bootstrap-policy-boundaries",
      promotion_scope: "approved_init_bootstrap_only",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
      source_refs: [...proposal.source_refs, ...decision.source_refs],
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "init-bootstrap-apply:init-bootstrap-policy-boundaries-test:decision",
      },
    });

    const result = storeKrnProposalPromotion(promotion, { targetInput: targetRoot });
    const policyContent = readFileSync(join(targetRoot, ".krn", "policies", "boundaries.json"), "utf8");
    const policy = parseKrnPolicyBoundaries(JSON.parse(policyContent) as unknown);

    expect(result.status).toBe("stored");
    expect(result.target_written).toBe(true);
    expect(policyContent).toBe(initPolicyBoundariesContent());
    expect(policy.boundaries.find((boundary) => boundary.surface === "memory_core_write")?.enforcement).toBe("block");
    expect(policy.forbidden_defaults).toContain("cloud_sync_default");
    expect(existsSync(join(targetRoot, result.promotion_path))).toBe(true);
  });

  it("treats duplicate promotion records as already stored", () => {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal();
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath);

    const first = storeKrnProposalPromotion(promotion, { targetInput: targetRoot });
    const second = storeKrnProposalPromotion(promotion, { targetInput: targetRoot });

    expect(first.status).toBe("stored");
    expect(second.status).toBe("already_stored");
    expect(second.promotion_path).toBe(first.promotion_path);
  });

  it("rejects promotion when the review decision rejected the proposal", () => {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal();
    const storedProposal = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot });
    const rejectedDecision = validDecisionFor(proposal, storedProposal.proposal_path, {
      decision_id: "decision-reject-proposal-memory-note-krn-mcp-stdio-transport",
      decision: "rejected",
      rationale: "Rejected decisions must not promote target content.",
      write_policy: {
        default_effect: "no_target_mutation",
        allowed_persistence: "append_only",
        idempotency_key: "review-decision:reject-memory-note-krn-mcp-stdio-transport:2026-06-20",
      },
    });
    const storedDecision = storeKrnProposalReviewDecision(rejectedDecision, { targetInput: targetRoot });
    const promotion = validPromotionFor(proposal, storedProposal.proposal_path, rejectedDecision, storedDecision.decision_path);

    expect(() => storeKrnProposalPromotion(promotion, { targetInput: targetRoot })).toThrow(/approved_for_promotion/);
  });

  it("rejects promotion when the proposal lacks machine-applicable payload", () => {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal({ promotion_payload: undefined });
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(validProposal(), proposalPath, decision, decisionPath);

    expect(() => storeKrnProposalPromotion(promotion, { targetInput: targetRoot })).toThrow(/machine-applicable/);
  });

  it("lists invalid manually written promotion records", () => {
    const targetRoot = createPromotionTarget();
    writeText(join(targetRoot, ".krn/promotions/bad/promotion.json"), "{\"bad\": true}\n");

    const records = listKrnProposalPromotionStoreRecords(targetRoot);

    expect(records.total_records).toBe(1);
    expect(records.valid_records).toEqual([]);
    expect(records.invalid_records[0]?.promotion_path).toBe(".krn/promotions/bad/promotion.json");
  });
});
