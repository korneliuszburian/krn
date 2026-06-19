---
id: krn-proposal-store-eval
kind: eval-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/evals/STANDARD.md
  - docs/goals/goal-006.md
  - docs/specs/krn-control-plane-proposal/README.md
  - docs/plans/canonical/SOURCES.md
---

# KRN Proposal Store Eval

## Purpose

Validate the first source-backed, append-only proposal persistence boundary before any MCP/API proposal tool is registered.

This eval exists to prevent proposal objects from becoming decorative JSON. A proposal must keep source refs grounded in local files or the canonical source ledger, and persistence must be append-only and idempotent under `.krn/proposals`.

## Command

```bash
pnpm run eval:krn-proposal-store
```

Runtime output:

```text
.krn/evals/krn-proposal-store/{run_id}/report.json
```

## Interpretation

A green result proves only the local proposal-store boundary:

- valid source refs resolve to existing target-root files or `docs/plans/canonical/SOURCES.md`,
- proposals persist under `.krn/proposals`,
- repeated identical idempotency keys do not rewrite or duplicate,
- conflicting idempotency keys and unbacked source refs are rejected,
- target path traversal is rejected before persistence.

It does not prove MCP/API tool safety, human approval quality, dashboard readiness, ChatGPT connector behavior, or productivity lift.
