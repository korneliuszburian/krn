# Goal 015: Promotion Review Dashboard Surface

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `6b9cfd9 feat: add proposal promotion workflow`. It is not a replacement for `goal-006`; it is the next bounded dashboard/control-plane object slice after the proposal promotion workflow.

Current implementation status: phases 0-5 are implemented and locally verified. The parent `goal-006` remains active because measured lift, broader control-plane views, API/HTTP readiness, and benchmark evidence are still incomplete.

## Current Progress Evidence

[FACT] This goal added the first Promotion Review dashboard surface over `.krn/promotions`:

- `packages/contracts/src/promotion-review-view-model.ts` exports `KrnPromotionReviewViewModel`, a parser, and JSON Schema.
- `packages/contracts/src/dashboard-data.ts` exports `KrnDashboardData`, the first multi-view dashboard data envelope.
- `packages/mcp/src/promotion-review-view-model.ts` builds Promotion Review from real promotion-store records, referenced proposal/review decision records, source-ref checks, and exact target-file state.
- `apps/dashboard/src/PromotionReviewDashboard.tsx` renders promotion audit rows without apply/promote/write commands.
- `apps/dashboard/scripts/write-dashboard-data.ts` now writes one parsed dashboard data envelope with Pending Review and Promotion Review.
- `packages/evals/src/validate-krn-dashboard-promotion-review-ui.ts` and `docs/evals/krn-dashboard-promotion-review-ui/` cover the new dashboard surface.

[FACT] Latest local evidence:

```text
pnpm typecheck -> passed
pnpm test -> 25 test files, 83 tests passed
pnpm --filter @krn/dashboard typecheck -> passed
pnpm --filter @krn/dashboard test -> 2 test files, 7 tests passed
pnpm --filter @krn/dashboard build -> passed
pnpm run eval:krn-dashboard-promotion-review-ui -> .krn/evals/krn-dashboard-promotion-review-ui/20260620T043648Z-2297921/report.json, 5/5 cases, 19/19 assertions
pnpm run eval:krn-eval -> .krn/eval/20260620T043611Z-2296702/report.json, 12/12 modules, 53/53 cases, 161/161 assertions
python3 scripts/evals/codex_memory_compliance.py --mode validate -> passed
git diff --check -> passed
```

[FACT] This still does not prove dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, broad promotion correctness, safe overwrite semantics, or productivity lift.

## Objective

Add the first Promotion Review dashboard surface so `.krn/promotions` becomes visible as typed dashboard review evidence without adding dashboard apply/promote commands or mutating targets.

The end state is:

```text
.krn/promotions promotion records
  -> KrnPromotionReviewViewModel
  -> generated KrnDashboardData envelope
  -> apps/dashboard Promotion Review surface
  -> deterministic eval covers empty, valid, invalid, and target-drift states
  -> aggregate krn eval coverage
  -> source/memory/goal update
```

This goal does not add dashboard promote buttons, HTTP/API write routes, ChatGPT bridge behavior, broad promotion for all proposal kinds, target overwrite support, destructive MCP tools, or productivity lift claims.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-014.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-014.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)
- [docs/specs/krn-proposal-promotion/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-proposal-promotion/README.md)

[DECISION] Promotion Review is a read-only dashboard review surface over promotion records, not a command surface.

[DECISION] Dashboard boot data is now a multi-view `KrnDashboardData` envelope, not a single Pending Review view model.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 dashboard/control-plane layer, specifically rendering promotion ledger state from existing typed promotion objects.

Selected mechanisms:

- S010 / Goals in Codex: this child goal names outcome, verification surface, constraints, boundaries, iteration policy, and blocked condition.
- S011 / ExecPlans: this file is the restartable state for a multi-step slice.
- S012 / Code modernization: split dashboard command readiness into a bounded read-only Promotion Review surface before adding any command surface.
- S007 and S022: MCP/API writes need least-power defaults, explicit approval, audit, and side-effect boundaries.
- C004: writes need schemas, approvals, idempotency, and audit.
- C010: dashboard value depends on reviewable operational objects, not charts.
- C031: non-trivial slices require source-backed mechanism selection before code.
- C036 and LOCAL023: proposal promotion proves exact memory payload promotion only, not dashboard command readiness.

Rejected alternatives:

- Add dashboard apply/promote buttons now: rejected because command semantics need a separate approval/write surface and eval.
- Keep dashboard data as the single Pending Review object: rejected because additional dashboard views would force the frontend to invent or side-load state.
- Render promotions from fixture JSON only: rejected because dashboard must read generated typed product objects.
- Treat target file presence as success without content comparison: rejected because exact promotion payloads require target-state parity checks.
- Generalize to all dashboard views in one pass: rejected because the first promotion dashboard surface must be independently falsifiable.

Required skills used:

- `operator-intake` for phase routing,
- `research-synthesis` for source-to-mechanism mapping,
- `goal-execplan` for this restartable child goal,
- `typescript-contract-engineer` for unknown-first contracts and dashboard envelope boundaries,
- `eval-designer` for deterministic eval coverage,
- `release-verifier` before closeout.

Contract/runtime surface changed:

- Add `KrnPromotionReviewViewModel` in `packages/contracts`.
- Add `KrnDashboardData` in `packages/contracts`.
- Add Promotion Review builder in `packages/mcp`.
- Update dashboard data generation to emit Pending Review and Promotion Review.
- Add Promotion Review UI component in `apps/dashboard`.
- Add deterministic `krn-dashboard-promotion-review-ui` eval and aggregate `krn eval` integration.

Falsification path:

- A valid Promotion Review fixture parses through `packages/contracts`.
- A known-bad command-like Promotion Review fixture fails parsing.
- A valid dashboard data envelope parses and rejects mismatched target roots.
- Empty promotion store renders explicit zero state.
- Valid promotion record renders audit evidence and blocked dashboard write commands.
- Invalid promotion record renders blocked state.
- Target file drift renders blocked state.
- Dashboard data command includes Promotion Review without mutating record-only target paths.
- `krn eval` includes the new module.

Overclaim boundary:

- This goal proves the first local Promotion Review dashboard surface over `.krn/promotions` only. It does not prove dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, broad promotion correctness, safe overwrite semantics, or productivity lift.

## Work Plan

### 0. Resume, Source, And Safety Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, final product plan, stack decision, eval standard, pattern matrix, source ledger, context, latest completed `goal-014`, and current worktree inspected.
- Official Codex `AGENTS.md` discovery docs checked before updating `AGENTS.md`.
- Current worktree clean before edits.

### 1. Promotion Review And Dashboard Data Contracts

Work:

- Add `KrnPromotionReviewViewModel` parser, exported JSON Schema, valid fixture, and known-bad fixture.
- Add `KrnDashboardData` parser and exported JSON Schema.
- Add contract tests through public parsers.

Acceptance evidence:

```bash
pnpm test -- packages/contracts/test/promotion-review-view-model.test.ts packages/contracts/test/dashboard-data.test.ts
```

Disproves completion:

- Dashboard data accepts mismatched target roots.
- Promotion Review accepts command-like or mutation-like fixtures.
- Promotion rows can omit source refs, next action, or failure mode.

### 2. Promotion Review Builder

Work:

- Add `buildKrnPromotionReviewViewModel`.
- Read `.krn/promotions`.
- Surface invalid promotion records.
- Validate referenced proposal and approved review decision records.
- Validate promotion source refs.
- Compare target file content against exact payload content.

Acceptance evidence:

```bash
pnpm test -- packages/mcp/test/promotion-review-view-model.test.ts
```

Disproves completion:

- Invalid promotion files are hidden.
- Missing proposal/review references are shown as ready.
- Target drift is ignored.
- Builder mutates target files.

### 3. Dashboard UI And Eval

Work:

- Update dashboard data generation to emit `KrnDashboardData`.
- Render Promotion Review in `apps/dashboard`.
- Update Pending Review tests/eval to parse the new envelope.
- Add deterministic Promotion Review dashboard eval.
- Include the module in aggregate `krn eval`.

Acceptance evidence:

```bash
pnpm test -- apps/dashboard/test/pending-review-dashboard.test.tsx apps/dashboard/test/promotion-review-dashboard.test.tsx
pnpm run eval:krn-dashboard-promotion-review-ui
pnpm run eval:krn-eval
pnpm --filter @krn/dashboard typecheck
pnpm --filter @krn/dashboard test
pnpm --filter @krn/dashboard build
```

Disproves completion:

- UI renders command names such as `apply_promotion_from_dashboard`.
- Dashboard data is mocked or fixture-only.
- Empty, invalid, or target-drift states are not covered.
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

- Docs imply Promotion Review is a command surface.
- Runtime `.krn` output is promoted as productivity proof.
- Completion is claimed without aggregate eval and dashboard build evidence.

### 5. Commit And Push

Acceptance evidence:

```bash
git status -sb
git commit -m "feat: add promotion review dashboard"
git push origin main
```

## Boundaries

In scope:

- Promotion Review view model,
- dashboard data envelope,
- read-only Promotion Review UI,
- deterministic eval and aggregate eval integration,
- source/memory/goal updates.

Out of scope:

- dashboard promote/apply buttons,
- HTTP/API write routes,
- ChatGPT bridge,
- generalized promotion for all proposal kinds,
- target overwrite/update semantics,
- destructive MCP tools,
- benchmark/productivity claims.

## Completion Criteria

This goal is complete only when:

- Promotion Review fixtures parse and reject known-bad command-like state,
- dashboard data parses and rejects inconsistent target roots,
- builder surfaces valid, empty, invalid, stale/reference, and target-drift states without mutation,
- dashboard renders Promotion Review without apply/promote/write commands,
- direct eval and aggregate eval pass,
- source ledger, memory index, parent goal, and this goal carry exact evidence,
- semantic commit is pushed.
