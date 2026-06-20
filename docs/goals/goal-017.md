# Goal 017: Benchmark Report Spine

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md). The parent goal remains active and incomplete until broader control-plane views and live baseline-vs-assisted lift evidence exist.

This goal starts after commit `4545642 feat: add eval runs dashboard`. It is not a replacement for `goal-006`; it is the next bounded benchmark/control-plane evidence slice after the Eval Runs dashboard surface.

Current implementation status: contract, fixtures, deterministic eval, aggregate eval integration, source ledger, memory index, parent goal update, and local release verification are complete. The semantic release commit and push carry the final git/GitHub evidence for this slice.

## Objective

Add the first typed KRN benchmark report spine so KRN can represent baseline Codex versus KRN-assisted Codex task evidence without claiming productivity lift from fixtures, green deterministic evals, or dashboard state.

The end state is:

```text
benchmark task fixture
  -> KrnBenchmarkReport contract
  -> deterministic benchmark-spine eval
  -> .krn/benchmarks/krn-benchmark-spine/{run_id}/report.json
  -> .krn/evals/krn-benchmark-spine/{run_id}/report.json
  -> aggregate krn eval coverage
  -> source/memory/goal update
```

This goal does not run a live Codex batch, does not claim measured lift, does not add a new CLI command, does not add dashboard benchmark UI, does not add auto-repair commands, and does not expose destructive MCP/API tools.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-016.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-016.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/evals/STANDARD.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/STANDARD.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)

[DECISION] The first benchmark slice is a report contract and deterministic eval, not a live productivity claim.

[DECISION] Fixture or score-artifact benchmark reports may show score deltas, but `productivity_lift_claimed` must remain false unless a future live `codex exec` benchmark mode satisfies the report contract's lift gate.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark/control-plane evidence layer, specifically the first typed report boundary for baseline Codex versus KRN-assisted task evidence.

Selected mechanisms:

- S010 / Goals in Codex: this child goal names outcome, verification surface, constraints, boundaries, iteration policy, and blocked condition.
- S011 / ExecPlans: this file is the restartable state for a multi-step slice.
- S012 / Code modernization: benchmark work starts as a bounded contract/validation pilot before live batch execution or dashboard surfaces.
- S014-S016 / eval and improvement loops: benchmark output is an eval artifact with deterministic assertions and explicit caveats before repair or improvement claims.
- S087 / Related resources: treated as discovery only; no resource is promoted without primary-source mechanism extraction.
- S088 / fixed-budget metric loop: baseline, assisted variant, metric delta, keep/repair decision, and stop reason are the useful mechanism; endless autonomous loops are rejected.
- C008: public benchmark results are not local product proof.
- C017: operator skills and KRN assistance must be evaluated as interventions against baseline Codex.
- C023 and C038: green aggregate evals and Eval Runs dashboards do not prove benchmark lift.

Rejected alternatives:

- Run a full live `codex exec` benchmark batch now: rejected because the report contract and no-lift gate do not exist yet, and a live run without a typed report would be hard to audit.
- Add a dashboard benchmark chart now: rejected because the product first needs a report object that prevents overclaiming.
- Add a new `krn benchmark` CLI command now: rejected because this slice can integrate through `packages/evals` and aggregate `krn eval` without expanding command surface.
- Extend the legacy Python `operator_skill_impact.py` as product foundation: rejected by the TypeScript-first stack decision. Its metrics can inform the schema, but new product code must be TypeScript-first.
- Claim lift from deterministic fixture deltas: rejected because fixture scoring proves contract behavior only.

Required skills used:

- `operator-intake` for phase routing,
- `research-synthesis` for source-to-mechanism mapping,
- `goal-execplan` for this restartable child goal,
- `typescript-contract-engineer` for unknown-first contracts and public parser tests,
- `eval-designer` for deterministic benchmark-spine eval coverage,
- `release-verifier` before closeout.

Contract/runtime surface to change:

- Add `KrnBenchmarkReport` in `packages/contracts`.
- Add valid and known-bad benchmark report fixtures under `docs/specs/krn-benchmark-report/`.
- Add deterministic `krn-benchmark-spine` eval and aggregate `krn eval` integration.
- Write generated benchmark reports under `.krn/benchmarks/krn-benchmark-spine/{run_id}/report.json`.

Falsification path:

- A valid no-lift fixture parses through `@krn/contracts`.
- A known-bad fixture that claims productivity lift from fixture data fails parsing.
- The eval runner writes a generated benchmark report and parses it through `KrnBenchmarkReport`.
- Generated benchmark reports include source refs, repair targets, measurement mode, lift status, and interpretation caveat.
- `krn eval` includes the new benchmark-spine module.

Overclaim boundary:

- This goal proves only the first benchmark report contract and deterministic no-lift gate. It does not prove measured productivity lift, live Codex benchmark quality, repair-loop quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

## Work Plan

### 0. Resume, Source, And Safety Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, final product plan, stack decision, eval standard, pattern matrix, source ledger, context, completed `goal-016`, and current worktree inspected.
- Current worktree clean before edits.

### 1. Benchmark Report Contract

Work:

- Add `KrnBenchmarkReport` parser, exported JSON Schema, valid fixture, and known-bad fixture.
- Add contract tests through the public parser.

Acceptance evidence:

```bash
pnpm test -- packages/contracts/test/benchmark-report.test.ts
```

Disproves completion:

- Fixture reports can claim productivity lift.
- Task totals and score deltas can contradict task rows.
- No-lift or fixture reports can omit repair targets or caveats.

### 2. Benchmark-Spine Eval

Work:

- Add `docs/evals/krn-benchmark-spine/` with README, cases, result schema, and OpenAI Cookbook mapping.
- Add `packages/evals/src/validate-krn-benchmark-spine.ts`.
- The runner writes both a generated benchmark report and an eval report.

Acceptance evidence:

```bash
pnpm run eval:krn-benchmark-spine
```

Disproves completion:

- The eval only checks happy paths.
- Generated reports are not parsed through `@krn/contracts`.
- Runtime output claims live lift or hides repair targets.

### 3. Aggregate Eval Integration

Work:

- Add `krn-benchmark-spine` to `krn eval`.
- Update aggregate eval docs, examples, and tests.

Acceptance evidence:

```bash
pnpm run eval:krn-eval
pnpm test -- packages/contracts/test/eval-report.test.ts packages/cli/test/eval.test.ts
```

Disproves completion:

- Aggregate eval omits the new module.
- Aggregate docs imply benchmark lift instead of benchmark contract readiness.

### 4. Memory, Source, Goal, And Release Audit

Work:

- Update source ledger with local evidence and claim caveat.
- Add a memory note after eval evidence exists.
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

- Docs imply benchmark lift is proven.
- Runtime `.krn` output is promoted as durable truth without reviewed memory/source updates.
- Completion is claimed without aggregate eval evidence.

### 5. Commit And Push

Acceptance evidence:

```bash
git status -sb
git commit -m "feat: add benchmark report spine"
git push origin main
```

## Completion Evidence

- `pnpm test -- packages/contracts/test/benchmark-report.test.ts` passed through Vitest.
- `pnpm run eval:krn-benchmark-spine` generated `.krn/evals/krn-benchmark-spine/20260620T052834Z-2409080/report.json` with 4/4 cases and 14/14 assertions.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T052950Z-2410440/report.json` with 14/14 modules, 62/62 cases, and 195/195 assertions, including `krn-benchmark-spine`.
- `pnpm test -- packages/contracts/test/benchmark-report.test.ts packages/contracts/test/eval-report.test.ts packages/cli/test/eval.test.ts` passed through Vitest with 28/28 files and 94/94 tests.
- `pnpm typecheck` passed for `packages/contracts`, `packages/cli`, `packages/mcp`, `packages/evals`, and `apps/dashboard`.
- `pnpm test` passed with 28/28 files and 94/94 tests.
- `python3 scripts/evals/codex_memory_compliance.py --mode validate` passed with 4/4 cases and wrote `.krn/evals/codex-memory-compliance/20260620T053653380413Z-2435367/report.json`.
- `git diff --check` passed.

## Outcome

KRN now has a typed benchmark report spine:

```text
fixture task evidence
  -> KrnBenchmarkReport
  -> .krn/benchmarks/krn-benchmark-spine/{run_id}/report.json
  -> krn-benchmark-spine eval
  -> aggregate krn eval module
```

This proves only the report contract and no-lift gate. It does not prove measured productivity lift, live Codex benchmark quality, repair-loop quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

## Boundaries

In scope:

- benchmark report contract,
- benchmark report fixtures,
- deterministic benchmark-spine eval,
- aggregate eval integration,
- source/memory/goal updates.

Out of scope:

- live baseline-vs-assisted Codex benchmark batch,
- productivity lift claim,
- dashboard benchmark UI,
- new `krn benchmark` CLI command,
- dashboard rerun/repair/apply buttons,
- HTTP/API write routes,
- ChatGPT bridge,
- destructive MCP tools,
- runtime/product skills.

## Completion Criteria

This goal is complete only when:

- benchmark report fixtures parse and reject known-bad lift claims,
- generated benchmark report writes under `.krn/benchmarks/krn-benchmark-spine/**` and parses through `@krn/contracts`,
- deterministic eval and aggregate eval pass,
- source ledger, memory index, parent goal, and this goal carry exact evidence,
- semantic commit is pushed.
