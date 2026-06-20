# Goal 022: Benchmark Current-Child Repair Attempt

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `3475c07 feat: add benchmark repair record contract`. It is not a replacement for `goal-006`; it is the first bounded repair attempt after `goal-021` converted the `goal-020` live no-lift result into a typed `KrnRepairRecord`.

Current implementation status: measured failed/no-lift repair attempt. Parent `goal-006` remains incomplete until measured productivity lift, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, human review quality, and remaining control-plane surfaces exist.

## Objective

Apply one bounded repair from the no-lift `KrnRepairRecord`, rerun the live benchmark suite explicitly, and compare the before/after benchmark delta.

The end state is:

```text
KrnRepairRecord no_lift evidence
  -> inspect low-scoring assisted benchmark path
  -> one scoped repair to benchmark-suite routing/scoring assumptions
  -> deterministic validate rerun
  -> explicit live codex exec rerun
  -> before/after delta recorded
  -> source/memory/goal update
```

This goal does not expand the suite to 20 tasks, add `krn benchmark` or `krn repair`, add dashboard repair buttons, expose MCP/API repair tools, tune root `AGENTS.md`, or claim productivity lift.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-021.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-021.md)
- [docs/goals/goal-020.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-020.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/evals/STANDARD.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/STANDARD.md)
- [docs/memory/product/2026-06-20--krn-benchmark-no-lift-repair-record.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/product/2026-06-20--krn-benchmark-no-lift-repair-record.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)

[FACT] The repair source is `.krn/benchmarks/krn-benchmark-live-suite/20260620T072154Z-2675156/report.json`: 3/3 completed tasks, baseline score `0.9433`, assisted score `0.94`, and `assisted_minus_baseline: -0.0033`.

[FACT] The largest task-level regression was `goal006-next-benchmark-action`, where assisted scored `0.86` against baseline `0.92`; the main negative metric was `next_action_score`.

[DECISION] The first repair surface is `benchmark_suite`, specifically stale current-child routing and hardcoded scorer expectations. This is smaller than root instruction tuning and directly connected to the observed assisted-path failure.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark/repair layer: live suite task registry, scorer assumptions, and assisted guidance for current-child routing after `goal-021`.

Codex best-practices gate:

- S013 / Codex repair loops: preserve failure source, repair attempt, validator result, metric before/after, and stop reason.
- S014 / Promptfoo migration: keep the deterministic fixture suite as the validate-mode regression before live runs.
- S015 / Agent improvement loop: use live trace output to update eval definitions and repair handoff, not broad instruction prose.
- S016 / Macro evals: measure routing, source grounding, next action, and overclaim boundary as workflow behavior.
- S088 / controlled experiment loop: apply one bounded repair, rerun the same explicit live suite, compare the metric delta, and keep/repair/stop based on evidence.

Selected mechanisms:

- Make latest-child goal scoring data-driven by task registry keywords instead of hardcoding `goal-019`/`goal-020`.
- Update assisted task guidance to route through `goal-021` and the no-lift repair-record contract before any suite expansion or dashboard/API work.
- Rerun deterministic validate mode first, then live mode explicitly.
- Record the delta comparison against `-0.0033`.

Rejected alternatives:

- Tune `AGENTS.md`: rejected because the failure is in benchmark suite routing/guidance and `goal-006` forbids broad prompt tuning from one failure.
- Expand to 20 tasks immediately: rejected because the first repair attempt should test the no-lift handoff before increasing suite cost/noise.
- Change scoring thresholds only: rejected because the stale latest-child assumptions are a real implementation defect; changing thresholds would hide it.
- Add dashboard repair buttons now: rejected because repair quality has not been demonstrated.
- Add live mode to default `krn eval`: rejected because live codex exec is nondeterministic, slower, and intentionally explicit.

Required skills used:

- `operator-intake` for P3/P8 routing,
- `repair-handoff` for the no-lift failure-to-attempt path,
- `goal-execplan` for this restartable child goal,
- `research-synthesis` for source-to-mechanism mapping,
- `eval-designer` for fixture/live validation coverage,
- `typescript-contract-engineer` for unknown-first runner changes,
- `release-verifier` before closeout.

Falsification path:

- Deterministic validate mode still passes after the task registry and scorer change.
- Live mode writes a parseable `KrnBenchmarkReport` and captures all evidence refs.
- The after delta is compared to `-0.0033`.
- If the after delta does not improve meaningfully, the attempt is recorded as a failed or no-meaningful-delta repair instead of being reframed as success.

Overclaim boundary:

- This goal proves only that KRN can execute one bounded repair attempt and measure before/after live suite delta. It does not prove productivity lift, statistical benchmark validity, complete repair-loop quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or a `krn benchmark`/`krn repair` command.

## Work Plan

### 0. Resume, Source, And Safety Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, `goal-021`, `goal-020`, final product plan, stack decision, eval standard, repair-record memory, source ledger, and current worktree inspected.
- Current worktree clean before edits.

### 1. Repair Benchmark Registry And Scorer

Work:

- Add data-driven latest-child goal keywords to `docs/evals/krn-benchmark-live-suite/tasks.json`.
- Update `packages/evals/src/validate-krn-benchmark-live-suite.ts` to score current-parent/latest-child alignment from task data instead of hardcoded old child goals.
- Update deterministic fixtures to reflect the current `goal-021` repair-record state.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-suite
```

Disproves completion:

- Validate mode fails after the repair.
- The scorer still hardcodes stale completed child goals.
- Fixtures can pass while omitting the current latest child or repair-record context.

### 2. Explicit Live Repair Rerun

Work:

- Run the live benchmark suite explicitly.
- Compare the new `KrnBenchmarkReport.assisted_minus_baseline` to the previous `-0.0033`.
- Keep `productivity_lift_claimed: false`.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-suite:live
```

Disproves completion:

- Live run is skipped without blocker evidence.
- Runtime output is unparseable or missing evidence refs.
- Any doc claims productivity lift from a three-task report or proposed repair.

### 3. Source, Memory, Goal, And Release Audit

Work:

- Update source ledger, memory index/note, final product plan if needed, parent goal, and this goal.
- Run release verification before closeout.

Acceptance evidence:

```bash
pnpm typecheck
pnpm test
pnpm run eval:krn-eval
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- Docs imply the repair attempt proves product lift.
- The before/after metric is missing.
- Source/memory updates hide a failed or weak repair.

### 4. Commit And Push

Acceptance evidence:

```bash
git status -sb
git commit -m "fix: repair benchmark current-child routing"
git push origin main
```

## Completion Evidence

- `docs/evals/krn-benchmark-live-suite/tasks.json` now carries task-owned `parent_goal_keywords` and `latest_child_goal_keywords` so current-parent/latest-child alignment is not hardcoded to stale child goals.
- `packages/evals/src/validate-krn-benchmark-live-suite.ts` now scores goal alignment from task registry keywords and writes fallback final-output JSON when live `codex exec` exits through timeout/spawn error before a parseable final artifact exists.
- Assisted fixtures route through `goal-021`, `KrnRepairRecord`, and the repair/no-lift boundary before suite expansion.
- `pnpm run eval:krn-benchmark-live-suite` passed with 4/4 cases and 16/16 assertions at `.krn/evals/krn-benchmark-live-suite/20260620T083211Z-2826332/report.json`.
- First live rerun exposed a runner observability defect: `pnpm run eval:krn-benchmark-live-suite:live` produced `.krn/evals/krn-benchmark-live-suite/20260620T081426Z-2776468/report.json` with 4/5 cases and 13/22 assertions because `goal006-next-benchmark-action.assisted` timed out without a final artifact. The generated benchmark report showed baseline `0.9367`, assisted `0.6533`, and delta `-0.2834`.
- Final live rerun after fallback artifact capture passed with 5/5 cases and 22/22 assertions at `.krn/evals/krn-benchmark-live-suite/20260620T083233Z-2828288/report.json`.
- Final benchmark report `.krn/benchmarks/krn-benchmark-live-suite/20260620T083233Z-2828288/report.json` stayed below the 20-task lift gate, kept `productivity_lift_claimed: false`, and reported baseline `0.9644`, assisted `0.62`, and delta `-0.3444`.
- `goal006-next-benchmark-action.assisted.final.json` in that final run is explicit fallback JSON with `error: "spawnSync codex ETIMEDOUT"`, `timed_out: true`, and a stderr ref. It is intentionally scored as failed output rather than silently missing evidence.
- Release gate passed after source/memory/goal updates:
  - `pnpm typecheck`
  - `pnpm test` with 31/31 test files and 105/105 tests
  - `pnpm run eval:krn-eval`, which generated `.krn/eval/20260620T085427Z-2888524/report.json` with 17/17 modules, 74/74 cases, and 249/249 assertions
  - `python3 scripts/evals/codex_memory_compliance.py --mode validate`, which generated `.krn/evals/codex-memory-compliance/20260620T085425065391Z-2888353/report.json` with 4/4 cases
  - `git diff --check`

## Outcome

This goal succeeded only at measuring the first bounded repair attempt and improving live-run observability. It did not improve the benchmark result.

[FACT] The pre-repair live suite delta was `-0.0033`.

[FACT] The final post-repair live suite delta was `-0.3444`.

[DECISION] This attempt must be treated as a controlled failed repair attempt, not as productivity lift, repair quality proof, or a reason to expand the suite. The next bounded repair should target assisted prompt load, timeout behavior, and first-task next-action routing before adding more tasks, dashboard repair controls, or CLI repair commands.

## Boundaries

In scope:

- one benchmark-suite repair attempt,
- deterministic suite fixture updates,
- live suite rerun,
- before/after delta comparison,
- source/memory/goal updates.

Out of scope:

- root `AGENTS.md` tuning,
- expanding to 20 benchmark tasks,
- measured productivity-lift claim,
- `krn benchmark` or `krn repair` CLI command,
- dashboard repair/run/apply buttons,
- MCP/API repair tools,
- ChatGPT connector behavior,
- human review quality proof.
