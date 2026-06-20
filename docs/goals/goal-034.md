# Goal 034: Expanded Arena Smoke Worker Ergonomics Repair

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `26505d1 test: add expanded arena live runner modes`. It is not a replacement for `goal-006`; it is the next bounded benchmark repair after `goal-033` proved live runner mechanics but completed 0/1 selected smoke tasks.

## Objective

Repair expanded-arena `live-smoke` worker ergonomics so the selected smoke task completes cleanly instead of producing only timeout fallback evidence.

The target is:

```text
goal-033 live runner mechanics
  -> bounded smoke input fixture
  -> registry-owned smoke task id and input ref
  -> baseline and assisted prompts both start from bounded source refs
  -> worker worktrees materialize the current foreground diff before codex exec
  -> failed or timed-out captures are not resumed as completed workers
  -> live-smoke report completes the selected bounded review task
  -> productivity_lift_claimed remains false
```

This goal does not add dashboard/API run controls, run `live-full`, add live execution to default `krn eval`, claim productivity lift, or mark the parent goal complete.

## Current Evidence

[FACT] `docs/goals/goal-033.md` completed explicit `live-smoke` and `live-full` runner modes, with worker stdout/stderr/final/status/patch/progress evidence capture.

[FACT] The `goal-033` live-smoke report passed its shape/evidence contract but completed 0/1 selected tasks because both workers timed out.

[FACT] The selected smoke task `release-verifier-finding-review` asked workers to review a KRN done-claim but did not provide a bounded claim fixture, causing broad repo/source-ledger search behavior.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark/eval repair loop for expanded-arena live worker ergonomics.

Source-backed mechanisms:

- `S009` keeps `codex exec` as an explicit worker/eval lane with schema output.
- `S013-S016` require measured repair attempts and decision metrics.
- `S088` contributes the controlled experiment loop: fixed task set, fixed metric, keep/discard, stop reason.
- `C044-C046` require repair attempts to compare before/after evidence and avoid mistaking timeouts for lift.
- `C057` says green live-smoke shape is no-lift evidence when selected tasks fail or timeout.
- Official Codex non-interactive docs support `codex exec`, JSONL output, `--output-schema`, and explicit sandbox settings for automation.

Selected mechanisms:

- Add a bounded done-claim fixture for the smoke review task.
- Store `smoke_task_id` and `bounded_smoke_input_ref` in the registry policy instead of a runner-only constant.
- Give baseline and assisted prompts the same task source refs; assisted still gets extra task guidance.
- Materialize the current foreground diff into worker worktrees before `codex exec`, because temp worktrees created from `HEAD` cannot see the in-progress slice.
- Resume only completed worker captures, not failed timeout fallback captures.
- Add a deterministic validate-mode case for bounded smoke input and a live-smoke-only completion case.

Rejected alternatives:

- Increase timeout only: rejected because the root failure is open-ended task input, and longer timeouts would hide poor ergonomics.
- Pick an easier unrelated smoke task: rejected because it would dodge the observed review-task failure instead of repairing it.
- Treat green evidence capture as enough: rejected by `C057`.
- Add dashboard/API controls now: rejected because clean live worker completion is still unproven.

Falsification path:

- Default validate mode starts live workers.
- Smoke task can no longer be selected through registry policy.
- Smoke prompt omits the bounded claim fixture.
- Worker worktrees are created from stale `HEAD` and cannot see the current repair files.
- A repeated `--run-id` resumes a failed timeout fallback as if it were complete.
- `live-smoke` still reports 0 completed selected tasks.
- A live report claims productivity lift.

Overclaim boundary:

This goal can prove only that the selected bounded smoke review task completes through the isolated live runner. It does not prove all 20 tasks run, measured productivity lift, statistical validity, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or safe concurrent runner scaling.

## Work Plan

### 1. Bounded Smoke Contract

Work:

- Add the smoke claim fixture.
- Add registry policy fields for smoke task id and bounded input.
- Add deterministic eval coverage for the bounded smoke input.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-expanded-arena
```

### 2. Worker Ergonomics Repair

Work:

- Give baseline and assisted prompts bounded task source refs.
- Resume only completed worker captures.
- Add live-smoke completion assertion.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-expanded-arena:live-smoke
```

### 3. Release Audit

Work:

- Update parent goal, final product plan, source ledger, memory index/read-order, and memory note with the repair outcome.

Acceptance evidence:

```bash
pnpm run eval:krn-eval
pnpm typecheck
pnpm test
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- `live-smoke` passes shape checks but selected task remains failed or timed out.
- The smoke task is completed only by fallback JSON.
- The repair changes the default deterministic aggregate into live execution.
- Parent `goal-006` is marked complete.

## Completion Evidence

- `pnpm run eval:krn-benchmark-expanded-arena` generated `.krn/evals/krn-benchmark-expanded-arena/20260620T145919Z-3729170/report.json` with 12/12 cases and 70/70 assertions. The generated fixture benchmark report stayed `measurement_mode: "fixture_contract"` and `productivity_lift_claimed: false`.
- `pnpm run eval:krn-benchmark-expanded-arena:live-smoke` generated `.krn/evals/krn-benchmark-expanded-arena/20260620T150429Z-3746653/report.json` with 14/14 cases and 85/85 assertions.
- The corresponding live benchmark report `.krn/benchmarks/krn-benchmark-expanded-arena/20260620T150429Z-3746653/report.json` used `measurement_mode: "live_codex_exec"`, selected 1 task, completed 1 task, failed 0 tasks, scored baseline `0.9167`, assisted `0.9167`, delta `0`, kept `lift_status: "no_lift_evidence"`, and kept `productivity_lift_claimed: false`.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T145930Z-3730966/report.json` with 20/20 modules, 101/101 cases, and 382/382 assertions, including the expanded-arena validate module with the bounded smoke-repair guard.
- `pnpm typecheck` passed.
- `pnpm test` passed with 31/31 test files and 106/106 tests.
- `python3 scripts/evals/codex_memory_compliance.py --mode validate` generated `.krn/evals/codex-memory-compliance/20260620T151009689717Z-3753890/report.json` with 4/4 cases passing.
- `git diff --check` passed.
- `git worktree list --porcelain` after the successful live-smoke run showed no leftover temporary worker worktrees.
- The registry-level source refs keep `docs/goals/goal-034.md` as current child context; task-level `goal-034` refs are kept only where workers actually need that file as task input, avoiding repeated per-task source-ref churn.

## Outcome

[FACT] The selected expanded-arena smoke task now completes cleanly through the isolated live runner instead of producing timeout fallback evidence.

[FACT] The final smoke run is one-task no-lift evidence, not a productivity claim.

[DECISION] The next benchmark step may use this as worker-completion readiness for a bounded `live-full` attempt or another runner-quality repair, but not as dashboard/API command readiness or lift evidence.
