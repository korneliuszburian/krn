---
id: krn-proposal-review-decision
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-038.md
  - docs/goals/goal-013.md
  - docs/plans/canonical/draft.md
  - docs/specs/krn-control-plane-proposal/README.md
  - docs/specs/krn-pending-review-view-model/README.md
  - docs/plans/canonical/SOURCES.md
---

# KRN Proposal Review Decision Contract

## Purpose

`KrnProposalReviewDecision` records a terminal human review decision for a proposal-store record.

It is append-only review state. It is not promotion, target mutation, dashboard command readiness, or productivity proof.

## Public Interface

```ts
parseKrnProposalReviewDecision(input)
krnProposalReviewDecisionJsonSchema
storeKrnProposalReviewDecision(input, { targetInput })
listKrnProposalReviewDecisionStoreRecords(targetRoot)
```

## Required Shape

Every decision includes:

- stable schema version,
- decision id,
- referenced proposal id and proposal path,
- `decision: "approved_for_promotion"` or `decision: "rejected"`,
- `review_scope: "proposal_review_only"`,
- `target_mutated: false`,
- `promotion_state: "not_promoted"`,
- idempotency key,
- source refs,
- evidence refs,
- blocked surfaces,
- interpretation caveat.

## Boundary

Allowed behavior:

- parse decision objects through `@krn/contracts`,
- export JSON Schema for MCP/API/dashboard consumers,
- persist decision records under `.krn/proposal-reviews`,
- mark a proposal as reviewed for Pending Review queue purposes.

Forbidden behavior:

- no target mutation,
- no memory/source/goal promotion,
- no in-place proposal mutation,
- no dashboard approve/reject button,
- no destructive MCP/API tool,
- no productivity or human-review-quality claim.

## Interpretation

A green proposal review decision result means KRN can record append-only terminal review state for proposal-store records and consume it in Pending Review.

It does not prove promotion correctness, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, target mutation safety beyond `.krn/proposal-reviews`, or productivity lift.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/proposal-review-decision.test.ts
pnpm test -- packages/mcp/test/proposal-review-decision-store.test.ts
pnpm run eval:krn-proposal-review-decision
pnpm typecheck
```
