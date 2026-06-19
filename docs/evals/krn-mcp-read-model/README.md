---
id: krn-mcp-read-model
kind: eval-module
status: active
owner: krn
updated: 2026-06-19
runner: packages/evals/src/validate-krn-mcp.ts
---

# KRN MCP Read Model Eval

## Purpose

This eval verifies the first Slice 3 control-plane path:

```text
KRN runtime reports -> read-only resource contract -> packages/mcp read model -> eval report
```

It does not claim a deployed MCP transport, dashboard readiness, human approval, destructive tool safety, or productivity lift.

## What This Tests

- Valid `krn-mcp-read-model` fixtures parse through `@krn/contracts`.
- The known-bad fixture fails deterministically.
- `packages/mcp` lists the allowlisted read-only runtime resources.
- `packages/mcp` reads parsed latest runtime reports without write or proposal tools.
- The eval writes a machine-readable report under `.krn/evals/krn-mcp-read-model/{run_id}/report.json`.

## Command

```bash
pnpm run eval:krn-mcp
```

## Runtime Output

```text
.krn/evals/krn-mcp-read-model/{run_id}/report.json
```

Runtime outputs stay local. Reviewed durable lessons move to `docs/memory`.

## Interpretation Policy

A green run means the read-model package can expose typed local runtime state through a read-only resource contract. It does not mean KRN has deployed an MCP server or that write tools are safe.
