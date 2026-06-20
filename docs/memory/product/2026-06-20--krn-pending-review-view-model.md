---
id: krn-pending-review-view-model
status: fact
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-011.md
  - docs/specs/krn-pending-review-view-model/README.md
  - docs/evals/krn-pending-review-view-model/README.md
  - docs/specs/krn-control-plane-proposal/README.md
  - packages/contracts/src/pending-review-view-model.ts
  - packages/mcp/src/pending-review-view-model.ts
---

# KRN Pending Review View Model

## Status

[FACT] KRN now has a typed Pending Review view model over local proposal-store records under `.krn/proposals`.

## Useful Pattern

Pending Review uses the proposal store as the source of truth:

```text
.krn/proposals/**/proposal.json
  -> KrnControlPlaneProposal parser
  -> source-ref revalidation
  -> KrnPendingReviewViewModel
  -> dashboard overview pending count
```

The view model surfaces invalid proposal files and stale source refs instead of hiding them or counting them as ready.

## KRN Implication

Dashboard work can now consume a real queue object instead of reading chat state, snapshots, or the latest `krn review` report as the Pending Review source.

Future `apps/dashboard` work must use `KrnPendingReviewViewModel` or preserve the same semantics: no mock state, no approval, no target mutation, owner/action/failure mode on rows, and explicit blocked state for invalid or stale records.

## Evidence

- `pnpm exec vitest run packages/contracts/test/pending-review-view-model.test.ts packages/contracts/test/dashboard-view-model.test.ts packages/contracts/test/eval-report.test.ts packages/mcp/test/pending-review-view-model.test.ts packages/mcp/test/dashboard-view-model.test.ts packages/mcp/test/proposal-store.test.ts packages/cli/test/eval.test.ts` passed with 7 files and 22 tests.
- `pnpm run eval:krn-pending-review-view-model` generated `.krn/evals/krn-pending-review-view-model/20260620T002555Z-1998197/report.json` with 4/4 cases and 14/14 assertions.
- `pnpm run krn -- eval` generated `.krn/eval/20260620T002555Z-1998210/report.json` with 8/8 modules, 28/28 cases, and 76/76 assertions.

## Failure Mode

This becomes harmful if overclaimed as:

- dashboard UI readiness,
- proposal approval/rejection workflow,
- safe target mutation,
- HTTP/API or ChatGPT connector readiness,
- productivity or benchmark lift.

It also becomes harmful if a future UI bypasses source-ref revalidation or renders invalid proposal records as normal pending work.

## Review Trigger

Revisit this note when:

- `apps/dashboard` starts rendering Pending Review,
- proposal approval/rejection contracts are added,
- HTTP/API transport is added,
- another proposal record type is added,
- source refs gain line-level or source-section-level validation,
- benchmark work starts measuring baseline Codex vs KRN-assisted Codex.
