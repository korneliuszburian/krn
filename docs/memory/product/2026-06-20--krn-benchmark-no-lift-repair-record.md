# KRN Benchmark No-Lift Repair Record

Status: decision

Sources:

- `docs/goals/goal-006.md`
- `docs/goals/goal-020.md`
- `docs/goals/goal-021.md`
- `docs/specs/krn-repair-record/README.md`
- `docs/evals/krn-repair-record/README.md`
- `docs/plans/canonical/SOURCES.md`

Useful pattern:

Benchmark failures become typed repair records before KRN changes prompts, skills, memory, benchmark tasks, dashboard behavior, or API/MCP behavior. The record keeps the failure source, classification, repair surface, validator command/status, attempt log, stop reason, source refs, evidence refs, and overclaim boundary together.

KRN implication:

The `goal-020` live suite result (`assisted_minus_baseline: -0.0033` across 3 tasks) is now represented as `KrnRepairRecord` evidence rather than a loose note. The next product step is a bounded repair attempt from that record, followed by an explicit live benchmark rerun. `krn eval` may validate the repair-record contract, but it must not run live benchmarks by default or claim productivity lift.

Failure mode:

This becomes harmful if repair records are treated as proof that the repair worked. A proposed repair record is only a typed handoff. Repair quality still requires an applied change, validator rerun, and metric movement.

Review trigger:

Update this note when `KrnRepairRecord` gains MCP/API/dashboard review surfaces, when the live benchmark suite reaches the lift gate, or when a repair attempt produces a positive or negative rerun delta.
