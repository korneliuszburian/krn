---
id: krn-repair-record
kind: product-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-020.md
  - docs/goals/goal-021.md
  - docs/evals/STANDARD.md
  - docs/memory/evals/2026-06-19--repair-loops-promptfoo-quality-gates.md
  - docs/plans/canonical/SOURCES.md
---

# KRN Repair Record Contract

## Purpose

`KrnRepairRecord` is the typed handoff from failure evidence to bounded repair work.

The first concrete use is the `goal-020` live benchmark no-lift result. The record keeps failure source, classification, repair surface, validator status, attempt log, stop reason, source refs, evidence refs, and blocked overclaim surfaces in one machine-readable object.

## Public Interface

```ts
parseKrnRepairRecord(input)
krnRepairRecordJsonSchema
```

## Required Shape

Every repair record includes:

- stable schema version,
- repair id, owner, creation time, and status,
- failure source with source/evidence refs and observed metric,
- classification and repair surface,
- proposed repair and next action,
- attempt log with validator command, validator status, metric before/after/delta, and stop reason,
- source refs and evidence refs,
- blocked overclaim surfaces,
- interpretation caveat.

## Benchmark No-Lift Gate

For `classification: "benchmark_no_lift"`:

- `failure_source.source_type` must be `benchmark_report`,
- `failure_source.expected_metric_direction` must be `increase`,
- `failure_source.observed_metric_value` must be zero or negative,
- `blocked_surfaces` must include `productivity_lift_claim`.

`status: "validated"` requires the final attempt to have a passed validator, `stop_reason: "pass"`, `metric_after`, and `metric_delta`.

## Boundary

Allowed behavior:

- parse repair records through `@krn/contracts`,
- reject overclaimed validated repairs,
- generate local repair records from benchmark no-lift evidence,
- write local repair artifacts under `.krn/repairs/**`.

Forbidden behavior:

- no productivity-lift claim from a repair record,
- no prompt/skill/memory tuning without a source-backed repair record,
- no default live benchmark execution from `krn eval`,
- no dashboard auto-repair or mutating MCP/API repair tools in this slice.

## Interpretation

A green repair-record eval means KRN can represent benchmark no-lift evidence as a typed repair handoff.

It does not prove repair quality, productivity lift, prompt improvement, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/repair-record.test.ts
pnpm run eval:krn-repair-record
pnpm run eval:krn-eval
```
