---
id: krn-research-pack-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-035.md
  - docs/goals/goal-036.md
  - docs/source-bank/MANIFEST.md
  - .agents/skills/long-researcher/SKILL.md
---

# KRN Research Pack Contract

## Purpose

`KrnResearchPack` is the typed artifact for bounded deep research.

It prevents the failure mode where "research" becomes a few links, chat memory, or an unbounded browser pass. A pack starts as a scaffold and becomes reviewable only after source budget, mechanisms, contradictions, rejected alternatives, and promotion targets are filled.

## Command

```bash
pnpm run krn -- research-pack --question "<question>" --decision "<KRN decision>" --budget quick --target .
```

Accepted shape:

```text
krn research-pack --question <text> --decision <text> [--budget quick|standard|deep] [--target <path>]
```

Default budget: `standard`.

## Runtime Output

The command writes:

```text
{target_root}/.krn/research-packs/{run_id}/research-pack.json
```

The scaffold uses `schema_version: "krn-research-pack.v1"` and `kind: "krn_research_pack"`.

## Status Semantics

- `scaffolded`: target artifact exists, no sources or mechanisms have been completed.
- `in_progress`: source work has started but is not reviewable.
- `ready_for_review`: source budget, mechanisms, rejected alternatives, decisions, and promotion targets are present.
- `promoted`: reviewed outcome has been promoted into memory/ADR/skill/eval/product docs.
- `discarded`: research did not produce a durable KRN implication.

## Budget Semantics

- `quick`: 5-8 sources.
- `standard`: 10-20 sources.
- `deep`: 20+ sources.

Non-scaffolded packs must meet the selected minimum source count before they parse.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/research-pack.test.ts packages/cli/test/research-pack.test.ts
pnpm run eval:krn-research-pack
```

Runtime reports stay under `.krn/`. Durable lessons move to `docs/memory/` only after review.
