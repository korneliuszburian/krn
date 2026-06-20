# OpenAI Cookbook Mapping

## Source Patterns

- S010 / Goals in Codex: completion must be tied to evidence and constraints, not plausible progress.
- S011 / ExecPlans: the slice is restartable and evidence-driven through `docs/goals/goal-016.md`.
- S012 / Code modernization: Eval Runs is a bounded dashboard pilot before benchmark or command surfaces.
- S014-S016 / eval and improvement loops: eval evidence must remain deterministic and caveated before repair or improvement claims.

## Case Mapping

| Case | Source pattern | Mechanism | Failure mode |
|---|---|---|---|
| `dashboard-data-generation-includes-eval-runs` | S010-S012, C010, C023 | Generate dashboard boot data from real `KrnEvalReport` state. | Dashboard uses mocks or omits eval health. |
| `eval-module-row-renders-evidence` | S014-S016, C010 | Render module owner, source refs, next action, failure mode, and caveat. | Eval rows become vanity metrics. |
| `missing-eval-report-renders-explicit-empty` | S010, C023 | Missing eval report is explicit state, not hidden success. | Dashboard invents eval evidence. |
| `invalid-eval-report-renders-blocked` | S014, C023 | Invalid aggregate report blocks trust. | Unparseable reports are presented as valid. |
| `failed-module-renders-blocked` | S013-S016 | Failed modules route to repair record, not prompt churn or lift claim. | Failures are hidden or overclaimed as improvement. |
