---
id: krn-mcp-proposal-tool
status: fact
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-010.md
  - docs/specs/krn-mcp-proposal-tool/README.md
  - docs/evals/krn-mcp-proposal-tool/README.md
  - docs/specs/krn-control-plane-proposal/README.md
  - docs/plans/canonical/SOURCES.md
  - packages/mcp/src/server.ts
  - packages/evals/src/validate-krn-mcp-proposal-tool.ts
---

# KRN MCP Proposal Tool

## Status

[FACT] KRN now exposes exactly one local STDIO MCP proposal-only tool: `krn_store_control_plane_proposal`.

## Useful Pattern

The tool is useful only because it sits behind the prior proposal-store boundary:

```text
unknown MCP input -> KrnControlPlaneProposal parser -> source-ref gate -> append-only .krn/proposals store -> typed non-approval tool result
```

MCP annotations are treated as hints. Safety comes from the parser, source-ref validation, append-only persistence, idempotency behavior, and deterministic eval coverage.

## KRN Implication

Future proposal tools must follow the same pattern: one narrow tool, shared contracts, no target mutation, explicit non-approval output, and a transport-level eval before aggregate `krn eval` includes the module.

This is the first product step where MCP is not only a read model: it can record review input, but only under `.krn/proposals`.

## Evidence

- `pnpm exec vitest run packages/contracts/test/mcp-proposal-tool.test.ts packages/mcp/test/stdio-server.test.ts packages/mcp/test/proposal-store.test.ts packages/cli/test/eval.test.ts packages/contracts/test/eval-report.test.ts` passed with 5 files and 17 tests.
- `pnpm run eval:krn-mcp-transport` generated `.krn/evals/krn-mcp-transport/20260620T000555Z-1943987/report.json` with 3/3 cases and 7/7 assertions.
- `pnpm run eval:krn-mcp-proposal-tool` generated `.krn/evals/krn-mcp-proposal-tool/20260620T000445Z-1940364/report.json` with 5/5 cases and 16/16 assertions.
- `pnpm run krn -- eval` generated `.krn/eval/20260620T000445Z-1940365/report.json` with 7/7 modules, 24/24 cases, and 62/62 assertions.

## Failure Mode

This becomes harmful if the tool is overclaimed as:

- human approval,
- dashboard Pending Review readiness,
- HTTP/API or ChatGPT connector readiness,
- target mutation safety beyond `.krn/proposals`,
- productivity or benchmark lift.

It also becomes harmful if future MCP tools bypass `storeKrnControlPlaneProposal` or if annotations are treated as enforcement.

## Review Trigger

Revisit this note when:

- another MCP proposal tool is added,
- HTTP/API transport is added,
- dashboard Pending Review consumes proposal records,
- proposal approval/rejection workflow exists,
- source refs need stronger line-level or source-section validation,
- a benchmark starts measuring baseline Codex vs KRN-assisted Codex.
