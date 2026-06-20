# OpenAI Cookbook Mapping: KRN Proposal Review Decision

This eval maps the proposal review decision ledger to KRN's source-backed, acceptance-driven control-plane pattern.

| Case | Source pattern | KRN mechanism | Failure guarded |
|---|---|---|---|
| `decision-contract-valid-and-known-bad` | Goals and ExecPlans require explicit success and blocked boundaries before work is claimed done. | Review decisions parse only when they state no target mutation and no promotion. | Approval-like JSON becomes executed truth. |
| `append-only-review-decision-store` | MCP/API writes need schemas, idempotency, and audit. | Store accepts decisions only for existing proposals and writes under `.krn/proposal-reviews`. | Review state bypasses proposal records or mutates targets. |
| `duplicate-review-decision-idempotent` | Repeatable artifacts need stable stop conditions. | Same decision and idempotency key returns the existing decision path. | Duplicate terminal review decisions accumulate. |
| `missing-proposal-review-decision-rejected` | Tool/write surfaces must validate referenced state. | Missing proposal references fail before persistence. | Review can close non-existent work. |
| `conflicting-terminal-review-decision-rejected` | Repair/review loops need unambiguous terminal state. | A second terminal decision for one proposal is rejected. | Approval/rejection state becomes contradictory. |
| `pending-review-excludes-reviewed-proposal` | Dashboard/control-plane surfaces must read typed product objects only. | Pending Review consumes decision records and removes valid reviewed proposals from the queue. | UI keeps reviewed proposals pending or invents hidden state. |
| `invalid-review-decision-blocks-readiness` | Deterministic evals should surface invalid artifacts instead of hiding them. | Invalid decision files block queue readiness and route repair to the review ledger. | Broken review records disappear from the dashboard/control plane. |
| `manual-conflicting-review-decisions-block-readiness` | Repair/review loops need unambiguous terminal state and visible failure modes. | Pending Review keeps a proposal pending and blocks readiness when manually written valid decisions conflict. | Contradictory approved/rejected state is hidden as reviewed. |
