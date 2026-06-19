---
id: eval-index
kind: eval-index
status: active
owner: krn
updated: 2026-06-19
---

# KRN Evals

This folder contains repo-local evaluation definitions. Runtime outputs belong in `.krn/evals/`.

## Modules

- [codex-memory-compliance](./codex-memory-compliance/README.md) checks whether Codex follows repo-local instructions and memory conventions from neutral prompts, without being explicitly told to read `docs/memory`.
- [operator-skill-contracts](./operator-skill-contracts/README.md) checks whether P1 repo-local operator skills exist under `.agents/skills` and expose the required static contract.
- [operator-skill-impact](./operator-skill-impact/README.md) compares neutral Codex runs against explicit repo-local operator-skill runs and reports metric deltas.
- [product-spine-contracts](./product-spine-contracts/README.md) checks whether the first product object contracts validate real examples and reject known-bad fixtures before API/MCP/dashboard work.

## Rules

1. Keep eval definitions small and runnable.
2. Prefer deterministic assertions before model-graded assertions.
3. Every case needs an expected behavior, failure mode, and source pattern.
4. Runtime traces are local artifacts; durable findings move to `docs/memory`.
5. A passing eval is not proof of product quality. It is a regression guard for one behavior.
