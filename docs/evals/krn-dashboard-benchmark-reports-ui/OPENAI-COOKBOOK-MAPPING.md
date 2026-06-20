# OpenAI Cookbook Mapping

## Source Patterns

- S010 / Goals in Codex: completion must be tied to explicit benchmark evidence, constraints, and blocker rules.
- S011 / ExecPlans: the slice is restartable and evidence-driven through `docs/goals/goal-019.md`.
- S012 / Code modernization: Benchmark Reports is a bounded vertical surface before benchmark command/API expansion.
- S014-S016 / eval and improvement loops: benchmark evidence must be deterministic, caveated, and repair-oriented before improvement claims.

## Case Mapping

| Case | Source pattern | Mechanism | Failure mode |
|---|---|---|---|
| `dashboard-data-generation-includes-benchmark-reports` | S010-S012, C010, C039-C040 | Generate dashboard boot data from real `KrnBenchmarkReport` state. | Dashboard uses mocks, hides negative delta, or claims lift. |
| `benchmark-row-renders-no-lift-evidence` | S014-S016, C010, C040 | Render benchmark source refs, delta, repair target, next action, and caveat. | Benchmark rows become vanity metrics or command links. |
| `missing-benchmark-report-renders-explicit-empty` | S010, C039 | Missing benchmark report is explicit state, not hidden success. | Dashboard invents benchmark evidence. |
| `invalid-benchmark-report-renders-blocked` | S014, C039 | Invalid benchmark report blocks trust. | Unparseable reports are presented as valid. |
| `negative-delta-preserves-no-lift-boundary` | S010-S016, C040 | Negative live delta routes to larger suite or repair work before any product claim. | One-task negative evidence is overclaimed as breakthrough. |
