---
id: krn-dashboard-view-model-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-008.md
  - docs/product/final-product-plan.md
  - docs/specs/technology-stack/decision.md
  - docs/specs/krn-mcp-read-model/README.md
  - docs/specs/krn-control-plane-proposal/README.md
---

# KRN Dashboard View-Model Contract

## Purpose

`KrnDashboardViewModel` is the first Slice 3 dashboard contract. It gives a future dashboard one typed source object before any UI exists.

The view model is generated from real KRN runtime/control-plane objects. It must not read chat state, invent metrics, or use mocked dashboard state.

## Public Interface

```ts
parseKrnDashboardViewModel(input)
krnDashboardViewModelJsonSchema
buildKrnDashboardViewModel(targetRoot)
```

## Required Shape

The first view model contains:

- resource health,
- latest runtime artifacts,
- benchmark report runtime artifact,
- pending review count from `.krn/proposals` or explicit zero when no proposal records exist,
- next allowed action,
- source refs,
- owner/action/failure mode for each displayed metric,
- `no_mock_state: true`,
- interpretation caveat.

## Boundary

Allowed behavior:

- parse dashboard view-model objects through `@krn/contracts`,
- build the view model from `packages/mcp` read-only resources,
- expose real runtime artifact health and proposal-store pending review count.

Forbidden behavior:

- no dashboard UI in this slice,
- no mocked metrics,
- no chat/transcript state,
- no hidden proposal store,
- no memory/source/goal mutation,
- no productivity or measured-lift claim.

## Interpretation

A green dashboard view-model result means KRN can produce typed dashboard input from real runtime/control-plane objects and proposal-store pending-review state.

It does not prove dashboard UI readiness, user experience quality, proposal-tool safety, human approval quality, ChatGPT connector behavior, or productivity lift.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/dashboard-view-model.test.ts packages/mcp/test/dashboard-view-model.test.ts packages/mcp/test/read-model.test.ts
pnpm typecheck
```
