# OpenAI Cookbook Mapping

## Source Patterns

- S009 / Codex non-interactive mode: live `codex exec` stays an explicit worker lane outside default deterministic evals.
- S010 / Goals in Codex: the arena contract names the current parent goal, latest child evidence, constraints, and overclaim boundary.
- S011 / ExecPlans: larger benchmark expansion must stay restartable with progress, resume, and explicit verification.
- S013-S016 / repair and eval loops: failures become deterministic regression cases and repair inputs before prompt or skill tuning.
- S088 / controlled experiment loop: baseline, fixed budget, metric, keep/discard, and stop reason are imported without importing open-ended autonomy.

## Case Mapping

| Case | Source pattern | Mechanism | Failure mode |
|---|---|---|---|
| `valid-arena-contract-parses` | S010-S011, C031, C052 | Anchor the next arena to parent goal and repeat-clean evidence. | Expansion drifts away from current goal truth. |
| `minimum-live-task-gate` | S009-S016, C050-C052 | Require 20 tasks before lift claims and keep `productivity_lift_claim_allowed` false. | Three-task repeat-clean evidence becomes a lift claim. |
| `quality-rubric-coverage` | S016, C053, LOCAL040 | Require coding-quality metrics, not only answer quality. | The suite rewards polished prose while missing bad diffs. |
| `pipeline-ergonomics-and-live-boundary` | S009, S011, S088, C048 | Keep live explicit and require resume/progress/smoke/full evidence lanes. | The arena becomes hidden-cost, non-resumable, or default-live. |
| `task-mix-requires-coding-work` | S016, C053 | Require implementation-heavy task families. | The arena tests only meta-planning. |
| `known-bad-overclaim-fixture-fails` | S013-S016, C052-C053 | Preserve a known-bad small-suite overclaim fixture. | A bad arena contract passes. |
| `eval-report-preserves-review-only-boundary` | S010-S016, C052-C053 | Caveat states contract readiness only. | A green contract gate is sold as implemented lift. |
