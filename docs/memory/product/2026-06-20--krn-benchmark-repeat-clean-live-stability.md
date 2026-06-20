# KRN Benchmark Repeat-Clean Live Stability

Status: fact

Sources:

- `docs/goals/goal-006.md`
- `docs/goals/goal-029.md`
- `docs/evals/krn-benchmark-live-suite/tasks.json`
- `packages/evals/src/validate-krn-benchmark-live-suite.ts`
- `packages/evals/src/validate-krn-benchmark-live-stability.ts`
- `.krn/evals/krn-benchmark-live-suite/20260620T121920Z-3339493/report.json`
- `.krn/evals/krn-benchmark-live-suite/20260620T121951Z-3340034/report.json`
- `.krn/benchmarks/krn-benchmark-live-suite/20260620T121951Z-3340034/report.json`
- `.krn/evals/krn-benchmark-live-stability/20260620T123540Z-3385093/report.json`
- `.krn/eval/20260620T123940Z-3393698/report.json`

Useful pattern:

Repeated clean live evidence is an unlock for expanding the benchmark arena, not for claiming productivity lift. The current policy requires the two newest `live_codex_exec` reports to complete all tasks cleanly before suite expansion becomes review-ready.

KRN implication:

The explicit repeat live run under `goal-029` completed 3/3 tasks with 0 failed and 0 blocked tasks. The generated report stayed below the lift gate with `lift_status: "no_lift_evidence"` and `productivity_lift_claimed: false`.

The live stability eval now classifies the current store as 10 live reports, 4 clean, 6 dirty, latest clean, `suite_expansion_ready: true`, and `productivity_lift_ready: false`. The next allowed action is to review suite expansion toward the 20-task lift gate without claiming productivity lift.

Failure mode:

Do not keep repeating the same three-task live suite as a substitute for expanding the research arena. Repeated clean stability should now feed a larger benchmark/autoresearch slice with better pipeline ergonomics, not another micro-gate unless the next run becomes dirty.

Review trigger:

Update this note when the live suite expands, when benchmark pipeline concurrency/resume/progress policy changes, when a larger suite run is dirty, or when productivity lift evidence becomes claimable.
