# KRN Benchmark Assisted Prompt Load Repair

Status: fact

Sources:

- `docs/goals/goal-006.md`
- `docs/goals/goal-022.md`
- `docs/goals/goal-023.md`
- `docs/memory/product/2026-06-20--krn-benchmark-current-child-repair-attempt.md`
- `docs/evals/krn-benchmark-live-suite/README.md`
- `docs/plans/canonical/SOURCES.md`
- `.krn/evals/krn-benchmark-live-suite/20260620T090328Z-2900409/report.json`
- `.krn/evals/krn-benchmark-live-suite/20260620T090346Z-2900772/report.json`
- `.krn/benchmarks/krn-benchmark-live-suite/20260620T090346Z-2900772/report.json`

Useful pattern:

When a KRN-assisted live benchmark task times out, the first repair should reduce task prompt load before increasing timeout or broadening instructions. Assisted prompts should use task-owned source refs and task-specific guidance, not a universal read list for every task.

KRN implication:

The assisted prompt-load repair changed `krn-benchmark-live-suite` so assisted prompts are scoped to each task's `source_refs`. Deterministic validate mode passed. The live rerun completed all three tasks, removed the `goal006-next-benchmark-action.assisted` timeout, and improved the live suite delta from `-0.3444` to `-0.0056`. The first task improved from failed `-1` delta to completed `+0.0333` delta.

Failure mode:

Do not treat this as productivity lift. The suite remains three tasks, below the 20-task lift gate, and overall assisted performance is still slightly below baseline. The next repair should target the remaining `memory-layers-vs-file-substrate` next-action regression or repeat stability before suite expansion.

Review trigger:

Update this note when a later repair produces positive suite delta, when the suite expands toward the lift gate, or when live runner timeout/concurrency policy changes.
