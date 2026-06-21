import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import {
  parseKrnContextPointerIndex,
  parseKrnControlPlaneProposal,
  parseKrnEvalBaseline,
  parseKrnPolicyBoundaries,
  parseKrnProposalPromotion,
  parseKrnProposalReviewDecision,
  type KrnControlPlaneProposal,
  type KrnProposalPromotion,
  type KrnProposalReviewDecision,
} from "@krn/contracts";
import {
  listKrnProposalPromotionStoreRecords,
  storeKrnControlPlaneProposal,
  storeKrnProposalPromotion,
  storeKrnProposalReviewDecision,
} from "@krn/mcp";

type EvalCase = {
  id: string;
  expected_behavior: string;
  metrics: string[];
  failure_mode: string;
};

type CaseResult = {
  id: string;
  passed: boolean;
  assertions: string[];
  failure_mode: string;
  message: string;
};

type EvalReport = {
  schema_version: "krn-proposal-promotion-result.v1";
  kind: "krn_proposal_promotion_eval_result";
  run_id: string;
  created_at: string;
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  case_pass_rate: number;
  total_assertions: number;
  passed_assertions: number;
  failed_assertions: number;
  assertion_pass_rate: number;
  cases: CaseResult[];
  stored_promotion_path: string | null;
  applied_target_path: string | null;
  interpretation_caveat: string;
};

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function parseCases(input: unknown): EvalCase[] {
  if (!Array.isArray(input)) {
    throw new Error("cases.json must be an array");
  }

  return input.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`case ${index} must be an object`);
    }

    const record = item as Record<string, unknown>;
    const id = record.id;
    const expectedBehavior = record.expected_behavior;
    const metrics = record.metrics;
    const failureMode = record.failure_mode;

    if (typeof id !== "string" || id.length === 0) {
      throw new Error(`case ${index} missing id`);
    }
    if (typeof expectedBehavior !== "string" || expectedBehavior.length === 0) {
      throw new Error(`case ${id} missing expected_behavior`);
    }
    if (!Array.isArray(metrics) || !metrics.every((metric) => typeof metric === "string" && metric.length > 0)) {
      throw new Error(`case ${id} missing metrics`);
    }
    if (typeof failureMode !== "string" || failureMode.length === 0) {
      throw new Error(`case ${id} missing failure_mode`);
    }

    return {
      id,
      expected_behavior: expectedBehavior,
      metrics,
      failure_mode: failureMode,
    };
  });
}

function result(id: string, passed: boolean, assertions: string[], failureMode: string, message: string): CaseResult {
  return { id, passed, assertions, failure_mode: failureMode, message };
}

function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}`;
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

function validProposal(): KrnControlPlaneProposal {
  return parseKrnControlPlaneProposal(
    readJson(resolve("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json")),
  );
}

function proposalWithoutPromotionPayload(): KrnControlPlaneProposal {
  const proposal = validProposal();
  const { promotion_payload: _promotionPayload, ...rest } = proposal;
  return parseKrnControlPlaneProposal(rest);
}

function validInitProposal(): KrnControlPlaneProposal {
  const fileContent = initAgentInstructionsContent();
  return parseKrnControlPlaneProposal({
    schema_version: "krn-control-plane-proposal.v1",
    kind: "krn_control_plane_proposal",
    proposal_id: "init-bootstrap-agent-instructions-eval",
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
      idempotency_key: "init-bootstrap:agent_instructions:eval",
    },
    review_gate: {
      required: true,
      state: "not_reviewed",
      reviewer: null,
    },
    evidence_refs: [".krn/init/eval/manifest.json"],
    source_refs: [".krn/init/eval/manifest.json"],
    blocked_surfaces: ["target_file_mutation", "memory_core_write"],
    created_at: "2026-06-20T22:55:00.000Z",
    created_by: "krn init",
    interpretation_caveat:
      "This init proposal is append-only review input and does not mutate AGENTS.md until explicit apply mode.",
  });
}

function validInitLocalConfigProposal(): KrnControlPlaneProposal {
  const fileContent = initLocalConfigContent();
  return parseKrnControlPlaneProposal({
    schema_version: "krn-control-plane-proposal.v1",
    kind: "krn_control_plane_proposal",
    proposal_id: "init-bootstrap-local-config-eval",
    proposal_kind: "init_bootstrap",
    status: "proposal_only",
    title: "Review KRN init local-config bootstrap",
    rationale: "The local config target must be reviewed before target mutation.",
    proposed_change: "Write a minimal .krn/config.toml only after approved review.",
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
      idempotency_key: "init-bootstrap:local_config:eval",
    },
    review_gate: {
      required: true,
      state: "not_reviewed",
      reviewer: null,
    },
    evidence_refs: [".krn/init/eval/manifest.json"],
    source_refs: [".krn/init/eval/manifest.json"],
    blocked_surfaces: ["target_file_mutation", "memory_core_write"],
    created_at: "2026-06-20T22:55:00.000Z",
    created_by: "krn init",
    interpretation_caveat:
      "This init proposal is append-only review input and does not mutate .krn/config.toml until explicit apply mode.",
  });
}

function validInitSourcePointersProposal(): KrnControlPlaneProposal {
  const fileContent = initSourcePointersContent();
  return parseKrnControlPlaneProposal({
    schema_version: "krn-control-plane-proposal.v1",
    kind: "krn_control_plane_proposal",
    proposal_id: "init-bootstrap-source-pointers-eval",
    proposal_kind: "init_bootstrap",
    status: "proposal_only",
    title: "Review KRN init source-pointers bootstrap",
    rationale: "The source graph seed target must be reviewed before target mutation.",
    proposed_change: "Write a minimal .krn/sources/index.json only after approved review.",
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
      idempotency_key: "init-bootstrap:source_pointers:eval",
    },
    review_gate: {
      required: true,
      state: "not_reviewed",
      reviewer: null,
    },
    evidence_refs: [".krn/init/eval/manifest.json"],
    source_refs: [".krn/init/eval/manifest.json"],
    blocked_surfaces: ["target_file_mutation", "memory_core_write", "copied_source_truth"],
    created_at: "2026-06-20T22:55:00.000Z",
    created_by: "krn init",
    interpretation_caveat:
      "This init proposal is append-only review input and does not mutate .krn/sources/index.json until explicit apply mode.",
  });
}

function validInitContextPointersProposal(): KrnControlPlaneProposal {
  const fileContent = initContextPointersContent();
  return parseKrnControlPlaneProposal({
    schema_version: "krn-control-plane-proposal.v1",
    kind: "krn_control_plane_proposal",
    proposal_id: "init-bootstrap-context-pointers-eval",
    proposal_kind: "init_bootstrap",
    status: "proposal_only",
    title: "Review KRN init context-pointers bootstrap",
    rationale: "The context pointer index target must be reviewed before target mutation.",
    proposed_change: "Write a minimal .krn/context/index.json only after approved review.",
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
      idempotency_key: "init-bootstrap:context_pointers:eval",
    },
    review_gate: {
      required: true,
      state: "not_reviewed",
      reviewer: null,
    },
    evidence_refs: [".krn/init/eval/manifest.json"],
    source_refs: [".krn/init/eval/manifest.json"],
    blocked_surfaces: ["target_file_mutation", "memory_core_write", "context_dump"],
    created_at: "2026-06-20T22:55:00.000Z",
    created_by: "krn init",
    interpretation_caveat:
      "This init proposal is append-only review input and does not mutate .krn/context/index.json until explicit apply mode.",
  });
}

function validInitEvalBaselineProposal(): KrnControlPlaneProposal {
  const fileContent = initEvalBaselineContent();
  return parseKrnControlPlaneProposal({
    schema_version: "krn-control-plane-proposal.v1",
    kind: "krn_control_plane_proposal",
    proposal_id: "init-bootstrap-eval-baseline-eval",
    proposal_kind: "init_bootstrap",
    status: "proposal_only",
    title: "Review KRN init eval-baseline bootstrap",
    rationale: "The eval baseline target must be reviewed before target mutation.",
    proposed_change: "Write a minimal .krn/evals/baseline.json only after approved review.",
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
      idempotency_key: "init-bootstrap:eval_baseline:eval",
    },
    review_gate: {
      required: true,
      state: "not_reviewed",
      reviewer: null,
    },
    evidence_refs: [".krn/init/eval/manifest.json"],
    source_refs: [".krn/init/eval/manifest.json"],
    blocked_surfaces: ["target_file_mutation", "memory_core_write", "lab_default", "lift_claim"],
    created_at: "2026-06-20T22:55:00.000Z",
    created_by: "krn init",
    interpretation_caveat:
      "This init proposal is append-only review input and does not mutate .krn/evals/baseline.json until explicit apply mode.",
  });
}

function validInitPolicyBoundariesProposal(): KrnControlPlaneProposal {
  const fileContent = initPolicyBoundariesContent();
  return parseKrnControlPlaneProposal({
    schema_version: "krn-control-plane-proposal.v1",
    kind: "krn_control_plane_proposal",
    proposal_id: "init-bootstrap-policy-boundaries-eval",
    proposal_kind: "init_bootstrap",
    status: "proposal_only",
    title: "Review KRN init policy-boundaries bootstrap",
    rationale: "The policy boundaries target must be reviewed before target mutation.",
    proposed_change: "Write a minimal .krn/policies/boundaries.json only after approved review.",
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
      idempotency_key: "init-bootstrap:policy_boundaries:eval",
    },
    review_gate: {
      required: true,
      state: "not_reviewed",
      reviewer: null,
    },
    evidence_refs: [".krn/init/eval/manifest.json"],
    source_refs: [".krn/init/eval/manifest.json"],
    blocked_surfaces: ["target_file_mutation", "memory_core_write", "cloud_sync_default", "lift_claim"],
    created_at: "2026-06-20T22:55:00.000Z",
    created_by: "krn init",
    interpretation_caveat:
      "This init proposal is append-only review input and does not mutate .krn/policies/boundaries.json until explicit apply mode.",
  });
}

function validDecisionFor(
  proposal: KrnControlPlaneProposal,
  proposalPath: string,
  overrides: Partial<KrnProposalReviewDecision> = {},
): KrnProposalReviewDecision {
  const decision = parseKrnProposalReviewDecision(
    readJson(resolve("docs/specs/krn-proposal-review-decision/examples/proposal-review-decision.example.json")),
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
    readJson(resolve("docs/specs/krn-proposal-promotion/examples/proposal-promotion.example.json")),
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
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-eval-"));
  const proposal = validProposal();
  const promotion = parseKrnProposalPromotion(
    readJson(resolve("docs/specs/krn-proposal-promotion/examples/proposal-promotion.example.json")),
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

function caseById(cases: EvalCase[], id: string): EvalCase {
  const found = cases.find((testCase) => testCase.id === id);
  if (!found) {
    throw new Error(`Missing case ${id}`);
  }
  return found;
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

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-proposal-promotion/cases.json")));
  const results: CaseResult[] = [];
  let storedPromotionPath: string | null = null;
  let appliedTargetPath: string | null = null;

  const contractCase = caseById(cases, "promotion-contract-valid-and-known-bad");
  try {
    const promotion = parseKrnProposalPromotion(
      readJson(resolve("docs/specs/krn-proposal-promotion/examples/proposal-promotion.example.json")),
    );
    const proposal = parseKrnControlPlaneProposal(
      readJson(resolve("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json")),
    );
    let badPromotionRejected = false;
    let badPayloadRejected = false;
    try {
      parseKrnProposalPromotion(
        readJson(resolve("docs/specs/krn-proposal-promotion/fixtures/bad-proposal-promotion.example.json")),
      );
    } catch {
      badPromotionRejected = true;
    }
    try {
      parseKrnControlPlaneProposal(
        readJson(resolve("docs/specs/krn-control-plane-proposal/fixtures/bad-promotion-payload.example.json")),
      );
    } catch {
      badPayloadRejected = true;
    }

    results.push(
      result(
        contractCase.id,
        promotion.apply_mode === "record_only" &&
          promotion.target_mutated === false &&
          proposal.promotion_payload?.payload_type === "memory_entry" &&
          badPromotionRejected &&
          badPayloadRejected,
        [
          "valid promotion fixture parses",
          "known-bad promotion mutation fixture rejected",
          "valid proposal payload parses",
          "mismatched proposal payload rejected",
        ],
        contractCase.failure_mode,
        "Promotion contract and proposal payload fixtures enforce exact machine-applicable promotion semantics.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        contractCase.id,
        false,
        ["promotion contract fixtures"],
        contractCase.failure_mode,
        error instanceof Error ? error.message : "unknown promotion contract error",
      ),
    );
  }

  const recordOnlyCase = caseById(cases, "record-only-promotion-store");
  try {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal();
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const beforeFiles = collectFiles(targetRoot);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath);
    const stored = storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    storedPromotionPath = stored.promotion_path;
    const newFiles = collectFiles(targetRoot).filter((file) => !beforeFiles.includes(file));
    const targetMutated = proposal.target.target_type === "path" ? existsSync(join(targetRoot, proposal.target.path)) : false;

    results.push(
      result(
        recordOnlyCase.id,
        stored.status === "stored" &&
          stored.target_written === false &&
          stored.promotion_path.startsWith(".krn/promotions/") &&
          newFiles.length === 1 &&
          newFiles[0] === stored.promotion_path &&
          !targetMutated,
        ["proposal stored first", "approved decision stored first", "promotion stored under .krn/promotions", "target not mutated"],
        recordOnlyCase.failure_mode,
        "Record-only promotion stored append-only under .krn/promotions without target mutation.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        recordOnlyCase.id,
        false,
        ["record-only promotion store"],
        recordOnlyCase.failure_mode,
        error instanceof Error ? error.message : "unknown record-only promotion error",
      ),
    );
  }

  const applyCase = caseById(cases, "apply-exact-memory-promotion");
  try {
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
    const stored = storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    const targetPath = proposal.target.target_type === "path" ? join(targetRoot, proposal.target.path) : null;
    appliedTargetPath = proposal.target.target_type === "path" ? proposal.target.path : null;

    results.push(
      result(
        applyCase.id,
        stored.status === "stored" &&
          stored.target_written === true &&
          targetPath !== null &&
          readFileSync(targetPath, "utf8") === promotion.target.file_content &&
          existsSync(join(targetRoot, stored.promotion_path)),
        ["apply promotion stored", "target written in apply mode", "target content matches payload", "promotion record persisted"],
        applyCase.failure_mode,
        "Explicit apply mode wrote exact reviewed memory payload content after approved review.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        applyCase.id,
        false,
        ["apply exact memory promotion"],
        applyCase.failure_mode,
        error instanceof Error ? error.message : "unknown apply promotion error",
      ),
    );
  }

  const initApplyCase = caseById(cases, "apply-exact-init-bootstrap-promotion");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-init-eval-"));
    const proposal = validInitProposal();
    for (const sourceRef of proposal.source_refs) {
      writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
    }
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      promotion_id: "promotion-apply-init-bootstrap-agent-instructions-eval",
      promotion_scope: "approved_init_bootstrap_only",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
      source_refs: [...proposal.source_refs, ...decision.source_refs],
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "init-bootstrap-apply:init-bootstrap-agent-instructions-eval:decision",
      },
    });
    const stored = storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    const targetPath = join(targetRoot, "AGENTS.md");
    appliedTargetPath = "AGENTS.md";

    results.push(
      result(
        initApplyCase.id,
        stored.status === "stored" &&
          stored.target_written === true &&
          readFileSync(targetPath, "utf8") === initAgentInstructionsContent() &&
          existsSync(join(targetRoot, stored.promotion_path)),
        [
          "approved init proposal stored",
          "init apply promotion stored",
          "AGENTS.md written in explicit apply mode",
          "promotion record persisted",
        ],
        initApplyCase.failure_mode,
        "Explicit apply mode wrote exact reviewed init agent-instructions payload after approved review.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        initApplyCase.id,
        false,
        ["apply exact init bootstrap promotion"],
        initApplyCase.failure_mode,
        error instanceof Error ? error.message : "unknown init apply promotion error",
      ),
    );
  }

  const initLocalConfigApplyCase = caseById(cases, "apply-exact-init-local-config-promotion");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-init-config-eval-"));
    const proposal = validInitLocalConfigProposal();
    for (const sourceRef of proposal.source_refs) {
      writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
    }
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      promotion_id: "promotion-apply-init-bootstrap-local-config-eval",
      promotion_scope: "approved_init_bootstrap_only",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
      source_refs: [...proposal.source_refs, ...decision.source_refs],
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "init-bootstrap-apply:init-bootstrap-local-config-eval:decision",
      },
    });
    const stored = storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    const targetPath = join(targetRoot, ".krn", "config.toml");
    appliedTargetPath = ".krn/config.toml";

    results.push(
      result(
        initLocalConfigApplyCase.id,
        stored.status === "stored" &&
          stored.target_written === true &&
          readFileSync(targetPath, "utf8") === initLocalConfigContent() &&
          existsSync(join(targetRoot, stored.promotion_path)),
        [
          "approved init local-config proposal stored",
          "init local-config apply promotion stored",
          ".krn/config.toml written in explicit apply mode",
          "promotion record persisted",
        ],
        initLocalConfigApplyCase.failure_mode,
        "Explicit apply mode wrote exact reviewed init local-config payload after approved review.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        initLocalConfigApplyCase.id,
        false,
        ["apply exact init local-config promotion"],
        initLocalConfigApplyCase.failure_mode,
        error instanceof Error ? error.message : "unknown init local-config apply promotion error",
      ),
    );
  }

  const initSourcePointersApplyCase = caseById(cases, "apply-exact-init-source-pointers-promotion");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-init-sources-eval-"));
    const proposal = validInitSourcePointersProposal();
    for (const sourceRef of proposal.source_refs) {
      writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
    }
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      promotion_id: "promotion-apply-init-bootstrap-source-pointers-eval",
      promotion_scope: "approved_init_bootstrap_only",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
      source_refs: [...proposal.source_refs, ...decision.source_refs],
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "init-bootstrap-apply:init-bootstrap-source-pointers-eval:decision",
      },
    });
    const stored = storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    const targetPath = join(targetRoot, ".krn", "sources", "index.json");
    appliedTargetPath = ".krn/sources/index.json";

    results.push(
      result(
        initSourcePointersApplyCase.id,
        stored.status === "stored" &&
          stored.target_written === true &&
          readFileSync(targetPath, "utf8") === initSourcePointersContent() &&
          existsSync(join(targetRoot, stored.promotion_path)),
        [
          "approved init source-pointers proposal stored",
          "init source-pointers apply promotion stored",
          ".krn/sources/index.json written in explicit apply mode",
          "promotion record persisted",
        ],
        initSourcePointersApplyCase.failure_mode,
        "Explicit apply mode wrote exact reviewed init source-pointers payload after approved review.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        initSourcePointersApplyCase.id,
        false,
        ["apply exact init source-pointers promotion"],
        initSourcePointersApplyCase.failure_mode,
        error instanceof Error ? error.message : "unknown init source-pointers apply promotion error",
      ),
    );
  }

  const initContextPointersApplyCase = caseById(cases, "apply-exact-init-context-pointers-promotion");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-init-context-eval-"));
    const proposal = validInitContextPointersProposal();
    for (const sourceRef of proposal.source_refs) {
      writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
    }
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      promotion_id: "promotion-apply-init-bootstrap-context-pointers-eval",
      promotion_scope: "approved_init_bootstrap_only",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
      source_refs: [...proposal.source_refs, ...decision.source_refs],
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "init-bootstrap-apply:init-bootstrap-context-pointers-eval:decision",
      },
    });
    const stored = storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    const targetPath = join(targetRoot, ".krn", "context", "index.json");
    const contextIndex = parseKrnContextPointerIndex(JSON.parse(readFileSync(targetPath, "utf8")) as unknown);
    appliedTargetPath = ".krn/context/index.json";

    results.push(
      result(
        initContextPointersApplyCase.id,
        stored.status === "stored" &&
          stored.target_written === true &&
          readFileSync(targetPath, "utf8") === initContextPointersContent() &&
          contextIndex.memory_policy.store_memory_bodies === false &&
          contextIndex.memory_policy.require_application_guidance === true &&
          existsSync(join(targetRoot, stored.promotion_path)),
        [
          "approved init context-pointers proposal stored",
          "init context-pointers apply promotion stored",
          ".krn/context/index.json written in explicit apply mode",
          "promotion record persisted",
          "context pointer index keeps memory bodies out of runtime seed",
        ],
        initContextPointersApplyCase.failure_mode,
        "Explicit apply mode wrote exact reviewed init context-pointers payload after approved review.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        initContextPointersApplyCase.id,
        false,
        ["apply exact init context-pointers promotion"],
        initContextPointersApplyCase.failure_mode,
        error instanceof Error ? error.message : "unknown init context-pointers apply promotion error",
      ),
    );
  }

  const initEvalBaselineApplyCase = caseById(cases, "apply-exact-init-eval-baseline-promotion");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-init-eval-baseline-eval-"));
    const proposal = validInitEvalBaselineProposal();
    for (const sourceRef of proposal.source_refs) {
      writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
    }
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      promotion_id: "promotion-apply-init-bootstrap-eval-baseline-eval",
      promotion_scope: "approved_init_bootstrap_only",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
      source_refs: [...proposal.source_refs, ...decision.source_refs],
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "init-bootstrap-apply:init-bootstrap-eval-baseline-eval:decision",
      },
    });
    const stored = storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    const targetPath = join(targetRoot, ".krn", "evals", "baseline.json");
    const evalBaseline = parseKrnEvalBaseline(JSON.parse(readFileSync(targetPath, "utf8")) as unknown);
    appliedTargetPath = ".krn/evals/baseline.json";

    results.push(
      result(
        initEvalBaselineApplyCase.id,
        stored.status === "stored" &&
          stored.target_written === true &&
          readFileSync(targetPath, "utf8") === initEvalBaselineContent() &&
          evalBaseline.default_lane === "current" &&
          evalBaseline.forbidden_default_lanes.includes("lab") &&
          evalBaseline.forbidden_default_lanes.includes("all") &&
          evalBaseline.policy.productivity_lift_claimed === false &&
          existsSync(join(targetRoot, stored.promotion_path)),
        [
          "approved init eval-baseline proposal stored",
          "init eval-baseline apply promotion stored",
          ".krn/evals/baseline.json written in explicit apply mode",
          "promotion record persisted",
          "eval baseline keeps lab/all and lift claims out of default bootstrap",
        ],
        initEvalBaselineApplyCase.failure_mode,
        "Explicit apply mode wrote exact reviewed init eval-baseline payload after approved review.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        initEvalBaselineApplyCase.id,
        false,
        ["apply exact init eval-baseline promotion"],
        initEvalBaselineApplyCase.failure_mode,
        error instanceof Error ? error.message : "unknown init eval-baseline apply promotion error",
      ),
    );
  }

  const initPolicyBoundariesApplyCase = caseById(cases, "apply-exact-init-policy-boundaries-promotion");
  try {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-promotion-init-policy-boundaries-eval-"));
    const proposal = validInitPolicyBoundariesProposal();
    for (const sourceRef of proposal.source_refs) {
      writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
    }
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      promotion_id: "promotion-apply-init-bootstrap-policy-boundaries-eval",
      promotion_scope: "approved_init_bootstrap_only",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      evidence_refs: [...proposal.evidence_refs, ...decision.evidence_refs],
      source_refs: [...proposal.source_refs, ...decision.source_refs],
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "init-bootstrap-apply:init-bootstrap-policy-boundaries-eval:decision",
      },
    });
    const stored = storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    const targetPath = join(targetRoot, ".krn", "policies", "boundaries.json");
    const policy = parseKrnPolicyBoundaries(JSON.parse(readFileSync(targetPath, "utf8")) as unknown);
    appliedTargetPath = ".krn/policies/boundaries.json";

    results.push(
      result(
        initPolicyBoundariesApplyCase.id,
        stored.status === "stored" &&
          stored.target_written === true &&
          readFileSync(targetPath, "utf8") === initPolicyBoundariesContent() &&
          policy.boundaries.find((boundary) => boundary.surface === "memory_core_write")?.enforcement === "block" &&
          policy.boundaries.find((boundary) => boundary.surface === "target_file_mutation")?.enforcement ===
            "require_approval" &&
          policy.forbidden_defaults.includes("cloud_sync_default") &&
          policy.forbidden_defaults.includes("productivity_lift_claim") &&
          policy.overclaim_boundary.includes("does not prove hook enforcement") &&
          existsSync(join(targetRoot, stored.promotion_path)),
        [
          "approved init policy-boundaries proposal stored",
          "init policy-boundaries apply promotion stored",
          ".krn/policies/boundaries.json written in explicit apply mode",
          "promotion record persisted",
          "policy seed blocks repo-local memory core and hook/security overclaims",
        ],
        initPolicyBoundariesApplyCase.failure_mode,
        "Explicit apply mode wrote exact reviewed init policy-boundaries payload after approved review.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        initPolicyBoundariesApplyCase.id,
        false,
        ["apply exact init policy-boundaries promotion"],
        initPolicyBoundariesApplyCase.failure_mode,
        error instanceof Error ? error.message : "unknown init policy-boundaries apply promotion error",
      ),
    );
  }

  const rejectedDecisionCase = caseById(cases, "rejected-decision-promotion-rejected");
  try {
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
    const storedDecision = storeKrnProposalReviewDecision(rejectedDecision, { targetInput: targetRoot, now });
    const promotion = validPromotionFor(proposal, storedProposal.proposal_path, rejectedDecision, storedDecision.decision_path);
    let rejected = false;
    try {
      storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    } catch {
      rejected = true;
    }

    results.push(
      result(
        rejectedDecisionCase.id,
        storedDecision.status === "stored" && rejected,
        ["rejected decision stored", "promotion rejected"],
        rejectedDecisionCase.failure_mode,
        "Promotion was rejected for a terminal rejected review decision.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        rejectedDecisionCase.id,
        false,
        ["rejected decision promotion rejected"],
        rejectedDecisionCase.failure_mode,
        error instanceof Error ? error.message : "unknown rejected decision promotion error",
      ),
    );
  }

  const missingPayloadCase = caseById(cases, "missing-payload-promotion-rejected");
  try {
    const targetRoot = createPromotionTarget();
    const proposal = proposalWithoutPromotionPayload();
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(validProposal(), proposalPath, decision, decisionPath);
    let rejected = false;
    try {
      storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    } catch {
      rejected = true;
    }

    results.push(
      result(
        missingPayloadCase.id,
        decision.decision === "approved_for_promotion" && rejected,
        ["approved decision stored", "missing payload rejected"],
        missingPayloadCase.failure_mode,
        "Promotion was rejected because the approved proposal lacked machine-applicable payload.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        missingPayloadCase.id,
        false,
        ["missing payload promotion rejected"],
        missingPayloadCase.failure_mode,
        error instanceof Error ? error.message : "unknown missing payload promotion error",
      ),
    );
  }

  const duplicateCase = caseById(cases, "duplicate-promotion-idempotent");
  try {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal();
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath);
    const first = storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    const second = storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });

    results.push(
      result(
        duplicateCase.id,
        first.status === "stored" && second.status === "already_stored" && first.promotion_path === second.promotion_path,
        ["first promotion stored", "duplicate promotion already stored", "duplicate promotion uses same path"],
        duplicateCase.failure_mode,
        "Duplicate promotion write returned the existing path for the same idempotency key and content.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        duplicateCase.id,
        false,
        ["duplicate promotion idempotent"],
        duplicateCase.failure_mode,
        error instanceof Error ? error.message : "unknown duplicate promotion error",
      ),
    );
  }

  const unsafeTargetCase = caseById(cases, "unsafe-target-path-rejected");
  try {
    const targetRoot = createPromotionTarget();
    const proposal = validProposal();
    const { proposalPath, decision, decisionPath } = storeApprovedReview(targetRoot, proposal);
    const promotion = validPromotionFor(proposal, proposalPath, decision, decisionPath, {
      target: {
        target_type: "path",
        path: "../outside.md",
        write_mode: "exact_file_content",
        file_content: proposal.promotion_payload?.file_content ?? "",
        content_sha256: proposal.promotion_payload?.content_sha256 ?? "",
      },
    });
    let rejected = false;
    try {
      storeKrnProposalPromotion(promotion, { targetInput: targetRoot, now });
    } catch {
      rejected = true;
    }
    const promotionRecords = listKrnProposalPromotionStoreRecords(targetRoot);
    const outsidePath = resolve(targetRoot, "..", "outside.md");

    results.push(
      result(
        unsafeTargetCase.id,
        rejected && promotionRecords.total_records === 0 && !existsSync(outsidePath),
        ["unsafe target path rejected", "no promotion record created", "outside target not written"],
        unsafeTargetCase.failure_mode,
        "Unsafe promotion target path was rejected before persistence or target write.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        unsafeTargetCase.id,
        false,
        ["unsafe target path rejected"],
        unsafeTargetCase.failure_mode,
        error instanceof Error ? error.message : "unknown unsafe target promotion error",
      ),
    );
  }

  const totalCases = results.length;
  const passedCases = results.filter((caseResult) => caseResult.passed).length;
  const totalAssertions = results.reduce((count, caseResult) => count + caseResult.assertions.length, 0);
  const passedAssertions = results.reduce(
    (count, caseResult) => count + (caseResult.passed ? caseResult.assertions.length : 0),
    0,
  );

  return {
    schema_version: "krn-proposal-promotion-result.v1",
    kind: "krn_proposal_promotion_eval_result",
    run_id: runId,
    created_at: now.toISOString(),
    total_cases: totalCases,
    passed_cases: passedCases,
    failed_cases: totalCases - passedCases,
    case_pass_rate: totalCases === 0 ? 0 : passedCases / totalCases,
    total_assertions: totalAssertions,
    passed_assertions: passedAssertions,
    failed_assertions: totalAssertions - passedAssertions,
    assertion_pass_rate: totalAssertions === 0 ? 0 : passedAssertions / totalAssertions,
    cases: results,
    stored_promotion_path: storedPromotionPath,
    applied_target_path: appliedTargetPath,
    interpretation_caveat:
      "This eval proves the local approved proposal promotion boundary for exact memory_update and init_bootstrap payloads, including policy-boundaries seeds, only; it does not prove general promotion correctness for every proposal kind, hook enforcement, security quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or productivity lift.",
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-proposal-promotion", report.run_id);
  const reportPath = resolve(reportDir, "report.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  console.log(`report: ${reportPath}`);

  if (report.failed_cases > 0) {
    process.exitCode = 1;
  }
}

main();
