---
id: krn-proposal-promotion-workflow
status: fact
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-014.md
  - docs/specs/krn-control-plane-proposal/README.md
  - docs/specs/krn-proposal-review-decision/README.md
  - docs/specs/krn-proposal-promotion/README.md
  - docs/evals/krn-proposal-promotion/README.md
  - docs/plans/canonical/SOURCES.md
  - packages/contracts/src/proposal-promotion.ts
  - packages/mcp/src/proposal-promotion-store.ts
---

# KRN Proposal Promotion Workflow

## Status

[FACT] KRN now has a typed proposal promotion workflow for exact `memory_update` payloads after an `approved_for_promotion` review decision.

## Useful Pattern

Promotion is a separate object and ledger, not an implicit side effect of approval:

```text
.krn/proposals/**/proposal.json with promotion_payload
  -> .krn/proposal-reviews/**/decision.json approved_for_promotion
  -> KrnProposalPromotion
  -> .krn/promotions/**/promotion.json
  -> optional explicit exact target write for memory_update only
```

The proposal must carry machine-applicable exact file content and a SHA-256 hash. The promotion store validates the proposal, review decision, payload match, source refs, idempotency, and target path safety before storing or applying anything.

## KRN Implication

KRN no longer needs to infer memory target content from prose when an approved proposal is promoted. The first safe promotion pilot is exact memory-entry content only; source claims, goal updates, eval requests, repair records, dashboard events, API write routes, and dashboard promote buttons remain future work.

## Evidence

- `pnpm test -- packages/contracts/test/control-plane-proposal.test.ts packages/contracts/test/proposal-promotion.test.ts packages/mcp/test/proposal-store.test.ts packages/mcp/test/proposal-promotion-store.test.ts` passed with 22 test files and 73 tests.
- `pnpm typecheck` passed.
- `pnpm run eval:krn-proposal-promotion` generated `.krn/evals/krn-proposal-promotion/20260620T015701Z-2203468/report.json` with 7/7 cases and 22/22 assertions.
- `pnpm run eval:krn-eval` generated `.krn/eval/20260620T015701Z-2203458/report.json` with 11/11 modules, 48/48 cases, and 142/142 assertions.

## Failure Mode

This becomes harmful if overclaimed as:

- general promotion correctness for all proposal kinds,
- dashboard promote command readiness,
- HTTP/API write-route readiness,
- ChatGPT connector behavior,
- human review quality,
- safe overwrite/update semantics for existing target files,
- productivity or benchmark lift.

It also becomes harmful if future code writes target files from `proposed_change` prose instead of a typed, hash-checked payload.

## Review Trigger

Revisit this note when:

- promotion support expands beyond exact `memory_update` payloads,
- dashboard promote controls are added,
- HTTP/API or MCP exposes promotion tools,
- target overwrite/update semantics are introduced,
- benchmark work starts measuring baseline Codex vs KRN-assisted Codex.
