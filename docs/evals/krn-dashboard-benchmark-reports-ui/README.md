---
id: krn-dashboard-benchmark-reports-ui
kind: eval-module
status: active
owner: krn
updated: 2026-06-20
runner: packages/evals/src/validate-krn-dashboard-benchmark-reports-ui.ts
---

# KRN Dashboard Benchmark Reports UI Eval

## Purpose

This eval verifies the dashboard Benchmark Reports surface:

```text
.krn/benchmarks/**/report.json -> KrnBenchmarkReportsViewModel -> KrnDashboardData -> apps/dashboard Benchmark Reports
```

It does not run benchmarks, claim productivity lift, prove benchmark statistical validity, expose dashboard commands, or prove HTTP/API/ChatGPT connector readiness.

## What This Tests

- Dashboard data generation includes a parsed Benchmark Reports view model from a real benchmark report file.
- A negative-delta live benchmark report stays visible as no-lift evidence.
- Missing benchmark reports render explicit empty state.
- Invalid benchmark report files render blocked state.
- UI does not expose run, repair, write, or lift-claim command names.

## Command

```bash
pnpm run eval:krn-dashboard-benchmark-reports-ui
```

## Runtime Output

```text
.krn/evals/krn-dashboard-benchmark-reports-ui/{run_id}/report.json
```

Runtime outputs stay local. Reviewed durable lessons move to `docs/memory`.

## Interpretation Policy

A green run means the local dashboard can render typed Benchmark Reports product objects from parsed local benchmark reports. It does not prove measured productivity lift, benchmark statistical validity, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, or human review quality.
