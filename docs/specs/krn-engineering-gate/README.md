---
id: krn-engineering-gate-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-038.md
  - AGENTS.md
---

# KRN Engineering Gate Contract

## Purpose

`krn gate` writes a schema-backed pre-edit engineering gate for non-trivial KRN work:

```text
task intent -> scope classification -> required checks -> required skills -> next verifications
```

This gate exists to make the senior engineering standard operational before editing starts. It is runtime evidence, not a passive planning document and not a hook enforcement claim.

## Command

```bash
krn gate --task <text> [--path <path>] [--target <path>]
```

## Runtime Output

```text
{target_root}/.krn/gates/{run_id}/engineering-gate.json
```

## Required Non-Trivial Checks

- mechanism
- scope boundary
- consumer
- verification
- rollback or kill path
- hardcoded-truth boundary
- skill routing
- simplify cadence
- overclaim boundary

## Validation

```bash
pnpm exec vitest run packages/contracts/test/engineering-gate.test.ts packages/cli/test/gate.test.ts
```

Known-bad fixtures must fail when a non-trivial gate omits required checks or claims `pass` while any required check warns or fails.
