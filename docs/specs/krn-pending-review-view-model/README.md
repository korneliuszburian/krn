---
id: krn-pending-review-view-model
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-011.md
  - docs/product/final-product-plan.md
  - docs/specs/krn-control-plane-proposal/README.md
  - docs/specs/krn-dashboard-view-model/README.md
  - docs/plans/canonical/SOURCES.md
---

# KRN Pending Review View-Model Contract

## Purpose

`KrnPendingReviewViewModel` is the first dashboard-view contract over real proposal-store records.

It reads `.krn/proposals/**/proposal.json` records, parses them as `KrnControlPlaneProposal`, rechecks source refs, and exposes review rows for a future dashboard.

It is not a dashboard UI and not an approval workflow.

## Public Interface

```ts
parseKrnPendingReviewViewModel(input)
krnPendingReviewViewModelJsonSchema
buildKrnPendingReviewViewModel(targetRoot)
```

## Required Shape

The view model contains:

- explicit source: `proposal_store` or `explicit_zero_no_proposals`,
- queue state: `ready`, `empty`, or `blocked`,
- proposal rows from `.krn/proposals`,
- invalid proposal records,
- stale source-ref count,
- next allowed action,
- blocked actions,
- source refs,
- owner/action/failure mode for every proposal row,
- `no_mock_state: true`,
- interpretation caveat.

## Boundary

Allowed behavior:

- parse proposal-store records through `@krn/contracts`,
- render valid proposal records as pending review rows,
- surface invalid proposal files,
- surface stale source refs as blocked readiness,
- update dashboard overview counts from proposal-store state.

Forbidden behavior:

- no proposal approval or rejection,
- no target mutation,
- no memory/source/goal mutation,
- no UI rendering,
- no chat/transcript state,
- no mocked pending-review rows,
- no productivity or measured-lift claim.

## Interpretation

A green Pending Review view-model eval means KRN can produce typed dashboard input from local proposal-store records.

It does not prove dashboard UI readiness, human approval quality, HTTP/API readiness, ChatGPT connector behavior, target mutation safety beyond `.krn/proposals`, or productivity lift.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/pending-review-view-model.test.ts packages/mcp/test/pending-review-view-model.test.ts packages/mcp/test/dashboard-view-model.test.ts
pnpm run eval:krn-pending-review-view-model
pnpm typecheck
```
