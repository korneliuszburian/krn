# Goal 011: Pending Review View Model Over Proposal Store

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `332d5af feat: add proposal-only mcp tool`. It is not a replacement for `goal-006`; it is the next bounded dashboard/control-plane slice.

Current implementation status: phases 0-5 are completed and verified in the semantic commit containing this goal update.

## Current Progress Evidence

[FACT] This goal added the first Pending Review view model over proposal-store records:

- `packages/contracts/src/pending-review-view-model.ts` defines `KrnPendingReviewViewModel`.
- `packages/mcp/src/proposal-store.ts` exports `listKrnProposalStoreRecords`.
- `packages/mcp/src/pending-review-view-model.ts` exports `buildKrnPendingReviewViewModel`.
- `buildKrnPendingReviewViewModel` reads `.krn/proposals/**/proposal.json`, parses `KrnControlPlaneProposal`, revalidates source refs, surfaces invalid records, and marks stale source refs as blocked.
- `buildKrnDashboardViewModel` now uses proposal-store pending count.
- `krn eval` includes `krn-pending-review-view-model`.

[FACT] Latest local evidence during this goal:

```text
pnpm typecheck -> passed
pnpm exec vitest run packages/contracts/test/pending-review-view-model.test.ts packages/contracts/test/dashboard-view-model.test.ts packages/contracts/test/eval-report.test.ts packages/mcp/test/pending-review-view-model.test.ts packages/mcp/test/dashboard-view-model.test.ts packages/mcp/test/proposal-store.test.ts packages/cli/test/eval.test.ts -> 7 files, 22 tests passed
pnpm run eval:krn-pending-review-view-model -> .krn/evals/krn-pending-review-view-model/20260620T002555Z-1998197/report.json, 4/4 cases, 14/14 assertions
pnpm run eval:krn-eval -> .krn/evals/krn-eval-contracts/20260620T002641Z-1999549/report.json, 3/3 cases, 7/7 assertions
pnpm run krn -- eval -> .krn/eval/20260620T002555Z-1998210/report.json, 8/8 modules, 28/28 cases, 76/76 assertions
```

[FACT] This still does not prove dashboard UI readiness, human approval quality, HTTP/API readiness, ChatGPT connector behavior, target mutation safety beyond `.krn/proposals`, or productivity lift.

## Objective

Make dashboard Pending Review read real proposal-store records before building dashboard UI.

The end state is:

```text
.krn/proposals proposal records
  -> typed Pending Review view model
  -> dashboard overview uses proposal-store count
  -> deterministic eval
  -> aggregate krn eval coverage
  -> source/memory/goal update
```

This goal does not approve proposals, reject proposals, mutate proposal targets, create `apps/dashboard`, add HTTP/API, add more MCP tools, or claim productivity lift.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-010.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-010.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/specs/krn-dashboard-view-model/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-dashboard-view-model/README.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)

[DECISION] Build the Pending Review data contract before dashboard UI.

[DECISION] Treat `.krn/proposals` as the current Pending Review source after the proposal-only MCP tool exists. The latest `krn review` report remains a runtime artifact, not the queue source of truth.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 dashboard/control-plane Pending Review view model.

Selected mechanisms:

- C010 / dashboard patterns: dashboard value depends on reviewable operational objects, not charts.
- C028 / LOCAL016: dashboard view models precede dashboard UI and must not be overclaimed as the dashboard itself.
- C029 / LOCAL017: proposal records are append-only, source-backed persistence records.
- C032 / LOCAL019: the MCP proposal tool writes proposal-only review input under `.krn/proposals`.
- S010 / S011 / C006: keep this child goal self-contained with outcome, verification, constraints, boundaries, and blocked stop condition.

Rejected alternatives:

- Build `apps/dashboard` now: rejected because the first missing behavior is a source-backed Pending Review queue, not UI composition.
- Keep Pending Review count from `krn review`: rejected because `goal-010` introduced the intended proposal-store path.
- Add approval/rejection actions now: rejected because review-state mutation needs a separate contract, eval, and human workflow.
- Read chat state or `.krn` snapshots broadly: rejected because dashboard rows must come from typed product objects.

Required skills used:

- `operator-intake` for phase routing,
- `goal-execplan` for this restartable child goal,
- `typescript-contract-engineer` for unknown-first TypeScript contracts,
- `eval-designer` for deterministic view-model eval cases.

Falsification path:

- Valid proposal records under `.krn/proposals` must render as pending rows.
- Empty proposal store must produce explicit zero state.
- Invalid proposal files must be surfaced as invalid records, not counted as pending.
- Source-ref drift must block readiness instead of silently presenting stale proposals as reviewable.
- `krn eval` must include the new Pending Review view-model eval.

Overclaim boundary:

- This goal proves only a typed Pending Review view model over local proposal-store records. It does not prove dashboard UI readiness, human approval quality, HTTP/API readiness, ChatGPT connector behavior, target mutation safety beyond `.krn/proposals`, or productivity lift.

## Work Plan

### 0. Resume, Source, And Safety Gate - completed

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, `goal-010`, final product plan, stack decision, eval standard, and context inspected.
- Current worktree clean before edits.

### 1. Pending Review Contract And Builder - completed

Work:

- Add `KrnPendingReviewViewModel` contract, parser, JSON Schema, valid fixture, and known-bad fixture.
- Add proposal-store listing over `.krn/proposals/**/proposal.json`.
- Add `buildKrnPendingReviewViewModel(targetRoot)`.
- Update `buildKrnDashboardViewModel` pending count to use proposal-store state.

Acceptance evidence:

```bash
pnpm test -- packages/contracts/test/pending-review-view-model.test.ts packages/mcp/test/pending-review-view-model.test.ts packages/mcp/test/dashboard-view-model.test.ts
pnpm typecheck
```

Disproves completion:

- Pending Review reads `krn review` instead of `.krn/proposals` after proposal store exists.
- Invalid proposal records are hidden.
- Source-ref drift is not visible in the view model.
- The view model implies approval or target mutation.

### 2. Pending Review Eval - completed

Work:

- Add `docs/evals/krn-pending-review-view-model/`.
- Add `packages/evals/src/validate-krn-pending-review-view-model.ts`.
- Eval must cover proposal-store rows, explicit empty state, invalid proposal record, and source-ref drift.

Acceptance evidence:

```bash
pnpm run eval:krn-pending-review-view-model
```

Disproves completion:

- Eval only parses a static good fixture.
- Eval does not prove invalid files are surfaced.
- Eval treats pending review as approval workflow.

### 3. Aggregate Eval Integration - completed

Work:

- Add the eval script to `package.json`.
- Include `krn-pending-review-view-model` in `krn eval`.
- Update aggregate eval docs/fixtures/tests.

Acceptance evidence:

```bash
pnpm run eval:krn-eval
pnpm run krn -- eval
```

Disproves completion:

- `krn eval` omits the Pending Review boundary.
- Aggregate fixture overclaims UI/API/productivity readiness.

### 4. Memory, Source, And Goal Update - completed

Work:

- Update `docs/plans/canonical/SOURCES.md` with new local evidence and claim caveat.
- Add a memory note only after eval evidence exists.
- Update `docs/memory/INDEX.md`.
- Update `goal-006` and this goal with exact evidence.

Acceptance evidence:

```bash
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- Runtime `.krn` artifacts are promoted as reviewed truth.
- Docs say Pending Review is an approval workflow or dashboard UI.

### 5. Final Audit, Commit, And Push - completed

Acceptance evidence:

```bash
pnpm typecheck
pnpm test
pnpm run eval:krn-pending-review-view-model
pnpm run krn -- eval
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
git push origin main
```

## Boundaries

In scope:

- proposal-store listing,
- typed Pending Review view model,
- dashboard overview pending count from proposal store,
- behavior tests,
- deterministic eval and aggregate eval integration,
- source/memory/goal docs.

Out of scope:

- `apps/dashboard` UI,
- proposal approval/rejection workflow,
- HTTP/API server,
- ChatGPT bridge,
- additional MCP tools,
- direct memory/source/goal mutation tools,
- destructive tools,
- productivity benchmark claims.

## Completion Criteria

This goal is complete only when:

- proposal-store records render as typed pending review rows,
- empty proposal store renders explicit zero state,
- invalid proposal files surface as invalid records,
- stale source refs block readiness,
- dashboard overview pending count uses proposal-store state,
- `pnpm typecheck` and relevant tests pass,
- `pnpm run eval:krn-pending-review-view-model` passes,
- `krn eval` includes the new eval module,
- source/memory/goal docs state exact claims and caveats,
- changes are committed semantically and pushed.

## Next Command

Resume parent [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md) with the next bounded Slice 3 child goal. Good candidates are `apps/dashboard` rendering over typed view models, proposal approval/rejection contracts, or benchmark/control-plane evidence.

Do not mark `goal-006` complete.
