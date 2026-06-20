---
id: krn-benchmark-reports-control-plane-surface
status: fact
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-019.md
  - docs/specs/krn-benchmark-report/README.md
  - docs/specs/krn-benchmark-reports-view-model/README.md
  - docs/evals/krn-dashboard-benchmark-reports-ui/README.md
  - docs/plans/canonical/SOURCES.md
  - .krn/evals/krn-dashboard-benchmark-reports-ui/20260620T063805Z-2567754/report.json
  - .krn/eval/20260620T063841Z-2568949/report.json
---

# KRN Benchmark Reports Control-Plane Surface

## Status

[FACT] KRN can render parsed local benchmark reports as a read-only MCP/dashboard control-plane surface.

## Useful Pattern

Benchmark report review now follows this path:

```text
.krn/benchmarks/**/report.json
  -> KrnBenchmarkReport parser
  -> KrnBenchmarkReportsViewModel
  -> krn://runtime/benchmark/latest read-only MCP resource
  -> KrnDashboardData.benchmark_reports
  -> apps/dashboard Benchmark Reports
  -> krn-dashboard-benchmark-reports-ui eval
```

The view model carries ready, empty, blocked, invalid, no-lift, negative-delta, lift-claim, repair-target, next-action, source-ref, and failure-mode state. The dashboard renders those states without run, repair, write, or lift-claim command names.

## KRN Implication

Benchmark evidence is now reviewable before KRN adds any benchmark command surface. A one-task negative live pilot can be seen in the dashboard/control plane as no-lift evidence, not hidden in `.krn/benchmarks` and not promoted into a productivity claim.

This completes the safe read-only surface after the benchmark report spine and first live `codex exec` pilot. The next benchmark work should expand the suite or improve the assisted path, but productivity lift remains unproven until a larger suite passes the benchmark lift gate.

## Failure Mode

This becomes harmful if Benchmark Reports is treated as proof of measured productivity lift, benchmark statistical validity, repair-loop quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

## Evidence

- `pnpm run eval:krn-dashboard-benchmark-reports-ui` generated `.krn/evals/krn-dashboard-benchmark-reports-ui/20260620T063805Z-2567754/report.json` with 5/5 cases and 28/28 assertions.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T063841Z-2568949/report.json` with 15/15 modules, 67/67 cases, and 224/224 assertions.
- `pnpm test` passed with 30/30 test files and 100/100 tests.
- `pnpm typecheck` passed.

## Review Trigger

Revisit this note when a `krn benchmark` command is added, dashboard benchmark run/repair actions are proposed, HTTP/API/ChatGPT benchmark surfaces are introduced, the benchmark lift gate changes, or a larger live benchmark suite produces positive lift evidence.
