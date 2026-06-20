# KRN Benchmark Expanded Arena Fixture Scoring

Status: decision

Sources:

- `docs/goals/goal-032.md`
- `docs/evals/krn-benchmark-expanded-arena/README.md`
- `docs/evals/krn-benchmark-expanded-arena/fixtures/baseline-scoring-fixture.json`
- `docs/evals/krn-benchmark-expanded-arena/fixtures/assisted-scoring-fixture.json`
- `docs/evals/krn-benchmark-expanded-arena/fixtures/bad-scoring-fixture-overclaims-lift.json`
- `packages/evals/src/validate-krn-benchmark-expanded-arena.ts`
- `.krn/evals/krn-benchmark-expanded-arena/20260620T133615Z-3538000/report.json`
- `.krn/benchmarks/krn-benchmark-expanded-arena/20260620T133615Z-3538000/report.json`
- `.krn/eval/20260620T133514Z-3535649/report.json`

Useful pattern:

After the expanded arena registry exists, add deterministic fixture scoring before live execution. The scorer should produce a normal `KrnBenchmarkReport` so downstream dashboard/MCP/API consumers can reuse the same benchmark contract, while keeping `measurement_mode: "fixture_contract"` and `productivity_lift_claimed: false`.

KRN implication:

`krn-benchmark-expanded-arena` now proves registry coverage plus deterministic fixture scoring/report generation for all 20 tasks. The next benchmark slice should implement isolated explicit live smoke/full runner modes over the same registry.

Failure mode:

Do not treat the positive fixture delta as measured productivity lift. Fixture scoring proves scorer/report mechanics only; live expanded execution, statistical validity, isolated coding-task runner safety, and product lift remain unproven.

Review trigger:

Update this note when the explicit live runner executes the expanded registry, when fixture scoring is replaced by real review-burden evidence, or when dashboard/API controls consume expanded arena benchmark reports.
