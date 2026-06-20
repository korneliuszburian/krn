# Goal 020: Expanded Live Benchmark Suite Harness

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `4eae080 feat: add benchmark reports dashboard surface`. It is not a replacement for `goal-006`; it is the next bounded benchmark slice after the first live pilot and Benchmark Reports surface proved the evidence path but still left measured productivity lift unproven.

Current implementation status: task registry, fixture scorer, explicit live runner, aggregate validate-mode gate, source ledger, memory note/index, parent-goal update, and verification evidence are complete. Parent `goal-006` remains incomplete because measured productivity lift, statistical benchmark validity, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, human review quality, dashboard command readiness, and `krn benchmark` CLI readiness remain outside this child goal.

## Objective

Expand the KRN live benchmark harness from one baseline-vs-assisted `codex exec` task to a typed multi-task suite, while keeping live execution explicit, deterministic validation local, and `productivity_lift_claimed: false` until the benchmark lift gate is satisfied.

The end state is:

```text
docs/evals/krn-benchmark-live-suite/tasks.json
  -> task registry parser
  -> fixture scorer and known-bad cases
  -> optional explicit live codex exec mode
  -> KrnBenchmarkReport task_count >= 3
  -> deterministic krn eval module in validate mode only
  -> source/memory/goal update
```

This goal does not add a `krn benchmark` CLI command, does not put live `codex exec` runs into default `krn eval`, does not claim measured productivity lift, does not add dashboard run/repair buttons, and does not expose destructive MCP/API tools.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-018.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-018.md)
- [docs/goals/goal-019.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-019.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/specs/krn-benchmark-report/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-benchmark-report/README.md)
- [docs/evals/STANDARD.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/STANDARD.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)

[DECISION] The next benchmark step is a multi-task suite harness, not another dashboard surface. Benchmark Reports made no-lift evidence visible; now the measurement surface must cover more than one task before repair or lift decisions can be trusted.

[DECISION] The deterministic validate mode may join default `krn eval`, but live `codex exec` remains opt-in through a separate script because live runs are slower, cost-bearing, nondeterministic, and below the minimum lift gate at three tasks.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark layer, specifically multi-task baseline-vs-assisted Codex measurement.

Codex best-practices gate:

- S009 / Codex non-interactive mode: live workers must use `codex exec --json`, read-only sandboxing, schema-constrained final output, and captured stdout/stderr/final artifacts. `codex exec` remains a worker/eval lane, not a continuous conversational goal loop.
- S010 / Using Goals in Codex: this goal states the outcome, verification surface, constraints, boundaries, iteration policy, and blocked condition before implementation.
- S011 / Codex ExecPlans: this file is the restartable state file for a multi-hour slice, with progress, decisions, evidence, and next steps preserved outside chat.
- S012 / Code modernization with Codex: this expands a bounded pilot into a reusable template without widening command/API/dashboard surfaces first.
- S014-S016 / eval and improvement loops: traces and fixture outputs become portable cases, deterministic assertions, score metrics, and repair targets.
- S087 / Related resources: archived discovery only. No pattern from it is adopted unless converted into a mechanism, artifact, eval/falsification path, and failure mode.
- S088 / controlled experiment loop: use baseline, assisted condition, fixed task registry, fixed metrics, keep/discard interpretation, and explicit stop reason. Do not import an open-ended autonomous research loop.

Selected mechanisms:

- A task registry defines fixed benchmark tasks, expected source refs, expected next-action signals, scoring keywords, and fixture paths.
- Validate mode scores fixture baseline/assisted outputs and writes a fixture-contract `KrnBenchmarkReport` with `task_count >= 3`.
- Live mode runs each task through baseline and KRN-assisted `codex exec` in read-only mode, captures evidence refs, and writes a live `KrnBenchmarkReport`.
- The report contract keeps `productivity_lift_claimed: false` because three tasks are below `minimum_task_count_for_lift_claim: 20`.
- Default `krn eval` can include only the validate module; live mode stays separate and explicit.

Rejected alternatives:

- Add `krn benchmark` now: rejected because the harness still needs a stable suite contract before user-facing command design.
- Put live mode into default `krn eval`: rejected because live `codex exec` is nondeterministic and cost-bearing.
- Claim lift from three tasks or fixture data: rejected by `KrnBenchmarkReport` and C039-C041.
- Build more dashboard around the one-task pilot: rejected because visible no-lift evidence is already available and the larger gap is measurement coverage.
- Tune prompts from one negative pilot result: rejected without a larger suite and regression cases.

Required skills used:

- `operator-intake` for routing to P8 benchmark work,
- `goal-execplan` for the child goal contract,
- `research-synthesis` for source-to-mechanism mapping,
- `eval-designer` for deterministic cases and report semantics,
- `typescript-contract-engineer` for TypeScript parser/scorer implementation,
- `release-verifier` before closeout.

Falsification path:

- Task registry parses and contains at least three tasks.
- Validate mode proves fixture pairs parse, assisted fixtures beat baseline fixtures, known-bad output is penalized, and a generated `KrnBenchmarkReport` parses with `measurement_mode: "fixture_contract"`, `task_count >= 3`, and `productivity_lift_claimed: false`.
- Live mode, when explicitly run, uses read-only `codex exec`, schema-constrained final output, captured evidence refs, and a parseable `live_codex_exec` report.
- Default `krn eval` includes the deterministic validate module only and never calls live `codex exec`.

Overclaim boundary:

- This goal proves only that KRN has a multi-task benchmark suite harness and deterministic guardrails against unsupported lift claims. It does not prove measured productivity lift, statistical benchmark validity, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, human review quality, dashboard command readiness, or `krn benchmark` CLI readiness.

## Work Plan

### 0. Resume, Source, And Safety Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, `goal-019`, final product plan, stack decision, eval standard, source ledger, context, and current worktree inspected.
- Official Codex/OpenAI non-interactive and Cookbook mechanisms checked before changing `codex exec` workflow.

### 1. Multi-Task Benchmark Suite Contract

Work:

- Add `docs/evals/krn-benchmark-live-suite/tasks.json`.
- Add fixture outputs and output/result schemas.
- Add `README.md` and `OPENAI-COOKBOOK-MAPPING.md`.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-suite
```

Disproves completion:

- Task registry is ad hoc prose.
- Suite has fewer than three tasks.
- Fixture data can claim productivity lift.

### 2. TypeScript Runner And Report Generation

Work:

- Add `packages/evals/src/validate-krn-benchmark-live-suite.ts`.
- Score task outputs from registry-defined expectations.
- Generate `KrnBenchmarkReport` in validate and explicit live modes.
- Add package scripts for validate and live modes.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-suite
pnpm run eval:krn-benchmark-live-suite:live
```

Disproves completion:

- Live mode does not use read-only `codex exec`.
- Report deltas do not match task metrics.
- Three-task report is treated as lift proof.

### 3. Aggregate Eval, Memory, Source, Goal, And Release Audit

Work:

- Add deterministic validate module to `krn eval`.
- Update source ledger, memory index/note, final product plan, parent goal, and this goal.
- Run release verification before closeout.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-live-suite
pnpm run eval:krn-eval
pnpm typecheck
pnpm test
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- Docs imply three tasks prove product lift.
- Default aggregate eval calls live Codex.
- Runtime `.krn` artifacts are promoted as durable truth without source/memory updates.

### 4. Commit And Push

Acceptance evidence:

```bash
git status -sb
git commit -m "feat: add expanded benchmark suite harness"
git push origin main
```

## Completion Evidence

- Suite contract and docs:
  - `docs/evals/krn-benchmark-live-suite/tasks.json`
  - `docs/evals/krn-benchmark-live-suite/README.md`
  - `docs/evals/krn-benchmark-live-suite/OPENAI-COOKBOOK-MAPPING.md`
  - `docs/evals/krn-benchmark-live-suite/cases.json`
  - `docs/evals/krn-benchmark-live-suite/codex-output.schema.json`
  - `docs/evals/krn-benchmark-live-suite/result.schema.json`
- Runner:
  - `packages/evals/src/validate-krn-benchmark-live-suite.ts`
  - `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T072146Z-2674923/report.json` with 4/4 cases and 16/16 assertions.
  - The generated fixture benchmark report `.krn/benchmarks/krn-benchmark-live-suite/20260620T072146Z-2674923/report.json` parsed as `KrnBenchmarkReport`, used `measurement_mode: "fixture_contract"`, had task count 3, and kept `productivity_lift_claimed: false`.
- Explicit live run:
  - `pnpm run eval:krn-benchmark-live-suite:live` generated `.krn/evals/krn-benchmark-live-suite/20260620T072154Z-2675156/report.json` with 5/5 cases and 22/22 assertions.
  - The generated live benchmark report `.krn/benchmarks/krn-benchmark-live-suite/20260620T072154Z-2675156/report.json` parsed as `KrnBenchmarkReport`, used `measurement_mode: "live_codex_exec"`, had task count 3, completed 3/3 tasks, kept `productivity_lift_claimed: false`, reported `lift_status: "no_lift_evidence"`, and scored baseline `0.9433`, assisted `0.94`, delta `-0.0033`.
  - Live mode verified captured evidence files exist; the earlier loose evidence-ref check was tightened before accepting this goal.
- Aggregate validate-mode gate:
  - `krn-benchmark-live-suite` is included in default `krn eval` through validate mode only.
  - `pnpm run eval:krn-eval` generated `.krn/eval/20260620T074031Z-2716146/report.json` with 16/16 modules, 71/71 cases, and 240/240 assertions.
- Repo validation:
  - `pnpm typecheck` passed.
  - `pnpm test` passed with 30/30 test files and 100/100 tests.
  - `python3 scripts/evals/codex_memory_compliance.py --mode validate` generated `.krn/evals/codex-memory-compliance/20260620T074247731174Z-2720667/report.json` with 4/4 cases.
  - `git diff --check` passed with no output.
- Source/memory/product updates:
  - `docs/plans/canonical/SOURCES.md` adds LOCAL029 and C042.
  - `docs/memory/product/2026-06-20--krn-expanded-live-benchmark-suite.md` records the durable product lesson.
  - `AGENTS.md`, `docs/memory/INDEX.md`, `docs/product/final-product-plan.md`, and `docs/goals/goal-006.md` now point to `goal-020` as latest completed Slice 3 child context.

## Outcome

[FACT] KRN now has a fixed three-task benchmark suite harness:

```text
tasks.json
  -> task registry parser
  -> fixture baseline/assisted scorer
  -> known-bad lift-claim guard
  -> explicit live codex exec worker mode
  -> KrnBenchmarkReport task_count >= 3
  -> krn eval validate-mode module
```

[FACT] The final explicit live run completed 3/3 tasks with baseline score `0.9433`, assisted score `0.94`, and delta `-0.0033`. The report kept `productivity_lift_claimed: false` and `lift_status: "no_lift_evidence"`.

[DECISION] Deterministic validate mode belongs in default `krn eval`; live mode stays explicit because it is slow, cost-bearing, nondeterministic, and below the 20-task lift gate.

[INFERENCE] This improves KRN's direction because the product now has stronger measurement infrastructure and a realistic no-lift signal. It does not prove a breakthrough; it identifies the next benchmark work as assisted-path repair or suite expansion toward the gate.

## Boundaries

In scope:

- multi-task benchmark task registry,
- deterministic fixture scorer,
- optional explicit live `codex exec` runner,
- `KrnBenchmarkReport` output with task count greater than one,
- aggregate validate-mode gate,
- source/memory/goal updates.

Out of scope:

- measured productivity lift claim,
- statistical benchmark validity,
- `krn benchmark` CLI command,
- dashboard run/repair/apply buttons,
- destructive MCP/API tools,
- ChatGPT connector behavior,
- human review quality proof.
