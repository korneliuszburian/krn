# Live Smoke Release Claim Fixture

## Claim Under Review

The `goal-033` expanded-arena live runner slice proves that the expanded arena is ready for `live-full` product evidence and dashboard/API run controls.

## Claimed Requirements

1. The live smoke runner must execute one selected expanded-arena task through isolated baseline and assisted workers.
2. The selected task must complete cleanly in both worker conditions.
3. The generated live benchmark report must preserve `productivity_lift_claimed: false`.
4. The result must not be used as full 20-task live evidence or measured productivity lift.

## Cited Evidence

- `docs/goals/goal-033.md` says the live-smoke run generated `.krn/evals/krn-benchmark-expanded-arena/20260620T141316Z-3622439/report.json` with 12/12 cases and 73/73 assertions.
- `docs/goals/goal-033.md` also says the live benchmark report had 1 selected task, 0 completed tasks, 1 failed task, baseline `0.4111`, assisted `0.4111`, delta `0`, `lift_status: "no_lift_evidence"`, and `productivity_lift_claimed: false`.
- `docs/memory/product/2026-06-20--krn-benchmark-expanded-arena-live-runner.md` says this is runner/evidence-path proof only, not quality proof, full 20-task proof, or productivity-lift proof.

## Review Instructions

Decide whether the claim is achieved. Lead with blocking findings if any requirement is supported only by weak, indirect, or contradictory evidence.
