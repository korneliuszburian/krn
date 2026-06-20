---
id: krn-source-graph-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-038.md
  - docs/plans/canonical/draft.md
  - docs/plans/canonical/SOURCES.md#C062
---

# KRN Source Graph Contract

## Purpose

`krn sources check` verifies the source refs selected by a context packet:

```text
context packet source_refs -> source graph records -> pass / warn / block
```

This is the first source-quality gate after the bounded context packet. It is a local adapter and runtime evidence path, not the final cloud/API source service.

`krn init --apply source_pointers` may seed `.krn/sources/index.json` with a minimal `krn-source-graph.v1` boundary after approved review and exact-payload promotion. That seed is not a copied bibliography, active canonical source ledger, final source service, or source freshness proof.

## Command

```bash
krn sources check --context <context-packet.json> --graph <source-graph.json> [--target <path>]
```

## Runtime Output

```text
{target_root}/.krn/sources/{run_id}/source-check.json
```

## Contract Rules

- every checked context source ref must exist in the source graph or block;
- stale, superseded, or conflicting sources block;
- aging, unknown, or unverified sources warn;
- conflicting source records must name the conflicting refs;
- warn/block decisions must include required action guidance;
- source checks may store refs, IDs, status, freshness, confidence, actions, and reasons, not broad source bodies.

## Validation

```bash
pnpm exec vitest run packages/contracts/test/source-graph.test.ts packages/cli/test/source-graph.test.ts
```
