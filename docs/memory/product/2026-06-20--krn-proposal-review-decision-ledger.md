---
id: krn-proposal-review-decision-ledger
status: fact
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-013.md
  - docs/specs/krn-proposal-review-decision/README.md
  - docs/evals/krn-proposal-review-decision/README.md
  - docs/plans/canonical/SOURCES.md
  - packages/contracts/src/proposal-review-decision.ts
  - packages/mcp/src/proposal-review-decision-store.ts
  - packages/mcp/src/pending-review-view-model.ts
---

# KRN Proposal Review Decision Ledger

## Status

[FACT] KRN now has a typed append-only proposal review decision ledger under `.krn/proposal-reviews`.

## Useful Pattern

Proposal review state is a separate terminal record, not an edit to the proposal and not promotion:

```text
.krn/proposals/**/proposal.json
  -> KrnProposalReviewDecision
  -> .krn/proposal-reviews/**/decision.json
  -> Pending Review reviewed/pending/blocked counts
```

The store accepts a decision only when it references an existing proposal and its source refs resolve to the target source ledger or local files. Duplicate identical decisions are idempotent. A second terminal decision for the same proposal is rejected.

## KRN Implication

Pending Review can now remove proposals with one valid terminal decision from the pending queue while still blocking invalid or conflicting review decision records.

This creates the missing review-state object before dashboard buttons, promotion workflows, HTTP/API routes, or additional MCP tools. Future approval UI or API work should call this ledger or preserve the same semantics instead of mutating `proposal.json` in place.

## Evidence

- `pnpm test -- packages/mcp/test/pending-review-view-model.test.ts` passed with 20 test files and 63 tests after the manual conflict regression case was added.
- `pnpm run eval:krn-proposal-review-decision` generated `.krn/evals/krn-proposal-review-decision/20260620T013214Z-2143548/report.json` with 8/8 cases and 25/25 assertions.
- `pnpm typecheck` passed.
- `pnpm test` passed with 20/20 test files and 63/63 tests.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T013233Z-2144081/report.json` with 10/10 modules, 41/41 cases, and 120/120 assertions.

## Failure Mode

This becomes harmful if overclaimed as:

- memory/source/goal promotion correctness,
- dashboard approve/reject command readiness,
- HTTP/API or ChatGPT connector readiness,
- human review quality,
- target mutation safety beyond `.krn/proposal-reviews`,
- productivity or benchmark lift.

It also becomes harmful if future promotion code treats `approved_for_promotion` as permission to write target files without a separate typed promotion workflow and eval.

## Review Trigger

Revisit this note when:

- dashboard approve/reject controls are added,
- proposal promotion into memory/source/goal files is added,
- HTTP/API exposes review decisions,
- MCP tool coverage expands beyond proposal storage,
- benchmark work starts measuring baseline Codex vs KRN-assisted Codex.
