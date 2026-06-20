# KRN Benchmark Live-Suite Registry Policy Gate

Status: fact

Sources:

- `docs/goals/goal-006.md`
- `docs/goals/goal-025.md`
- `docs/goals/goal-026.md`
- `docs/goals/goal-028.md`
- `docs/evals/krn-benchmark-live-suite/README.md`
- `docs/evals/krn-benchmark-live-suite/OPENAI-COOKBOOK-MAPPING.md`
- `docs/evals/krn-benchmark-live-suite/cases.json`
- `docs/evals/krn-benchmark-live-suite/tasks.json`
- `packages/evals/src/validate-krn-benchmark-live-suite.ts`
- `.krn/evals/krn-benchmark-live-suite/20260620T111349Z-3200927/report.json`
- `.krn/evals/krn-benchmark-live-suite/20260620T115002Z-3281262/report.json`
- `.krn/eval/20260620T111356Z-3202153/report.json`

Useful pattern:

Benchmark repair state must be represented as typed registry data before live `codex exec` runs are trusted. The task registry should name the current child goal, list superseded latest-child refs, and expose runner policy such as sequential execution, max concurrency, timeout, output capture buffer, baseline prompt scope, and timeout classification.

KRN implication:

`docs/evals/krn-benchmark-live-suite/tasks.json` now carries `live_run_policy`, `current_child_goal_ref`, and `superseded_latest_child_goal_refs`. Validate mode includes `task-registry-current-context-and-run-policy`, which rejects stale latest-child guidance and checks that live runs are sequential with `max_concurrent_codex_exec_runs: 1`, `max_codex_exec_output_buffer_bytes: 32000000`, `baseline_prompt_scope: "bounded_task_relevant_repo_reading"`, and timeout failures classified as no-lift evidence. The runner consumes the typed timeout, output buffer, and prompt-scope policy instead of hidden runner constants.

Failure mode:

Do not treat this as repeated live runner stability or productivity lift. This is deterministic registry/policy protection only; even after one clean latest live report it does not prove repeated live runs complete 3/3 tasks, statistical validity, suite expansion readiness, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

Review trigger:

Update this note when live mode is rerun under the typed policy, when runner concurrency/timeout policy changes, when the suite expands toward the 20-task lift gate, or when a future `krn benchmark` CLI surface is added.
