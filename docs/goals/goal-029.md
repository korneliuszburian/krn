# Goal 029: Repeat Clean Live Stability Evidence

## Status

Complete Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `62a708e fix: stabilize live benchmark runner`. It is not a replacement for `goal-006`; it is the next bounded benchmark evidence slice after `goal-028` produced one clean latest explicit live-suite run under typed output-capture and baseline-scope policy.

## Objective

Repeat the explicit `krn-benchmark-live-suite` live run under the typed policy and let `krn-benchmark-live-stability` classify whether the two newest `live_codex_exec` reports are clean enough for suite-expansion review.

The target is repeated live-run stability evidence, not productivity lift:

```text
one clean latest live report after goal-028
  -> rerun deterministic validate mode
  -> explicitly rerun live mode
  -> classify current live store
  -> if the two newest live reports are clean, allow suite-expansion review only
  -> preserve no-lift boundary below the 20-task gate
```

This goal does not expand the suite to 20 tasks, add default live execution to `krn eval`, add `krn benchmark`, add dashboard/API run controls, tune prompts for lift, claim productivity lift, or mark the parent goal complete.

## Current Evidence

[FACT] `goal-028` added typed live-runner policy for `max_codex_exec_output_buffer_bytes` and `baseline_prompt_scope`.

[FACT] `.krn/benchmarks/krn-benchmark-live-suite/20260620T115037Z-3282001/report.json` is the latest confirmed explicit `live_codex_exec` report at the start of this goal: 3/3 completed tasks, 0 failed tasks, baseline `0.8457`, assisted `0.91`, delta `+0.0643`, `lift_status: "no_lift_evidence"`, and `productivity_lift_claimed: false`.

[FACT] `.krn/evals/krn-benchmark-live-stability/20260620T120047Z-3298454/report.json` classified the local store as 9 live reports, 3 clean, 6 dirty, latest clean, `suite_expansion_ready: false`, `productivity_lift_ready: false`, and next allowed action `repeat the clean live run under the typed policy before suite expansion`.

[FACT] `packages/evals/src/validate-krn-benchmark-live-stability.ts` requires the two newest `live_codex_exec` reports to be clean before `suite_expansion_ready` becomes true.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark live evidence gate.

Source-backed mechanisms:

- OpenAI/Codex non-interactive mode is an explicit worker/eval lane, not default deterministic `krn eval`.
- Goals and ExecPlan patterns require evidence, boundaries, and current-state verification before claiming completion.
- Repair/eval loops require the next run to become measured evidence, not narrative reassurance.
- `C050` and `C051` require repeated clean live evidence before suite expansion and keep one clean small-suite report below productivity-lift readiness.

Selected mechanisms:

- Reuse the `goal-028` typed runner policy unchanged.
- Run deterministic validate mode before live mode.
- Run explicit live mode once and inspect the generated `KrnBenchmarkReport`.
- Run `krn-benchmark-live-stability` after the live rerun and accept its readiness classification.
- If the repeat live run is dirty, record that as failed/dirty no-lift evidence and do not proceed to suite expansion.
- If the two newest live reports are clean, record only suite-expansion review readiness, not lift.

Rejected alternatives:

- Expand the suite now: rejected until the stability gate says repeated-clean evidence is ready.
- Claim lift from two clean three-task reports: rejected because the suite is below the 20-task lift gate.
- Add live mode to default `krn eval`: rejected because live `codex exec` is cost-bearing and nondeterministic.
- Tune benchmark prompts while repeating the run: rejected because this goal tests runner stability, not prompt optimization.

Falsification path:

- If validate mode fails, the typed runner policy is not stable enough for live rerun.
- If the live rerun fails or produces blocked/failed tasks, repeated-clean evidence is not achieved.
- If the stability gate keeps `suite_expansion_ready: false`, this goal remains an evidence-gathering repair slice, not an expansion unlock.
- Any productivity lift claim from this three-task repeated-clean evidence disproves completion.

Overclaim boundary:

This goal can prove only repeated clean explicit live-suite evidence for suite-expansion review. It does not prove measured productivity lift, statistical validity, suite expansion completion, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

## Work Plan

### 0. Policy And Store Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, `goal-028`, live-suite runner, live-stability runner, and current live store inspected.

### 1. Deterministic Validate Before Live

Work:

- Run `pnpm run eval:krn-benchmark-live-suite`.
- Confirm the task registry and typed live policy still pass.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-suite
```

### 2. Explicit Repeat Live Run

Work:

- Run `pnpm run eval:krn-benchmark-live-suite:live`.
- Inspect generated eval report and generated benchmark report.
- Confirm status, task counts, lift status, and productivity claim boundary.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-suite:live
```

### 3. Stability Classification And Release Audit

Work:

- Run `pnpm run eval:krn-benchmark-live-stability`.
- Update memory, source ledger, final product plan, parent goal, and this goal with the classification.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-stability
pnpm run eval:krn-eval
pnpm typecheck
pnpm test
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- The latest repeat live report is dirty.
- The two newest `live_codex_exec` reports are not both clean.
- Docs imply productivity lift, suite expansion completion, or command-surface readiness.
- Parent goal is marked complete.

## Completion Evidence

- `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T121920Z-3339493/report.json` with 5/5 cases and 24/24 assertions after the task registry moved to `goal-029`.
- `pnpm run eval:krn-benchmark-live-suite:live` generated `.krn/evals/krn-benchmark-live-suite/20260620T121951Z-3340034/report.json` with 6/6 cases and 30/30 assertions.
- `.krn/benchmarks/krn-benchmark-live-suite/20260620T121951Z-3340034/report.json` parsed as `KrnBenchmarkReport`, used `measurement_mode: "live_codex_exec"`, completed 3/3 tasks, had 0 failed tasks, 0 blocked tasks, baseline score `0.8717`, assisted score `0.8967`, delta `+0.025`, `lift_status: "no_lift_evidence"`, and `productivity_lift_claimed: false`.
- `pnpm run eval:krn-benchmark-live-stability` generated `.krn/evals/krn-benchmark-live-stability/20260620T123540Z-3385093/report.json` with 6/6 cases and 20/20 assertions.
- The stability summary classified current local evidence as 10 live reports, 4 clean completed reports, 6 dirty reports, latest live report clean, `suite_expansion_ready: true`, `productivity_lift_ready: false`, and next allowed action `review suite expansion toward the 20-task lift gate without claiming productivity lift`.
- `pnpm typecheck` passed after the runner/report-target changes.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T123940Z-3393698/report.json` with 18/18 modules, 82/82 cases, and 278/278 assertions.
- `pnpm test` passed with 31/31 test files and 106/106 tests.
- `python3 scripts/evals/codex_memory_compliance.py --mode validate` generated `.krn/evals/codex-memory-compliance/20260620T124527224761Z-3404068/report.json` with 4/4 cases.
- `git diff --check` passed.

## Outcome

[FACT] The two newest explicit `live_codex_exec` reports are clean enough for `krn-benchmark-live-stability` to mark suite expansion review-ready.

[FACT] The repeat-clean run remains below the 20-task productivity lift gate and keeps productivity lift unclaimed.

[DECISION] The next benchmark step should move up one level: review and implement suite expansion plus pipeline ergonomics for a larger KRN autoresearch arena. It should not keep repeating the same three-task suite unless the next larger run becomes dirty.

[DECISION] Parent `goal-006` remains active and incomplete. This child goal unlocks expansion review only; it does not prove measured productivity lift, suite expansion completion, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.
