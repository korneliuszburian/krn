---
id: krn-promotion-review-dashboard-surface
status: fact
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-014.md
  - docs/goals/goal-015.md
  - docs/specs/krn-promotion-review-view-model/README.md
  - docs/specs/krn-dashboard-data/README.md
  - docs/evals/krn-dashboard-promotion-review-ui/README.md
  - docs/plans/canonical/SOURCES.md
---

# KRN Promotion Review Dashboard Surface

## Status

[FACT] KRN has a typed Promotion Review dashboard surface over local `.krn/promotions` records.

## Useful Pattern

Promotion state is rendered as a read-only dashboard review surface:

```text
.krn/promotions
  -> KrnPromotionReviewViewModel
  -> KrnDashboardData
  -> apps/dashboard Promotion Review
  -> deterministic eval
```

The dashboard checks referenced proposal/review-decision records, source-ref health, and exact target-file state before rendering promotion rows.

## KRN Implication

Dashboard boot data is now a multi-view typed envelope instead of a single Pending Review object. Future dashboard views should join through `KrnDashboardData` and keep each view model independently parseable and falsifiable.

## Failure Mode

This becomes harmful if Promotion Review is overclaimed as a dashboard apply command, HTTP/API write route, ChatGPT connector behavior, broad promotion correctness, human review quality, safe overwrite semantics, or measured lift.

## Evidence

- `pnpm run eval:krn-dashboard-promotion-review-ui` generated `.krn/evals/krn-dashboard-promotion-review-ui/20260620T043648Z-2297921/report.json` with 5/5 cases and 19/19 assertions.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T043611Z-2296702/report.json` with 12/12 modules, 53/53 cases, and 161/161 assertions, including `krn-dashboard-promotion-review-ui`.

## Review Trigger

Revisit this note when KRN adds dashboard promote/apply commands, HTTP/API routes, ChatGPT connector behavior, broader proposal-kind promotion, overwrite semantics, or benchmark lift evidence.
