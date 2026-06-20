# OpenAI Cookbook Mapping

## Source Patterns

- S009 / Codex non-interactive mode: live `codex exec` remains explicit and outside default deterministic `krn eval`.
- S010 / Goals in Codex: the registry is tied to parent goal, current child goal, prior child evidence, constraints, and overclaim boundary.
- S011 / ExecPlans: larger benchmark work needs restartable state before live execution.
- S013-S016 / repair and eval loops: registry checks cover routes, task families, metrics, and changing conditions before prompt tuning.
- S088 / controlled experiment loop: the arena defines fixed tasks and metrics before running expensive worker loops.

## Case Mapping

| Case | Source pattern | Mechanism | Failure mode |
|---|---|---|---|
| `expanded-arena-registry-parses` | S010-S011, C031, C054 | Parse a goal-bound 20-task registry. | Arena becomes an unanchored prompt list. |
| `twenty-task-lift-gate` | S009-S016, C050-C054 | Enforce 20 unique tasks and lift gate. | Small suite is overclaimed as expanded arena. |
| `task-mix-covers-coding-work` | S016, C053-C054 | Require implementation, debugging, refactor, review, continuity, and repair tasks. | Arena measures only planning answers. |
| `quality-rubric-per-task` | S016, C053-C054, LOCAL040 | Require coding-quality metrics per task. | Human review burden and bad diffs are invisible. |
| `pipeline-and-live-boundary-preserved` | S009, S011, S088, C048, C054 | Keep live explicit and require resumable lanes. | Larger arena becomes hidden-cost or non-resumable. |
| `known-bad-registry-fails` | S013-S016, C052-C054 | Reject shallow default-live registry. | Bad arena registry passes. |
| `eval-report-preserves-registry-only-boundary` | S010-S016, C052-C054 | Caveat states registry-only readiness. | Green registry eval is sold as live lift. |
