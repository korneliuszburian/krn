---
id: krn-context-packet-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-038.md
  - docs/plans/canonical/draft.md
---

# KRN Context Packet Contract

## Purpose

`krn context build` writes a bounded context packet for the next Codex run:

```text
task intent -> selected memory IDs -> rejected context -> policy -> verification
```

This is the first context-supply-chain object after the MemoryStore boundary. It is runtime evidence/cache, not authoritative memory core.

## Command

```bash
krn context build --task <text> [--path <path>] [--target <path>]
```

## Runtime Output

```text
{target_root}/.krn/context/{run_id}/context-packet.json
```

## Contract Rules

- selected context must be backed by `memory_selection.selected`;
- selected context must not contain broad dumps such as `docs/memory/**`;
- memory application surface must be `krn_context`;
- every selected memory must have application guidance;
- runtime evidence may store memory IDs, reasons, lineage, guidance, and outcomes, not authoritative memory bodies.

## Validation

```bash
pnpm exec vitest run packages/contracts/test/context-packet.test.ts packages/cli/test/context.test.ts
```
