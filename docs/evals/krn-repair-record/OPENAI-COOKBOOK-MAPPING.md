# OpenAI Cookbook Mapping

This eval applies the repair-loop and eval migration mechanisms already recorded in `docs/plans/canonical/SOURCES.md`:

- S013: keep failure source, repair attempt, validator result, and stop reason separate.
- S014: keep portable deterministic eval cases near code before claiming runtime behavior.
- S015: convert real trace/benchmark feedback into eval definitions and repair handoffs.
- S016: measure workflow behavior and changing conditions, not only final answer quality.
- S088: record baseline, assisted condition, metric delta, keep/repair decision, and stop reason.

Applied boundary:

- deterministic validate mode only,
- no default live Codex run,
- no prompt/skill/memory tuning in this slice,
- no productivity-lift claim.
