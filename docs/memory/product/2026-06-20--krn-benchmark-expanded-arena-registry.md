# KRN Benchmark Expanded Arena Registry

Status: decision

Sources:

- `docs/goals/goal-031.md`
- `docs/evals/krn-benchmark-expanded-arena/README.md`
- `docs/evals/krn-benchmark-expanded-arena/tasks.json`
- `docs/evals/krn-benchmark-expanded-arena/fixtures/bad-expanded-arena-tasks.json`
- `packages/evals/src/validate-krn-benchmark-expanded-arena.ts`
- `.krn/evals/krn-benchmark-expanded-arena/20260620T131923Z-3485253/report.json`
- `.krn/eval/20260620T131931Z-3485816/report.json`

Useful pattern:

After locking the arena contract, implement the expanded benchmark arena as a source-backed task registry before live runner/scoring. The registry should be deterministic, easy to diff, and explicit about task family, source refs, assisted guidance, required coding-quality metrics, acceptance keywords, and overclaim keywords.

KRN implication:

`krn-benchmark-expanded-arena` now validates a 20-task registry across implementation, debugging, refactor, review, continuity, and benchmark-repair families. Every task must carry enough coding-quality metrics, including review burden, and the registry keeps live `codex exec` outside default `krn eval`.

Failure mode:

Do not treat this green eval as live expanded benchmark execution or productivity lift. It proves task-registry readiness only. Fixture scoring, explicit live smoke/full runner, statistical validity, and product lift remain unproven.

Review trigger:

Update this note when fixture scoring is added, when the explicit live expanded runner executes the registry, when scoring starts using human review burden from real review evidence, or when dashboard/API controls begin consuming expanded arena reports.
