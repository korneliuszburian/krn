---
id: krn-context-pointer-index
kind: object-contract
status: active
owner: krn
updated: 2026-06-21
sources:
  - docs/goals/goal-038.md
  - docs/specs/krn-context-packet/README.md
  - docs/specs/krn-init/README.md
---

# KRN Context Pointer Index Contract

## Purpose

`KrnContextPointerIndex` is the reviewed `krn init` seed for context runtime pointers.

It is not a `KrnContextPacket`. It does not contain task intent, selected memory bodies, authoritative memory, source truth, or active-goal truth. It points future work toward bounded context packets built by:

```bash
krn context build --task <text> [--path <path>]
```

## Runtime Target

Reviewed init apply writes:

```text
.krn/context/index.json
```

The index uses:

- `schema_version: "krn-context-pointer-index.v1"`
- `kind: "krn_context_pointer_index"`
- `runtime_root: ".krn/context"`
- `packet_glob: ".krn/context/*/context-packet.json"`
- `memory_policy.store_memory_bodies: false`
- `memory_policy.require_selected_memory_ids: true`
- `memory_policy.require_application_guidance: true`

## Boundary

Allowed behavior:

- seed a target repo with the context packet runtime location;
- require future context packets to use selected memory IDs and application guidance;
- explicitly reject broad `docs/memory/**` context dumps;
- keep memory bodies out of `.krn/context/index.json`.

Forbidden behavior:

- no active `KrnContextPacket` generation during `krn init`;
- no memory body storage;
- no broad `docs/memory/**` dump as selected context;
- no active-goal or canonical-plan copying into target repos;
- no claim of context quality, source quality, or productivity lift.

## Validation

Run:

```bash
pnpm exec vitest run packages/contracts/test/context-pointer-index.test.ts
pnpm exec vitest run packages/cli/test/init-dry-run.test.ts
pnpm run eval:krn-init
```
