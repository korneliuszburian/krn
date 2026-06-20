---
id: krn-proposal-promotion
kind: command-contract
status: active
owner: krn
updated: 2026-06-21
sources:
  - docs/goals/goal-006.md
  - docs/goals/goal-014.md
  - docs/product/final-product-plan.md
  - docs/specs/krn-control-plane-proposal/README.md
  - docs/specs/krn-proposal-review-decision/README.md
  - docs/plans/canonical/SOURCES.md
---

# KRN Proposal Promotion Contract

## Purpose

`KrnProposalPromotion` records the typed promotion workflow after a proposal has a terminal `approved_for_promotion` review decision.

It prevents KRN from treating approval as vague permission to rewrite files. Promotion can only use a machine-applicable payload from the proposal, validates the approved decision, and records the promotion under `.krn/promotions`.

Current promotion kinds are intentionally narrow: `memory_update` and the first `init_bootstrap` targets for `agent_instructions`, `local_config`, and `source_pointers`.

## Public Interface

```ts
parseKrnProposalPromotion(input)
krnProposalPromotionJsonSchema
storeKrnProposalPromotion(input, { targetInput })
listKrnProposalPromotionStoreRecords(targetRoot)
```

## Required Shape

Every promotion includes:

- stable schema version,
- proposal id and proposal path,
- review decision id and decision path,
- `proposal_kind: "memory_update"` or `"init_bootstrap"`,
- `promotion_scope: "approved_memory_update_only"` or `"approved_init_bootstrap_only"`,
- `apply_mode: "record_only"` or `"apply_exact_target_write"`,
- `target_mutated` truthfully tied to apply mode,
- exact target file content and SHA-256 hash,
- idempotency key,
- source refs,
- evidence refs,
- blocked surfaces,
- interpretation caveat.

## Boundary

Allowed behavior:

- parse promotion objects through `@krn/contracts`,
- validate proposal and review decision records before storing promotion,
- persist promotion records under `.krn/promotions`,
- in explicit apply mode only, write exact target content to the proposal target path when the path is safe and absent.
- promote exact `memory_entry` payloads only for `memory_update` proposals,
- promote exact `init_agent_instructions`, `init_local_config`, and `init_source_pointers` payloads only for `init_bootstrap` proposals.

Forbidden behavior:

- no promotion without an existing proposal,
- no promotion without an `approved_for_promotion` review decision,
- no rejected proposal promotion,
- no inferred target content from prose,
- no overwrite of an existing different target file,
- no source/goal/eval/dashboard mutation in this slice,
- no broad init scaffolding beyond exact reviewed `AGENTS.md`, `.krn/config.toml`, and `.krn/sources/index.json` payloads,
- no HTTP/API or dashboard command readiness claim,
- no productivity or human-review-quality claim.

## Interpretation

A green proposal promotion result means KRN can record and optionally apply one exact payload after a review decision for the currently allowed proposal kinds: `memory_update` and `init_bootstrap`.

It does not prove general promotion correctness for all proposal kinds, broad `krn init` scaffolding, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or productivity lift.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/proposal-promotion.test.ts
pnpm test -- packages/mcp/test/proposal-promotion-store.test.ts
pnpm run eval:krn-proposal-promotion
pnpm typecheck
```
