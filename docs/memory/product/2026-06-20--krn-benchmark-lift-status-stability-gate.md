# KRN Benchmark Lift Status Stability Gate

Status: fact

Sources:

- `docs/goals/goal-006.md`
- `docs/goals/goal-024.md`
- `docs/goals/goal-025.md`
- `packages/contracts/src/benchmark-report.ts`
- `packages/contracts/test/benchmark-report.test.ts`
- `docs/specs/krn-benchmark-report/README.md`
- `docs/specs/krn-benchmark-report/fixtures/bad-positive-lift-status-with-failed-task.example.json`
- `docs/evals/krn-benchmark-spine/cases.json`
- `packages/evals/src/validate-krn-benchmark-spine.ts`
- `.krn/evals/krn-benchmark-spine/20260620T102007Z-3090855/report.json`
- `.krn/evals/krn-benchmark-live-suite/20260620T102111Z-3093271/report.json`
- `.krn/evals/krn-benchmark-live-suite/20260620T102133Z-3093693/report.json`
- `.krn/benchmarks/krn-benchmark-live-suite/20260620T102133Z-3093693/report.json`

Useful pattern:

Benchmark status labels need the same hard gate as explicit productivity claims. A positive delta from live `codex exec` evidence is not enough for `positive_lift` when tasks failed, blocked, are below the minimum task count, or came from fixture data.

KRN implication:

`KrnBenchmarkReport` now rejects `lift_status: "positive_lift"` unless the report is `live_codex_exec`, has at least `minimum_task_count_for_lift_claim` tasks, has zero failed/blocked tasks, and has positive assisted-minus-baseline delta. The deterministic benchmark-spine eval includes a known-bad fixture where `productivity_lift_claimed` is false but `lift_status` overclaims dirty positive evidence.

Failure mode:

Do not treat the `20260620T102133Z-3093693` live suite delta of `+0.7223` as lift. That run passed shape/evidence checks, but completed only 1/3 tasks and failed 2 tasks, so the correct status is `no_lift_evidence`.

Review trigger:

Update this note when the live suite produces a clean completed-task repeat above the lift gate, when `minimum_task_count_for_lift_claim` changes, or when benchmark status labels gain new states.
