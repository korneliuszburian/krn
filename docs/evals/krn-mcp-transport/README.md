---
id: krn-mcp-transport
kind: eval-module
status: active
owner: krn
updated: 2026-06-20
runner: packages/evals/src/validate-krn-mcp-transport.ts
---

# KRN MCP Transport Eval

## Purpose

This eval verifies the first real Slice 3 MCP transport path:

```text
KRN runtime reports -> packages/mcp read model -> SDK STDIO server -> SDK STDIO client -> eval report
```

It does not claim ChatGPT connector behavior, dashboard readiness, human approval, destructive tool safety, or productivity lift.

## What This Tests

- The STDIO server starts and responds through the MCP SDK client.
- The server lists the five allowlisted KRN runtime resources.
- The server exposes no MCP tools.
- Reading summary and latest review resources returns schema-backed control-plane resources.
- Unknown resource URIs fail deterministically.
- The eval writes a machine-readable report under `.krn/evals/krn-mcp-transport/{run_id}/report.json`.

## Command

```bash
pnpm run eval:krn-mcp-transport
```

## Runtime Output

```text
.krn/evals/krn-mcp-transport/{run_id}/report.json
```

Runtime outputs stay local. Reviewed durable lessons move to `docs/memory`.

## Interpretation Policy

A green run means KRN has a local STDIO MCP transport that can serve typed read-only runtime resources. It does not mean proposal tools are safe, dashboard UI is ready, ChatGPT can connect, or KRN improves productivity.
