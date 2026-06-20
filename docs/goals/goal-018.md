# Goal 018: Live Codex Benchmark Pilot

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md). The parent goal remains active and incomplete until broader control-plane views and measured lift evidence exist.

This goal starts after commit `cd095a5 feat: add benchmark report spine`. It is not a replacement for `goal-006`; it is the next bounded benchmark evidence slice after the typed benchmark report spine.

Current implementation status: live runner, validation evidence, live pilot evidence, source ledger, memory index, parent-goal update, and local release verification are complete. The semantic release commit and push carry the final git/GitHub evidence for this slice.

## Objective

Add the first live `codex exec` benchmark pilot that runs one baseline prompt and one KRN-assisted prompt, scores both outputs deterministically, and writes a `KrnBenchmarkReport` with `measurement_mode: "live_codex_exec"` without claiming productivity lift.

The end state is:

```text
one benchmark task
  -> baseline codex exec read-only run
  -> KRN-assisted codex exec read-only run
  -> deterministic scorer
  -> KrnBenchmarkReport measurement_mode live_codex_exec
  -> .krn/benchmarks/krn-benchmark-live-pilot/{run_id}/report.json
  -> .krn/evals/krn-benchmark-live-pilot/{run_id}/report.json
  -> source/memory/goal update
```

This goal does not claim measured productivity lift, does not satisfy the minimum task count for lift claims, does not add a new `krn benchmark` CLI command, does not add dashboard benchmark UI, and does not add destructive MCP/API tools.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-017.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-017.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/specs/krn-benchmark-report/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-benchmark-report/README.md)
- [docs/evals/STANDARD.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/STANDARD.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)

[DECISION] This is a live benchmark pilot, not a lift claim. The report must use `productivity_lift_claimed: false`.

[DECISION] The pilot is intentionally one task so the end-to-end harness is proven before spending a larger live `codex exec` budget. Because the task count is below the contract gate, `lift_status` must remain `no_lift_evidence` even if the assisted score is higher.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark evidence layer, specifically live `codex exec` worker evidence flowing into the existing typed benchmark report.

Selected mechanisms:

- S009 / Codex non-interactive mode: `codex exec` is the worker lane for scripted runs and can emit JSONL plus a final message file.
- S010 / Goals in Codex: this child goal names outcome, verification surface, constraints, boundaries, iteration policy, and blocked condition.
- S011 / ExecPlans: this file is the restartable state for a multi-step live benchmark slice.
- S012 / Code modernization: live benchmark work starts as one bounded pilot before a broader task suite.
- S014-S016 / eval and improvement loops: trace output is converted into deterministic scoring and a report with caveats.
- S087 / Related resources: treated as archived discovery only; no linked tool or paper is promoted without primary-source inspection and mechanism extraction.
- S088 / fixed-budget metric loop: one fixed task, baseline, assisted variant, metric delta, stop reason, and repair target.
- C005: `codex exec` is a worker lane, not a continuous Goal conversation.
- C017: KRN assistance must be evaluated against baseline Codex.
- C039: benchmark-shaped evidence must not be overclaimed as measured productivity lift.

Rejected alternatives:

- Run a 20+ task live benchmark now: rejected because the pilot runner needs proof before spending a large live budget.
- Add live pilot to default `krn eval`: rejected because default deterministic evals should not unexpectedly run expensive model calls.
- Add a new CLI command now: rejected because a package eval runner is enough to prove the live worker path.
- Claim lift from one task: rejected by the benchmark report lift gate and `goal-006` overclaim rules.

Required skills used:

- `operator-intake` for P8 benchmark routing,
- `research-synthesis` for source-to-mechanism mapping,
- `goal-execplan` for this restartable child goal,
- `typescript-contract-engineer` for unknown-first live output parsing,
- `eval-designer` for deterministic scoring and live/validate separation,
- `release-verifier` before closeout.

Contract/runtime surface to change:

- Add `docs/evals/krn-benchmark-live-pilot/`.
- Add `packages/evals/src/validate-krn-benchmark-live-pilot.ts`.
- Add package scripts for deterministic validation and explicit live pilot execution.
- Reuse `KrnBenchmarkReport`; do not create a second benchmark report shape.

Falsification path:

- Deterministic validate mode proves the scorer on valid and known-bad outputs without calling Codex.
- Live mode runs two `codex exec` invocations with read-only sandbox.
- Live mode captures JSONL/stdout, stderr, final JSON messages, and a `KrnBenchmarkReport`.
- The generated live report parses through `KrnBenchmarkReport`, uses `measurement_mode: "live_codex_exec"`, keeps `productivity_lift_claimed: false`, and includes repair targets.

Overclaim boundary:

- This goal proves only that KRN can execute and score one live baseline-vs-assisted Codex task through the typed benchmark report. It does not prove measured productivity lift, benchmark statistical validity, human review quality, dashboard command readiness, HTTP/API readiness, or ChatGPT connector behavior.

## Work Plan

### 0. Resume, Source, And Safety Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, `goal-017`, final product plan, stack decision, eval standard, pattern matrix, source ledger, context, official Codex non-interactive docs, and current worktree inspected.
- `codex exec --ephemeral --sandbox read-only` sanity check passes.

### 1. Live Pilot Eval Definition

Work:

- Add eval README, cases, result schema, output schema, and OpenAI Cookbook mapping.
- Define deterministic scoring metrics and overclaim caveats.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-pilot
```

Disproves completion:

- The eval lacks source patterns, failure modes, metrics, or a no-lift caveat.
- Validate mode calls live Codex unexpectedly.

### 2. Live Pilot Runner

Work:

- Add TypeScript runner with `--mode validate` and `--mode live`.
- Validate mode scores fixtures only.
- Live mode runs baseline and assisted `codex exec` with read-only sandbox, `--json`, `--ephemeral`, `--output-schema`, and `--output-last-message`.
- Parse final outputs as unknown before scoring.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-pilot:live
```

Disproves completion:

- Codex outputs are trusted without parsing.
- Live run can mutate the repo.
- Failure or timeout is hidden as a passing benchmark.
- The report claims lift from one task.

### 3. Memory, Source, Goal, And Release Audit

Work:

- Update source ledger with local live pilot evidence and claim caveat.
- Add a memory note after live evidence exists.
- Update memory index.
- Update `goal-006` and this goal with exact evidence.
- Run release verification before commit.

Acceptance evidence:

```bash
pnpm typecheck
pnpm test
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- Docs imply one live task proves productivity lift.
- Runtime `.krn` output is promoted as durable truth without reviewed memory/source updates.
- Completion is claimed without live output paths.

### 4. Commit And Push

Acceptance evidence:

```bash
git status -sb
git commit -m "feat: add live codex benchmark pilot"
git push origin main
```

## Completion Evidence

- `pnpm run eval:krn-benchmark-live-pilot` passed with 2/2 cases and 6/6 assertions and wrote `.krn/evals/krn-benchmark-live-pilot/20260620T060328Z-2492624/report.json`.
- `pnpm run eval:krn-benchmark-live-pilot:live` passed with 4/4 cases and 15/15 assertions and wrote `.krn/evals/krn-benchmark-live-pilot/20260620T060340Z-2493285/report.json`.
- The generated live benchmark report `.krn/benchmarks/krn-benchmark-live-pilot/20260620T060340Z-2493285/report.json` parsed through `KrnBenchmarkReport`, used `measurement_mode: "live_codex_exec"`, kept `productivity_lift_claimed: false`, and reported baseline score 0.95, assisted score 0.85, delta -0.1.
- `pnpm typecheck` passed for `packages/contracts`, `packages/cli`, `packages/mcp`, `packages/evals`, and `apps/dashboard`.
- `pnpm test` passed with 28/28 files and 94/94 tests.
- `python3 scripts/evals/codex_memory_compliance.py --mode validate` passed with 4/4 cases and wrote `.krn/evals/codex-memory-compliance/20260620T061029816637Z-2501931/report.json`.
- `git diff --check` passed.

## Outcome

KRN now has the first live `codex exec` benchmark pilot:

```text
one fixed KRN routing task
  -> baseline codex exec read-only run
  -> KRN-assisted codex exec read-only run
  -> schema-constrained final JSON
  -> deterministic scorer
  -> KrnBenchmarkReport measurement_mode live_codex_exec
```

This proves the live worker-to-typed-benchmark evidence path only. It does not prove measured productivity lift, statistical benchmark validity, repair-loop quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or a product breakthrough. The next benchmark step is a larger suite above the report contract's lift gate.

## Boundaries

In scope:

- live benchmark pilot eval,
- two read-only `codex exec` runs,
- deterministic scoring,
- `KrnBenchmarkReport` live report,
- source/memory/goal updates.

Out of scope:

- productivity lift claim,
- statistically meaningful benchmark suite,
- default `krn eval` integration,
- new `krn benchmark` command,
- benchmark dashboard UI,
- dashboard rerun/repair/apply buttons,
- HTTP/API write routes,
- ChatGPT bridge,
- destructive MCP tools.

## Completion Criteria

This goal is complete only when:

- validate mode passes without live Codex,
- live mode runs baseline and assisted `codex exec` in read-only sandbox,
- generated live benchmark report parses through `KrnBenchmarkReport`,
- generated live benchmark report uses `measurement_mode: "live_codex_exec"` and keeps `productivity_lift_claimed: false`,
- source ledger, memory index, parent goal, and this goal carry exact evidence,
- semantic commit is pushed.
