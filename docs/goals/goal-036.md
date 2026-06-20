# Goal 036: KRN Research Pack Runtime Scaffold

## Status

Completed child goal for `docs/goals/goal-006.md`.

Starts after completed reset child goal `docs/goals/goal-035.md`.

## Objective

Turn the repo-local `long-researcher` skill from a loose instruction into the first typed runtime artifact for bounded deep research.

KRN needs a way to hand a future long-running researcher worker a concrete destination artifact before it can safely run broader source work. The artifact must prevent shallow "three links and done" research from being marked ready for review.

## Mechanism

Add one vertical slice:

```text
KrnResearchPack contract
  -> valid and known-bad fixture
  -> krn research-pack scaffold command
  -> deterministic eval module
  -> krn eval aggregate coverage
```

The CLI command creates only a scaffolded pack under `.krn/research-packs/{run_id}/research-pack.json`. It does not claim that sources were read or that memory should be promoted.

## Boundaries

- Do not spawn long-running researcher workers in this slice.
- Do not browse or synthesize new source claims in this slice.
- Do not promote memory automatically from runtime artifacts.
- Do not add dashboard/API/MCP command surfaces.
- Do not claim productivity lift or research-quality lift.
- Do not treat markdown-only research notes as the durable runtime object.

## Acceptance Evidence

- `packages/contracts` exports `KrnResearchPack`, parser, and JSON schema.
- `docs/specs/krn-research-pack/` contains a valid ready-for-review example and a known-bad shallow ready pack.
- `krn research-pack --question <text> --decision <text> [--budget quick|standard|deep] [--target <path>]` writes a parseable scaffold under `.krn/research-packs/`.
- `docs/evals/krn-research-pack/` defines deterministic contract cases.
- `packages/evals/src/validate-krn-research-pack.ts` validates the fixture, known-bad fixture, and CLI-generated scaffold.
- `krn eval` includes `krn-research-pack` as deterministic aggregate coverage.
- Goal, memory, and final-product docs identify this as a scaffold for future researcher workers, not as completed research.

## Validation Evidence

- `pnpm exec vitest run packages/contracts/test/research-pack.test.ts packages/cli/test/research-pack.test.ts packages/cli/test/eval.test.ts` -> 3 files, 7 tests passed.
- `pnpm run eval:krn-research-pack` -> 3/3 cases, 9/9 assertions passed.
- `pnpm run eval:krn-eval` -> generated `.krn/eval/20260620T173231Z-4032848/report.json` with 21/21 modules, 104/104 cases, and 391/391 assertions passed.
- `pnpm typecheck` -> passed.
- `pnpm test` -> 33/33 files and 112/112 tests passed.

## Disproves Completion

- A ready research pack can parse with fewer sources than the selected source budget.
- The scaffold command claims mechanisms, decisions, or promotion targets before source work is performed.
- The aggregate `krn eval` gate does not include `krn-research-pack`.
- Runtime artifacts are treated as reviewed memory without review.
- The implementation runs broad live workers instead of creating a typed scaffold.
