# KRN Benchmark Live Stability Readiness Gate

Status: fact

Sources:

- `docs/goals/goal-006.md`
- `docs/goals/goal-027.md`
- `docs/evals/krn-benchmark-live-stability/README.md`
- `docs/evals/krn-benchmark-live-stability/cases.json`
- `packages/evals/src/validate-krn-benchmark-live-stability.ts`
- `.krn/evals/krn-benchmark-live-stability/20260620T113858Z-3249851/report.json`
- `.krn/eval/20260620T113916Z-3250294/report.json`

Useful pattern:

Live benchmark readiness must be classified from parsed benchmark reports before KRN expands the suite or claims lift. Missing live reports, dirty live reports, and one-off clean reports are different states and must not collapse into a generic green eval.

KRN implication:

`krn-benchmark-live-stability` now reads `.krn/benchmarks/krn-benchmark-live-suite/**/report.json`, parses reports through `KrnBenchmarkReport`, and classifies clean completed reports, dirty reports, suite expansion readiness, and productivity lift readiness. Default `krn eval` includes this module but does not call live `codex exec`.

The current local evidence is not expansion-ready: the stability eval saw 8 live reports, 2 clean completed reports, 6 dirty reports, latest live report `.krn/benchmarks/krn-benchmark-live-suite/20260620T102133Z-3093693/report.json`, `suite_expansion_ready: false`, and `productivity_lift_ready: false`.

Failure mode:

Do not treat this as live runner stability being solved. It is a classifier and gate over existing reports. It does not prove the next explicit live run will complete cleanly, that the suite can expand to 20 tasks, or that KRN has productivity lift.

Review trigger:

Update this note when an explicit live rerun changes the latest live report state, when the stability policy changes its repeated-clean threshold, when the suite expands, or when `krn benchmark`/dashboard run controls are added.
