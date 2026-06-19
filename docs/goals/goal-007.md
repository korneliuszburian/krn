# Goal 007: Overnight Slice 2 Runtime Spine

## Status

Ready as the next eight-hour execution goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This is an overnight child goal, not a replacement for `goal-006`. It exists because the normal one-to-two-hour KRN goals are too small for the first complete TypeScript runtime spine vertical slice.

## Objective

Execute the first meaningful Slice 2 vertical path for KRN:

```text
contracts -> krn init --dry-run CLI -> deterministic eval -> runtime artifact -> reviewed memory/source update
```

The end state is not a demo. The end state is a runnable, typed, source-backed `krn init --dry-run` bootstrap workflow that produces a schema-backed manifest without mutating target files.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/specs/technology-stack/decision.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/technology-stack/decision.md)

[DECISION] Current slice is Slice 2: Typed Runtime Spine.

[DECISION] `goal-005` is context for `krn init --dry-run`, not the active product direction.

## Current Starting State

[FACT] The repo already has:

- pnpm workspace seed files:
  - `package.json`
  - `pnpm-workspace.yaml`
  - `tsconfig.base.json`
  - `vitest.config.ts`
- `packages/contracts` with an initial `InitManifestSchema`.
- product-spine schemas and examples under `docs/specs/product-spine/`.
- operator skill and product-spine Python validators that pass.

[FACT] The repo does not yet have:

- runnable `packages/cli` implementation,
- runnable `packages/evals` implementation,
- `docs/specs/krn-init/` command contract and fixtures,
- a working `pnpm-lock.yaml`,
- proven `pnpm typecheck`,
- proven `pnpm test`,
- proven `pnpm run eval:krn-init`.

[FACT] A prior dependency install attempt failed because unconstrained `vitest@^4.0.0` resolved to a broken transitive version. The overnight slice must pin and lock dependencies before claiming TypeScript gates.

## Eight-Hour Work Plan

### 0. Kickoff Gate - 20 minutes

Purpose: prevent stale context and accidental dashboard/API drift.

Work:

- Read `AGENTS.md`, `docs/memory/INDEX.md`, this goal, `goal-006`, `docs/product/final-product-plan.md`, `docs/specs/technology-stack/decision.md`, `docs/evals/STANDARD.md`, and `CONTEXT.md`.
- Run current-state checks:

```bash
git status -sb
find packages -maxdepth 4 -type f -print | sort
find docs/specs -maxdepth 4 -type f -print | sort
```

Acceptance evidence:

- Current branch and dirty state are known.
- No API/MCP/dashboard implementation is started.

Disproves completion:

- Work begins from memory or prior chat without inspecting current files.

### 1. Workspace And Dependency Lock - 65 minutes

Purpose: make the TypeScript workspace runnable before adding more product code.

Work:

- Pin dependency versions narrowly enough for reproducible install.
- Generate and commit `pnpm-lock.yaml`.
- Create minimal package skeletons for:
  - `packages/cli`
  - `packages/evals`
- Keep `packages/contracts` as the single owner of manifest parsing.
- Do not add framework machinery beyond what the CLI/eval path needs.

Acceptance evidence:

```bash
pnpm install
pnpm typecheck
```

Disproves completion:

- `pnpm typecheck` references missing packages.
- Lockfile is missing.
- New product code introduces unchecked boundary `any`.
- New product foundation is Python.

### 2. KRN Init Contract And Fixtures - 70 minutes

Purpose: make `krn init --dry-run` an explicit public contract before CLI behavior grows.

Work:

- Add `docs/specs/krn-init/README.md`.
- Add valid fixture:
  - `docs/specs/krn-init/examples/init-manifest.example.json`
- Add known-bad fixture:
  - `docs/specs/krn-init/fixtures/bad-init-manifest.example.json`
- Export or write JSON Schema for the init manifest from `packages/contracts`.
- Ensure the valid fixture references real product-spine object kinds and real source refs.
- Ensure the known-bad fixture fails for a meaningful reason, such as missing `interpretation_caveat` or an invalid mutation mode.

Acceptance evidence:

```bash
pnpm test -- packages/contracts/test/init-manifest.test.ts
```

Disproves completion:

- Fixtures only prove JSON syntax.
- Known-bad fixture fails for the wrong accidental reason.
- Manifest fields are prose-only or duplicate product-spine logic outside `packages/contracts`.

### 3. Minimal CLI: `krn init --dry-run` - 100 minutes

Purpose: produce the first real runtime artifact under `.krn/` without mutating target project files.

Work:

- Implement `packages/cli/src/main.ts`.
- Support:

```bash
pnpm run krn -- init --dry-run --target .
```

- Detect at minimum:
  - `AGENTS.md`
  - `.codex/`
  - `.agents/`
  - `docs/memory/INDEX.md`
  - `.krn/`
- Write:

```text
.krn/init/{run_id}/manifest.json
```

- Print the manifest path.
- Parse the emitted manifest through `parseInitManifest` before writing or before reporting success.
- Keep all target changes as `skip`, `proposal_only`, or dry-run planned actions. Do not write target files other than the runtime report under `.krn/init/`.

Acceptance evidence:

```bash
pnpm run krn -- init --dry-run --target .
test -f .krn/init/*/manifest.json
```

Disproves completion:

- The command creates or modifies project setup files by default.
- The command emits a manifest that bypasses the contract parser.
- Collision handling is implicit.

### 4. Deterministic Eval Runner - 75 minutes

Purpose: make `krn init` quality checkable without manual inspection.

Work:

- Implement `packages/evals/src/validate-krn-init.ts`.
- Add `docs/evals/krn-init-contracts/README.md`.
- Add `docs/evals/krn-init-contracts/cases.json`.
- Add `docs/evals/krn-init-contracts/result.schema.json`.
- Runner must validate:
  - valid fixture passes,
  - known-bad fixture fails,
  - generated dry-run manifest passes,
  - runtime report is written under `.krn/evals/krn-init-contracts/{run_id}/report.json`.
- Report must include interpretation caveat: green eval proves contract behavior only, not productivity lift.

Acceptance evidence:

```bash
pnpm run eval:krn-init
```

Disproves completion:

- Eval checks only file existence.
- Eval has no known-bad case.
- Eval report has no caveat or no machine-readable result.

### 5. Behavior Tests And Runtime Safety - 65 minutes

Purpose: prove the CLI path through public behavior, not private helper assertions.

Work:

- Add or update tests so `pnpm test` covers:
  - exported manifest parser,
  - CLI generated manifest,
  - no default target mutation outside `.krn/init/`,
  - known-bad fixture rejection.
- Use public CLI/contract interfaces in tests.

Acceptance evidence:

```bash
pnpm test
pnpm typecheck
```

Disproves completion:

- Tests duplicate schema logic.
- Tests depend on private implementation details.
- The no-mutation check is absent.

### 6. Memory, Source, And Handoff Update - 55 minutes

Purpose: promote only reviewed lessons and leave the next agent with exact evidence.

Work:

- Add a memory note:
  - `docs/memory/product/YYYY-MM-DD--krn-init-runtime-spine.md`
- Update `docs/memory/INDEX.md`.
- Update `docs/plans/canonical/SOURCES.md` only if a durable claim changed.
- Update `docs/skills/operator-pipeline.md` only if the TypeScript skill now has real impact/evidence status to report.
- Add a concise completion/handoff section to this goal with exact commands and report paths.

Acceptance evidence:

```bash
python3 scripts/evals/operator_skill_contracts.py --mode validate
python3 scripts/evals/operator_skill_impact.py --mode validate
python3 scripts/evals/codex_memory_compliance.py --mode validate
python3 scripts/specs/validate_product_spine.py --mode validate
pnpm typecheck
pnpm test
pnpm run eval:krn-init
```

Disproves completion:

- Runtime reports are copied into memory as truth.
- Memory note lacks source refs, failure mode, or review trigger.
- A changed durable conclusion is not indexed.

### 7. Final Commit And Push - 30 minutes

Purpose: make the overnight result durable and reviewable.

Work:

- Inspect final diff.
- Do not commit runtime reports under `.krn/`.
- Commit with semantic commit messages only.
- Push to `origin/main` unless the operator chooses a branch.

Acceptance evidence:

```bash
git status -sb
git log --oneline -5
git push
```

Disproves completion:

- Commit includes cache, `node_modules`, or `.krn` runtime report payloads.
- Commit message is not semantic.
- Push is skipped without stating why.

## Time Budget

Total planned work: 480 minutes.

This is intentionally a full-night slice. The goal should not be shrunk to a one-hour subtask unless a blocker is recorded. If time runs short, stop only after writing exact incomplete phases and latest evidence into this goal; do not redefine partial progress as completion.

## Constraints

- TypeScript-first product code.
- Node.js runtime.
- No new Python product foundation.
- No API/MCP/dashboard/runtime-skill implementation.
- No target project writes except `.krn/init/{run_id}/manifest.json`.
- Every external JSON input is `unknown` until parsed.
- Runtime artifacts stay under `.krn/`.
- Reviewed memory stays under `docs/memory/`.
- No productivity or measured-lift claims.
- Semantic commits only.

## Boundaries

In scope:

- dependency lock,
- `packages/contracts`,
- `packages/cli`,
- `packages/evals`,
- `docs/specs/krn-init`,
- `docs/evals/krn-init-contracts`,
- `.krn/init` runtime output,
- product memory update after evidence exists.

Out of scope:

- read-only MCP gateway,
- proposal tools,
- dashboard,
- benchmark harness,
- runtime skills,
- write-mode init,
- global Codex config,
- plugin packaging,
- database or graph store.

## Iteration Policy

Implement vertically:

```text
contract -> parser/schema -> fixture -> CLI consumer -> behavior test -> eval report -> memory update
```

When a test or eval fails:

```text
failure -> classify -> smallest fix -> rerun -> keep evidence or record stop reason
```

Do not patch instructions, skills, or `AGENTS.md` to hide a runtime failure.

## Blocked Stop Condition

Mark this overnight goal blocked only if the same blocker repeats after three concrete attempts:

- pnpm dependency resolution cannot produce a lockfile,
- TypeScript package references cannot be made runnable without changing the stack decision,
- `InitManifest` cannot represent dry-run output without changing the product-spine boundary,
- the CLI cannot write `.krn/init/{run_id}/manifest.json` without mutating target files.

If blocked, write:

- exact command,
- exact error,
- attempted fix,
- next two viable alternatives,
- why the broader `goal-006` remains active.

## Completion Criteria

The overnight goal is complete only when:

- `pnpm install` succeeds and `pnpm-lock.yaml` exists.
- `packages/cli` and `packages/evals` are real runnable packages.
- `docs/specs/krn-init/` contains command contract, valid fixture, and known-bad fixture.
- `krn init --dry-run` writes a schema-backed manifest under `.krn/init/`.
- The command does not mutate target project files by default.
- `pnpm typecheck` passes.
- `pnpm test` passes.
- `pnpm run eval:krn-init` passes and writes a machine-readable report.
- Legacy Python validators still pass.
- Memory/source docs are updated only for reviewed durable lessons.
- No dashboard/API/MCP/runtime-skill work was started.
- Final changes are committed with semantic commit messages and pushed, unless the operator explicitly defers publish.

## Disproves Completion

- A CLI bootstrap exists but no eval runner exists.
- A manifest exists but is not parsed through `packages/contracts`.
- Tests pass only because they avoid the public CLI path.
- Known-bad fixture is missing or accidentally passes.
- Runtime artifacts are treated as reviewed memory.
- The slice starts dashboard/API/MCP before typed reports exist.
- Completion is claimed from green unit tests without eval and memory evidence.

## Next Command

Start with:

```bash
pnpm install
```

If dependency resolution fails, pin the failing package versions in `package.json`, rerun `pnpm install`, and continue only after `pnpm-lock.yaml` exists.
