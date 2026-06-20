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
| `explicit-live-runner-modes-available` | S009-S011, C052, C056 | Expose `live-smoke` and `live-full` as explicit commands while default eval remains fixture-only. | Live execution hides inside aggregate deterministic evals or exists only in docs. |
| `isolated-live-runner-policy-preserved` | S009, C048, C054-C058 | Require temporary Git worktrees, workspace-write sandboxing, bounded capture, foreground repair-state sync, progress logging, and resume-safe sequential workers. | Live coding tasks mutate the foreground checkout, test stale `HEAD`, or lack audit evidence. |
| `bounded-live-smoke-review-input-preserved` | S009, S013-S016, S088, C057-C058 | Keep the selected smoke review task bounded through registry-owned smoke task id and input fixture refs. | Workers receive open-ended review prompts and time out searching broad repo context. |
| `known-bad-registry-fails` | S013-S016, C052-C054 | Reject shallow default-live registry. | Bad arena registry passes. |
| `fixture-scoring-builds-benchmark-report` | S013-S016, S088, C053-C055 | Generate fixture_contract `KrnBenchmarkReport` scoring all 20 tasks. | Registry exists but scoring/report evidence is missing or overclaimed. |
| `known-bad-scoring-fixture-fails` | S013-S016, C052-C055 | Reject incomplete or lift-claiming scoring fixture. | Bad scoring input hides missing review burden or lift overclaim. |
| `live-runner-builds-smoke-report` | S009, S013-S016, S088, C053, C056-C058 | Capture isolated worker evidence and produce a live_codex_exec `KrnBenchmarkReport` without claiming lift. | Smoke evidence is missing, unparseable, or overclaimed as product lift. |
| `live-smoke-completes-bounded-review-task` | S009, S013-S016, S088, C057-C058 | Require the selected bounded smoke task to complete without failed workers while preserving no-lift status. | Green smoke shape evidence hides timeout fallback or failed selected workers. |
| `eval-report-preserves-registry-only-boundary` | S010-S016, C052-C055 | Caveat states registry and fixture-scoring readiness only. | Green fixture scoring eval is sold as live lift. |
