# Coding Quality Rubric For Agent Work

Status: decision

Sources:

- User-provided behavioral coding guidelines in the active `goal-006` thread on 2026-06-20.
- `docs/goals/goal-006.md`
- `docs/evals/krn-benchmark-live-suite/tasks.json`
- `packages/evals/src/validate-krn-benchmark-live-suite.ts`

Useful pattern:

KRN should measure agent coding quality as behavior, not only task completion. The key dimensions are explicit assumptions, simplicity, surgical diffs, and goal-driven verification.

KRN implication:

The current live benchmark metrics cover routing, source grounding, goal alignment, next action quality, and overclaim boundaries. The next expanded benchmark/autoresearch arena should add quality dimensions for:

- assumption surfacing before implementation,
- no speculative features or abstractions,
- minimal scoped diffs tied to the request,
- cleanup limited to changes introduced by the agent,
- verification that covers the stated success criteria,
- review burden left for the human.

Failure mode:

Do not turn this rubric into generic caution that blocks ambitious research. It should prevent sloppy implementation and overcomplicated diffs while still allowing aggressive experiment loops when the harness has a clear metric, budget, and rollback path.

Review trigger:

Update this note when the live benchmark suite expands, when a coding-quality eval module is added, when reviewer burden is measured, or when the rubric conflicts with a task that legitimately needs broader architectural work.
