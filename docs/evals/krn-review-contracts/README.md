---
id: krn-review-contracts
kind: eval-module
status: active
owner: krn
updated: 2026-06-19
runner: packages/evals/src/validate-krn-review.ts
---

# KRN Review Contracts Eval

## Purpose

This eval verifies the fourth Slice 2 runtime path:

```text
KrnReviewReport parser -> krn review -> proposal-only runtime review report -> eval report
```

It does not claim human approval, productivity lift, benchmark lift, API/MCP readiness, dashboard readiness, or human review quality.

## What This Tests

- The valid `krn-review` fixture parses through `@krn/contracts`.
- The known-bad fixture fails deterministically.
- The CLI-generated review report exists, parses through `@krn/contracts`, includes the required runtime artifacts, and keeps every proposal in `proposal_only` state.
- The eval writes a machine-readable report under `.krn/evals/krn-review-contracts/{run_id}/report.json`.

## Command

```bash
pnpm run eval:krn-review
```

## Runtime Output

```text
.krn/evals/krn-review-contracts/{run_id}/report.json
```

Runtime outputs stay local. Reviewed durable lessons move to `docs/memory`.

## Interpretation Policy

A green run means `krn review` can emit a proposal-only review report over typed local artifacts. It does not approve those proposals or prove the later control plane.
