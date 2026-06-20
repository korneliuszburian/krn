# Goal 027: Benchmark Live Stability Readiness Gate

## Status

Complete Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commits `a7abb7e fix: gate live benchmark task registry` and `5334b83 fix: reduce compact resume context load`. It is not a replacement for `goal-006`; it is the next bounded benchmark slice after `goal-026` exposed live runner policy as typed data but still did not prove clean repeated live-run stability.

## Objective

Add a deterministic readiness gate over live benchmark reports so KRN can distinguish:

```text
no live evidence
  -> dirty live evidence
  -> one clean completed live report
  -> repeated clean completed live reports
  -> still no productivity lift unless the lift gate is satisfied
```

The end state is a default `krn eval` module that reads existing `.krn/benchmarks/krn-benchmark-live-suite/**/report.json` artifacts, parses them through `KrnBenchmarkReport`, and blocks suite expansion or productivity claims unless the live evidence is clean enough.

This goal does not run live mode by default, expand the suite to 20 tasks, tune prompts, add dashboard repair buttons, expose MCP/API run controls, claim productivity lift, or mark the parent goal complete.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-026.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-026.md)
- [docs/evals/krn-benchmark-live-suite/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/krn-benchmark-live-suite/README.md)
- [docs/specs/krn-benchmark-report/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-benchmark-report/README.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)

[FACT] The latest relevant dirty live evidence before this goal is `.krn/benchmarks/krn-benchmark-live-suite/20260620T102133Z-3093693/report.json`: 3 tasks, 1 completed, 2 failed, positive delta, `lift_status: "no_lift_evidence"`.

[FACT] `goal-026` made the live runner policy typed but did not add a readiness gate that compares live reports across runs.

[DECISION] The repair surface is deterministic live-report stability classification. Do not broaden into prompt tuning, suite expansion, dashboard commands, or live-mode default execution.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark live evidence readiness before suite expansion.

Source-backed mechanisms:

- S009 `codex exec`: live runs are explicit worker/eval lanes, not default aggregate evaluation.
- S010/S011 Goals and ExecPlans: completion requires evidence and constraints, not plausible progress.
- S013-S016 repair/eval loops: failure evidence should become deterministic gates and repair inputs before another repair attempt.
- S088 controlled experiment loop: change one measurement gate and record what remains unresolved.
- C047/C048: dirty positive status and hidden runner policy are claim surfaces that must be blocked before lift or expansion.

Selected mechanisms:

- Add `krn-benchmark-live-stability` validate module.
- Parse live reports through `parseKrnBenchmarkReport`.
- Treat zero live reports as not ready.
- Treat failed or blocked tasks as dirty live evidence.
- Require repeated clean completed live reports before suite expansion readiness.
- Keep productivity lift readiness false unless a live report satisfies the 20-task clean positive lift gate.

Rejected alternatives:

- Run `eval:krn-benchmark-live-suite:live` inside default `krn eval`: rejected because live mode is slow, nondeterministic, and cost-bearing.
- Expand the task suite now: rejected because clean repeated live stability is not proven.
- Tune task prompts now: rejected because the current missing layer is evidence classification, not another prompt repair.
- Add dashboard run/repair buttons: rejected because command surfaces should not appear before readiness gates exist.

Falsification path:

- `pnpm run eval:krn-benchmark-live-stability` passes and writes a machine-readable report.
- `pnpm run eval:krn-eval` includes `krn-benchmark-live-stability`.
- A dirty live report with failed tasks is classified as not expansion-ready.
- One clean three-task report is recognized as clean but still not enough for repeated stability or productivity lift.
- Repeated clean three-task fixture reports can be expansion-ready but still cannot claim lift below the 20-task gate.
- If dirty or missing live evidence can be treated as expansion-ready, this goal is not complete.

Overclaim boundary:

This goal proves only deterministic live-report readiness classification. It does not prove measured productivity lift, clean repeated live execution in the current runtime, statistical validity, suite expansion completion, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

## Work Plan

### 0. Source And Failure Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, `goal-026`, benchmark report contract, live-suite docs, current live benchmark report store, and relevant source ledger entries inspected.

### 1. Add Stability Eval Module

Work:

- Add `docs/evals/krn-benchmark-live-stability/`.
- Add `packages/evals/src/validate-krn-benchmark-live-stability.ts`.
- Add `pnpm run eval:krn-benchmark-live-stability`.
- Add the module to `krn eval` default aggregation and its validator.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-stability
pnpm run krn -- eval --module krn-benchmark-live-stability
```

Disproves completion:

- Stability eval calls live `codex exec`.
- Dirty failed-task live evidence is marked expansion-ready.
- One clean three-task report is treated as productivity lift.

### 2. Validate And Release Audit

Work:

- Run narrow and broad checks.
- Update memory, source ledger, final product plan if needed, parent goal, and this goal.

Acceptance evidence:

```bash
pnpm typecheck
pnpm test
pnpm run eval:krn-eval
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- Docs imply live runner stability is solved.
- Docs imply productivity lift or suite expansion has happened.
- Parent goal is marked complete.

## Completion Evidence

- `pnpm run eval:krn-benchmark-live-stability` generated `.krn/evals/krn-benchmark-live-stability/20260620T113858Z-3249851/report.json` with 6/6 cases and 20/20 assertions.
- `pnpm run krn -- eval --module krn-benchmark-live-stability` generated `.krn/eval/20260620T113907Z-3250087/report.json`.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T113916Z-3250294/report.json` with 18/18 modules, 82/82 cases, and 276/276 assertions, including `krn-benchmark-live-stability`.
- `pnpm typecheck` passed.
- `pnpm test` passed with 31/31 test files and 106/106 tests.
- `python3 scripts/evals/codex_memory_compliance.py --mode validate` generated `.krn/evals/codex-memory-compliance/20260620T114024550186Z-3253880/report.json` with 4/4 cases.
- `git diff --check` passed before commit.

## Outcome

[FACT] `krn-benchmark-live-stability` is now part of default `krn eval` and reads existing live-suite benchmark reports without calling live `codex exec`.

[FACT] Current local live-suite evidence is not expansion-ready: 8 live reports, 2 clean completed reports, 6 dirty reports, latest live report `.krn/benchmarks/krn-benchmark-live-suite/20260620T102133Z-3093693/report.json`, `suite_expansion_ready: false`, and `productivity_lift_ready: false`.

[DECISION] The next benchmark slice should repair live runner stability until the latest explicit live-suite run completes every task cleanly under the typed policy. Do not expand the suite, make live mode default, or claim productivity lift from this classifier.
