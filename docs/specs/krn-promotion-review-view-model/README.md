---
id: krn-promotion-review-view-model
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-014.md
  - docs/goals/goal-015.md
  - docs/product/final-product-plan.md
  - docs/specs/krn-proposal-promotion/README.md
  - docs/plans/canonical/SOURCES.md
---

# KRN Promotion Review View Model

## Purpose

`KrnPromotionReviewViewModel` is the dashboard-facing read model over `.krn/promotions`.

It lets humans inspect promotion records, referenced proposal/review state, source-ref health, and exact target-file status without exposing a dashboard promote/apply command.

## Public Interface

```ts
parseKrnPromotionReviewViewModel(input)
krnPromotionReviewViewModelJsonSchema
buildKrnPromotionReviewViewModel(targetRoot)
```

## Required Shape

Every Promotion Review view model includes:

- stable schema version,
- target root and generated timestamp,
- explicit `no_mock_state: true`,
- queue state,
- valid/invalid promotion counts,
- reference/source/target conflict counts,
- promotion rows with source refs, next action, failure mode, exact target path/hash, reference status, source-ref status, and target-file state,
- invalid promotion records,
- next allowed action,
- blocked dashboard/API/write actions,
- interpretation caveat.

## Boundary

Allowed behavior:

- read `.krn/promotions`,
- parse promotion records through `@krn/contracts`,
- check referenced proposal and approved review-decision records,
- check promotion source refs,
- check target file content against exact payload hash/content semantics,
- render dashboard review evidence.

Forbidden behavior:

- no dashboard promote/apply button,
- no target mutation,
- no inferred memory content,
- no HTTP/API write-route readiness claim,
- no ChatGPT connector claim,
- no human-review-quality or productivity-lift claim.

## Interpretation

A green Promotion Review view model means KRN can render auditable promotion-store state for humans.

It does not prove dashboard command readiness, broad promotion correctness, HTTP/API readiness, ChatGPT connector behavior, human review quality, safe overwrite semantics, or measured lift.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/promotion-review-view-model.test.ts
pnpm test -- packages/mcp/test/promotion-review-view-model.test.ts
pnpm run eval:krn-dashboard-promotion-review-ui
```
