# Goal 025: Benchmark Lift Status Stability Gate

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `be52932 fix: repair benchmark memory-layer action`. It is not a replacement for `goal-006`; it is the next bounded benchmark repair after `goal-024` fixed the target memory-layer metric but exposed baseline timeout instability in live suite reruns.

## Objective

Harden the benchmark report contract so positive lift status cannot be represented when live benchmark evidence has failed/blocked tasks, too few tasks, non-live measurement, or non-positive delta. Then rerun deterministic validation and one explicit live benchmark sanity check.

The end state is:

```text
goal-024 dirty positive-delta evidence
  -> identify contract gap around lift_status
  -> reject positive_lift status unless lift-gate conditions are clean
  -> add known-bad regression
  -> deterministic validate rerun
  -> explicit live sanity rerun
  -> source/memory/goal update
```

This goal does not expand the suite to 20 tasks, change benchmark task prompts, add dashboard repair buttons, expose MCP/API repair tools, tune root `AGENTS.md`, change Codex authentication, or claim productivity lift.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-024.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-024.md)
- [docs/memory/product/2026-06-20--krn-benchmark-memory-layer-next-action-repair.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/product/2026-06-20--krn-benchmark-memory-layer-next-action-repair.md)
- [docs/specs/krn-benchmark-report/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-benchmark-report/README.md)
- [docs/evals/krn-benchmark-live-suite/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/krn-benchmark-live-suite/README.md)
- [docs/evals/STANDARD.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/STANDARD.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)

[FACT] `goal-024` live reruns had positive suite deltas but failed baseline tasks: `.krn/benchmarks/krn-benchmark-live-suite/20260620T093350Z-2983111/report.json` completed 2/3 tasks and `.krn/benchmarks/krn-benchmark-live-suite/20260620T094837Z-3002586/report.json` completed 1/3 tasks.

[FACT] `KrnBenchmarkReport` already rejects `productivity_lift_claimed: true` unless the report is live, has enough tasks, has zero blocked/failed tasks, and has positive delta.

[FACT] Before this goal, `KrnBenchmarkReport` did not apply the same hard gate to `lift_status: "positive_lift"` when `productivity_lift_claimed` was false.

[DECISION] The repair surface is the benchmark report contract and deterministic benchmark-spine regression, not prompt tuning, task registry tuning, or timeout length changes.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark/report contract layer: `KrnBenchmarkReport` positive-lift status validity and deterministic known-bad coverage.

Source-backed mechanisms:

- OpenAI Codex non-interactive mode: `codex exec` is a scriptable worker lane with explicit sandboxing and structured output, so live measurements must be represented as machine-readable artifacts.
- S010/S011 Goals and ExecPlans: keep this as a bounded child goal with evidence, constraints, and stop condition.
- S013 repair loops: preserve the failure source, smallest repair surface, validator result, metric before/after, and stop reason.
- S014/S016 eval patterns: deterministic contract regression must protect against overclaim even when live worker behavior is unstable.
- S088 controlled experiment loop: change one contract gate, rerun, and record what remains unresolved.
- C039/C044/C046: benchmark reports must reject unsupported lift claims, and positive deltas with failed baseline tasks are not clean productivity evidence.

Selected mechanisms:

- Add a `positive_lift` status gate to `KrnBenchmarkReportSchema`.
- Add a known-bad fixture where `lift_status` is `positive_lift` despite failed tasks and too few completed tasks.
- Add a deterministic eval case to `krn-benchmark-spine` for that fixture.
- Keep live suite explicit and use one live run only as a sanity check that generated reports still parse with `no_lift_evidence`.

Rejected alternatives:

- Increase `codex exec` timeout first: rejected because it does not prevent overclaiming dirty positive deltas.
- Retune baseline prompts: rejected because this goal is about report trust, not task behavior.
- Expand to 20 tasks: rejected because the current three-task live suite still has timeout instability.
- Add dashboard/API controls: rejected because benchmark status trust must be fixed before surfacing commands.
- Claim lift from `goal-024`: rejected because failed baseline tasks invalidate the positive suite deltas as clean comparison evidence.

Required skills used:

- `operator-intake` for P3/P8 routing,
- `goal-execplan` for this restartable child goal,
- `repair-handoff` for failure classification and smallest repair surface,
- `eval-designer` for the known-bad deterministic regression,
- `typescript-contract-engineer` for contract/parser/test changes,
- `openai-docs` for official `codex exec` worker-mode grounding,
- `release-verifier` before closeout.

Falsification path:

- The known-bad positive-lift-status fixture fails through `parseKrnBenchmarkReport`.
- `pnpm run eval:krn-benchmark-spine` passes and includes the new known-bad case.
- `pnpm run eval:krn-benchmark-live-suite` passes.
- One explicit `pnpm run eval:krn-benchmark-live-suite:live` still writes a parseable report with `productivity_lift_claimed: false` and no positive lift status.
- If the contract can still represent `positive_lift` with failed/blocked/too-few/non-live evidence, this goal is not complete.

Overclaim boundary:

- This goal proves only that benchmark report status cannot encode positive lift unless the lift-gate conditions are clean. It does not prove productivity lift, live runner stability, statistical validity, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or readiness to expand the suite.

## Work Plan

### 0. Source And Failure Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, `goal-024`, memory-layer repair note, benchmark report contract, live-suite runner, official Codex non-interactive-mode docs, and previous live artifacts inspected.

### 1. Harden Benchmark Report Contract

Work:

- Update `packages/contracts/src/benchmark-report.ts` so `lift_status: "positive_lift"` requires live mode, enough tasks, zero blocked/failed tasks, and positive delta.
- Add a known-bad fixture for dirty positive-lift status.
- Add or update contract tests and benchmark-spine eval coverage.

Acceptance evidence:

```bash
pnpm test -- packages/contracts/test/benchmark-report.test.ts
pnpm run eval:krn-benchmark-spine
pnpm typecheck
```

Disproves completion:

- A report with `positive_lift` and failed tasks parses.
- The new known-bad fixture is not exercised by tests or evals.

### 2. Validate Live-Suite Compatibility

Work:

- Run deterministic live-suite validate mode.
- Run one explicit live sanity rerun.
- Confirm generated live reports keep `productivity_lift_claimed: false` and `lift_status: "no_lift_evidence"`.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-suite
pnpm run eval:krn-benchmark-live-suite:live
```

Disproves completion:

- Validate mode fails.
- Live report becomes unparseable after the contract change.
- Any doc claims lift from a three-task or failed-task report.

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

- Docs imply timeout instability is fixed.
- Source/memory updates hide remaining live runner instability.
- The parent goal is marked complete.

### 4. Commit And Push

Acceptance evidence:

```bash
git status -sb
git commit -m "fix: gate benchmark positive lift status"
git push origin main
```

## Completion Evidence

- `pnpm run eval:krn-benchmark-spine` generated `.krn/evals/krn-benchmark-spine/20260620T102007Z-3090855/report.json` with 5/5 cases and 15/15 assertions, including `known-bad-positive-status-with-failed-task-fails`.
- `pnpm typecheck` passed.
- `pnpm test -- packages/contracts/test/benchmark-report.test.ts` passed; Vitest executed the full current suite with 31/31 test files and 106/106 tests passing.
- `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T102111Z-3093271/report.json` with 4/4 cases and 16/16 assertions.
- `pnpm run eval:krn-benchmark-live-suite:live` generated `.krn/evals/krn-benchmark-live-suite/20260620T102133Z-3093693/report.json` with 5/5 cases and 22/22 assertions.
- The live benchmark report `.krn/benchmarks/krn-benchmark-live-suite/20260620T102133Z-3093693/report.json` used `measurement_mode: "live_codex_exec"`, completed 1/3 tasks, failed 2 tasks, reported baseline `0.2144`, assisted `0.9367`, delta `+0.7223`, and kept `lift_status: "no_lift_evidence"` plus `productivity_lift_claimed: false`.
- `pnpm test` passed with 31/31 test files and 106/106 tests.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T104051Z-3119428/report.json` and `.krn/evals/krn-eval-contracts/20260620T104051Z-3119428/report.json` with 3/3 cases and 7/7 assertions.
- `python3 scripts/evals/codex_memory_compliance.py --mode validate` generated `.krn/evals/codex-memory-compliance/20260620T104200797830Z-3121675/report.json` with 4/4 cases.
- `git diff --check` passed.

## Outcome

The benchmark report contract now rejects dirty positive-lift status, not only dirty explicit lift claims. The live sanity rerun proves the gate behavior on the exact failure shape from `goal-024`: a positive live delta with failed tasks remains `no_lift_evidence`.

This does not prove productivity lift or live-runner stability. The next bounded benchmark repair should target live runner timeout/concurrency/stability and stale task guidance before suite expansion, dashboard commands, HTTP/API, or any lift claim.
