# KRN final product plan and three realization slices

Status: decision

Sources:

- `docs/product/final-product-plan.md`
- `docs/goals/goal-006.md`
- `docs/goals/goal-005.md`
- `docs/specs/technology-stack/decision.md`
- `docs/plans/canonical/pattern-matrix.md`
- `docs/plans/canonical/SOURCES.md`
- `docs/skills/operator-pipeline.md`
- `docs/evals/STANDARD.md`

Useful pattern:

KRN should not be planned as PoC/MVP/v1/v2. Use one final-product architecture and execute it through dependency-ordered slices. Gas Town is the repo/codename, not the public product/tool name.

1. Operator Build System.
2. Typed Runtime Spine.
3. Control Plane And Measured Lift.

These are not maturity stages. Each slice must use final standards from the start: source-backed claims, TypeScript contracts, deterministic evals, repair records, and dashboard-readiness.

KRN implication:

- `docs/product/final-product-plan.md` is the canonical product plan.
- `docs/goals/goal-006.md` is the next active execution contract.
- `docs/goals/goal-005.md` is superseded as the active direction and becomes Slice 2 context for `krn init --dry-run`.
- Future `/goal` work must identify the current slice and the acceptance evidence it is producing.

Failure mode:

- The repo drifts back to a bootstrap-only `krn init` plan.
- New docs duplicate product truth instead of pointing to the final plan.
- A slice is treated as an MVP and allowed to ignore final standards.
- Dashboard/API/MCP work starts before typed product objects exist.

Review trigger:

Update this note when `goal-006` is completed, superseded, or split into a new execution contract.
