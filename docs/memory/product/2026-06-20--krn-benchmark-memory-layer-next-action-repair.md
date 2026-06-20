# KRN Benchmark Memory-Layer Next Action Repair

Status: fact

Sources:

- `docs/goals/goal-006.md`
- `docs/goals/goal-023.md`
- `docs/goals/goal-024.md`
- `docs/memory/product/2026-06-20--krn-operating-architecture-and-memory-layers.md`
- `docs/memory/product/2026-06-20--krn-benchmark-assisted-prompt-load-repair.md`
- `docs/evals/krn-benchmark-live-suite/README.md`
- `docs/evals/krn-benchmark-live-suite/tasks.json`
- `docs/plans/canonical/SOURCES.md`
- `.krn/evals/krn-benchmark-live-suite/20260620T093329Z-2982842/report.json`
- `.krn/evals/krn-benchmark-live-suite/20260620T093350Z-2983111/report.json`
- `.krn/benchmarks/krn-benchmark-live-suite/20260620T093350Z-2983111/report.json`
- `.krn/evals/krn-benchmark-live-suite/20260620T094837Z-3002586/report.json`
- `.krn/benchmarks/krn-benchmark-live-suite/20260620T094837Z-3002586/report.json`

Useful pattern:

A benchmark repair can target one stale task expectation without changing root instructions, runner semantics, or product architecture. For memory-layer drift, the useful repair is to route the task through source-backed memory/control/eval evidence and the latest completed child goal, not to add storage infrastructure.

KRN implication:

The memory-layer repair updated `memory-layers-vs-file-substrate` to use `goal-023` and the assisted prompt-load repair note as current context. Deterministic validate mode passed. Two explicit live reruns kept the assisted memory-layer `next_action_score` at `1`, improving the target metric from the previous assisted score of `0.5`.

Failure mode:

Do not treat the positive suite deltas as productivity lift. The first live rerun completed 2/3 tasks and the repeat run completed 1/3 tasks; both positive deltas were inflated by baseline `codex exec` timeouts in non-target tasks. The result supports keeping the memory-layer repair, but it also shows live runner timeout/concurrency policy should be the next benchmark repair before suite expansion.

Review trigger:

Update this note when live runner timeout/concurrency policy changes, when a repeat live run completes 3/3 tasks after this repair, or when the suite expands toward the 20-task lift gate.
