# KRN Benchmark Live Runner Stability Repair

Status: fact

Sources:

- `docs/goals/goal-006.md`
- `docs/goals/goal-028.md`
- `docs/evals/krn-benchmark-live-suite/README.md`
- `docs/evals/krn-benchmark-live-suite/cases.json`
- `docs/evals/krn-benchmark-live-suite/tasks.json`
- `packages/evals/src/validate-krn-benchmark-live-suite.ts`
- `.krn/evals/krn-benchmark-live-suite/20260620T115002Z-3281262/report.json`
- `.krn/evals/krn-benchmark-live-suite/20260620T115037Z-3282001/report.json`
- `.krn/benchmarks/krn-benchmark-live-suite/20260620T115037Z-3282001/report.json`
- `.krn/evals/krn-benchmark-live-stability/20260620T120047Z-3298454/report.json`

Useful pattern:

Live `codex exec` benchmark runners need typed stability policy before their results are trusted. Output capture size, baseline prompt scope, timeout policy, and failure classification should be registry data checked by deterministic evals, not hidden runner assumptions.

KRN implication:

`krn-benchmark-live-suite` now exposes `max_codex_exec_output_buffer_bytes` and `baseline_prompt_scope` in `live_run_policy`, uses the typed buffer in `spawnSync`, and bounds baseline worker prompts without giving them assisted source refs. The latest explicit live run completed 3/3 tasks cleanly with no `ENOBUFS` or timeout final errors, producing baseline score `0.8457`, assisted score `0.91`, and delta `+0.0643`.

The repair does not change the lift boundary: `lift_status` remains `no_lift_evidence`, `productivity_lift_claimed` remains false, and the stability gate still blocks suite expansion until at least one repeat clean run under the typed policy.

Failure mode:

Do not expand the benchmark suite, add dashboard/API run controls, or claim breakthrough from one clean three-task live run. The prior dirty reports remain evidence that stability must be repeated before the suite grows toward the 20-task lift gate.

Review trigger:

Update this note when the clean live run is repeated, when live runner policy changes again, when the suite expands, or when `krn benchmark`/dashboard run controls are added.
