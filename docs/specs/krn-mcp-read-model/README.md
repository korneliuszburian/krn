---
id: krn-mcp-read-model-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-19
sources:
  - docs/goals/goal-006.md
  - docs/product/final-product-plan.md
  - docs/specs/technology-stack/decision.md
  - docs/evals/STANDARD.md
  - https://developers.openai.com/codex/mcp
---

# KRN MCP Read Model Contract

## Purpose

`packages/mcp` is the first Slice 3 control-plane package. It exposes an allowlisted read-only resource model over local `.krn` runtime reports.

This is not yet an installed Codex MCP server and not a write-capable API. It is the typed read model that a later STDIO or HTTP MCP server can serve.

## Public Interface

```ts
listKrnControlPlaneResources(targetRoot)
readKrnControlPlaneResource(uri, targetRoot)
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
- report missing or invalid resources without mutating the target.

Forbidden behavior:

- no destructive MCP tools,
- no proposal/write tools in this slice,
- no `.codex/config.toml` server registration,
- no memory/source/goal mutation,
- no dashboard mocked state.

## Interpretation

A green read-model result means KRN can expose typed local runtime state through a resource contract.

It does not approve review proposals, prove productivity lift, prove dashboard readiness, or prove a deployed MCP server transport.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/control-plane-resource.test.ts packages/mcp/test/read-model.test.ts
pnpm run eval:krn-mcp
```
