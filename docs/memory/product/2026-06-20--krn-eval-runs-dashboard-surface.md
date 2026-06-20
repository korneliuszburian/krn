---
id: krn-eval-runs-dashboard-surface
status: fact
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-016.md
  - docs/specs/krn-eval-runs-view-model/README.md
  - docs/specs/krn-dashboard-data/README.md
  - docs/evals/krn-dashboard-eval-runs-ui/README.md
  - docs/plans/canonical/SOURCES.md
---

# KRN Eval Runs Dashboard Surface

## Status

[FACT] KRN has a typed Eval Runs dashboard surface over the latest local aggregate `.krn/eval/**/report.json`.

## Useful Pattern

Eval state is rendered as read-only dashboard review evidence:

```text
.krn/eval latest aggregate report
  -> KrnEvalRunsViewModel
  -> KrnDashboardData
  -> apps/dashboard Eval Runs
  -> deterministic eval
```

The builder parses the aggregate report through `KrnEvalReport` before converting it into dashboard data. Missing, invalid, and failed-module states stay explicit instead of being hidden behind a green or empty UI.

## KRN Implication

Dashboard review now covers eval health from real product objects without adding rerun, repair, write, or benchmark-lift commands. Future dashboard command surfaces should be proposal-backed and separately evaluated; a green Eval Runs dashboard is not permission to add destructive controls.

## Failure Mode

This becomes harmful if Eval Runs is overclaimed as benchmark lift, productivity improvement, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, human review quality, or dashboard command readiness.

## Evidence

- `pnpm run eval:krn-dashboard-eval-runs-ui` generated `.krn/evals/krn-dashboard-eval-runs-ui/20260620T051305Z-2375941/report.json` with 5/5 cases and 20/20 assertions.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T051314Z-2376293/report.json` with 13/13 modules, 58/58 cases, and 181/181 assertions, including `krn-dashboard-eval-runs-ui`.

## Review Trigger

Revisit this note when KRN adds dashboard rerun or repair commands, benchmark reports, HTTP/API eval resources, ChatGPT connector behavior, human-review quality metrics, or new aggregate eval report fields.
