---
id: krn-proposal-promotion-eval
kind: eval-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/evals/STANDARD.md
  - docs/goals/goal-006.md
  - docs/goals/goal-014.md
  - docs/specs/krn-proposal-promotion/README.md
  - docs/specs/krn-proposal-review-decision/README.md
  - docs/specs/krn-control-plane-proposal/README.md
  - docs/plans/canonical/SOURCES.md
---

# KRN Proposal Promotion Eval

## Purpose

Validate the first typed proposal promotion workflow after a proposal review decision.

This eval exists to prevent KRN from treating `approved_for_promotion` as vague permission to mutate docs. Promotion must validate an existing proposal, an approved review decision, a machine-applicable proposal payload, source refs, target path safety, and idempotent `.krn/promotions` persistence.

## Command

```bash
pnpm run eval:krn-proposal-promotion
```

Runtime output:

```text
.krn/evals/krn-proposal-promotion/{run_id}/report.json
```

## Interpretation

A green result proves only the local proposal promotion boundary:

- valid and known-bad promotion fixtures behave correctly,
- control-plane proposals can carry exact machine-applicable memory payloads,
- record-only promotion persists under `.krn/promotions` without target mutation,
- explicit apply mode writes exact target content only after approved review,
- exact `init_bootstrap` agent-instructions payloads can be applied only through the approved promotion boundary,
- exact `init_bootstrap` local-config payloads can be applied only through the approved promotion boundary,
- rejected decisions cannot promote proposals,
- proposals without machine-applicable payload cannot promote,
- duplicate promotion writes are idempotent,
- unsafe target paths are rejected.

It does not prove general promotion correctness for all proposal kinds, broad `krn init` scaffolding, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or productivity lift.
