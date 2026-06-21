import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export function writeMemoryStoreFixture(path: string): void {
  const store = {
    schema_version: "krn-local-memory-store.v1",
    policy: {
      max_selected: 3,
      selection_policy: "active task-kind records only; reject stale/lab/archive context and full memory-bank scans",
      rejected_context: [
        {
          ref: "docs/goals/goal-018.md..goal-034.md",
          reason: "Expanded benchmark goals are lab/archive context and are rejected for default product review.",
        },
        {
          ref: "docs/memory/** full scan",
          reason: "Full memory-bank scans are context dumps; this run may use only selected memory IDs.",
        },
        {
          ref: ".krn/** as memory core",
          reason: ".krn is runtime evidence/cache/ledger and must not be treated as authoritative memory.",
        },
      ],
    },
    records: [
      {
        schema_version: "krn-memory-record.v1",
        kind: "krn_memory_record",
        id: "mem-goal-038-memory-boundary",
        status: "active",
        scope: "project",
        owner: "krn",
        source_lineage: ["docs/goals/goal-038.md", "docs/plans/canonical/SOURCES.md#C061"],
        confidence: "high",
        freshness: "fresh",
        kernel_terms: ["memory-operative", "context-budgeted", "deletion-friendly"],
        ttl_days: 30,
        last_verified_at: "2026-06-20T20:00:00.000Z",
        last_used_at: null,
        selectors: {
          task_kinds: ["review", "planning"],
          failure_modes: ["repo-local-memory-core", "context-dump"],
          target_globs: ["packages/**", "docs/goals/goal-038.md"],
          goal_refs: ["docs/goals/goal-038.md"],
        },
        summary:
          "KRN memory must be selected from a store boundary and applied to a concrete action; docs/memory and .krn are not authoritative memory core.",
        action_rule:
          "Reject repo-local memory-core claims and require selected memory IDs, rejected context, application guidance, and feedback.",
        invalidation_rule:
          "Invalidate if goal-038 no longer owns the active memory boundary or if a service-backed store supersedes the local adapter.",
        privacy_level: "local",
      },
      {
        schema_version: "krn-memory-record.v1",
        kind: "krn_memory_record",
        id: "mem-goal-038-simplify-cadence",
        status: "active",
        scope: "project",
        owner: "krn",
        source_lineage: ["docs/goals/goal-038.md"],
        confidence: "medium",
        freshness: "fresh",
        kernel_terms: ["diff-literate", "review-minimizing"],
        ttl_days: 30,
        last_verified_at: "2026-06-20T20:00:00.000Z",
        last_used_at: null,
        selectors: {
          task_kinds: ["review", "planning"],
          failure_modes: ["duplicate-concept", "monolith-growth"],
          target_globs: ["packages/**"],
          goal_refs: ["docs/goals/goal-038.md"],
        },
        summary:
          "Goal-038 requires a simplify/condense pass when a slice adds multiple durable objects or grows a monolith.",
        action_rule:
          "Before adding another surface, check for duplicate concepts, unused exports, unconsumed typed objects, and default-context growth.",
        invalidation_rule: "Invalidate if the simplify cadence is superseded by an automated quality hook.",
        privacy_level: "local",
      },
      {
        schema_version: "krn-memory-record.v1",
        kind: "krn_memory_record",
        id: "mem-expanded-arena-lab",
        status: "deprecated",
        scope: "project",
        owner: "krn",
        source_lineage: ["docs/goals/goal-018.md"],
        confidence: "low",
        freshness: "stale",
        kernel_terms: ["lab-lane"],
        ttl_days: 1,
        last_verified_at: "2026-06-19T20:00:00.000Z",
        last_used_at: null,
        selectors: {
          task_kinds: ["review", "planning"],
          failure_modes: ["benchmark-churn"],
          target_globs: ["docs/goals/**"],
          goal_refs: ["docs/goals/goal-018.md"],
        },
        summary: "Expanded arena benchmark work is lab/archive context, not default product context.",
        action_rule: "Reject this record from default MemoryStore selection unless the task explicitly asks for benchmark lab work.",
        invalidation_rule: "Remove when benchmark lab history is archived out of default source routing.",
        privacy_level: "local",
      },
    ],
    feedback: [],
  };

  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}
