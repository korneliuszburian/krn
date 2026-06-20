# Goal 024: Benchmark Memory-Layer Next Action Repair

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal started after commit `b3e867a fix: reduce benchmark assisted prompt load`. It is not a replacement for `goal-006`; it is the next bounded repair after `goal-023` removed the first-task assisted timeout but left the live suite slightly negative.

Current implementation status: measured memory-layer next-action repair. Parent `goal-006` remains incomplete until measured productivity lift, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, human review quality, and remaining control-plane surfaces exist.

## Objective

Repair the remaining `memory-layers-vs-file-substrate` assisted `next_action_score` regression, rerun deterministic validation, rerun the explicit live benchmark suite, and record whether the repair improves the suite delta from `goal-023`.

The end state is:

```text
goal-023 stabilized/no-lift evidence
  -> inspect memory-layer baseline and assisted final JSON
  -> repair stale task guidance for the latest completed child goal
  -> deterministic validate rerun
  -> explicit live codex exec rerun
  -> before/after metric recorded
  -> source/memory/goal update
```

This goal does not expand the suite to 20 tasks, add vector/graph memory infrastructure, add `krn benchmark` or `krn repair`, add dashboard repair buttons, expose MCP/API repair tools, tune root `AGENTS.md`, or claim productivity lift.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-023.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-023.md)
- [docs/memory/product/2026-06-20--krn-benchmark-assisted-prompt-load-repair.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/product/2026-06-20--krn-benchmark-assisted-prompt-load-repair.md)
- [docs/memory/product/2026-06-20--krn-operating-architecture-and-memory-layers.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/product/2026-06-20--krn-operating-architecture-and-memory-layers.md)
- [docs/evals/krn-benchmark-live-suite/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/krn-benchmark-live-suite/README.md)
- [docs/evals/STANDARD.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/STANDARD.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)

[FACT] The `goal-023` live suite report `.krn/benchmarks/krn-benchmark-live-suite/20260620T090346Z-2900772/report.json` completed 3/3 tasks, kept `productivity_lift_claimed: false`, and reported baseline `0.9456`, assisted `0.94`, and delta `-0.0056`.

[FACT] In that report, `memory-layers-vs-file-substrate` scored baseline `1` and assisted `0.9`. The only negative metric was `next_action_score`: baseline `1`, assisted `0.5`, delta `-0.5`.

[FACT] The assisted final JSON for that task routed the next action to "bounded assisted-prompt-load/timeout and first-task next-action-routing repair" but did not explicitly name the `memory` and `source-backed` next-action terms required by the task.

[DECISION] The repair surface is the memory-layer benchmark task registry and fixture context, not storage infrastructure, root instructions, or runner semantics.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark/repair layer: the `memory-layers-vs-file-substrate` task's source refs, latest-child context, assisted guidance, fixture, and suite repair target.

Source-backed mechanisms:

- S010/S011 Goals and ExecPlans: keep this repair as a bounded child goal with evidence, constraints, and stop condition.
- S013 repair loops: preserve failure source, repair surface, validator result, metric before/after, and stop reason.
- S014/S016 eval patterns: keep deterministic fixture validation separate from live `codex exec` measurement and score route/grounding/next-action behavior.
- S088 controlled experiment loop: change one mechanism, rerun, compare, and keep/discard based on measured delta.
- C030/C045: file-backed memory is an auditable substrate, while assisted prompts should stay scoped to task-owned source refs and guidance.

Selected mechanisms:

- Update the memory-layer task to use `goal-023` and the assisted prompt-load repair note as the latest repair context.
- Keep source refs task-owned and small.
- Make the expected next action require source-backed memory/control/eval repair language instead of stale first-task timeout language.
- Keep live mode explicit and keep `productivity_lift_claimed: false`.

Rejected alternatives:

- Add a vector DB or temporal graph store: rejected because `goal-006` defers storage infrastructure until file-backed product objects and benchmark evidence prove the workflow.
- Tune root `AGENTS.md`: rejected because one task-level regression should not become global prompt pressure.
- Expand to 20 tasks: rejected until the three-task suite is stable non-negative or positive.
- Add dashboard/API repair commands: rejected because repair quality is still being measured.
- Change `codex exec` runner semantics: rejected because the failure is stale task guidance, not worker transport behavior.

Required skills used:

- `operator-intake` for P3/P8 routing,
- `goal-execplan` for this restartable child goal,
- `repair-handoff` for failure classification and smallest repair surface,
- `eval-designer` for preserving deterministic/live validation separation,
- `typescript-contract-engineer` for the eval runner/report target changes,
- `release-verifier` before closeout.

Falsification path:

- Deterministic validate mode still passes.
- Live mode writes a parseable `KrnBenchmarkReport` and captures all evidence refs.
- `memory-layers-vs-file-substrate` assisted `next_action_score` improves versus the `goal-023` live score of `0.5`.
- Suite delta is compared to `-0.0056`.
- If the memory task remains negative, the attempt is recorded as failed/no-meaningful-delta repair instead of being reframed as success.

Overclaim boundary:

- This goal proves only whether stale memory-layer task guidance can be repaired and measured in the three-task live benchmark suite. It does not prove productivity lift, statistical benchmark validity, complete repair-loop quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, vector/graph memory readiness, or a `krn benchmark`/`krn repair` command.

## Work Plan

### 0. Source And Failure Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, `goal-023`, prompt-load repair note, memory-layer note, live-suite README, source ledger, runner code, task registry, and previous live artifacts inspected.

### 1. Repair Memory-Layer Task Guidance

Work:

- Update `docs/evals/krn-benchmark-live-suite/tasks.json` so `memory-layers-vs-file-substrate` uses `goal-023`, the prompt-load repair note, and source-backed memory/control/eval repair guidance.
- Update the assisted fixture for that task to match the repaired expected behavior.
- Update `packages/evals/src/validate-krn-benchmark-live-suite.ts` repair target/source refs/caveat from prompt-load repair to memory-layer next-action repair.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-suite
pnpm typecheck
```

Disproves completion:

- Validate mode fails.
- The memory-layer task still routes the next action only to prompt-load/timeout repair.
- Assisted fixture omits source-backed memory/control/eval repair language.

### 2. Explicit Live Repair Rerun

Work:

- Run the live benchmark suite explicitly.
- Compare the new `KrnBenchmarkReport.assisted_minus_baseline` to `-0.0056`.
- Compare the new `memory-layers-vs-file-substrate` `next_action_score` to `0.5`.
- Keep `productivity_lift_claimed: false`.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-suite:live
```

Disproves completion:

- Live run is skipped without blocker evidence.
- Runtime output is unparseable or missing evidence refs.
- Any doc claims productivity lift from a three-task report.

### 3. Source, Memory, Goal, And Release Audit

Work:

- Update source ledger, memory index/note, final product plan if needed, parent goal, and this goal.
- Run release verification before closeout.

Acceptance evidence:

```bash
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
git commit -m "fix: repair benchmark memory-layer action"
git push origin main
```

## Completion Evidence

- `docs/evals/krn-benchmark-live-suite/tasks.json` now routes `memory-layers-vs-file-substrate` through `goal-023`, the assisted prompt-load repair memory note, and source-backed memory/control/eval benchmark repair guidance.
- `docs/evals/krn-benchmark-live-suite/fixtures/memory-layers-vs-file-substrate.assisted.json` now expresses the repaired expected behavior and cites the repaired task-owned source refs.
- `packages/evals/src/validate-krn-benchmark-live-suite.ts` now emits `repair-live-suite-memory-layer-next-action` as the active repair target, with `goal-024` and memory-layer/prompt-load repair notes as source refs.
- `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T093329Z-2982842/report.json` with 4/4 cases and 16/16 assertions.
- `pnpm typecheck` passed.
- First explicit live rerun:
  - `.krn/evals/krn-benchmark-live-suite/20260620T093350Z-2983111/report.json` passed 5/5 cases and 22/22 assertions.
  - `.krn/benchmarks/krn-benchmark-live-suite/20260620T093350Z-2983111/report.json` reported 2/3 completed tasks, 1 failed baseline timeout, baseline `0.5589`, assisted `0.9733`, and delta `+0.4144`.
  - `memory-layers-vs-file-substrate` completed with baseline `1`, assisted `1`, and assisted `next_action_score` `1`, improving from the previous assisted `0.5`.
- Repeat explicit live rerun:
  - `.krn/evals/krn-benchmark-live-suite/20260620T094837Z-3002586/report.json` passed 5/5 cases and 22/22 assertions.
  - `.krn/benchmarks/krn-benchmark-live-suite/20260620T094837Z-3002586/report.json` reported 1/3 completed tasks, 2 failed baseline timeouts, baseline `0.2756`, assisted `0.9733`, and delta `+0.6977`.
  - `memory-layers-vs-file-substrate` completed with baseline `0.8267`, assisted `1`, and assisted `next_action_score` `1`.
- Source, memory, and parent-goal updates were applied:
  - `docs/memory/product/2026-06-20--krn-benchmark-memory-layer-next-action-repair.md`
  - `docs/memory/INDEX.md`
  - `docs/plans/canonical/SOURCES.md`
  - `docs/product/final-product-plan.md`
  - `docs/goals/goal-006.md`
  - `AGENTS.md`
- Release gate passed:
  - `pnpm typecheck`
  - `pnpm test` with 31/31 test files and 105/105 tests
  - `pnpm run eval:krn-eval`, which generated `.krn/eval/20260620T101151Z-3081457/report.json` with 17/17 modules, 74/74 cases, and 249/249 assertions
  - `python3 scripts/evals/codex_memory_compliance.py --mode validate`, which generated `.krn/evals/codex-memory-compliance/20260620T101037645756Z-3078587/report.json` with 4/4 cases
  - `git diff --check`

## Outcome

This goal repaired the target memory-layer assisted next-action regression enough to keep the change: the assisted `memory-layers-vs-file-substrate` `next_action_score` improved from `0.5` to `1` and repeated at `1` in a second live run.

This goal does not prove productivity lift. The suite-level positive deltas are not clean lift evidence because non-target baseline runs timed out:

- first live rerun: 2/3 completed tasks, 1 failed baseline timeout;
- repeat live rerun: 1/3 completed tasks, 2 failed baseline timeouts.

[DECISION] Keep the memory-layer task repair because the target metric improved in repeated live evidence. The next bounded benchmark repair should harden live runner timeout/concurrency/stability or require clean completed-task repeat evidence before suite expansion. Do not claim lift from this three-task suite or from positive deltas inflated by failed baseline tasks.
