# OpenAI Cookbook Mapping

This eval uses Cookbook and Codex documentation as mechanisms, not citations.

| Source ID | Source | Mechanism extracted | KRN artifact |
|---|---|---|---|
| S009 | Codex non-interactive mode | Run worker tasks through `codex exec --json`, read-only sandboxing, schema-constrained final output, and captured traces. | `runCodexExec` live mode and runtime evidence refs. |
| S010 | Using Goals in Codex | A long-running slice names outcome, constraints, verification, boundaries, iteration policy, and blocked state. | [docs/goals/goal-020.md](../../goals/goal-020.md), [docs/goals/goal-022.md](../../goals/goal-022.md). |
| S011 | Codex ExecPlans | Multi-hour work is restartable from a living state file. | Goal file progress/evidence sections and exact commands. |
| S012 | Code modernization with Codex | Expand from a bounded pilot into a reusable template after validation/parity is explicit. | One-task pilot becomes `tasks.json` plus reusable scorer. |
| S014-S016 | Eval and improvement loops | Convert traces/failures into portable cases, metrics, assertions, and repair targets. | `cases.json`, fixture pairs, known-bad case, and `KrnBenchmarkReport.repair_targets`. |
| S087 | Related resources | Archived discovery index only; no direct adoption without mechanism extraction. | Explicit rejection of link-only pattern adoption. |
| S088 | Controlled experiment loop | Fixed tasks, baseline condition, assisted condition, fixed metric, keep/discard caveat. | Baseline-vs-assisted report with no lift claim below task gate. |

Repair-attempt extension:

- `goal-022` applies the same mapping after the no-lift record: one scoped repair, deterministic validate first, explicit live rerun second, before/after delta comparison, no productivity-lift claim.

## Failure Modes

- Link-list failure: adding Cookbook links without a concrete parser, scorer, report, or eval case.
- Autonomy failure: treating `codex exec` as a continuous goal loop instead of an explicit worker lane.
- Lift overclaim: treating fixture deltas or three live tasks as measured productivity lift.
- Dashboard drift: adding more UI before expanding the measurement surface.
