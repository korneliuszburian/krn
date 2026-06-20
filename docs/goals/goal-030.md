# Goal 030: Benchmark Arena Expansion Contract

## Status

Complete Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `53085a3 test: record repeat-clean benchmark stability`. It is not a replacement for `goal-006`; it is the next bounded benchmark slice after `goal-029` unlocked suite-expansion review from repeated clean three-task live evidence.

## Objective

Create a deterministic arena-expansion contract gate before implementing a larger benchmark/autoresearch arena.

The target is not another repeat-clean live run and not productivity lift. The target is a machine-readable contract that forces the next larger arena to include:

```text
20-task lift gate
  -> explicit live mode outside default krn eval
  -> progress/resume/smoke/full pipeline ergonomics
  -> coding-quality rubric
  -> implementation-heavy task mix
  -> known-bad overclaim fixture
  -> aggregate krn eval coverage
```

This goal does not implement the 20-task suite, run live `codex exec`, add `krn benchmark`, add dashboard/API run controls, claim productivity lift, or mark the parent goal complete.

## Current Evidence

[FACT] `docs/goals/goal-029.md` completed repeated clean explicit three-task live-suite evidence.

[FACT] `.krn/evals/krn-benchmark-live-stability/20260620T123540Z-3385093/report.json` classified current local live evidence as 10 live reports, 4 clean completed reports, 6 dirty reports, latest clean, `suite_expansion_ready: true`, and `productivity_lift_ready: false`.

[FACT] `docs/memory/evals/2026-06-20--coding-quality-rubric.md` records that the next expanded benchmark/autoresearch arena must measure assumptions, simplicity, surgical diffs, verification quality, and review burden.

[FACT] `docs/plans/canonical/SOURCES.md` claim `C052` states repeat-clean three-task evidence unlocks suite-expansion review only, and claim `C053` states benchmark quality must include coding-agent behavior quality.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark/eval gate for the next expanded arena.

Source-backed mechanisms:

- `S009` keeps live `codex exec` as an explicit worker/eval lane, not a default aggregate eval.
- `S010` and `S011` require restartable, evidence-driven goal/plan contracts for multi-step work.
- `S013-S016` require deterministic eval/repair loops and metrics that cover routes/tools/decisions, not only final answer text.
- `S088` contributes the controlled autoresearch metric loop: baseline, fixed budget, metric, keep/discard, stop reason.
- `C052` allows suite-expansion review but blocks productivity lift below the 20-task gate.
- `C053` requires coding-quality dimensions in the expanded arena.

Selected mechanisms:

- Add `krn-benchmark-arena-contract` as a deterministic default eval module.
- Store the arena expansion rules in `docs/evals/krn-benchmark-arena-contract/arena-contract.example.json`.
- Add a known-bad fixture that overclaims lift from a three-task suite and makes live mode default.
- Require pipeline ergonomics before implementation: progress logging, resume completed workers, quick smoke lane, full suite lane, fixture/live evidence separation, and sequential `codex exec` until a separate concurrency policy exists.
- Require coding-quality metrics: assumptions, simplicity, surgical diffs, verification, review burden, source grounding, goal alignment, and anti-slop.
- Require implementation-heavy task families, not only planning or JSON-answer tasks.

Rejected alternatives:

- Implement the 20-task suite immediately: rejected because the contract gate should lock quality, pipeline, and claim boundaries first.
- Keep rerunning the same three-task live suite: rejected because `goal-029` already made expansion review-ready.
- Add live mode to default `krn eval`: rejected because live `codex exec` is cost-bearing and nondeterministic.
- Add dashboard/API run controls now: rejected because the arena implementation and control-plane contracts do not exist yet.
- Claim lift from repeat-clean evidence: rejected because the suite is below the 20-task lift gate.

Falsification path:

- The valid arena contract fails to parse.
- The known-bad overclaim fixture parses.
- The aggregate `krn eval` omits `krn-benchmark-arena-contract`.
- The eval report caveat implies productivity lift, suite expansion completion, or live command readiness.
- Parent `goal-006` is marked complete.

Overclaim boundary:

This goal can prove only deterministic arena-expansion contract readiness. It does not prove measured productivity lift, the 20-task suite implementation, statistical validity, live Codex quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

## Work Plan

### 0. Context Gate

Acceptance evidence:

- `AGENTS.md`, `docs/memory/INDEX.md`, `docs/goals/goal-006.md`, `docs/goals/goal-029.md`, source claims, and coding-quality rubric inspected.

### 1. Arena Contract Eval

Work:

- Add `docs/evals/krn-benchmark-arena-contract/`.
- Add valid arena contract, known-bad overclaim fixture, cases, result schema, README, and Cookbook mapping.
- Add `packages/evals/src/validate-krn-benchmark-arena-contract.ts`.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-arena-contract
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

- Update parent goal, final product plan, source ledger, memory index, and memory note with the new contract gate and overclaim boundary.

Acceptance evidence:

```bash
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- The contract allows productivity lift claims before a 20-task clean positive live run.
- The contract lacks coding-quality rubric dimensions.
- The contract makes live `codex exec` part of default `krn eval`.
- The implementation claims the expanded arena exists before its task registry and live runner are implemented.

## Completion Evidence

- `docs/evals/krn-benchmark-arena-contract/arena-contract.example.json` defines the expanded arena contract with `initial_task_count: 20`, `minimum_live_task_count_for_lift_claim: 20`, explicit live mode, separate fixture/live evidence, sequential live concurrency, progress/resume/smoke/full pipeline requirements, coding-quality metrics, and implementation-heavy task families.
- `docs/evals/krn-benchmark-arena-contract/fixtures/bad-arena-contract-overclaims-lift.json` is the known-bad fixture for small-suite lift overclaim, hidden live execution, missing pipeline ergonomics, missing coding-quality rubric, and default-live aggregate eval drift.
- `packages/evals/src/validate-krn-benchmark-arena-contract.ts` rejects the known-bad fixture and writes reports under `.krn/evals/krn-benchmark-arena-contract/{run_id}/report.json`.
- `pnpm run eval:krn-benchmark-arena-contract` generated `.krn/evals/krn-benchmark-arena-contract/20260620T125641Z-3428998/report.json` with 7/7 cases and 34/34 assertions.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T125652Z-3429751/report.json` with 19/19 modules, 89/89 cases, and 312/312 assertions, including `krn-benchmark-arena-contract`.
- `pnpm typecheck` passed after adding the arena-contract runner and aggregate integration.
- `pnpm test` passed with 31/31 test files and 106/106 tests.
- `python3 scripts/evals/codex_memory_compliance.py --mode validate` generated `.krn/evals/codex-memory-compliance/20260620T130224016503Z-3452343/report.json` with 4/4 cases.
- `git diff --check` passed.

## Outcome

[FACT] KRN now has a deterministic arena-expansion contract gate before the larger benchmark/autoresearch suite is implemented.

[FACT] The contract requires a 20-task live lift gate, explicit live mode outside default `krn eval`, resumable pipeline ergonomics, separate fixture/live evidence, coding-quality metrics, and implementation-heavy task families.

[FACT] The known-bad overclaim fixture fails deterministically.

[DECISION] The next benchmark slice should implement the expanded arena from `docs/evals/krn-benchmark-arena-contract/arena-contract.example.json`, not expand dashboard command surfaces or keep repeating the three-task suite.

[DECISION] Parent `goal-006` remains active and incomplete. This child goal proves contract readiness only; it does not prove measured productivity lift, expanded suite implementation, live expanded evidence, statistical validity, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.
