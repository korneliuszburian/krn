import { createHash } from "node:crypto";
import {
  parseKrnContextPointerIndex,
  parseKrnEvalBaseline,
  parseKrnPolicyBoundaries,
  type ControlPlanePromotionPayload,
} from "@krn/contracts";

type InitAgentInstructionsPayload = Extract<
  ControlPlanePromotionPayload,
  { payload_type: "init_agent_instructions" }
>;
type InitLocalConfigPayload = Extract<ControlPlanePromotionPayload, { payload_type: "init_local_config" }>;
type InitSourcePointersPayload = Extract<ControlPlanePromotionPayload, { payload_type: "init_source_pointers" }>;
type InitContextPointersPayload = Extract<ControlPlanePromotionPayload, { payload_type: "init_context_pointers" }>;
type InitEvalBaselinePayload = Extract<ControlPlanePromotionPayload, { payload_type: "init_eval_baseline" }>;
type InitSkillWiringPayload = Extract<ControlPlanePromotionPayload, { payload_type: "init_skill_wiring" }>;
type InitPolicyBoundariesPayload = Extract<ControlPlanePromotionPayload, { payload_type: "init_policy_boundaries" }>;
type InitBootstrapPayload =
  | InitAgentInstructionsPayload
  | InitLocalConfigPayload
  | InitSourcePointersPayload
  | InitContextPointersPayload
  | InitEvalBaselinePayload
  | InitSkillWiringPayload
  | InitPolicyBoundariesPayload;
export type InitBootstrapCapability = InitBootstrapPayload["bootstrap_capability"];

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function agentInstructionsFileContent(): string {
  return `# Agent Instructions

This repository is KRN-enabled.

## Operating Rules

- Newest user message wins over repo-local instructions.
- Treat \`.krn/**\` as runtime evidence/cache/ledger, not authoritative memory.
- Before non-trivial agent work, use KRN gate/context commands when available and keep generated artifacts as runtime evidence.
- Keep changes surgical, verify through existing repo tests/checks, and do not overwrite unrelated files.
- Do not store secrets, private raw transcripts, or unreviewed claims in agent context.
`;
}

function localConfigFileContent(): string {
  return `schema_version = "krn-local-config.v1"
mode = "local-first"

[runtime]
root = ".krn"
evidence_root = ".krn"
source_graph = ".krn/sources/index.json"
context_root = ".krn/context"
eval_lane = "current"
memory_store_env = "KRN_MEMORY_STORE_PATH"

[boundaries]
docs_memory = "pattern_bank_audit_export"
krn_runtime = "evidence_cache_ledger"
memory_core = "external_local_store"
target_writes = "reviewed_promotion_only"
api_sync = "disabled"
dashboard = "disabled"
`;
}

function sourcePointersFileContent(): string {
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

function contextPointersFileContent(): string {
  return `${JSON.stringify(
    parseKrnContextPointerIndex({
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
    }),
    null,
    2,
  )}\n`;
}

function evalBaselineFileContent(): string {
  return `${JSON.stringify(
    parseKrnEvalBaseline({
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
    }),
    null,
    2,
  )}\n`;
}

function skillWiringFileContent(): string {
  return `# KRN Skill Wiring

This folder is reserved for reviewed repo-local Codex/KRN skills.

## Rules

- Do not copy active skill bodies from another repo without review.
- Every skill must define owner, trigger, forbidden behavior, verification, and deletion criteria.
- Keep SKILL.md lean; move large references into explicit reference files only when the skill needs them.
- Runtime evidence belongs in .krn/**, not in skill instructions.
- Durable memory bodies belong in the MemoryStore, not in this folder.

## Review Boundary

\`krn init\` writes only this seed through approved proposal promotion. It does not create active skills, prove trigger quality, prove skill eval quality, enforce hooks, create memory core, publish dashboard/API state, or claim productivity lift.
`;
}

function policyBoundariesFileContent(): string {
  return `${JSON.stringify(
    parseKrnPolicyBoundaries({
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
    }),
    null,
    2,
  )}\n`;
}

export function buildInitAgentInstructionsPayload(targetPath: string): InitAgentInstructionsPayload {
  const fileContent = agentInstructionsFileContent();
  return {
    payload_type: "init_agent_instructions",
    bootstrap_capability: "agent_instructions",
    target_path: targetPath,
    write_mode: "exact_file_content",
    file_content: fileContent,
    content_sha256: sha256(fileContent),
  };
}

export function buildInitLocalConfigPayload(targetPath: string): InitLocalConfigPayload {
  const fileContent = localConfigFileContent();
  return {
    payload_type: "init_local_config",
    bootstrap_capability: "local_config",
    target_path: targetPath,
    write_mode: "exact_file_content",
    file_content: fileContent,
    content_sha256: sha256(fileContent),
  };
}

export function buildInitSourcePointersPayload(targetPath: string): InitSourcePointersPayload {
  const fileContent = sourcePointersFileContent();
  return {
    payload_type: "init_source_pointers",
    bootstrap_capability: "source_pointers",
    target_path: targetPath,
    write_mode: "exact_file_content",
    file_content: fileContent,
    content_sha256: sha256(fileContent),
  };
}

export function buildInitContextPointersPayload(targetPath: string): InitContextPointersPayload {
  const fileContent = contextPointersFileContent();
  return {
    payload_type: "init_context_pointers",
    bootstrap_capability: "context_pointers",
    target_path: targetPath,
    write_mode: "exact_file_content",
    file_content: fileContent,
    content_sha256: sha256(fileContent),
  };
}

export function buildInitEvalBaselinePayload(targetPath: string): InitEvalBaselinePayload {
  const fileContent = evalBaselineFileContent();
  return {
    payload_type: "init_eval_baseline",
    bootstrap_capability: "eval_baseline",
    target_path: targetPath,
    write_mode: "exact_file_content",
    file_content: fileContent,
    content_sha256: sha256(fileContent),
  };
}

export function buildInitSkillWiringPayload(targetPath: string): InitSkillWiringPayload {
  const fileContent = skillWiringFileContent();
  return {
    payload_type: "init_skill_wiring",
    bootstrap_capability: "skill_wiring",
    target_path: targetPath,
    write_mode: "exact_file_content",
    file_content: fileContent,
    content_sha256: sha256(fileContent),
  };
}

export function buildInitPolicyBoundariesPayload(targetPath: string): InitPolicyBoundariesPayload {
  const fileContent = policyBoundariesFileContent();
  return {
    payload_type: "init_policy_boundaries",
    bootstrap_capability: "policy_boundaries",
    target_path: targetPath,
    write_mode: "exact_file_content",
    file_content: fileContent,
    content_sha256: sha256(fileContent),
  };
}

export function buildInitBootstrapPayload(capability: InitBootstrapCapability, targetPath: string): InitBootstrapPayload {
  switch (capability) {
    case "agent_instructions":
      return buildInitAgentInstructionsPayload(targetPath);
    case "local_config":
      return buildInitLocalConfigPayload(targetPath);
    case "source_pointers":
      return buildInitSourcePointersPayload(targetPath);
    case "context_pointers":
      return buildInitContextPointersPayload(targetPath);
    case "eval_baseline":
      return buildInitEvalBaselinePayload(targetPath);
    case "skill_wiring":
      return buildInitSkillWiringPayload(targetPath);
    case "policy_boundaries":
      return buildInitPolicyBoundariesPayload(targetPath);
  }
}
