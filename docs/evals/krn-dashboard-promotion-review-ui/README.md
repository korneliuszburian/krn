---
id: krn-dashboard-promotion-review-ui
kind: eval-module
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-014.md
  - docs/goals/goal-015.md
  - docs/specs/krn-promotion-review-view-model/README.md
  - docs/evals/STANDARD.md
---

# KRN Dashboard Promotion Review UI Eval

## Purpose

Validate that the local dashboard can render Promotion Review from typed `.krn/promotions` product objects without exposing dashboard apply/promote/write commands.

## Command

```bash
pnpm run eval:krn-dashboard-promotion-review-ui
```

## Cases

The module checks:

- dashboard data generation includes Promotion Review from real promotion-store records,
- promotion rows render audit evidence,
- empty promotion stores render explicit zero state,
- invalid promotion records render blocked state,
- target drift renders blocked state.

## Interpretation

A green result means the dashboard can render promotion ledger review evidence from typed product objects.

It does not prove dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, broad promotion correctness, safe overwrite semantics, or measured lift.
