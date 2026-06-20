---
id: eval-index
kind: eval-index
status: active
owner: krn
updated: 2026-06-20
---

# KRN Evals

This folder contains repo-local evaluation definitions. Runtime outputs belong in `.krn/evals/`.

## Modules

- [codex-memory-compliance](./codex-memory-compliance/README.md) checks whether Codex follows repo-local instructions and memory conventions from neutral prompts, without being explicitly told to read `docs/memory`.
- [krn-doctor-contracts](./krn-doctor-contracts/README.md) checks whether `krn doctor` emits a schema-backed readiness report covering AGENTS, memory, skills, hooks, evals, and runtime surfaces.
- [krn-eval-contracts](./krn-eval-contracts/README.md) checks whether `krn eval` emits a schema-backed aggregate report over deterministic local eval modules.
- [krn-mcp-read-model](./krn-mcp-read-model/README.md) checks whether the first Slice 3 `packages/mcp` read model exposes allowlisted read-only resources over typed `.krn` runtime reports.
- [krn-mcp-transport](./krn-mcp-transport/README.md) checks whether the first Slice 3 local STDIO MCP transport lists and reads allowlisted resources while advertising only the separate proposal-only tool.
- [krn-mcp-proposal-tool](./krn-mcp-proposal-tool/README.md) checks whether the first Slice 3 MCP proposal-only tool stores source-backed proposals, preserves idempotency, and rejects unsafe inputs.
- [krn-pending-review-view-model](./krn-pending-review-view-model/README.md) checks whether dashboard Pending Review can render real proposal-store records, explicit empty state, invalid records, and stale source refs.
- [krn-review-contracts](./krn-review-contracts/README.md) checks whether `krn review` emits a schema-backed proposal-only report over typed local runtime artifacts.
- [operator-skill-contracts](./operator-skill-contracts/README.md) checks whether P1 repo-local operator skills exist under `.agents/skills` and expose the required static contract.
- [operator-skill-impact](./operator-skill-impact/README.md) compares neutral Codex runs against explicit repo-local operator-skill runs and reports metric deltas.
- [krn-init-contracts](./krn-init-contracts/README.md) checks whether `krn init --dry-run` emits a schema-backed manifest and rejects a known-bad write-mode fixture.
- [product-spine-contracts](./product-spine-contracts/README.md) checks whether the first product object contracts validate real examples and reject known-bad fixtures before API/MCP/dashboard work.

## Rules

1. Keep eval definitions small and runnable.
2. Prefer deterministic assertions before model-graded assertions.
3. Every case needs an expected behavior, failure mode, and source pattern.
4. Runtime traces are local artifacts; durable findings move to `docs/memory`.
5. A passing eval is not proof of product quality. It is a regression guard for one behavior.
