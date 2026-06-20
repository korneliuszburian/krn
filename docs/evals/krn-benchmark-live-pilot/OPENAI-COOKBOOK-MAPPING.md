# OpenAI Cookbook Mapping

## Source Patterns

- S009 / Codex non-interactive mode: scripted worker runs should use explicit sandbox settings and capture machine-readable output.
- S010 / Goals in Codex, https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex: completion remains evidence-based with explicit constraints and blocked conditions.
- S011 / ExecPlans, https://developers.openai.com/cookbook/articles/codex_exec_plans: this live benchmark pilot is restartable through `docs/goals/goal-018.md`.
- S012 / Code modernization, https://developers.openai.com/cookbook/examples/codex/code_modernization: run one bounded pilot before broadening the benchmark suite.
- S014-S016 / eval and improvement loops: traces become deterministic scoring and repair targets.
- S087 / Related resources, https://developers.openai.com/cookbook/articles/related_resources: archived discovery list only; candidate tools or papers must still be promoted through primary-source inspection and mechanism extraction.
- S088 / fixed-budget metric loop: compare baseline and assisted variants on a fixed task before keep/repair decisions.

## Case Mapping

| Case | Source pattern | Mechanism | Failure mode |
|---|---|---|---|
| `fixture-scorer-distinguishes-assisted` | S014-S016 | Validate scorer behavior without spending live model budget. | Scorer cannot distinguish source-grounded behavior. |
| `known-bad-output-fails` | C023, C039 | Penalize unsupported productivity claims and missing overclaim boundaries. | Eval rewards slop or lift claims. |
| `live-report-shape` | S009, S088 | Run baseline and assisted Codex worker calls and store typed evidence. | Live output remains untyped or unreviewable. |
| `live-overclaim-boundary` | S010, C039 | Keep one-task live pilot caveated and below lift gate. | Pilot is sold as measured productivity lift. |

## Enforcement Rule

These Cookbook links are not stored as passive reading material. Each promoted pattern must become at least one of: a goal constraint, runner behavior, schema requirement, eval assertion, repair target, or overclaim boundary. `related_resources` is intentionally weaker than the other three links and cannot justify a product decision without a primary source or local evidence.
