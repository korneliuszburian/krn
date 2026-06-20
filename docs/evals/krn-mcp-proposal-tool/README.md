---
id: krn-mcp-proposal-tool-eval
kind: eval-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/evals/STANDARD.md
  - docs/goals/goal-006.md
  - docs/goals/goal-010.md
  - docs/specs/krn-mcp-proposal-tool/README.md
  - docs/specs/krn-control-plane-proposal/README.md
  - docs/plans/canonical/SOURCES.md
---

# KRN MCP Proposal Tool Eval

## Purpose

Validate the first proposal-only MCP tool over the actual STDIO transport.

This eval exists because a direct store test is not enough. KRN must prove the MCP server exposes exactly one proposal-only tool, that the tool stores through the source-backed append-only store, and that negative cases fail as tool errors without creating proposal records.

## Command

```bash
pnpm run eval:krn-mcp-proposal-tool
```

Runtime output:

```text
.krn/evals/krn-mcp-proposal-tool/{run_id}/report.json
```

## Interpretation

A green result proves only the local STDIO MCP proposal-tool boundary:

- the MCP server lists `krn_store_control_plane_proposal`,
- read-only runtime resources remain available,
- valid proposal input stores append-only under `.krn/proposals`,
- duplicate idempotency returns `already_stored`,
- unbacked source refs and unsafe target paths return tool errors,
- invalid tool calls create no proposal records.

It does not prove human approval quality, dashboard UI readiness, HTTP/API readiness, ChatGPT connector behavior, target mutation safety beyond `.krn/proposals`, or productivity lift.
