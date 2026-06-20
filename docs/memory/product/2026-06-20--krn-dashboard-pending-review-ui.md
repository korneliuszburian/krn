---
id: krn-dashboard-pending-review-ui
status: fact
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-012.md
  - docs/evals/krn-dashboard-pending-review-ui/README.md
  - docs/specs/krn-pending-review-view-model/README.md
  - apps/dashboard/src/PendingReviewDashboard.tsx
  - apps/dashboard/scripts/write-dashboard-data.ts
---

# KRN Dashboard Pending Review UI

## Status

[FACT] KRN now has the first `apps/dashboard` surface for Pending Review.

## Useful Pattern

The dashboard UI is a typed consumer, not a state owner:

```text
.krn/proposals
  -> buildKrnPendingReviewViewModel
  -> generated krn-dashboard-data.json
  -> parseKrnPendingReviewViewModel in the app
  -> Pending Review UI rows
```

Generated dashboard data is ignored by git. It is runtime input for the app, not reviewed durable truth.

## KRN Implication

The dashboard can now render real Pending Review product objects before approval/rejection mutation exists. Each rendered row preserves owner, source refs, next action, and failure mode. Empty, invalid-record, and stale-source-ref states are visible instead of being hidden behind a pretty empty UI.

This is the correct next layer after `KrnPendingReviewViewModel`; it does not replace the proposal store, source ledger, memory review, or eval reports.

## Evidence

- `pnpm --filter @krn/dashboard typecheck` passed.
- `pnpm --filter @krn/dashboard test` passed with 1 file and 4 tests.
- `pnpm --filter @krn/dashboard build` passed and generated a Vite production build from generated dashboard data.
- `pnpm run eval:krn-dashboard-pending-review-ui` generated `.krn/evals/krn-dashboard-pending-review-ui/20260620T005027Z-2048035/report.json` with 5/5 cases and 19/19 assertions.
- `pnpm run krn -- eval` generated `.krn/eval/20260620T005117Z-2051988/report.json` with 9/9 modules, 33/33 cases, and 95/95 assertions.

## Failure Mode

This becomes harmful if overclaimed as:

- approval/rejection workflow,
- complete dashboard coverage,
- human review quality,
- HTTP/API or ChatGPT connector readiness,
- target mutation safety beyond `.krn/proposals`,
- productivity or benchmark lift.

It also becomes harmful if future dashboard views bypass contract parsers, commit generated data as durable truth, or add mutation buttons before approval/rejection contracts exist.

## Review Trigger

Revisit this note when:

- proposal approval/rejection contracts are added,
- another dashboard view is implemented,
- dashboard data moves from generated static JSON to HTTP/API,
- dashboard events become proposal records,
- benchmark work starts measuring baseline Codex vs KRN-assisted Codex.
