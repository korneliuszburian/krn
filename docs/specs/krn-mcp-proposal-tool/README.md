---
id: krn-mcp-proposal-tool
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-038.md
  - docs/goals/goal-010.md
  - docs/specs/krn-control-plane-proposal/README.md
  - docs/plans/canonical/SOURCES.md
  - https://developers.openai.com/codex/mcp
---

# KRN MCP Proposal Tool

## Purpose

`krn_store_control_plane_proposal` is the first proposal-only MCP tool. It persists review input under `.krn/proposals` by calling `storeKrnControlPlaneProposal`.

It is not an approval tool and not a general write tool.

## Public Interface

Tool name:

```text
krn_store_control_plane_proposal
```

Input:

```ts
KrnControlPlaneProposal
```

Output:

```ts
parseKrnMcpProposalToolResult(input)
krnMcpProposalToolResultJsonSchema
```

Tool-result `source_refs` should cite stable proposal/tool contracts. The stored proposal keeps its own validated source lineage; the tool result must not copy the active goal or canonical blueprint as volatile product truth.

## Boundary

Allowed behavior:

- validate tool input through the `KrnControlPlaneProposal` parser,
- validate source refs through the proposal store,
- persist only append-only proposal review input under `.krn/proposals`,
- return a typed tool result with `approved: false` and `mutated_target: false`.

Forbidden behavior:

- no direct memory/source/goal mutation,
- no proposal approval or rejection state,
- no target-path mutation,
- no dashboard event publication,
- no destructive MCP tools,
- no productivity or dashboard-readiness claim.

## Interpretation

A green MCP proposal-tool eval means the local STDIO MCP server can expose one proposal-only tool that writes append-only review input through the existing source-backed store.

It does not prove human approval quality, dashboard UI readiness, HTTP/API readiness, ChatGPT connector behavior, target mutation safety beyond `.krn/proposals`, or productivity lift.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/mcp-proposal-tool.test.ts packages/mcp/test/stdio-server.test.ts
pnpm run eval:krn-mcp-proposal-tool
pnpm typecheck
```
