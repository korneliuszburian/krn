---
id: krn-dashboard-data
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-012.md
  - docs/goals/goal-015.md
  - docs/specs/krn-pending-review-view-model/README.md
  - docs/specs/krn-promotion-review-view-model/README.md
---

# KRN Dashboard Data Contract

## Purpose

`KrnDashboardData` is the generated dashboard input envelope. It groups independently typed dashboard view models under one parsed file so the frontend does not invent state from chat, props, or mocks.

## Public Interface

```ts
parseKrnDashboardData(input)
krnDashboardDataJsonSchema
pnpm --filter @krn/dashboard data
```

## Current Views

- `pending_review`: `KrnPendingReviewViewModel`
- `promotion_review`: `KrnPromotionReviewViewModel`

## Boundary

Allowed behavior:

- generate one JSON file from typed view-model builders,
- parse every view through `@krn/contracts`,
- require all child view models to use the same target root.

Forbidden behavior:

- no mocked dashboard state,
- no dashboard write command,
- no proposal approval,
- no promotion apply command,
- no productivity or human-review-quality claim.

## Interpretation

A green dashboard-data parse proves the dashboard boot data is typed and internally aligned.

It does not prove dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or measured lift.
