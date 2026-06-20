# Goal 028: Benchmark Live Runner Stability Repair

## Status

Complete Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `6c0279d fix: gate live benchmark stability readiness`. It is not a replacement for `goal-006`; it is the next bounded benchmark repair after `goal-027` classified the current local live-suite evidence as not expansion-ready.

## Objective

Repair the explicit live benchmark runner enough that the latest `krn-benchmark-live-suite` live run can complete every fixed three-task baseline/assisted pair cleanly under typed policy.

The target is runner stability evidence, not productivity lift:

```text
latest dirty live report
  -> classify concrete runner failure source
  -> make runner capture/scope policy typed and deterministic
  -> rerun validate mode
  -> explicitly rerun live mode
  -> latest live report completes 3/3 tasks or preserves no-lift failure evidence
```

This goal does not expand the suite to 20 tasks, add default live execution to `krn eval`, tune model outputs for lift, add dashboard run/repair buttons, expose MCP/API run controls, claim productivity lift, or mark the parent goal complete.

## Failure Source

[FACT] The latest dirty live-suite report before this goal is `.krn/benchmarks/krn-benchmark-live-suite/20260620T102133Z-3093693/report.json`: 3 tasks, 1 completed, 2 failed, `lift_status: "no_lift_evidence"`, and `productivity_lift_claimed: false`.

[FACT] The failed `goal006-next-benchmark-action` baseline final output recorded `spawnSync codex ETIMEDOUT`.

[FACT] The failed `codex-exec-worker-boundary` baseline final output recorded `spawnSync codex ENOBUFS`.

[INFERENCE] The bounded repair surface is the live runner, not the benchmark task suite size: the runner currently captures Codex JSONL through `spawnSync` without an explicit max buffer and the baseline prompt invites broad "usual Codex repo-reading behavior" rather than bounded worker behavior.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 explicit `codex exec` benchmark runner stability.

Source-backed mechanisms:

- OpenAI Codex non-interactive mode: `codex exec` is a pipeline/worker interface, can use `--json`, read-only sandbox, and structured final output, and should run with explicit permissions.
- S009 `codex exec`: worker/CI/eval lane, not continuous conversational Goal loop.
- S010/S011 Goals and ExecPlans: completion requires evidence, boundaries, and current-state verification.
- S013-S016 repair/eval loops: failure evidence becomes a bounded repair and rerun, not broad prompt tuning.
- C050/LOCAL037: suite expansion waits for repeated clean completed live-suite evidence.

Selected mechanisms:

- Keep live mode explicit and outside default `krn eval`.
- Add typed runner policy for output capture buffer and bounded baseline scope.
- Increase `spawnSync` capture buffer so JSONL evidence does not fail with `ENOBUFS`.
- Bound the baseline prompt as a worker run without giving it KRN task source refs or assisted guidance.
- Update task registry current child context to `goal-028`.
- Preserve timeout failures as no-lift failed-task evidence if they still occur.

Rejected alternatives:

- Increase suite size now: rejected because latest evidence is dirty.
- Claim positive deltas from dirty baseline failures: rejected by `KrnBenchmarkReport` and `goal-027`.
- Add dashboard/API rerun controls: rejected until the runner can produce clean explicit live evidence.
- Remove baseline condition or give it assisted source refs: rejected because it would stop measuring baseline-vs-assisted behavior.

Falsification path:

- `pnpm run eval:krn-benchmark-live-suite` must prove the new runner policy is typed and current-context-aware.
- `pnpm run eval:krn-benchmark-live-suite:live` must write parseable JSONL/final evidence and a parseable `KrnBenchmarkReport`.
- Latest live report completing fewer than 3/3 tasks means this repair remains incomplete, even if the eval shape passes.
- Any productivity lift claim from this three-task run disproves completion.

Overclaim boundary:

This goal proves only bounded live-runner stability repair if the latest explicit live run completes cleanly. It does not prove measured productivity lift, statistical validity, suite expansion readiness, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

## Work Plan

### 0. Source And Failure Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, `goal-027`, Codex non-interactive manual section, live-suite runner, latest dirty live report, and current task registry inspected.

### 1. Add Typed Runner Stability Policy

Work:

- Extend `live_run_policy` with explicit output capture buffer and bounded baseline prompt scope.
- Update `tasks.json`, live-suite eval cases, README, and Cookbook mapping.
- Update fixtures so assisted condition names `goal-028` as current child context.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-suite
```

Disproves completion:

- Runner buffer remains hidden in code.
- Baseline prompt still invites unbounded repo rereads.
- Task registry still names `goal-026` as current child context.

### 2. Repair Runner Capture And Prompt Scope

Work:

- Use the typed output capture buffer in `spawnSync`.
- Keep stdout/stderr/final evidence paths unchanged.
- Bound baseline worker instructions while withholding assisted task source refs.
- Preserve failed no-lift evidence for timeout or schema failures.

Acceptance evidence:

```bash
pnpm typecheck
pnpm run eval:krn-benchmark-live-suite
```

Disproves completion:

- `codex exec` live mode becomes part of default `krn eval`.
- Live runner mutates files.
- Failed live output is hidden instead of written as explicit evidence.

### 3. Explicit Live Rerun And Release Audit

Work:

- Run explicit live mode after deterministic validation.
- Update memory, source ledger, final product plan if needed, parent goal, and this goal.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-suite:live
pnpm run eval:krn-benchmark-live-stability
pnpm run eval:krn-eval
pnpm test
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- Latest live report remains dirty.
- Docs imply productivity lift or suite expansion.
- Parent goal is marked complete.

## Completion Evidence

- `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T115002Z-3281262/report.json` with 5/5 cases and 24/24 assertions.
- `pnpm typecheck` passed after the runner-policy code changes.
- `pnpm run eval:krn-benchmark-live-suite:live` generated `.krn/evals/krn-benchmark-live-suite/20260620T115037Z-3282001/report.json` with 6/6 cases and 30/30 assertions.
- `.krn/benchmarks/krn-benchmark-live-suite/20260620T115037Z-3282001/report.json` parsed as `KrnBenchmarkReport`, completed 3/3 tasks, had 0 failed tasks, recorded baseline score `0.8457`, assisted score `0.91`, delta `+0.0643`, `lift_status: "no_lift_evidence"`, and `productivity_lift_claimed: false`.
- `pnpm run eval:krn-benchmark-live-stability` generated `.krn/evals/krn-benchmark-live-stability/20260620T120047Z-3298454/report.json` with 6/6 cases and 20/20 assertions; it classified local live evidence as 9 live reports, 3 clean, 6 dirty, latest clean, `suite_expansion_ready: false`, and `productivity_lift_ready: false`.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T121036Z-3328080/report.json` with 18/18 modules, 82/82 cases, and 278/278 assertions.
- `pnpm test` passed with 31/31 test files and 106/106 tests.
- `python3 scripts/evals/codex_memory_compliance.py --mode validate` generated `.krn/evals/codex-memory-compliance/20260620T121148932746Z-3330438/report.json` with 4/4 cases.

## Outcome

[FACT] The explicit live-suite runner now has typed policy for `max_codex_exec_output_buffer_bytes` and `baseline_prompt_scope`.

[FACT] The runner uses the typed output buffer in `spawnSync`, and both baseline and assisted prompts include bounded worker-scope instructions.

[FACT] The latest explicit live-suite benchmark report completed all three tasks cleanly and no longer shows the prior `ETIMEDOUT` or `ENOBUFS` final errors.

[FACT] The latest live-suite result remains no-lift evidence. It is one clean latest three-task run, not repeated-clean stability, not suite expansion readiness, and not productivity lift.

[DECISION] The next benchmark action is to repeat the clean live run under the typed policy before expanding the suite or adding dashboard/API run controls.
