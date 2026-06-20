# Goal 031: Expanded Benchmark Arena Task Registry

## Status

Complete Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `c6d4201 test: add benchmark arena contract gate`. It is not a replacement for `goal-006`; it is the first implementation slice after `goal-030` locked the expanded arena contract.

## Objective

Implement the first concrete expanded benchmark/autoresearch arena artifact: a source-backed 20-task task registry plus deterministic validator.

The target is:

```text
arena contract
  -> 20 source-backed coding-agent tasks
  -> implementation/debugging/refactor/review/continuity/repair task mix
  -> coding-quality rubric on every task
  -> explicit live boundary outside default krn eval
  -> known-bad shallow/default-live registry rejection
  -> aggregate krn eval coverage
```

This goal does not implement fixture scoring, run live `codex exec` over 20 tasks, add `krn benchmark`, add dashboard/API run controls, claim productivity lift, or mark the parent goal complete.

## Current Evidence

[FACT] `docs/goals/goal-030.md` completed a deterministic arena-expansion contract gate.

[FACT] `docs/evals/krn-benchmark-arena-contract/arena-contract.example.json` requires a 20-task lift gate, explicit live mode, pipeline ergonomics, coding-quality rubric, and implementation-heavy task mix.

[FACT] `docs/plans/canonical/SOURCES.md` claims `C052-C054` block productivity lift and dashboard/API run controls below the 20-task gate and require coding-quality dimensions before expanded live scaling.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark/eval gate for the expanded arena registry.

Source-backed mechanisms:

- `S009` keeps live `codex exec` outside default deterministic evals.
- `S010-S011` require restartable, evidence-driven goal/plan contracts.
- `S013-S016` require deterministic eval/repair loops and explicit failure modes.
- `S088` contributes the controlled autoresearch loop: baseline, fixed budget, metric, keep/discard, stop reason.
- `C052-C054` require the expanded arena to satisfy the contract before live scaling or lift claims.

Selected mechanisms:

- Add `krn-benchmark-expanded-arena` as a deterministic default eval module.
- Store the source-backed task registry in `docs/evals/krn-benchmark-expanded-arena/tasks.json`.
- Require 20 tasks, six coding-agent task families, implementation-heavy coverage, and per-task coding-quality metrics.
- Add a known-bad registry fixture for shallow planning-only, small-suite, default-live drift.
- Preserve the caveat that this validates registry readiness only.

Rejected alternatives:

- Implement live 20-task execution first: rejected because the registry and rubric must exist before cost-bearing live runs.
- Add dashboard run/repair controls now: rejected because the expanded runner and control contracts do not exist.
- Treat a green registry eval as product lift: rejected because no live expanded evidence exists.

Falsification path:

- The task registry has fewer than 20 tasks.
- The task mix measures only planning or JSON-answer behavior.
- Any task misses the review-burden metric or source refs to the active child goal.
- Default `krn eval` starts running live `codex exec`.
- The eval report caveat implies live expanded execution or productivity lift.

Overclaim boundary:

This goal can prove only deterministic expanded-arena task-registry readiness. It does not prove measured productivity lift, live expanded execution, statistical validity, fixture scoring quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

## Work Plan

### 0. Context Gate

Acceptance evidence:

- `AGENTS.md`, `docs/memory/INDEX.md`, active goal context, `goal-030`, arena contract, and coding-quality rubric inspected.

### 1. Expanded Arena Registry Eval

Work:

- Add `docs/evals/krn-benchmark-expanded-arena/`.
- Add valid 20-task registry, known-bad fixture, cases, result schema, README, Cookbook mapping, and validator.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-expanded-arena
```

### 2. Aggregate KRN Eval Integration

Work:

- Add the module to `package.json`, `packages/cli/src/main.ts`, `packages/evals/src/validate-krn-eval.ts`, aggregate examples, docs, and tests.

Acceptance evidence:

```bash
pnpm run eval:krn-eval
pnpm typecheck
pnpm test
```

### 3. Release Audit

Work:

- Update parent goal, final product plan, source ledger, memory index, and memory note with the registry boundary.

Acceptance evidence:

```bash
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- The registry is accepted with fewer than 20 tasks.
- The registry allows default-live execution.
- The registry lacks coding-quality or review-burden metrics.
- The implementation claims the expanded arena has run live or proven lift.

## Completion Evidence

- `docs/evals/krn-benchmark-expanded-arena/tasks.json` defines 20 source-backed coding-agent tasks across implementation, debugging, refactor, review, continuity, and benchmark-repair families.
- The registry preserves `minimum_live_task_count_for_lift_claim: 20`, keeps live `codex exec` outside default evals, requires separate fixture/live evidence, and keeps sequential live concurrency until separately evaluated.
- Every task includes source refs to `docs/goals/goal-006.md` and `docs/goals/goal-031.md`, task-specific assisted guidance, acceptance/overclaim keywords, and at least five coding-quality metrics including `review_burden_score`.
- `docs/evals/krn-benchmark-expanded-arena/fixtures/bad-expanded-arena-tasks.json` is the known-bad fixture for small-suite, planning-only, missing-rubric, default-live registry drift.
- `packages/evals/src/validate-krn-benchmark-expanded-arena.ts` rejects the known-bad fixture and writes reports under `.krn/evals/krn-benchmark-expanded-arena/{run_id}/report.json`.
- `pnpm run eval:krn-benchmark-expanded-arena` generated `.krn/evals/krn-benchmark-expanded-arena/20260620T131923Z-3485253/report.json` with 7/7 cases and 38/38 assertions.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T131931Z-3485816/report.json` with 20/20 modules, 96/96 cases, and 350/350 assertions, including `krn-benchmark-expanded-arena`.
- `pnpm typecheck` passed after adding the expanded-arena validator and aggregate integration.
- `pnpm test` passed with 31/31 test files and 106/106 tests.
- `python3 scripts/evals/codex_memory_compliance.py --mode validate` generated `.krn/evals/codex-memory-compliance/20260620T132538147792Z-3508433/report.json` with 4/4 cases.
- `jq empty` passed for the new and changed JSON files.
- `git diff --check` passed.

## Outcome

[FACT] KRN now has the first concrete expanded benchmark arena artifact: a deterministic, source-backed 20-task registry.

[FACT] The registry covers implementation-heavy coding-agent work and forces coding-quality metrics, including review burden, before any expanded live runner or scoring layer can claim value.

[FACT] The aggregate `krn eval` includes `krn-benchmark-expanded-arena` as a deterministic validate-mode module.

[DECISION] The next benchmark slice should add fixture scoring and explicit live smoke/full runner modes over `docs/evals/krn-benchmark-expanded-arena/tasks.json`, while keeping live `codex exec` outside default deterministic `krn eval`.

[DECISION] Parent `goal-006` remains active and incomplete. This child goal proves registry readiness only; it does not prove measured productivity lift, live expanded execution, statistical validity, fixture scoring quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.
