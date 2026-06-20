---
id: krn-memory-store-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-038.md
  - docs/plans/canonical/draft.md
  - docs/plans/canonical/SOURCES.md#C061
---

# KRN MemoryStore Contract

## Purpose

The MemoryStore contract proves that KRN memory selection is operational and bounded.

`docs/memory/**` remains a pattern bank / audit export. `.krn/**` remains runtime evidence/cache/ledger. Authoritative memory records come from a typed store boundary. The first local adapter is a JSON file supplied by `KRN_MEMORY_STORE_PATH`.

## Runtime Boundary

Runtime reports may store:

- memory IDs,
- selection reasons,
- confidence,
- source lineage,
- rejected context,
- application guidance,
- feedback outcome.

Runtime reports must not store authoritative memory bodies as the memory core.

## Validation

```bash
pnpm exec vitest run packages/contracts/test/memory-store.test.ts
```

Known-bad fixtures must fail when selection becomes a context dump or selected memory has no application guidance.
