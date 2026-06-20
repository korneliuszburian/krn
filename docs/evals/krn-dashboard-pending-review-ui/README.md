---
id: krn-dashboard-pending-review-ui
kind: eval
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-012.md
  - docs/evals/STANDARD.md
  - docs/specs/krn-pending-review-view-model/README.md
  - https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex
  - https://developers.openai.com/cookbook/articles/codex_exec_plans
  - https://developers.openai.com/cookbook/examples/codex/code_modernization
---

# KRN Dashboard Pending Review UI Eval

This eval checks the first dashboard UI boundary:

```text
proposal-store records
  -> generated Pending Review dashboard data
  -> unknown-first app parser
  -> static render of the Pending Review UI
```

## Command

```bash
pnpm run eval:krn-dashboard-pending-review-ui
```

Runtime report:

```text
.krn/evals/krn-dashboard-pending-review-ui/{run_id}/report.json
```

## Cases

The eval covers:

- dashboard data generation from real proposal-store records,
- ready proposal row rendering with source refs, next action, and failure mode,
- explicit empty queue state,
- blocked invalid-record state,
- blocked stale-source-ref state.

## Interpretation

A passing run proves only that the first local dashboard UI can render typed Pending Review product objects without exposing mutation commands. It does not prove approval workflow quality, HTTP/API readiness, ChatGPT connector behavior, complete dashboard coverage, human review quality, or productivity lift.
