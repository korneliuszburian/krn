# OpenAI Cookbook Mapping

This eval uses Cookbook and Codex documentation as mechanisms, not citations.

| Source ID | Source | Mechanism extracted | KRN artifact |
|---|---|---|---|
| S009 | Codex non-interactive mode | Run worker tasks through `codex exec --json`, read-only sandboxing, schema-constrained final output, and captured traces. | `runCodexExec` live mode and runtime evidence refs. |
| S010 | Using Goals in Codex | A long-running slice names outcome, constraints, verification, boundaries, iteration policy, and blocked state. | [docs/goals/goal-020.md](../../goals/goal-020.md), [docs/goals/goal-022.md](../../goals/goal-022.md), [docs/goals/goal-023.md](../../goals/goal-023.md), [docs/goals/goal-026.md](../../goals/goal-026.md), [docs/goals/goal-028.md](../../goals/goal-028.md). |
| S011 | Codex ExecPlans | Multi-hour work is restartable from a living state file. | Goal file progress/evidence sections and exact commands. |
| S012 | Code modernization with Codex | Expand from a bounded pilot into a reusable template after validation/parity is explicit. | One-task pilot becomes `tasks.json` plus reusable scorer. |
| S014-S016 | Eval and improvement loops | Convert traces/failures into portable cases, metrics, assertions, and repair targets. | `cases.json`, fixture pairs, known-bad case, and `KrnBenchmarkReport.repair_targets`. |
| S087 | Related resources | Archived discovery index only; no direct adoption without mechanism extraction. | Explicit rejection of link-only pattern adoption. |
| S088 | Controlled experiment loop | Fixed tasks, baseline condition, assisted condition, fixed metric, keep/discard caveat. | Baseline-vs-assisted report with no lift claim below task gate. |

Repair-attempt extension:

- `goal-022` applies the same mapping after the no-lift record: one scoped repair, deterministic validate first, explicit live rerun second, before/after delta comparison, no productivity-lift claim.
- `goal-023` repeats the mapping for the assisted prompt-load timeout: one scoped runner prompt repair, deterministic validate first, explicit live rerun second, before/after delta comparison, no productivity-lift claim.
- `goal-026` turns the next repair into a deterministic registry/policy gate: task-owned current child context, superseded latest-child refs, sequential worker policy, max concurrency 1, typed timeout, and no lift claim.
- `goal-028` applies the same repair-loop mapping to observed live-runner defects: `ENOBUFS` output capture and timeout-prone baseline scope become typed policy plus explicit validate/live rerun evidence.

## Failure Modes

- Link-list failure: adding Cookbook links without a concrete parser, scorer, report, or eval case.
- Autonomy failure: treating `codex exec` as a continuous goal loop instead of an explicit worker lane.
- Lift overclaim: treating fixture deltas or three live tasks as measured productivity lift.
- Dashboard drift: adding more UI before expanding the measurement surface.
- Prompt-load drift: adding broader assisted read instructions after a timeout instead of reducing task-owned context and measuring the delta.
- Stale-context drift: letting old child goals remain "latest" in task fixtures or assisted guidance after a newer repair goal is active.
- Hidden-runner-policy drift: keeping timeout/concurrency behavior in runner code only instead of making it typed registry data.
- Hidden-output-capture drift: keeping `spawnSync` output buffer limits in runner defaults until `ENOBUFS` failures distort benchmark evidence.
