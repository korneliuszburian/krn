---
id: krn-init-contracts
kind: eval-module
status: active
owner: krn
updated: 2026-06-19
runner: packages/evals/src/validate-krn-init.ts
---

# KRN Init Contracts Eval

## Purpose

This eval verifies the first Slice 2 runtime path:

```text
InitManifest parser -> krn init --dry-run -> runtime manifest -> eval report
```

It does not claim productivity lift, dashboard readiness, MCP readiness, or write-mode safety.

## What This Tests

- The valid `krn-init` fixture parses through `@krn/contracts`.
- The known-bad fixture fails deterministically.
- The CLI-generated dry-run manifest exists and parses through `@krn/contracts`.
- The eval writes a machine-readable report under `.krn/evals/krn-init-contracts/{run_id}/report.json`.

## Command

```bash
pnpm run eval:krn-init
```

## Runtime Output

```text
.krn/evals/krn-init-contracts/{run_id}/report.json
```

Runtime outputs stay local. Reviewed durable lessons move to `docs/memory`.

## Interpretation Policy

A green run means the bootstrap dry-run contract is locally checkable. It does not mean KRN improves Codex behavior or that later API/MCP/dashboard work is ready to start.
