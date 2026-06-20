# OpenAI Cookbook Mapping

## Source Patterns

- S009 / Codex non-interactive mode: live `codex exec` is an explicit worker lane, not a default aggregate eval.
- S010 / Goals in Codex: readiness must be tied to evidence and constraints.
- S011 / ExecPlans: stability work remains restartable and bounded through `docs/goals/goal-027.md`.
- S013-S016 / repair and eval loops: dirty live evidence becomes a deterministic gate and next repair input.
- S088 / controlled experiment loop: separate measurement readiness from prompt tuning, suite expansion, and lift claims.

## Case Mapping

| Case | Source pattern | Mechanism | Failure mode |
|---|---|---|---|
| `known-bad-positive-status-rejected` | C047 | Reject failed-task positive-lift status at the report parser boundary. | Dirty positive evidence enters readiness classification as lift. |
| `dirty-live-report-blocks-expansion` | C046-C048 | Failed/blocked live tasks block expansion readiness even with positive deltas. | Baseline timeouts are mistaken for useful improvement. |
| `single-clean-live-report-stays-below-repeat-gate` | S010, S013-S014, C048 | One clean small run is clean evidence but not repeated stability or lift. | One green run becomes a breakthrough claim. |
| `repeated-clean-live-reports-enable-expansion-review-only` | S010-S011, S088, C048 | Repeated clean small runs can permit expansion review only. | Expansion readiness is confused with productivity lift. |
| `current-live-store-readiness` | C046-C048 | Local live reports become explicit readiness evidence. | Runtime state is ignored or overclaimed. |
| `eval-report-preserves-overclaim-boundary` | S010-S011, C047-C048 | Caveats preserve the gap between classification, live execution, and lift. | A green stability eval becomes command/lift readiness. |
