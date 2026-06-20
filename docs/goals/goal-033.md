# Goal 033: Expanded Arena Live Runner Modes

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md). The parent remains incomplete.

This goal starts after commit `591cdb6 test: add expanded arena fixture scoring`. It is not a replacement for `goal-006`; it is the next bounded benchmark slice after `goal-032` added deterministic fixture scoring for the 20-task expanded arena.

## Objective

Add isolated explicit live smoke/full runner modes for `docs/evals/krn-benchmark-expanded-arena/tasks.json`.

The target is:

```text
20-task expanded arena registry
  -> explicit validate mode remains fixture_contract only
  -> explicit live-smoke mode runs one registry task in isolated worker worktrees
  -> explicit live-full mode can run all 20 registry tasks in the same isolated runner path
  -> per-worker stdout/stderr/final/status/patch/progress evidence under .krn/
  -> live_codex_exec KrnBenchmarkReport
  -> no productivity lift claim until the live lift gate is clean
```

This goal does not add a `krn benchmark` CLI command, add dashboard/API run controls, add destructive MCP/API tools, make live execution part of default `krn eval`, claim productivity lift, or mark the parent goal complete.

## Current Evidence

[FACT] `docs/goals/goal-032.md` completed deterministic fixture scoring and benchmark-report generation for the 20-task expanded arena registry.

[FACT] `docs/plans/canonical/SOURCES.md` claim `C056` states that positive fixture deltas remain no-lift evidence until an isolated live runner executes the registry with complete positive live evidence above the lift gate.

[FACT] The official Codex manual documents `codex exec` as non-interactive automation for pipelines, supports JSONL and `--output-schema`, and says automation should use the least sandbox permissions needed; local `codex exec --help` confirms `--sandbox read-only|workspace-write`, `--ephemeral`, `--output-schema`, `--output-last-message`, and `-C`.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark/eval live runner path for the expanded arena.

Source-backed mechanisms:

- `S009` keeps `codex exec` as an explicit worker/eval lane with machine-readable output.
- `S010-S011` require restartable evidence-driven goals and plans.
- `S013-S016` require deterministic eval/repair loops and decision metrics, not prose-only success.
- `S088` contributes the controlled experiment loop: fixed task set, fixed metric, keep/discard, stop reason.
- `C052-C056` require the 20-task gate, coding-quality metrics, clean evidence, and no-lift boundaries before live scaling or dashboard/API controls.
- Official Codex non-interactive and sandbox docs support explicit `codex exec` workers, schema-constrained output, and least-permission sandboxing.

Selected mechanisms:

- Keep default `pnpm run eval:krn-benchmark-expanded-arena` deterministic and fixture-only.
- Add explicit `live-smoke` and `live-full` modes outside default `krn eval`.
- Run live workers in temporary detached Git worktrees with `--sandbox workspace-write`, not in the foreground checkout.
- Capture worker stdout, stderr, final JSON, status, patch, and progress evidence under `.krn/benchmarks/krn-benchmark-expanded-arena/{run_id}/`.
- Generate a parsed `KrnBenchmarkReport` with `measurement_mode: "live_codex_exec"` and `productivity_lift_claimed: false`.
- Run `live-smoke` for one task as acceptance evidence; implement but do not run `live-full` in this slice unless explicitly needed.

Rejected alternatives:

- Add live mode to default `krn eval`: rejected because live `codex exec` is cost-bearing, nondeterministic, and explicitly outside aggregate deterministic evals.
- Run all 20 tasks immediately: rejected for this slice because the first safe step is proving the isolated runner path and smoke evidence before spending a full live budget.
- Reuse the three-task read-only runner directly: rejected because expanded-arena tasks are coding/review/refactor tasks and require isolated writable workspaces plus patch evidence.
- Add dashboard/API run controls now: rejected because live runner evidence must exist before command surfaces.

Falsification path:

- Default validate mode runs live `codex exec`.
- `live-smoke` does not use isolated worker worktrees.
- Worker evidence files are missing or outside `.krn/`.
- A generated live report fails `parseKrnBenchmarkReport`.
- A smoke/full live report claims productivity lift below the 20-task clean lift gate.
- The full runner mode cannot select all 20 registry tasks through the same runner path.

Overclaim boundary:

This goal can prove only explicit isolated live runner mechanics and one smoke live-run path over the expanded arena. It does not prove live execution of all 20 tasks, measured productivity lift, statistical validity, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or safe concurrent runner scaling.

## Work Plan

### 0. Context Gate

Acceptance evidence:

- `AGENTS.md`, `docs/memory/INDEX.md`, `docs/goals/goal-006.md`, `docs/goals/goal-032.md`, fixture-scoring memory note, eval standard, TypeScript standards, source claims, official Codex non-interactive/sandbox docs, local `codex exec --help`, and current worktree inspected.

### 1. Live Runner Contract

Work:

- Add expanded-arena Codex output schema.
- Extend result schema, cases, README, package scripts, and validator modes for `validate`, `live-smoke`, and `live-full`.
- Add typed live execution policy fields for isolated worktree, sandbox, timeout, output buffer, progress log, and resume behavior.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-expanded-arena
```

### 2. Isolated Smoke Evidence

Work:

- Implement temporary detached Git worktree workers for baseline and assisted runs.
- Capture stdout/stderr/final/status/patch/progress evidence under `.krn/benchmarks/krn-benchmark-expanded-arena/{run_id}/`.
- Generate and parse a live `KrnBenchmarkReport` for `live-smoke`.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-expanded-arena:live-smoke
```

### 3. Release Audit

Work:

- Update parent goal, final product plan, source ledger, memory index/read-order, and memory note with the live-smoke/full boundary.

Acceptance evidence:

```bash
pnpm run eval:krn-eval
pnpm typecheck
pnpm test
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- `live-full` is only a README claim and cannot be selected by the runner.
- The smoke live report is fixture-shaped instead of `live_codex_exec`.
- Worker patches/status/final outputs are not captured.
- The generated live report claims productivity lift.
- Parent `goal-006` is marked complete.

## Completion Evidence

- `jq empty package.json docs/evals/krn-benchmark-expanded-arena/tasks.json docs/evals/krn-benchmark-expanded-arena/cases.json docs/evals/krn-benchmark-expanded-arena/result.schema.json docs/evals/krn-benchmark-expanded-arena/codex-output.schema.json docs/evals/krn-eval-contracts/cases.json docs/specs/krn-eval/examples/krn-eval-report.example.json` passed.
- `pnpm exec tsc -p packages/evals/tsconfig.json --noEmit` passed.
- `pnpm run eval:krn-benchmark-expanded-arena` generated `.krn/evals/krn-benchmark-expanded-arena/20260620T142746Z-3660514/report.json` with 11/11 cases and 63/63 assertions, plus fixture benchmark report `.krn/benchmarks/krn-benchmark-expanded-arena/20260620T142746Z-3660514/report.json`.
- `pnpm run eval:krn-benchmark-expanded-arena:live-smoke` generated `.krn/evals/krn-benchmark-expanded-arena/20260620T141316Z-3622439/report.json` with 12/12 cases and 73/73 assertions, plus live benchmark report `.krn/benchmarks/krn-benchmark-expanded-arena/20260620T141316Z-3622439/report.json` with `measurement_mode: "live_codex_exec"`, 1 selected task, 0 completed tasks, 1 failed task, baseline `0.4111`, assisted `0.4111`, delta `0`, `lift_status: "no_lift_evidence"`, and `productivity_lift_claimed: false`.
- `git worktree list --porcelain` showed only the foreground worktree after the live-smoke run.
- `pnpm run eval:krn-eval` generated `.krn/evals/krn-eval-contracts/20260620T142757Z-3661448/report.json` with 3/3 cases and 7/7 assertions, and aggregate `.krn/eval/20260620T142757Z-3661448/report.json` with 20/20 modules, 100/100 cases, and 375/375 assertions.
- `pnpm typecheck` passed.
- `pnpm test` passed with 31/31 test files and 106/106 tests.
- `python3 scripts/evals/codex_memory_compliance.py --mode validate` generated `.krn/evals/codex-memory-compliance/20260620T142918742307Z-3664283/report.json` with 4/4 cases.
- `git diff --check` passed.

## Outcome

Implemented explicit expanded-arena `validate`, `live-smoke`, and `live-full` modes. Default deterministic validation remains fixture-only, and live modes remain callable only through explicit scripts. Live workers use temporary detached Git worktrees, schema-constrained `codex exec`, local stdout/stderr/final/status/patch captures, progress logs, and typed `live_codex_exec` benchmark reports.

The smoke run is intentionally no-lift evidence: it proved isolated runner mechanics and evidence capture, but both workers timed out and the selected task completed 0/1. The next benchmark slice should repair expanded-arena worker prompt/budget ergonomics before treating `live-full` as meaningful product evidence or adding dashboard/API command surfaces.
