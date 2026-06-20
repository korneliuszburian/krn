---
id: krn-pending-review-view-model
kind: eval-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/evals/STANDARD.md
  - docs/goals/goal-006.md
  - docs/goals/goal-011.md
  - docs/specs/krn-pending-review-view-model/README.md
  - docs/specs/krn-control-plane-proposal/README.md
  - docs/plans/canonical/SOURCES.md
---

# KRN Pending Review View-Model Eval

## Purpose

Validate the first dashboard Pending Review view model over real proposal-store records.

The eval proves that `.krn/proposals` records can drive a typed dashboard input without approval actions, UI mock state, or hidden chat state.

## Command

```bash
pnpm run eval:krn-pending-review-view-model
```

Runtime output:

```text
.krn/evals/krn-pending-review-view-model/{run_id}/report.json
```

## Interpretation

A green result proves only the local Pending Review view-model boundary:

- valid proposal-store records render as pending rows,
- empty proposal store renders explicit zero state,
- invalid proposal files are surfaced,
- stale source refs block readiness,
- the generated object parses through `@krn/contracts`.

It does not prove dashboard UI readiness, human approval quality, HTTP/API readiness, ChatGPT connector behavior, target mutation safety beyond `.krn/proposals`, or productivity lift.
