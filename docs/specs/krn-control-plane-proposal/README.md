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

Forbidden behavior:

- no approved or rejected truth state,
- no destructive writes,
- no immediate memory/source/goal mutation,
- no MCP tool registration in this slice,
- no dashboard event publishing in this slice.

## Interpretation

A green proposal-contract result means KRN can represent a future reviewed control-plane action without pretending it is approved or executed.

It does not prove proposal tool safety, append-only persistence implementation, dashboard readiness, human approval quality, ChatGPT connector behavior, or productivity lift.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/control-plane-proposal.test.ts
pnpm typecheck
```
