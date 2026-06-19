---
id: krn-mcp-read-model-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/product/final-product-plan.md
  - docs/specs/technology-stack/decision.md
  - docs/evals/STANDARD.md
  - https://developers.openai.com/codex/mcp
  - https://github.com/modelcontextprotocol/typescript-sdk
---

# KRN MCP Read Model Contract

## Purpose

`packages/mcp` is the first Slice 3 control-plane package. It exposes an allowlisted read-only resource model over local `.krn` runtime reports and a local STDIO MCP transport for that model.

This is not yet registered in project or user `.codex/config.toml`, not a ChatGPT/HTTP connector, and not a write-capable API. It is the typed read model plus local STDIO server that later control-plane work can harden.

## Public Interface

```ts
listKrnControlPlaneResources(targetRoot)
readKrnControlPlaneResource(uri, targetRoot)
createKrnMcpServer(options)
serveKrnMcpStdio(options)
```

Allowlisted resource URIs:

- `krn://runtime/summary`
- `krn://runtime/init/latest`
- `krn://runtime/doctor/latest`
- `krn://runtime/eval/latest`
- `krn://runtime/review/latest`

## Input Reports

The read model consumes the latest local reports from:

- `.krn/init/*/manifest.json`
- `.krn/doctor/*/report.json`
- `.krn/eval/*/report.json`
- `.krn/review/*/report.json`

Each report is parsed through the existing `@krn/contracts` parser before it is exposed as a resource payload.

## Boundary

Allowed behavior:

- read local runtime reports,
- parse them through contracts,
- return schema-backed resource index and resource payloads,
- serve the allowlisted resources over a local SDK STDIO server,
- report missing or invalid resources without mutating the target.

Forbidden behavior:

- no destructive MCP tools,
- no proposal/write tools in this slice,
- no `.codex/config.toml` server registration,
- no HTTP/ChatGPT connector claim,
- no memory/source/goal mutation,
- no dashboard mocked state.

## Local STDIO Invocation

From the repo root:

```bash
pnpm exec tsx packages/mcp/src/stdio.ts --target .
```

Through the package script:

```bash
pnpm --filter @krn/mcp run serve:stdio -- --target /absolute/path/to/target
```

## Interpretation

A green read-model result means KRN can expose typed local runtime state through a resource contract. A green transport result means the same resources can be listed and read through the local STDIO MCP SDK boundary.

It does not approve review proposals, prove productivity lift, prove dashboard readiness, prove ChatGPT connector behavior, or prove a registered Codex MCP server configuration.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/control-plane-resource.test.ts packages/mcp/test/read-model.test.ts
pnpm test -- packages/mcp/test/stdio-server.test.ts
pnpm run eval:krn-mcp
pnpm run eval:krn-mcp-transport
```
