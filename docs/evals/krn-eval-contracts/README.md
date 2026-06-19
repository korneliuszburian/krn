---
id: krn-eval-contracts
kind: eval-module
status: active
owner: krn
updated: 2026-06-19
runner: packages/evals/src/validate-krn-eval.ts
---

# KRN Eval Contracts Eval

## Purpose

This eval verifies the third Slice 2 runtime path:

```text
KrnEvalReport parser -> krn eval -> aggregate runtime eval report -> eval report
```

It does not claim productivity lift, benchmark lift, hook semantic correctness, API/MCP readiness, dashboard readiness, or human review quality.

## What This Tests

- The valid `krn-eval` fixture parses through `@krn/contracts`.
- The known-bad fixture fails deterministically.
- The CLI-generated aggregate eval report exists, parses through `@krn/contracts`, and includes `krn-init-contracts`, `krn-doctor-contracts`, and `krn-review-contracts`.
- The eval writes a machine-readable report under `.krn/evals/krn-eval-contracts/{run_id}/report.json`.

## Command

```bash
pnpm run eval:krn-eval
```

## Runtime Output

```text
.krn/evals/krn-eval-contracts/{run_id}/report.json
```

Runtime outputs stay local. Reviewed durable lessons move to `docs/memory`.

## Interpretation Policy

A green run means `krn eval` can execute and aggregate deterministic local eval modules. It does not mean the selected modules prove product quality or productivity lift.
