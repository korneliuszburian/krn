---
id: krn-eval-contracts
kind: eval-module
status: active
owner: krn
updated: 2026-06-20
runner: packages/evals/src/validate-krn-eval.ts
---

# KRN Eval Contracts Eval

## Purpose

This eval verifies the lane-aware `krn eval` runtime path:

```text
KrnEvalReport parser -> krn eval lane selection -> aggregate runtime eval report -> eval report
```

It does not claim productivity lift, benchmark lift, hook semantic correctness, API/MCP readiness, complete dashboard readiness, or human review quality.

## What This Tests

- The typed eval module registry parses through `@krn/contracts` and rejects duplicate module IDs.
- The valid `krn-eval` fixture parses through `@krn/contracts`.
- The known-bad fixture fails deterministically.
- The known-bad excluded-lane fixture fails deterministically.
- The CLI-generated default `krn eval` report exists, parses through `@krn/contracts`, includes only `core` plus `current` modules, and excludes `lab`.
- Explicit `--module krn-research-pack` still works and emits a `custom` report with a lab module only because it was directly requested.
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

A green run means `krn eval` can execute and aggregate deterministic local eval modules through lane-aware routing. It does not mean the selected modules prove product quality or productivity lift.
