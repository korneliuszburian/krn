# Goal 005: KRN Init Dry-Run Bootstrap Contract

## Status

Superseded as the active product direction by [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This file is retained as Slice 2 context for the future `krn init --dry-run` command. Do not run it as the next `/goal` by itself.

The user explicitly stopped implementation before CLI work and rejected an implicit Python default. The active direction is now the final-product plan in [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md), executed through [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

## Mission

Turn the validated product spine from `goal-004` into the first usable bootstrap workflow:

```bash
krn init --dry-run
```

The command must inspect a target project, produce a machine-readable dry-run manifest, and explain what KRN would create or change without mutating the target by default.

This is the first bridge from repo-local research artifacts to a practical operator tool. It should make later API, MCP, runtime skills, and dashboard work simpler by giving them a stable bootstrap contract to read.

## Current P0 Stack Decision

[DECISION] Product implementation should be TypeScript-first on the Node.js runtime, not Python-first.

Read [docs/specs/technology-stack/decision.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/technology-stack/decision.md) before any implementation work.

Existing Python validators are local proof artifacts from earlier research. They should not grow into the product foundation. They may remain until replaced or migrated.

## Current Evidence

- `goal-004` completed the product spine:
  - 8 product objects,
  - 8 matching examples,
  - 1 known-bad fixture,
  - local validator,
  - eval integration,
  - memory condensation.
- Latest product-spine validator evidence:
  - `.krn/specs/product-spine/20260619T124200342866Z-700904/report.json`
  - 17/17 checks passed.
- The product-spine next-step path explicitly names `krn init --dry-run` before API/MCP/dashboard work.
- The strongest current product rule remains: dashboard/API/runtime skills must read real objects, not invented chat state.

## Required Read Order

Before implementing this goal, read:

1. [AGENTS.md](/home/krn/coding/krn/active/krn-gastown/AGENTS.md)
2. [docs/memory/INDEX.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/INDEX.md)
3. [docs/goals/goal-004.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-004.md)
4. [docs/specs/product-spine/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/product-spine/README.md)
5. [docs/specs/product-spine/mappings.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/product-spine/mappings.md)
6. [docs/plans/canonical/draft.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/draft.md)
7. [docs/plans/canonical/pattern-matrix.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/pattern-matrix.md)
8. [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)

Use primary OpenAI/Codex docs only when a contract depends on current Codex behavior. Do not reread all sources by default.

## Standards To Preserve

- This is project-local. Do not create or rely on global Codex config.
- Default mode is dry-run. No target project writes without an explicit future write-mode contract.
- No dashboard, API, MCP server, runtime skills, database, background daemon, or plugin packaging in this goal.
- No new Python product code in this goal.
- Generated output must be source-backed and schema-backed.
- The manifest must be machine-readable JSON, not only prose.
- The command must make ownership boundaries explicit:
  - files it would create,
  - files it would modify,
  - files it would never touch,
  - artifacts it would only read.
- If a project already has `AGENTS.md`, `.codex/`, `.agents/`, or docs memory, the dry-run must report collision/merge strategy instead of overwriting.
- Runtime evidence goes under `.krn/`; durable lessons move into `docs/memory`.
- Keep the implementation small. TypeScript-first on Node.js runtime is the product stack unless a new ADR supersedes the stack decision.
- Use deterministic validation before any model-judge or subjective review.
- Do not claim productivity lift. This goal proves a bootstrap contract, not business value.

## Required Pattern Set

| Pattern family | Source surface | Required consequence in `goal-005` |
|---|---|---|
| Product spine | `docs/specs/product-spine/**` | Dry-run manifest references product-spine object kinds and schema versions. |
| Goals and ExecPlans | OpenAI Cookbook goals/exec plans, local `goal-004` | The bootstrap task remains restartable, phase-based, and evidence-backed. |
| Iterative repair loops | OpenAI Cookbook repair-loop pattern | Known-bad fixtures must fail deterministically and describe a repair target. |
| Eval-first quality | OpenAI eval/Promptfoo patterns, local eval modules | Add a local validator/eval contract before expanding behavior. |
| AGENTS/memory hygiene | `AGENTS.md`, `docs/memory/INDEX.md` | The init plan must create minimal selector files, not dump broad rules. |
| Matt Pocock operator skills | `docs/memory/github-research/2026-06-19--mattpocock-skills-operator-pipeline.md` | Bootstrap output should support normalized operator workflows, not ad hoc prompt packs. |
| Sandcastle isolation | `docs/memory/github-research/2026-06-19--mattpocock-sandcastle.md` | Target inspection and future writes need explicit isolation and no silent mutation. |
| Compact continuity | `.codex/hooks/compact_continuity.py`, compact memory note | Dry-run can mention compact hook installation as a proposal only, not execute it. |
| Dashboard control plane | product principles memory note | Manifest fields must be usable later by a dashboard review queue. |

## Scope

Design and implement the first minimal local CLI path for:

```bash
krn init --dry-run
```

After the stack decision is accepted, the goal should produce:

- a command contract,
- a dry-run manifest schema,
- at least one valid manifest example,
- at least one known-bad fixture,
- a minimal TypeScript CLI skeleton,
- a deterministic validator,
- eval/docs integration,
- memory condensation and index updates.

The implementation path must use the stack decision. Do not use the earlier Python fallback.

## Suggested File Layout

The earlier Python layout is superseded. Prefer a small TypeScript workspace unless implementation-time repo inspection finds a stronger TypeScript convention:

```text
package.json
pnpm-workspace.yaml
tsconfig.base.json

packages/
  contracts/
    src/
      init-manifest.ts
  cli/
    src/
      main.ts
  evals/
    src/
      validate-krn-init.ts

docs/specs/krn-init/
docs/evals/krn-init-contracts/
.krn/init/{run_id}/
```

## Dry-Run Manifest Requirements

The manifest must include at least:

- `schema_version`
- `kind`
- `run_id`
- `created_at`
- `target_root`
- `mode`
- `project_profile`
- `detected_artifacts`
- `planned_files`
- `planned_runtime_dirs`
- `collisions`
- `no_touch_paths`
- `source_refs`
- `product_spine_refs`
- `validation`
- `interpretation_caveat`

Planned files must distinguish:

- `create`
- `modify`
- `skip`
- `proposal_only`

Every planned change must include a reason and source reference. If the command cannot justify a file from current standards, it must not plan that file.

## Out Of Scope

- Real write mode.
- Global install.
- API server.
- MCP server.
- Dashboard UI.
- Runtime/product skills.
- Database migration.
- Agent swarm orchestration.
- Full autoresearch.
- Claims that KRN improves productivity.

## Phases

| Phase | Output | Acceptance evidence |
|---|---|---|
| P0 Stack decision | Decide and document product stack before implementation. | `docs/specs/technology-stack/decision.md` exists and this goal no longer proposes Python as the default. |
| P1 Command contract | `docs/specs/krn-init/README.md` describes command behavior and boundaries. | Contract states dry-run default, no writes, collision handling, and manifest location. |
| P2 Manifest schema | JSON Schema plus valid and known-bad examples. | Valid example passes; known-bad fails for a meaningful reason. |
| P3 CLI skeleton | Minimal TypeScript command emits dry-run manifest. | Running `krn init --dry-run` equivalent writes `.krn/init/{run_id}/manifest.json` and prints the path. |
| P4 Validator/eval integration | Local validator and eval module document checks. | Deterministic validation command exits non-zero on malformed manifest and writes a report. |
| P5 Memory condensation | Durable decision note and index updates. | `docs/memory/INDEX.md` links the new note and says what API/MCP/dashboard work is now unblocked. |

## Validation Commands

At minimum, the completed goal must pass:

```bash
python3 scripts/specs/validate_product_spine.py --mode validate
pnpm typecheck
pnpm test
```

During migration, the existing product-spine Python validator remains valid evidence for `goal-004`. New `krn-init` validation must be TypeScript-based unless a new ADR supersedes the stack decision.

## Completion Criteria

This goal is complete only when:

- `docs/specs/krn-init/` exists with command contract, schema, example, and known-bad fixture,
- a minimal TypeScript `krn init --dry-run` path exists,
- the dry-run command does not mutate target files,
- the manifest is schema-backed and includes collision/no-touch/source/product-spine references,
- validator reports pass for valid examples,
- known-bad fixture fails validation for the expected reason,
- eval/docs integration explains the quality gate,
- memory is updated and indexed,
- the next path to read-only API/MCP or dashboard is explicit,
- no API/MCP/dashboard/runtime-skill implementation is started.

## Disproving Completion

Do not mark complete if:

- the command writes project files by default,
- the manifest is prose-only,
- collision handling is implicit,
- validation only checks JSON syntax,
- examples do not reference real KRN standards or product-spine objects,
- implementation introduces a new framework without proving it is necessary,
- implementation adds new Python product code,
- dashboard/API/MCP work begins before the bootstrap contract validates.

## Blocked Stop Condition

Mark blocked only if, after reading the required files and inspecting the repo, there is no viable way to create a local TypeScript dry-run command without choosing an unresolved framework or product boundary.

If blocked, write the unresolved stack choice and the smallest two viable alternatives into this goal file before stopping.

## Next Command

When the user starts this goal:

```bash
python3 scripts/specs/validate_product_spine.py --mode validate
```

Then read `docs/specs/technology-stack/decision.md` and continue only if the TypeScript stack decision is accepted.
