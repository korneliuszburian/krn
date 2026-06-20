---
id: krn-benchmark-report-spine
status: fact
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-017.md
  - docs/specs/krn-benchmark-report/README.md
  - docs/evals/krn-benchmark-spine/README.md
  - docs/plans/canonical/SOURCES.md
---

# KRN Benchmark Report Spine

## Status

[FACT] KRN has a typed benchmark report spine and deterministic eval for no-lift-gated benchmark evidence.

## Useful Pattern

Benchmark evidence now flows through a typed contract before any product claim:

```text
fixture task evidence
  -> KrnBenchmarkReport
  -> .krn/benchmarks/krn-benchmark-spine/{run_id}/report.json
  -> krn-benchmark-spine eval
  -> aggregate krn eval
```

The contract permits score deltas but rejects `productivity_lift_claimed: true` unless a future live `codex exec` benchmark mode satisfies the lift gate.

## KRN Implication

KRN can now store benchmark-shaped evidence without pretending that fixture or deterministic eval output is productivity lift. Future live benchmark work should reuse this report shape instead of inventing a separate artifact.

## Failure Mode

This becomes harmful if a green `krn-benchmark-spine` eval, fixture score delta, or aggregate `krn eval` report is described as measured productivity improvement.

## Evidence

- `pnpm run eval:krn-benchmark-spine` generated `.krn/evals/krn-benchmark-spine/20260620T052834Z-2409080/report.json` with 4/4 cases and 14/14 assertions.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T052950Z-2410440/report.json` with 14/14 modules, 62/62 cases, and 195/195 assertions, including `krn-benchmark-spine`.

## Review Trigger

Revisit this note when KRN adds a live `codex exec` benchmark batch, changes the minimum lift gate, adds benchmark dashboard UI, or claims measured baseline-vs-assisted improvement.
