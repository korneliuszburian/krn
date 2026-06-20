# Goal 026: Benchmark Live-Suite Registry And Runner Policy Gate

## Status

Active Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `e232e54 fix: gate benchmark positive lift status`. It is not a replacement for `goal-006`; it is the next bounded benchmark repair after `goal-025` proved that dirty positive live deltas stay `no_lift_evidence` but left live runner instability and stale task guidance unresolved.

## Objective

Harden the live benchmark suite task registry and runner policy so deterministic validation rejects stale latest-child guidance and exposes the live `codex exec` execution policy as typed data before any further suite expansion or lift claim.

The end state is:

```text
goal-025 dirty positive-delta sanity evidence
  -> identify stale task guidance and implicit runner policy
  -> create typed live_run_policy for sequential/no-concurrency/timeout handling
  -> make task registry name current child context explicitly
  -> add deterministic eval coverage for stale-context/run-policy drift
  -> rerun validate and release gates
  -> source/memory/goal update
```

This goal does not change Codex authentication, run live mode by default, expand the suite to 20 tasks, add dashboard repair buttons, expose MCP/API repair tools, add storage infrastructure, or claim productivity lift.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-025.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-025.md)
- [docs/memory/product/2026-06-20--krn-benchmark-lift-status-stability-gate.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/product/2026-06-20--krn-benchmark-lift-status-stability-gate.md)
- [docs/evals/krn-benchmark-live-suite/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/krn-benchmark-live-suite/README.md)
- [docs/evals/krn-benchmark-live-suite/tasks.json](/home/krn/coding/krn/active/krn-gastown/docs/evals/krn-benchmark-live-suite/tasks.json)
- [packages/evals/src/validate-krn-benchmark-live-suite.ts](/home/krn/coding/krn/active/krn-gastown/packages/evals/src/validate-krn-benchmark-live-suite.ts)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)

[FACT] `goal-025` live sanity evidence passed shape checks but completed only 1/3 tasks and failed 2 tasks: `.krn/benchmarks/krn-benchmark-live-suite/20260620T102133Z-3093693/report.json`.

[FACT] Before this goal, `docs/evals/krn-benchmark-live-suite/tasks.json` still told some assisted runs to treat `goal-022` or `goal-023` as the latest child context even after `goal-025` completed.

[FACT] Before this goal, the live `codex exec` timeout policy was hardcoded in the runner as `240_000` ms and was not represented in the task registry or deterministic eval case.

[DECISION] The repair surface is the live-suite registry/runner-policy contract and deterministic validation, not prompt tuning, timeout-length tuning, suite expansion, or dashboard/API work.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark live-suite eval runner and task registry contract.

Source-backed mechanisms:

- OpenAI Codex non-interactive mode: `codex exec` is a pipeline/automation worker with JSONL/schema output and explicit sandboxing, not a continuous conversational goal loop.
- S010/S011 Goals and ExecPlans: keep this as a bounded child goal with constraints, acceptance evidence, and no completion claim without proof.
- S013 repair loops: preserve failure source, smallest repair surface, validation result, and stop reason.
- S014/S016 eval patterns: deterministic evals should catch stale operating-layer context before live nondeterministic runs are trusted.
- S088 controlled experiment loop: change one runner/registry mechanism and record what remains unresolved.
- C044/C046/C047: benchmark repair attempts need before/after evidence, failed live tasks invalidate lift evidence, and status labels are claim surfaces.

Selected mechanisms:

- Add typed `live_run_policy` to the task registry with sequential execution, `max_concurrent_codex_exec_runs: 1`, per-invocation timeout, and timeout classification.
- Add per-task `current_child_goal_ref` and `superseded_latest_child_goal_refs`.
- Make deterministic validate mode reject current-context drift when a task's latest-child keywords or latest-child guidance point at superseded goals.
- Use the typed policy value in the live runner timeout instead of a hidden constant.

Rejected alternatives:

- Increase timeout first: rejected because timeout length alone does not stop stale guidance or overclaim.
- Run live mode by default: rejected because live mode is slow, nondeterministic, cost-bearing, and below the 20-task lift gate.
- Expand the suite now: rejected because the current three-task suite still has failed live tasks.
- Add vector DB/graph store: rejected because current evidence points to benchmark stability and source-backed memory/control/eval routing first.
- Add dashboard/API controls: rejected because the benchmark worker/report trust layer is still not stable enough for command surfaces.

Required skills used:

- `operator-intake` for P3/P8 routing,
- `goal-execplan` for this restartable child goal,
- `eval-designer` for deterministic stale-context/run-policy coverage,
- `typescript-contract-engineer` for the typed registry/runner change,
- `openai-docs` for official `codex exec` worker-mode grounding,
- `release-verifier` before closeout.

Falsification path:

- `pnpm run eval:krn-benchmark-live-suite` passes and includes the stale-context/run-policy gate.
- The task registry contains typed live-run policy and each task names current child context.
- A task that points `latest_child_goal_keywords` or latest-child guidance at a superseded goal would fail validation.
- `pnpm typecheck` passes after the runner uses the typed timeout policy.
- If stale latest-child guidance can remain in the registry while validate mode passes, this goal is not complete.

Overclaim boundary:

This goal proves only deterministic stale-context/run-policy protection for the live-suite registry. It does not prove productivity lift, live runner stability under repeated live execution, statistical validity, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or readiness to expand the suite.

## Work Plan

### 0. Source And Failure Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, `goal-025`, lift-status memory note, live-suite runner, live-suite task registry, official Codex non-interactive docs, and previous live artifacts inspected.

### 1. Harden Task Registry And Runner Policy

Work:

- Extend `TaskRegistrySchema` with `live_run_policy`.
- Extend task definitions with current and superseded child-goal context fields.
- Use the typed timeout in `runCodexExec`.
- Refresh task source refs, latest-child keywords, and fixtures to the current child context.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-suite
pnpm typecheck
```

Disproves completion:

- The runner still has an unrepresented timeout policy.
- Validate mode passes while a task calls `goal-022` or `goal-023` the latest child.

### 2. Validate And Release Audit

Work:

- Run narrow and broad checks.
- Update memory, source ledger, final product plan if needed, parent goal, and this goal.

Acceptance evidence:

```bash
pnpm test
pnpm run eval:krn-eval
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- Docs imply live runner stability is solved.
- Docs imply productivity lift or suite expansion readiness.
- Parent goal is marked complete.

### 3. Commit And Push

Acceptance evidence:

```bash
git status -sb
git commit -m "fix: gate live benchmark task registry"
git push origin main
```

## Completion Evidence

- `python3 -m py_compile .codex/hooks/compact_continuity.py` passed.
- Manual PreCompact/PostCompact smoke for `token-efficiency-postdocs-smoke` returned `{"continue": true}` for both phases.
- `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T111349Z-3200927/report.json` with 5/5 cases and 22/22 assertions.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T111356Z-3202153/report.json`.
- `pnpm typecheck` passed.
- `pnpm test` passed with 31/31 test files and 106/106 tests.
- `python3 scripts/evals/codex_memory_compliance.py --mode validate` generated `.krn/evals/codex-memory-compliance/20260620T111641504876Z-3210612/report.json` with 4/4 cases passing.
- `git diff --check` passed.

## Outcome

Complete for this child goal.

[FACT] The live-suite registry now carries typed `live_run_policy` and every task names `current_child_goal_ref` plus `superseded_latest_child_goal_refs`.

[FACT] Validate mode includes `task-registry-current-context-and-run-policy`, which checks current child context, rejects stale latest-child guidance, and verifies sequential execution, concurrency 1, typed timeout, and timeout-as-no-lift behavior.

[FACT] The live runner consumes `registry.live_run_policy.per_codex_exec_timeout_ms` instead of a hidden timeout constant.

[DECISION] The next benchmark slice should be a repeat/stability live-run check under the typed policy or a read-only repair-record control-plane surface. It should not expand toward the 20-task lift gate, add default live mode to `krn eval`, or claim productivity lift from this deterministic gate.
