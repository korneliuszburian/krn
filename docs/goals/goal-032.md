# Goal 032: Expanded Arena Fixture Scoring Gate

## Status

Complete Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `1239d9f test: add expanded benchmark arena registry`. It is not a replacement for `goal-006`; it is the next bounded benchmark slice after `goal-031` created the 20-task registry.

## Objective

Add deterministic fixture scoring and benchmark-report generation for `docs/evals/krn-benchmark-expanded-arena/tasks.json`.

The target is:

```text
20-task registry
  -> deterministic baseline/assisted scoring fixtures
  -> per-task coding-quality metric rows
  -> generated KrnBenchmarkReport under .krn/benchmarks/
  -> fixture_contract no-lift boundary
  -> known-bad scoring fixture rejection
  -> aggregate krn eval coverage
```

This goal does not run live `codex exec` over the 20-task arena, add a `krn benchmark` command, add dashboard/API run controls, claim productivity lift, or mark the parent goal complete.

## Current Evidence

[FACT] `docs/goals/goal-031.md` completed the source-backed 20-task expanded arena registry.

[FACT] `docs/plans/canonical/SOURCES.md` claim `C055` states the green registry eval does not prove fixture scoring quality, live expanded execution, measured productivity lift, or dashboard command readiness.

[FACT] `docs/memory/product/2026-06-20--krn-benchmark-expanded-arena-registry.md` lists fixture scoring and explicit live smoke/full runner as review triggers after the registry gate.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark/eval scoring gate for the expanded arena.

Source-backed mechanisms:

- `S009` keeps live `codex exec` outside default deterministic evals.
- `S010-S011` require restartable, evidence-driven goal/plan contracts.
- `S013-S016` require deterministic eval/repair loops and metrics over agent decisions, not only final prose.
- `S088` contributes the controlled autoresearch loop: baseline, fixed budget, metric, keep/discard, stop reason.
- `C052-C055` require the 20-task gate, coding-quality metrics, and no-lift caveats before live scaling or dashboard controls.

Selected mechanisms:

- Keep `krn-benchmark-expanded-arena` as the deterministic default eval module.
- Add fixture scoring fixtures that cover all 20 registry task IDs.
- Generate a `KrnBenchmarkReport` with `measurement_mode: "fixture_contract"` and `productivity_lift_claimed: false`.
- Reject a known-bad scoring fixture that misses required metrics, covers too few tasks, or claims lift.
- Preserve the next action as explicit live smoke/full runner implementation, not dashboard work.

Rejected alternatives:

- Run 20 live coding tasks now: rejected because the expanded arena still lacks an isolated worktree runner and scoring trail for code diffs.
- Reuse the three-task read-only live runner directly: rejected because the expanded tasks are code-change/review tasks, not only route-selection prompts.
- Add dashboard controls now: rejected because fixture scoring is not live runner evidence or lift evidence.

Falsification path:

- The fixture scoring report fails to parse through `KrnBenchmarkReport`.
- The scoring fixture covers fewer than 20 tasks.
- Required task metrics are missing or unsupported.
- Fixture mode claims productivity lift or `positive_lift`.
- Default `krn eval` runs live `codex exec`.

Overclaim boundary:

This goal can prove only deterministic fixture scoring over the 20-task registry. It does not prove live expanded execution, measured productivity lift, statistical validity, isolated coding-task runner safety, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

## Work Plan

### 0. Context Gate

Acceptance evidence:

- `AGENTS.md`, `docs/memory/INDEX.md`, `docs/goals/goal-006.md`, `docs/goals/goal-031.md`, expanded registry memory note, source claims, and TypeScript/eval standards inspected.

### 1. Fixture Scoring Contract

Work:

- Add baseline, assisted, and known-bad scoring fixtures under `docs/evals/krn-benchmark-expanded-arena/fixtures/`.
- Extend the validator to parse fixtures, score all registry tasks, generate `KrnBenchmarkReport`, and reject the known-bad fixture.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-expanded-arena
```

### 2. Aggregate KRN Eval Integration

Work:

- Update module cases, result schema, README, aggregate examples, and expected aggregate counts.

Acceptance evidence:

```bash
pnpm run eval:krn-eval
pnpm typecheck
pnpm test
```

### 3. Release Audit

Work:

- Update parent goal, final product plan, source ledger, memory index/read-order, and memory note with fixture-scoring boundary.

Acceptance evidence:

```bash
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- The fixture scorer accepts missing review-burden coverage.
- The generated benchmark report can be overclaimed as productivity lift.
- The aggregate eval omits the expanded arena scoring gate.
- Parent `goal-006` is marked complete.

## Completion Evidence

- `docs/evals/krn-benchmark-expanded-arena/fixtures/baseline-scoring-fixture.json` and `docs/evals/krn-benchmark-expanded-arena/fixtures/assisted-scoring-fixture.json` cover all 20 expanded-arena task IDs with deterministic coding-quality metric scores.
- `docs/evals/krn-benchmark-expanded-arena/fixtures/bad-scoring-fixture-overclaims-lift.json` is rejected because fixture scoring cannot claim productivity lift and lacks full review-burden/registry coverage.
- `packages/evals/src/validate-krn-benchmark-expanded-arena.ts` now builds a parsed `KrnBenchmarkReport` under `.krn/benchmarks/krn-benchmark-expanded-arena/{run_id}/report.json`.
- `pnpm run eval:krn-benchmark-expanded-arena` generated `.krn/evals/krn-benchmark-expanded-arena/20260620T134730Z-3552506/report.json` with 9/9 cases and 51/51 assertions, plus `.krn/benchmarks/krn-benchmark-expanded-arena/20260620T134730Z-3552506/report.json` with 20/20 completed fixture-scored tasks, baseline `0.4868`, assisted `0.7937`, delta `+0.3069`, `measurement_mode: "fixture_contract"`, `lift_status: "no_lift_evidence"`, and `productivity_lift_claimed: false`.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T134738Z-3552706/report.json` with 20/20 modules, 98/98 cases, and 363/363 assertions; the aggregate run included `krn-benchmark-expanded-arena` report `.krn/evals/krn-benchmark-expanded-arena/20260620T134842Z-3556304/report.json` and benchmark report `.krn/benchmarks/krn-benchmark-expanded-arena/20260620T134842Z-3556304/report.json`.
- `pnpm typecheck` passed.
- `pnpm test` passed with 31/31 test files and 106/106 tests.
- `python3 scripts/evals/codex_memory_compliance.py --mode validate` generated `.krn/evals/codex-memory-compliance/20260620T135020266046Z-3560001/report.json` with 4/4 cases passing.
- `jq empty` passed for changed JSON fixtures/contracts, and `git diff --check` passed.

## Outcome

[FACT] KRN now has deterministic fixture scoring and benchmark-report generation for the 20-task expanded arena registry.

[FACT] The generated expanded-arena benchmark report remains `fixture_contract`, keeps `productivity_lift_claimed: false`, and routes the next repair target to explicit isolated live smoke/full runner implementation.

[DECISION] The next benchmark slice should implement isolated explicit live smoke/full runner modes over `docs/evals/krn-benchmark-expanded-arena/tasks.json`. It should not add dashboard/API run controls before live runner evidence exists.

[DECISION] Parent `goal-006` remains active and incomplete. This child goal proves fixture scoring only; it does not prove live expanded execution, measured productivity lift, statistical validity, isolated coding-task runner safety, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.
