---
id: krn-control-plane-proposal-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-008.md
  - docs/product/final-product-plan.md
  - docs/specs/technology-stack/decision.md
  - docs/evals/STANDARD.md
  - docs/plans/canonical/SOURCES.md
---

# KRN Control-Plane Proposal Contract

## Purpose

`KrnControlPlaneProposal` is the first Slice 3 proposal-only object contract. It prepares safe future control-plane write surfaces without exposing MCP/API tools yet.

A proposal is not approved truth. It is a schema-backed, append-only, idempotent, human-reviewable request to change or record product state later.

## Public Interface

```ts
parseKrnControlPlaneProposal(input)
krnControlPlaneProposalJsonSchema
validateProposalSourceRefs(proposal, targetRoot)
storeKrnControlPlaneProposal(input, { targetInput })
```

## Required Shape

Every proposal includes:

- stable schema version,
- proposal kind,
- `status: "proposal_only"`,
- target path or resource URI,
- idempotency key,
- source refs,
- evidence refs,
- human review gate,
- no-mutation default write policy,
- blocked surfaces,
- interpretation caveat.

## Boundary

Allowed behavior:

- parse proposal objects through `@krn/contracts`,
- export JSON Schema for MCP/API/dashboard consumers,
- represent future append-only reviewed write requests.
- validate proposal source refs against existing target-root files or `docs/plans/canonical/SOURCES.md`,
- persist proposal review inputs only under `.krn/proposals/{idempotency-key}/proposal.json`.

Forbidden behavior:

- no approved or rejected truth state,
- no destructive writes,
- no immediate memory/source/goal mutation,
- no MCP tool registration in this slice,
- no dashboard event publishing in this slice.
- no unbacked source refs masquerading as paper/source-backed product decisions.

## Interpretation

A green proposal-contract result means KRN can represent a future reviewed control-plane action without pretending it is approved or executed.

A green proposal-store result means KRN can persist that action as append-only review input only after its `source_refs` resolve to existing target-root files, source IDs, claim IDs, local evidence IDs, or URLs present in `docs/plans/canonical/SOURCES.md`.

It does not prove MCP/API proposal tool safety, dashboard readiness, human approval quality, ChatGPT connector behavior, target mutation safety beyond `.krn/proposals`, or productivity lift.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/control-plane-proposal.test.ts
pnpm test -- packages/mcp/test/proposal-store.test.ts
pnpm run eval:krn-proposal-store
pnpm typecheck
```
