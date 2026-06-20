# KRN Benchmark Arena Contract

Status: decision

Sources:

- `docs/goals/goal-030.md`
- `docs/evals/krn-benchmark-arena-contract/README.md`
- `docs/evals/krn-benchmark-arena-contract/arena-contract.example.json`
- `docs/evals/krn-benchmark-arena-contract/fixtures/bad-arena-contract-overclaims-lift.json`
- `packages/evals/src/validate-krn-benchmark-arena-contract.ts`
- `.krn/evals/krn-benchmark-arena-contract/20260620T125641Z-3428998/report.json`
- `.krn/eval/20260620T125652Z-3429751/report.json`

Useful pattern:

After repeat-clean small-suite evidence, do not immediately scale live runs. First add a deterministic arena contract that fixes the lift gate, source claims, live-execution boundary, pipeline ergonomics, coding-quality rubric, task mix, and known-bad overclaim fixture.

KRN implication:

The next benchmark slice should implement the expanded arena from `docs/evals/krn-benchmark-arena-contract/arena-contract.example.json`. The contract requires at least 20 initial tasks, keeps live `codex exec` outside default `krn eval`, requires progress/resume/smoke/full lanes, and requires coding-quality metrics for assumptions, simplicity, surgical diffs, verification, review burden, source grounding, goal alignment, and anti-slop.

Failure mode:

Do not treat this green eval as the expanded suite itself or as productivity lift. It proves contract readiness only. Suite implementation, live evidence, statistical validity, and product lift remain unproven.

Review trigger:

Update this note when the expanded task registry is implemented, when a live expanded run is executed, when concurrency policy changes, or when the arena starts scoring human review burden from real review evidence.
