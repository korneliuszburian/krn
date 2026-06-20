---
id: krn-final-product-plan
kind: product-plan-pointer
status: active
owner: krn
updated: 2026-06-20
canonical_blueprint: docs/plans/canonical/draft.md
active_goal: docs/goals/goal-038.md
decision: ACCEPT_WITH_CHANGES
---

# KRN Final Product Plan Pointer

[DECISION] The full canonical product blueprint now lives in [docs/plans/canonical/draft.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/draft.md).

[DECISION] The active final-product execution contract is [docs/goals/goal-038.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-038.md).

This file remains only as a compatibility pointer for older docs and tooling that still reference `docs/product/final-product-plan.md`.

Current non-negotiable direction:

- KRN is a Codex Operating Layer / AI Engineering Control Plane.
- Codex executes; KRN supplies context, memory, sources, policy, skills, eval expectations, traces, review gates, feedback, API sync, and decision surfaces.
- `docs/memory/**` is a pattern bank / audit export, not final memory core.
- `.krn/**` is runtime evidence/cache/ledger, not final memory core.
- The target memory core is service/store backed, local-first initially and API/team-sync capable later.
- The active goal is final-product shaped, not MVP/v0/prototype shaped.
- Simplify/condense passes are mandatory on the cadence defined in `goal-038`.

Do not add product direction here. Update `docs/plans/canonical/draft.md` and keep this pointer aligned.
