---
id: krn-benchmark-reports-view-model-spec
kind: contract-spec
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-018.md
  - docs/goals/goal-019.md
  - docs/specs/krn-benchmark-report/README.md
---

# KRN Benchmark Reports View Model

`KrnBenchmarkReportsViewModel` is the dashboard-facing read model for benchmark reports under `.krn/benchmarks`.

It exists to make no-lift, negative-delta, repair-target, and lift-gate evidence reviewable without running benchmarks or claiming product lift.

## Contract

- `no_mock_state` must be `true`.
- `source` is one of:
  - `benchmark_report_store`
  - `missing_benchmark_reports`
  - `invalid_benchmark_reports`
- `queue_state` is one of:
  - `ready`
  - `empty`
  - `blocked`
- `reports` are copied from parsed `KrnBenchmarkReport` objects and enriched with owner, next action, failure mode, evidence refs, and repair targets.
- `dashboard_commands_enabled` must be `false`.
- Missing reports must render explicit empty state.
- Invalid reports must render blocked state.

## Interpretation

This view model proves only that KRN can render typed benchmark evidence for review. It does not prove measured productivity lift, benchmark statistical validity, repair-loop quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.
