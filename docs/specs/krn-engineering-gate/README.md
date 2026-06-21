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

## Blocked Surface Classifier

`krn gate` blocks broad dashboard, benchmark, API/cloud sync, and `live-full`
expansion unless the task names a typed consumer such as memory application,
selection, review consumer, source graph, or trace consumer.

Explicitly negated mentions in a local clause, such as `no dashboard state` or
`without cloud sync`, are hardcoded-truth boundaries and must not block an
otherwise scoped task. This is a false-positive guard only; it does not prove
semantic policy enforcement, hook enforcement, security quality, or product
lift.

## Validation

```bash
pnpm exec vitest run packages/contracts/test/engineering-gate.test.ts packages/cli/test/gate.test.ts
```

Known-bad fixtures must fail when a non-trivial gate omits required checks or claims `pass` while any required check warns or fails.
