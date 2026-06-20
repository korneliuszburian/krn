---
id: krn-live-codex-benchmark-pilot
status: fact
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-018.md
  - docs/evals/krn-benchmark-live-pilot/README.md
  - docs/evals/krn-benchmark-live-pilot/OPENAI-COOKBOOK-MAPPING.md
  - docs/specs/krn-benchmark-report/README.md
  - docs/plans/canonical/SOURCES.md
  - .krn/benchmarks/krn-benchmark-live-pilot/20260620T060340Z-2493285/report.json
  - .krn/evals/krn-benchmark-live-pilot/20260620T060340Z-2493285/report.json
---

# KRN Live Codex Benchmark Pilot

## Status

[FACT] KRN has run the first live baseline-vs-assisted `codex exec` benchmark pilot through `KrnBenchmarkReport`.

## Useful Pattern

Live Codex benchmark evidence now follows this path:

```text
one fixed KRN routing task
  -> baseline codex exec read-only run
  -> KRN-assisted codex exec read-only run
  -> schema-constrained final JSON
  -> deterministic scorer
  -> KrnBenchmarkReport measurement_mode live_codex_exec
  -> no-lift caveat and repair target
```

The runner uses explicit `codex exec --json --ephemeral --sandbox read-only --output-schema --output-last-message` calls. Validate mode scores fixtures only; live mode is separate because it spends model budget and is nondeterministic.

## KRN Implication

KRN can now turn live Codex worker output into typed benchmark evidence without treating `.krn` runtime snapshots as durable truth. The first final pilot had one task, baseline score `0.95`, assisted score `0.85`, and delta `-0.1`, so it proves the measurement path only and gives no lift evidence.

The next benchmark step is to expand the task suite and keep `productivity_lift_claimed: false` until the report contract's minimum task gate and score evidence justify a lift claim.

## Failure Mode

This becomes harmful if a one-task live pilot is presented as measured productivity improvement, statistical benchmark validity, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

## Evidence

- `pnpm run eval:krn-benchmark-live-pilot` generated `.krn/evals/krn-benchmark-live-pilot/20260620T060328Z-2492624/report.json` with 2/2 cases and 6/6 assertions.
- `pnpm run eval:krn-benchmark-live-pilot:live` generated `.krn/evals/krn-benchmark-live-pilot/20260620T060340Z-2493285/report.json` with 4/4 cases and 15/15 assertions.
- The generated benchmark report at `.krn/benchmarks/krn-benchmark-live-pilot/20260620T060340Z-2493285/report.json` parsed as `KrnBenchmarkReport`, used `measurement_mode: "live_codex_exec"`, kept `productivity_lift_claimed: false`, and reported `assisted_minus_baseline: -0.1`.

## Review Trigger

Revisit this note when the live benchmark suite grows beyond one task, the minimum lift gate changes, benchmark results are surfaced in the dashboard, or anyone claims KRN productivity lift.
