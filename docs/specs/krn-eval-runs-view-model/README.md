---
id: krn-eval-runs-view-model-spec
kind: contract-spec
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-016.md
  - docs/specs/krn-eval/README.md
---

# KRN Eval Runs View Model

`KrnEvalRunsViewModel` is the dashboard-facing read model for the latest aggregate `krn eval` report under `.krn/eval`.

It exists to show eval health as review evidence, not as productivity proof.

## Contract

- `no_mock_state` must be `true`.
- `source` is one of:
  - `eval_report`
  - `missing_eval_report`
  - `invalid_eval_report`
- `eval_state` is one of:
  - `ready`
  - `empty`
  - `blocked`
- `modules` are copied from the parsed `KrnEvalReport` and enriched with owner, next action, failure mode, and caveat.
- `productivity_lift_claimed` must be `false`.
- `dashboard_commands_enabled` must be `false`.
- `benchmark_lift_status` must be `not_measured`.

## Interpretation

This view model proves only that the dashboard can render typed eval-run state. It does not prove benchmark lift, human review quality, repair-loop quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or productivity improvement.
