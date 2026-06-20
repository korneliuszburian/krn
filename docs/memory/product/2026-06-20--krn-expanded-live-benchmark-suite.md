---
id: krn-expanded-live-benchmark-suite
status: fact
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-020.md
  - docs/evals/krn-benchmark-live-suite/README.md
  - docs/evals/krn-benchmark-live-suite/OPENAI-COOKBOOK-MAPPING.md
  - docs/evals/krn-benchmark-live-suite/tasks.json
  - docs/specs/krn-benchmark-report/README.md
  - docs/plans/canonical/SOURCES.md
  - .krn/evals/krn-benchmark-live-suite/20260620T072146Z-2674923/report.json
  - .krn/evals/krn-benchmark-live-suite/20260620T072154Z-2675156/report.json
  - .krn/benchmarks/krn-benchmark-live-suite/20260620T072154Z-2675156/report.json
  - .krn/eval/20260620T074031Z-2716146/report.json
---

# KRN Expanded Live Benchmark Suite

## Status

[FACT] KRN now has a typed multi-task benchmark suite harness with deterministic validate mode and explicit live `codex exec` mode.

## Useful Pattern

Benchmark suite work now follows this path:

```text
tasks.json
  -> task registry parser
  -> fixture baseline/assisted scorer
  -> known-bad lift-claim fixture
  -> optional explicit live codex exec worker runs
  -> KrnBenchmarkReport task_count >= 3
  -> default krn eval validate module only
```

The validate mode is safe to aggregate in `krn eval`. The live mode remains separate because it is slow, cost-bearing, and nondeterministic.

## KRN Implication

The first expanded live suite has three tasks and all completed, but it is still below the minimum lift gate of 20 tasks. Its final live report had baseline score `0.9433`, assisted score `0.94`, and delta `-0.0033`, with `productivity_lift_claimed: false` and `lift_status: "no_lift_evidence"`.

This means KRN has stronger measurement infrastructure, not measured productivity lift. The next benchmark decision should either improve the assisted path on low/neutral tasks or expand toward the lift gate with the same fixed-task discipline.

## Failure Mode

This becomes harmful if a three-task fixture or live suite is claimed as a breakthrough, if live mode is added to default deterministic `krn eval`, or if the small-suite no-lift result is hidden behind dashboard/API work.

## Evidence

- `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T072146Z-2674923/report.json` with 4/4 cases and 16/16 assertions.
- `pnpm run eval:krn-benchmark-live-suite:live` generated `.krn/evals/krn-benchmark-live-suite/20260620T072154Z-2675156/report.json` with 5/5 cases and 22/22 assertions.
- The generated live benchmark report `.krn/benchmarks/krn-benchmark-live-suite/20260620T072154Z-2675156/report.json` parsed as `KrnBenchmarkReport`, used `measurement_mode: "live_codex_exec"`, had `task_count: 3`, completed 3/3 tasks, kept `productivity_lift_claimed: false`, and reported `assisted_minus_baseline: -0.0033`.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T074031Z-2716146/report.json` with 16/16 modules, 71/71 cases, and 240/240 assertions, including `krn-benchmark-live-suite` validate mode only.

## Review Trigger

Revisit this note when the live suite reaches the minimum lift gate, benchmark scoring changes, `krn benchmark` is proposed, live mode is added to any default command, or benchmark repair work changes the assisted path.
