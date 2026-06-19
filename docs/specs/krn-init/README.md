---
id: krn-init-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-19
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-007.md
  - docs/goals/goal-005.md
  - docs/product/final-product-plan.md
  - docs/specs/technology-stack/decision.md
  - docs/specs/product-spine/README.md
---

# KRN Init Dry-Run Contract

## Purpose

`krn init --dry-run` is the first Slice 2 runtime consumer of KRN product-spine contracts.

It inspects a target project and writes a schema-backed dry-run manifest under `.krn/init/{run_id}/manifest.json`. It must not mutate target project setup files by default.

## Command

```bash
pnpm run krn -- init --dry-run --target .
```

Accepted shape:

```text
krn init --dry-run [--target <path>]
```

The command must reject missing `init`, missing `--dry-run`, unknown flags, and empty target values.

## Runtime Output

The command writes:

```text
{target_root}/.krn/init/{run_id}/manifest.json
```

The manifest uses `schema_version: "krn-init-manifest.v1"` and `kind: "krn_init_manifest"`.

## Dry-Run Boundary

Allowed writes:

- `.krn/init/{run_id}/manifest.json`

Forbidden default writes:

- `AGENTS.md`
- `.codex/**`
- `.agents/**`
- `docs/memory/**`
- source files outside `.krn/init/**`

If an artifact already exists, the command reports it as detected and chooses `skip`, `proposal_only`, or `merge_required` instead of overwriting.

## Minimum Detection

The command must inspect whether these target artifacts exist:

- `AGENTS.md`
- `.codex/`
- `.agents/`
- `docs/memory/INDEX.md`
- `.krn/`

## Manifest Interpretation

A valid manifest proves only that KRN can inspect a target project and express a dry-run bootstrap plan through a typed contract. It does not prove productivity lift, dashboard readiness, MCP readiness, or write-mode safety.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/init-manifest.test.ts
pnpm run krn -- init --dry-run --target .
pnpm run eval:krn-init
```

Runtime reports stay under `.krn/`. Durable lessons move to `docs/memory/` only after review.
