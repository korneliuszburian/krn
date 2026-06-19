---
id: krn-source-backed-proposal-store
status: fact
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-009.md
  - docs/specs/krn-control-plane-proposal/README.md
  - docs/evals/krn-proposal-store/README.md
  - docs/plans/canonical/SOURCES.md
  - packages/mcp/src/proposal-store.ts
  - packages/mcp/test/proposal-store.test.ts
---

# KRN Source-Backed Proposal Store

## Status

[FACT] KRN now has a local proposal-store boundary before any MCP/API proposal tool is registered.

## Useful Pattern

Do not treat `source_refs` as decorative strings. A proposal can be persisted only when every source ref resolves to one of:

- an existing target-root file,
- a source ID, claim ID, or local evidence ID in `docs/plans/canonical/SOURCES.md`,
- a URL already present in `docs/plans/canonical/SOURCES.md`.

Proposal persistence is append-only under `.krn/proposals/{idempotency-key}/proposal.json`. The same idempotency key and identical content returns the existing proposal. The same idempotency key with different content is rejected.

## KRN Implication

Future proposal tools must consume `storeKrnControlPlaneProposal` or preserve the same semantics:

```text
unknown input -> proposal parser -> source-ref gate -> append-only store -> deterministic eval
```

This prevents KRN from becoming a snapshot/artifact generator where JSON claims look source-backed but are not mechanically tied to the source ledger.

## Evidence

- `pnpm exec vitest run packages/contracts/test/control-plane-proposal.test.ts packages/mcp/test/proposal-store.test.ts packages/contracts/test/eval-report.test.ts packages/cli/test/eval.test.ts` passed with 4 files and 13 tests.
- `pnpm run eval:krn-proposal-store` passed 4/4 cases and 9/9 assertions.
- `pnpm run eval:krn-eval` passed 3/3 cases and 7/7 assertions after `krn-proposal-store` was added to the aggregate eval contract.

## Failure Mode

This becomes harmful if it is overclaimed as:

- MCP/API proposal tool safety,
- human approval,
- target mutation approval,
- dashboard readiness,
- productivity lift.

It also becomes harmful if future tools bypass the source-ref gate and write directly under `.krn/proposals`.

## Review Trigger

Revisit this note when:

- MCP proposal tools are registered,
- proposal approval workflow is added,
- dashboard Pending Review reads proposal-store records,
- `docs/plans/canonical/SOURCES.md` changes shape,
- source refs need line-level or paper-section-level validation.
