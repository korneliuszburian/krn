# OpenAI Cookbook Mapping

## Source Patterns

- S010 / Goals in Codex: completion must be tied to evidence and constraints, not plausible progress.
- S011 / ExecPlans: this benchmark slice is restartable and evidence-driven through `docs/goals/goal-017.md`.
- S012 / Code modernization: benchmark work starts as a bounded contract/validation pilot before live batch execution.
- S014-S016 / eval and improvement loops: benchmark evidence is a local eval artifact with deterministic checks and caveats before repair or improvement claims.
- S088 / fixed-budget metric loop: the useful mechanism is baseline, assisted variant, one metric set, fixed budget, and keep/repair decision.

## Case Mapping

| Case | Source pattern | Mechanism | Failure mode |
|---|---|---|---|
| `valid-benchmark-fixture-parses` | S010-S012, C017 | Parse valid benchmark evidence while keeping no-lift status explicit. | Fixture evidence is treated as live lift. |
| `known-bad-lift-fixture-fails` | C008, C023, C038 | Reject unsupported productivity claims at the parser boundary. | Green evals or fixture deltas become product claims. |
| `generated-benchmark-report-writes-and-parses` | S014-S016, S088 | Generate a runtime benchmark report and parse it through the shared contract. | Runtime evidence becomes untyped or unsourced. |
| `eval-report-preserves-overclaim-boundary` | S010, C017, C023 | Eval report carries the generated benchmark path and live-benchmark caveat. | Benchmark-spine eval is overclaimed as measured improvement. |
