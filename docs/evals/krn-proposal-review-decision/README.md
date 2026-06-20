---
id: krn-proposal-review-decision-eval
kind: eval-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/evals/STANDARD.md
  - docs/goals/goal-006.md
  - docs/goals/goal-013.md
  - docs/specs/krn-proposal-review-decision/README.md
  - docs/specs/krn-pending-review-view-model/README.md
  - docs/plans/canonical/SOURCES.md
---

# KRN Proposal Review Decision Eval

## Purpose

Validate the first typed append-only proposal review decision ledger.

This eval exists to prevent review state from becoming a chat note, dashboard snapshot, or in-place proposal mutation. A review decision must reference an existing proposal, validate source refs, persist idempotently under `.krn/proposal-reviews`, and update Pending Review without implying promotion.

## Command

```bash
pnpm run eval:krn-proposal-review-decision
```

Runtime output:

```text
.krn/evals/krn-proposal-review-decision/{run_id}/report.json
```

## Interpretation

A green result proves only the local proposal review decision boundary:

- valid and known-bad decision fixtures behave correctly,
- decisions persist under `.krn/proposal-reviews`,
- repeated identical idempotency keys do not rewrite or duplicate,
- missing proposals are rejected,
- conflicting terminal decisions are rejected,
- Pending Review excludes valid reviewed proposals,
- invalid review decision records block readiness,
- manually conflicting review decision records block readiness.

It does not prove promotion correctness, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or productivity lift.
