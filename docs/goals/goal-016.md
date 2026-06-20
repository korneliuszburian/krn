# Goal 016: Eval Runs Dashboard Surface

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md). The parent goal remains active and incomplete until broader control-plane surfaces and measured baseline-vs-assisted lift evidence exist.

This goal starts after commit `92a1574 feat: add promotion review dashboard`. It is not a replacement for `goal-006`; it is the next bounded dashboard/control-plane object slice after the Promotion Review dashboard surface.

Current implementation status: contract, runtime builder, UI, deterministic eval, aggregate eval integration, source ledger, memory index, parent goal update, and local release verification are complete. The semantic release commit and push carry the final git/GitHub evidence for this slice.

## Objective

Add the first Eval Runs dashboard surface so the latest `.krn/eval/**/report.json` aggregate becomes visible as typed dashboard review evidence without claiming benchmark lift or adding write commands.

The end state is:

```text
.krn/eval latest aggregate report
  -> KrnEvalRunsViewModel
  -> generated KrnDashboardData envelope
  -> apps/dashboard Eval Runs surface
  -> deterministic eval covers ready, missing, invalid, and failed-module states
  -> aggregate krn eval coverage
  -> source/memory/goal update
```

This goal does not add benchmark runs, baseline-vs-assisted lift claims, auto-repair commands, dashboard rerun buttons, HTTP/API routes, ChatGPT bridge behavior, or destructive MCP tools.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-015.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-015.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)
- [docs/specs/krn-eval/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-eval/README.md)

[DECISION] Eval Runs is a read-only dashboard review surface over aggregate eval reports, not a benchmark, auto-repair, or command surface.

[DECISION] `KrnDashboardData` contains an independently parseable `eval_runs` view model instead of letting the frontend parse raw `.krn/eval` JSON.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 dashboard/control-plane layer, specifically rendering eval aggregate state from existing typed `KrnEvalReport` runtime artifacts.

Selected mechanisms:

- S010 / Goals in Codex: this child goal names outcome, verification surface, constraints, boundaries, iteration policy, and blocked condition.
- S011 / ExecPlans: this file is the restartable state for a multi-step slice.
- S012 / Code modernization: split benchmark/control-plane work into a bounded read-only Eval Runs view before adding measured-lift harness or command surfaces.
- S087 / Related resources: treated as discovery only; no resource was promoted without local mechanism and eval evidence.
- C010: dashboard value depends on reviewable operational objects, not charts.
- C023 and LOCAL011: `krn eval` aggregate reports prove deterministic local eval execution and aggregation only, not productivity lift.
- C031: non-trivial slices require source-backed mechanism selection before code.
- C037 and LOCAL024: dashboard views join through `KrnDashboardData` and preserve overclaim boundaries.
- C038 and LOCAL025: Eval Runs reads aggregate eval reports before benchmark/control commands.

Rejected alternatives:

- Start the benchmark harness now: rejected because the dashboard still lacks the required Eval Runs review surface over existing eval evidence.
- Render `.krn/evals/**` module reports directly in the UI: rejected because the aggregate `KrnEvalReport` is the current typed contract and already carries module paths and caveats.
- Treat a green aggregate eval as measured lift: rejected because `goal-006` requires baseline-vs-assisted benchmark evidence for lift claims.
- Add dashboard rerun or repair buttons now: rejected because command semantics need a separate proposal/write surface and eval.
- Use fixture-only dashboard data: rejected because dashboard boot data must be generated from real product objects.

Required skills used:

- `operator-intake` for phase routing,
- `research-synthesis` for source-to-mechanism mapping,
- `goal-execplan` for this restartable child goal,
- `typescript-contract-engineer` for unknown-first contracts and dashboard envelope boundaries,
- `eval-designer` for deterministic eval coverage,
- `release-verifier` before closeout.

Contract/runtime surface to change:

- Add `KrnEvalRunsViewModel` in `packages/contracts`.
- Add Eval Runs builder in `packages/mcp`.
- Update `KrnDashboardData` and dashboard data generation to include Eval Runs.
- Add Eval Runs UI component in `apps/dashboard`.
- Add deterministic `krn-dashboard-eval-runs-ui` eval and aggregate `krn eval` integration.

Falsification path:

- A valid Eval Runs fixture parses through `packages/contracts`.
- A known-bad fixture that implies benchmark lift or command readiness fails parsing.
- Dashboard data rejects mismatched Eval Runs `target_root`.
- Missing `.krn/eval` state renders explicit blocked or empty state.
- Invalid latest eval report renders blocked state.
- Failed module state renders blocked state and does not become a lift claim.
- Valid latest aggregate eval renders module rows, report paths, source refs, and caveats.
- `krn eval` includes the new module.

Overclaim boundary:

- This goal proves the first local Eval Runs dashboard surface over `.krn/eval` aggregate reports only. It does not prove benchmark lift, dashboard command readiness, auto-repair quality, HTTP/API readiness, ChatGPT connector behavior, human review quality, or productivity improvement.

## Work Plan

### 0. Resume, Source, And Safety Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, final product plan, stack decision, eval standard, pattern matrix, source ledger, context, completed `goal-015`, and current worktree inspected.
- Official Codex `AGENTS.md` discovery docs checked before updating `AGENTS.md`.
- Current worktree clean before edits.

### 1. Eval Runs Contract

Work:

- Add `KrnEvalRunsViewModel` parser, exported JSON Schema, valid fixture, and known-bad fixture.
- Update `KrnDashboardData` parser and fixture to include Eval Runs.
- Add contract tests through public parsers.

Acceptance evidence:

```bash
pnpm test -- packages/contracts/test/eval-runs-view-model.test.ts packages/contracts/test/dashboard-data.test.ts
```

Disproves completion:

- Eval Runs accepts benchmark-lift or command-ready claims.
- Dashboard data accepts mismatched Eval Runs target roots.
- Module rows can omit owner, source refs, next action, failure mode, report path, or interpretation caveat.

### 2. Eval Runs Builder

Work:

- Add `buildKrnEvalRunsViewModel`.
- Locate the latest `.krn/eval/*/report.json`.
- Parse it through `parseKrnEvalReport`.
- Surface missing and invalid latest eval state.
- Convert module status into owner/source/action/failure-mode rows.

Acceptance evidence:

```bash
pnpm test -- packages/mcp/test/eval-runs-view-model.test.ts
```

Disproves completion:

- Missing `.krn/eval` state is hidden.
- Invalid eval reports are shown as ready.
- Failed modules do not block the view.
- Builder mutates runtime files.

### 3. Dashboard UI And Eval

Work:

- Update dashboard data generation to emit `eval_runs`.
- Render Eval Runs in `apps/dashboard`.
- Add deterministic Eval Runs dashboard eval.
- Include the module in aggregate `krn eval`.

Acceptance evidence:

```bash
pnpm test -- apps/dashboard/test/eval-runs-dashboard.test.tsx apps/dashboard/test/pending-review-dashboard.test.tsx apps/dashboard/test/promotion-review-dashboard.test.tsx
pnpm run eval:krn-dashboard-eval-runs-ui
pnpm run eval:krn-eval
pnpm --filter @krn/dashboard typecheck
pnpm --filter @krn/dashboard test
pnpm --filter @krn/dashboard build
```

Disproves completion:

- UI renders benchmark/lift/repair command claims.
- Dashboard data is mocked or fixture-only.
- Missing, invalid, or failed-module states are not covered.
- Aggregate eval omits the new module.

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

- Docs imply Eval Runs proves productivity lift.
- Runtime `.krn` output is promoted as benchmark proof.
- Completion is claimed without aggregate eval and dashboard build evidence.

### 5. Commit And Push

Acceptance evidence:

```bash
git status -sb
git commit -m "feat: add eval runs dashboard"
git push origin main
```

## Completion Evidence

- `pnpm test -- packages/contracts/test/eval-runs-view-model.test.ts packages/contracts/test/dashboard-data.test.ts packages/mcp/test/eval-runs-view-model.test.ts apps/dashboard/test/eval-runs-dashboard.test.tsx` passed through Vitest with 27/27 files and 90/90 tests.
- `pnpm --filter @krn/dashboard typecheck` passed.
- `pnpm --filter @krn/dashboard test` passed with 3/3 files and 10/10 tests.
- `pnpm --filter @krn/dashboard build` passed and generated a Vite production build from generated dashboard data.
- `pnpm run eval:krn-dashboard-eval-runs-ui` generated `.krn/evals/krn-dashboard-eval-runs-ui/20260620T051305Z-2375941/report.json` with 5/5 cases and 20/20 assertions.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T051314Z-2376293/report.json` with 13/13 modules, 58/58 cases, and 181/181 assertions.
- `pnpm typecheck` passed for `packages/contracts`, `packages/cli`, `packages/mcp`, `packages/evals`, and `apps/dashboard`.
- `pnpm test` passed with 27/27 files and 90/90 tests.
- `python3 scripts/evals/codex_memory_compliance.py --mode validate` passed with 4/4 cases and wrote `.krn/evals/codex-memory-compliance/20260620T051434368176Z-2378324/report.json`.
- `git diff --check` passed.

## Outcome

KRN now has a read-only Eval Runs dashboard surface over latest aggregate `.krn/eval` evidence:

```text
.krn/eval latest aggregate report
  -> KrnEvalRunsViewModel
  -> KrnDashboardData.eval_runs
  -> apps/dashboard Eval Runs
  -> krn-dashboard-eval-runs-ui eval
  -> aggregate krn eval module
```

This proves only typed dashboard rendering of aggregate eval state. It does not prove benchmark lift, productivity improvement, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, human review quality, or dashboard command readiness.

## Boundaries

In scope:

- Eval Runs view model,
- dashboard data envelope update,
- read-only Eval Runs UI,
- deterministic eval and aggregate eval integration,
- source/memory/goal updates.

Out of scope:

- benchmark harness,
- baseline-vs-assisted lift claims,
- dashboard rerun/repair buttons,
- HTTP/API write routes,
- ChatGPT bridge,
- destructive MCP tools,
- runtime/product skills.

## Completion Criteria

This goal is complete only when:

- Eval Runs fixtures parse and reject known-bad lift/command state,
- dashboard data parses and rejects inconsistent target roots,
- builder surfaces valid, missing, invalid, and failed-module states without mutation,
- dashboard renders Eval Runs without benchmark/lift/repair command claims,
- direct eval and aggregate eval pass,
- source ledger, memory index, parent goal, and this goal carry exact evidence,
- semantic commit is pushed.
