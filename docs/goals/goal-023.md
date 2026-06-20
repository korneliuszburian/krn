# Goal 023: Benchmark Assisted Prompt Load Repair

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `ddf3773 fix: repair benchmark current-child routing`. It is not a replacement for `goal-006`; it is the second bounded benchmark repair attempt after `goal-022` proved timeout observability but worsened the live suite delta.

Current implementation status: measured assisted-prompt-load repair attempt. Parent `goal-006` remains incomplete until measured productivity lift, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, human review quality, and remaining control-plane surfaces exist.

## Objective

Apply one bounded repair to the assisted live-suite prompt load and first-task timeout path, rerun deterministic validation, rerun the explicit live benchmark suite, and compare the after delta to `goal-022`.

The end state is:

```text
goal-022 failed/no-lift repair evidence
  -> inspect assisted timeout path
  -> reduce assisted prompt scope to task-owned source refs and guidance
  -> deterministic validate rerun
  -> explicit live codex exec rerun
  -> before/after delta recorded
  -> source/memory/goal update
```

This goal does not expand the suite to 20 tasks, add `krn benchmark` or `krn repair`, add dashboard repair buttons, expose MCP/API repair tools, tune root `AGENTS.md`, or claim productivity lift.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-022.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-022.md)
- [docs/memory/product/2026-06-20--krn-benchmark-current-child-repair-attempt.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/product/2026-06-20--krn-benchmark-current-child-repair-attempt.md)
- [docs/evals/krn-benchmark-live-suite/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/krn-benchmark-live-suite/README.md)
- [docs/evals/STANDARD.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/STANDARD.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)

[FACT] The repair source is `.krn/benchmarks/krn-benchmark-live-suite/20260620T083233Z-2828288/report.json`: task count `3`, completed `2`, failed `1`, baseline score `0.9644`, assisted score `0.62`, and `assisted_minus_baseline: -0.3444`.

[FACT] The failed task was `goal006-next-benchmark-action.assisted`, which timed out and was represented by fallback final JSON with `error: "spawnSync codex ETIMEDOUT"`.

[DECISION] The repair surface is the live-suite assisted prompt construction, not root instructions. The runner currently appends a broad universal read list to every assisted task; this goal will make assisted prompts use task-owned source refs and task-specific guidance.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark/repair layer: live-suite assisted prompt construction and task registry context for the second repair attempt.

Codex best-practices gate:

- OpenAI Codex non-interactive mode: `codex exec` is an explicit scriptable worker lane with JSONL and `--output-schema`, not a continuous goal loop.
- S013 / Codex repair loops: preserve failure source, repair attempt, validator result, metric before/after, and stop reason.
- S014 / Promptfoo migration: keep deterministic fixture validation separate from live worker execution.
- S015 / Agent improvement loop: use live trace output to change the eval/runner mechanism, not broad prose.
- S016 / Macro evals: measure workflow behavior through routing, grounding, next action, and overclaim boundary.
- S088 / controlled experiment loop: apply one bounded repair and compare against the prior live delta.

Selected mechanisms:

- Replace the universal assisted prompt read list with task-owned source refs and task-specific guidance.
- Update task expectations from `goal-021` to `goal-022`, because `goal-022` is now the latest completed child and the failure source for this repair.
- Keep fallback final JSON for timeout/error paths; a timeout remains a scored failure, not hidden missing evidence.
- Rerun validate mode first, then live mode explicitly, then compare against `-0.3444`.

Rejected alternatives:

- Increase timeout only: rejected because it treats the symptom without reducing prompt load or first-task routing cost.
- Tune `AGENTS.md`: rejected because `goal-006` forbids broad prompt tuning from one failure and the failure is in benchmark runner prompt construction.
- Expand to 20 tasks: rejected because the current suite has a failed assisted task and a worse delta.
- Add dashboard/API repair controls: rejected because repair quality is not proven.
- Add live mode to default `krn eval`: rejected because live `codex exec` is nondeterministic, slower, and intentionally explicit.

Required skills used:

- `operator-intake` for P3/P8 routing,
- `goal-execplan` for this restartable child goal,
- `repair-handoff` for the timeout-to-repair path,
- `eval-designer` for fixture/live validation coverage,
- `typescript-contract-engineer` for runner changes,
- `openai-docs` for the official Codex non-interactive-mode source gate,
- `release-verifier` before closeout.

Falsification path:

- Deterministic validate mode still passes.
- Live mode writes a parseable `KrnBenchmarkReport` and captures all evidence refs.
- The after delta is compared to `-0.3444`.
- If the first task still times out or the delta does not improve, the attempt is recorded as failed/no-meaningful-delta repair instead of being reframed as success.

Overclaim boundary:

- This goal proves only whether a scoped assisted-prompt-load repair improves or stabilizes the three-task live benchmark evidence. It does not prove productivity lift, statistical benchmark validity, complete repair-loop quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or a `krn benchmark`/`krn repair` command.

## Work Plan

### 0. Source And Failure Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, `goal-022`, current repair memory note, eval standard, source ledger, Codex manual non-interactive-mode section, runner code, task registry, and previous live artifacts inspected.

### 1. Repair Assisted Prompt Scope

Work:

- Change `packages/evals/src/validate-krn-benchmark-live-suite.ts` so assisted prompts list task-owned `source_refs` and task guidance instead of appending a universal read list.
- Update task registry and assisted fixtures to target `goal-022` and the prompt-load/timeout repair decision.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-suite
pnpm typecheck
```

Disproves completion:

- Validate mode fails.
- Assisted prompt still asks every task to read unrelated broad context.
- Fixtures pass while omitting `goal-022` or the current repair memory note.

### 2. Explicit Live Repair Rerun

Work:

- Run the live benchmark suite explicitly.
- Compare the new `KrnBenchmarkReport.assisted_minus_baseline` to `-0.3444`.
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
git commit -m "fix: reduce benchmark assisted prompt load"
git push origin main
```

## Completion Evidence

- `packages/evals/src/validate-krn-benchmark-live-suite.ts` now builds assisted prompts from each task's `source_refs` and `assisted_guidance` instead of appending the same universal read list to every assisted task.
- `docs/evals/krn-benchmark-live-suite/tasks.json` and assisted fixtures now target `goal-022` as the latest completed child and current repair failure source.
- `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T090328Z-2900409/report.json` with 4/4 cases and 16/16 assertions.
- `pnpm typecheck` passed after the runner change.
- `pnpm run eval:krn-benchmark-live-suite:live` generated `.krn/evals/krn-benchmark-live-suite/20260620T090346Z-2900772/report.json` with 5/5 cases and 22/22 assertions.
- The generated benchmark report `.krn/benchmarks/krn-benchmark-live-suite/20260620T090346Z-2900772/report.json` completed 3/3 tasks, kept `productivity_lift_claimed: false`, and reported baseline `0.9456`, assisted `0.94`, and delta `-0.0056`.
- `goal006-next-benchmark-action` changed from failed timeout delta `-1` in `goal-022` to completed delta `+0.0333`; its assisted output wrote final JSON and cited `goal-022`, the current-child repair memory note, the live-suite README, the repair-record spec, and the source ledger.
- Release gate passed after source/memory/goal updates:
  - `pnpm typecheck`
  - `pnpm test` with 31/31 test files and 105/105 tests
  - `pnpm run eval:krn-eval`, which generated `.krn/eval/20260620T092221Z-2969002/report.json` with 17/17 modules, 74/74 cases, and 249/249 assertions
  - `python3 scripts/evals/codex_memory_compliance.py --mode validate`, which generated `.krn/evals/codex-memory-compliance/20260620T092218941035Z-2968833/report.json` with 4/4 cases
  - `git diff --check`

## Outcome

This goal repaired the specific first-task assisted timeout failure and stabilized the suite delta close to the original no-lift result. It did not prove productivity lift.

[FACT] The `goal-022` post-repair live suite delta was `-0.3444`, with 2/3 completed tasks and one failed assisted timeout.

[FACT] The `goal-023` live suite delta was `-0.0056`, with 3/3 completed tasks and no failed task.

[DECISION] This repair is useful and should be kept because it removed the timeout failure and restored comparable live evidence. The next bounded repair should target the remaining `memory-layers-vs-file-substrate` assisted `next_action_score` regression, or repeat stability before suite expansion. It is still not a productivity-lift claim because assisted remains slightly below baseline and the suite remains below the 20-task lift gate.

## Boundaries

In scope:

- one assisted-prompt-load repair attempt,
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
