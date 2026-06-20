---
id: krn-research-pack
kind: eval-module
status: active
owner: krn
updated: 2026-06-20
runner: packages/evals/src/validate-krn-research-pack.ts
---

# KRN Research Pack Eval

## Purpose

This eval verifies the first typed artifact for bounded deep research:

```text
KrnResearchPack parser -> krn research-pack scaffold -> runtime pack -> eval report
```

It does not run a long-running researcher worker and does not claim research quality or productivity lift.

## What This Tests

- The valid `krn-research-pack` fixture parses through `@krn/contracts`.
- The known-bad shallow ready pack fails deterministically.
- The CLI-generated scaffold exists and parses through `@krn/contracts`.
- The scaffold stays honest: no sources, mechanisms, decisions, or promotion targets are filled by the command.
- The eval writes a machine-readable report under `.krn/evals/krn-research-pack/{run_id}/report.json`.

## Command

```bash
pnpm run eval:krn-research-pack
```

## Runtime Output

```text
.krn/evals/krn-research-pack/{run_id}/report.json
```

Runtime outputs stay local. Reviewed durable lessons move to `docs/memory`.

## Interpretation Policy

A green run means KRN has a typed scaffold for deep-research packs. It does not mean sources were read, a researcher worker exists, memory should be promoted, or KRN has measured productivity lift.
