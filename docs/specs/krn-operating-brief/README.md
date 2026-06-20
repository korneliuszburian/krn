---
id: krn-operating-brief-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-038.md
  - docs/plans/canonical/draft.md
  - docs/plans/canonical/SOURCES.md#C061
---

# KRN Operating Brief Contract

## Purpose

`krn brief` writes a schema-backed operating brief for the next Codex run:

```text
task intent -> selected memory IDs/patterns -> rejected context -> applied kernel terms -> next action -> verification
```

This is a MemoryStore consumer, not a passive planning document and not final memory core.

## Command

```bash
krn brief --task <text> [--path <path>] [--target <path>]
```

## Runtime Output

```text
{target_root}/.krn/briefs/{run_id}/brief.json
```

## Validation

```bash
pnpm exec vitest run packages/contracts/test/operating-brief.test.ts packages/cli/test/brief.test.ts
```

Known-bad fixtures must fail when selected context is not backed by selected MemoryStore IDs.
