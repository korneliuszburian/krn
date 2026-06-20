# Goal 021: Benchmark No-Lift Repair Record Contract

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `f3182b6 feat: add expanded benchmark suite harness`. It is not a replacement for `goal-006`; it is the next bounded repair-loop slice after the expanded benchmark suite produced a three-task live no-lift result.

Current implementation status: completed for the repair-record contract/eval slice. Parent `goal-006` remains incomplete until measured productivity lift, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, human review quality, and remaining control-plane surfaces exist.

## Objective

Turn no-lift benchmark evidence into a typed repair record before changing prompts, skills, memory, benchmark tasks, or dashboard/API behavior.

The end state is:

```text
KrnBenchmarkReport no_lift_evidence
  -> KrnRepairRecord parser
  -> valid and known-bad fixtures
  -> deterministic repair-record eval
  -> .krn/repairs/**/repair-record.json
  -> krn eval validate-mode module
  -> source/memory/goal update
```

This goal does not tune prompts, alter `AGENTS.md`, expand the live suite, add a `krn benchmark` CLI command, add dashboard repair buttons, expose MCP/API repair tools, or claim productivity lift.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-020.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-020.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/evals/STANDARD.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/STANDARD.md)
- [docs/memory/evals/2026-06-19--repair-loops-promptfoo-quality-gates.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/evals/2026-06-19--repair-loops-promptfoo-quality-gates.md)
- [docs/memory/product/2026-06-20--krn-expanded-live-benchmark-suite.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/product/2026-06-20--krn-expanded-live-benchmark-suite.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)

[DECISION] No-lift benchmark evidence must become a typed repair record before KRN changes prompts, skills, memory, or suite tasks. This preserves the repair-loop contract and prevents blind tuning from a single result.

[DECISION] The first repair-record slice is contract/eval only. Persistence, MCP/API proposal tools, and dashboard repair surfaces come after the repair object can be parsed, rejected when overclaimed, and generated from benchmark evidence.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 repair/eval layer, specifically benchmark no-lift evidence becoming a typed repair record.

Codex best-practices gate:

- S013 / Codex repair loops: reviewer/failure source, repair attempt, validator result, attempt log, and stop reason must be separate objects rather than prompt churn.
- S014 / Promptfoo migration: repair evidence must live near code as portable deterministic cases before CI/dashboard/UI claims.
- S015 / Agent improvement loop: real traces and feedback become eval definitions and Codex handoffs; no-lift benchmark evidence becomes a repair handoff object.
- S016 / Macro evals: measure routes, tool choices, and changing conditions; no-lift benchmark results are workflow evidence, not final-answer quality.
- S088 / controlled experiment loop: record baseline, assisted condition, metric delta, keep/repair decision, and stop reason. Do not import an open-ended autonomous loop.

Selected mechanisms:

- Add `KrnRepairRecord` as a generic typed product object for failure source, classification, repair surface, validator result, attempt log, stop reason, source refs, evidence refs, and overclaim boundary.
- Add a deterministic eval that parses a valid repair fixture, rejects a known-bad overclaim fixture, and generates a repair record from a benchmark no-lift fixture.
- Add validate mode to `krn eval`; do not add live or mutating repair mode.

Rejected alternatives:

- Tune benchmark prompts immediately: rejected because `goal-006` requires repair records before instruction changes.
- Expand the suite toward 20 tasks immediately: rejected for this slice because the three-task no-lift signal first needs a repair handoff object.
- Store repair records only as markdown: rejected because dashboard/MCP/API will need a typed object.
- Add dashboard repair buttons now: rejected because repair records need a contract and eval before command surfaces.
- Reuse `repair_targets` inside `KrnBenchmarkReport` as the whole repair record: rejected because targets lack classification, attempt log, validator result, and stop reason.

Required skills used:

- `operator-intake` for P3/P8 routing,
- `repair-handoff` for the failure-to-repair-record contract,
- `goal-execplan` for this restartable child goal,
- `research-synthesis` for source-to-mechanism mapping,
- `eval-designer` for deterministic repair-record eval coverage,
- `typescript-contract-engineer` for unknown-first parser and contract implementation,
- `release-verifier` before closeout.

Falsification path:

- Valid repair record fixture parses through `@krn/contracts`.
- Known-bad fixture that claims validated repair or lift without validator evidence is rejected.
- A benchmark no-lift fixture generates a parseable `KrnRepairRecord` with classification, repair surface, validator result, metric delta, attempt log, stop reason, source refs, and blocked surfaces.
- Default `krn eval` includes only deterministic validate mode and does not run live benchmarks or mutate product state.

Overclaim boundary:

- This goal proves only that KRN can represent benchmark no-lift evidence as a typed repair record and validate the object contract. It does not prove repair quality, productivity lift, prompt improvement, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or a `krn benchmark`/`krn repair` command.

## Work Plan

### 0. Resume, Source, And Safety Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, `goal-020`, final product plan, stack decision, eval standard, repair-loop memory, source ledger, context, compact checkpoint, and current worktree inspected.
- Current worktree clean before edits.

### 1. Repair Record Contract

Work:

- Add `KrnRepairRecord` in `packages/contracts`.
- Add JSON Schema export, valid example, and known-bad fixture under `docs/specs/krn-repair-record/`.
- Add contract tests.

Acceptance evidence:

```bash
pnpm test -- packages/contracts/test/repair-record.test.ts
```

Disproves completion:

- A repair record can claim validated repair without a passed validator result.
- Benchmark no-lift repair records can omit source refs, evidence refs, attempt log, or stop reason.

### 2. Deterministic Repair Eval

Work:

- Add `docs/evals/krn-repair-record/` and `packages/evals/src/validate-krn-repair-record.ts`.
- Generate a repair record from a benchmark no-lift fixture and write it under `.krn/repairs/krn-repair-record/{run_id}/repair-record.json`.
- Add validate mode to default `krn eval`.

Acceptance evidence:

```bash
pnpm run eval:krn-repair-record
pnpm run eval:krn-eval
```

Disproves completion:

- Eval depends on live `.krn` state.
- Eval mutates source/memory/goal files.
- Eval treats generated repair record as an approved repair.

### 3. Source, Memory, Goal, And Release Audit

Work:

- Update source ledger, memory index/note, final product plan, parent goal, and this goal.
- Run release verification before closeout.

Acceptance evidence:

```bash
pnpm typecheck
pnpm test
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- Docs imply repair-record existence proves repair quality.
- No-lift benchmark evidence is hidden or softened.
- Source/memory updates are missing for the new durable product object.

### 4. Commit And Push

Acceptance evidence:

```bash
git status -sb
git commit -m "feat: add benchmark repair record contract"
git push origin main
```

## Completion Evidence

- `packages/contracts/src/repair-record.ts` exports `KrnRepairRecord`, `parseKrnRepairRecord`, and `krnRepairRecordJsonSchema`.
- `docs/specs/krn-repair-record/examples/repair-record.example.json` parses as a proposed benchmark no-lift repair record.
- `docs/specs/krn-repair-record/fixtures/bad-repair-record.example.json` is rejected because it claims validated status without a passed validator attempt.
- `docs/specs/krn-repair-record/fixtures/benchmark-no-lift-report.example.json` drives deterministic generation from benchmark no-lift evidence.
- `packages/evals/src/validate-krn-repair-record.ts` writes generated local repair records under `.krn/repairs/krn-repair-record/{run_id}/repair-record.json`.
- `krn eval` includes `krn-repair-record` as a deterministic validate-mode module.
- `.krn/repairs/.gitignore` and `.krn/repairs/README.md` keep generated repair runtime artifacts local by default.

Validation:

```bash
pnpm test -- packages/contracts/test/repair-record.test.ts
# 31 test files passed, 105 tests passed

pnpm run eval:krn-repair-record
# .krn/evals/krn-repair-record/20260620T075903Z-2754248/report.json
# 3/3 cases, 9/9 assertions

pnpm run eval:krn-eval
# .krn/eval/20260620T080015Z-2757479/report.json
# 17/17 modules, 74/74 cases, 249/249 assertions

pnpm typecheck
# passed

pnpm test
# 31 test files passed, 105 tests passed

python3 scripts/evals/codex_memory_compliance.py --mode validate
# 4/4 cases

git diff --check
# passed
```

## Outcome

[DECISION] KRN now has a typed proposed repair handoff for benchmark no-lift evidence.

[FACT] The latest source-backed no-lift evidence remains the `goal-020` live suite result: 3/3 completed tasks, baseline score `0.9433`, assisted score `0.94`, and `assisted_minus_baseline: -0.0033`.

[FACT] The generated repair-record eval proves only the object contract, known-bad overclaim rejection, and deterministic generation path from no-lift benchmark evidence.

[BLOCKED] Productivity lift, repair quality, prompt improvement, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, `krn benchmark`, and `krn repair` remain unproven.

Next bounded slice should apply one repair attempt from the generated no-lift repair record, rerun the live benchmark suite explicitly, and compare before/after delta.

## Boundaries

In scope:

- repair record contract,
- repair record examples/fixtures,
- deterministic eval,
- generated local repair artifact,
- aggregate validate-mode gate,
- source/memory/goal updates.

Out of scope:

- prompt/skill/memory tuning,
- actual repair attempt implementation,
- measured productivity lift,
- `krn benchmark` or `krn repair` CLI command,
- dashboard repair/run/apply buttons,
- MCP/API repair tools,
- ChatGPT connector behavior,
- human review quality proof.
