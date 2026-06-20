---
id: krn-dashboard-eval-runs-ui
kind: eval-module
status: active
owner: krn
updated: 2026-06-20
runner: packages/evals/src/validate-krn-dashboard-eval-runs-ui.ts
---

# KRN Dashboard Eval Runs UI Eval

## Purpose

This eval verifies the first dashboard Eval Runs surface:

```text
.krn/eval/latest report -> KrnEvalRunsViewModel -> KrnDashboardData -> apps/dashboard Eval Runs
```

It does not claim benchmark lift, productivity lift, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, or dashboard command readiness.

## What This Tests

- Dashboard data generation includes a parsed Eval Runs view model from a real aggregate eval report.
- Eval module rows render owner/source/action/failure-mode evidence.
- Missing aggregate eval state renders explicit empty state.
- Invalid latest aggregate eval report renders blocked state.
- Failed module state renders blocked state.
- UI does not expose lift, rerun, auto-repair, or write command names.

## Command

```bash
pnpm run eval:krn-dashboard-eval-runs-ui
```

## Runtime Output

```text
.krn/evals/krn-dashboard-eval-runs-ui/{run_id}/report.json
```

Runtime outputs stay local. Reviewed durable lessons move to `docs/memory`.

## Interpretation Policy

A green run means the local dashboard can render typed Eval Runs product objects. It does not prove benchmark lift, productivity improvement, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, or human review quality.
