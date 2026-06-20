# KRN Benchmark Live Stability Readiness Gate

Status: fact

Sources:

- `docs/goals/goal-006.md`
- `docs/goals/goal-027.md`
- `docs/evals/krn-benchmark-live-stability/README.md`
- `docs/evals/krn-benchmark-live-stability/cases.json`
- `packages/evals/src/validate-krn-benchmark-live-stability.ts`
- `.krn/evals/krn-benchmark-live-stability/20260620T113858Z-3249851/report.json`
- `.krn/evals/krn-benchmark-live-stability/20260620T120047Z-3298454/report.json`
- `.krn/eval/20260620T113916Z-3250294/report.json`

Useful pattern:

Live benchmark readiness must be classified from parsed benchmark reports before KRN expands the suite or claims lift. Missing live reports, dirty live reports, and one-off clean reports are different states and must not collapse into a generic green eval.

KRN implication:

`krn-benchmark-live-stability` now reads `.krn/benchmarks/krn-benchmark-live-suite/**/report.json`, parses reports through `KrnBenchmarkReport`, and classifies clean completed reports, dirty reports, suite expansion readiness, and productivity lift readiness. Default `krn eval` includes this module but does not call live `codex exec`.

The current local evidence is still not expansion-ready after the live-runner repair: the stability eval saw 9 live reports, 3 clean completed reports, 6 dirty reports, latest live report `.krn/benchmarks/krn-benchmark-live-suite/20260620T115037Z-3282001/report.json`, `latest_live_report_is_clean: true`, `suite_expansion_ready: false`, `productivity_lift_ready: false`, and next allowed action `repeat the clean live run under the typed policy before suite expansion`.

Failure mode:

Do not treat one latest clean three-task report as repeated live runner stability. This is a classifier and gate over existing reports. It does not prove the next explicit live run will complete cleanly, that the suite can expand to 20 tasks, or that KRN has productivity lift.

Review trigger:

Update this note when an explicit live rerun changes the latest live report state, when the stability policy changes its repeated-clean threshold, when the suite expands, or when `krn benchmark`/dashboard run controls are added.
