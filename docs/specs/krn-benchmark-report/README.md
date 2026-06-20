---
id: krn-benchmark-report
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-017.md
  - docs/product/final-product-plan.md
  - docs/evals/STANDARD.md
  - docs/plans/canonical/SOURCES.md
---

# KRN Benchmark Report Contract

## Purpose

`KrnBenchmarkReport` is the first typed report boundary for baseline Codex versus KRN-assisted Codex task evidence.

It exists to prevent KRN from turning fixture deltas, green deterministic evals, dashboard views, or anecdotal progress into productivity claims. A report can show measured scores, but `productivity_lift_claimed` is only valid for a future live `codex exec` benchmark mode that satisfies the lift gate.

## Public Interface

```ts
parseKrnBenchmarkReport(input)
krnBenchmarkReportJsonSchema
```

## Required Shape

Every benchmark report includes:

- stable schema version,
- run id, target root, benchmark id, suite id,
- measurement mode,
- baseline and assisted labels,
- minimum task count required before lift can be claimed,
- lift status and `productivity_lift_claimed`,
- task counts and aggregate scores,
- per-task baseline and assisted evidence,
- metric deltas,
- repair targets for no-lift or unproven-lift states,
- benchmark report path,
- source refs,
- interpretation caveat.

## Lift Gate

`productivity_lift_claimed: true` is valid only when all of these are true:

- `measurement_mode` is `live_codex_exec`,
- `lift_status` is `positive_lift`,
- `task_count` is at least `minimum_task_count_for_lift_claim`,
- no tasks are blocked or failed,
- assisted score is higher than baseline score.

`fixture_contract` reports must use `lift_status: "no_lift_evidence"` and `productivity_lift_claimed: false`.

## Boundary

Allowed behavior:

- parse report objects through `@krn/contracts`,
- write deterministic benchmark-spine fixture reports under `.krn/benchmarks/krn-benchmark-spine/`,
- include score deltas as contract evidence.

Forbidden behavior:

- no productivity claim from fixtures,
- no productivity claim from aggregate `krn eval`,
- no productivity claim from dashboard surfaces,
- no benchmark dashboard UI in this slice,
- no new `krn benchmark` CLI command in this slice,
- no destructive MCP/API tools.

## Interpretation

A green benchmark-spine report means KRN can represent benchmark evidence and block unsupported lift claims.

It does not prove measured productivity lift, live Codex benchmark quality, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, dashboard command readiness, or human review quality.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/benchmark-report.test.ts
pnpm run eval:krn-benchmark-spine
pnpm run eval:krn-eval
```
