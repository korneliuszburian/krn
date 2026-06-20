---
title: KRN Benchmark Expanded Arena Smoke Worker Ergonomics
date: 2026-06-20
kind: product-memory
status: active
source_refs:
  - docs/goals/goal-034.md
  - docs/goals/goal-006.md
  - docs/evals/krn-benchmark-expanded-arena/README.md
  - docs/evals/krn-benchmark-expanded-arena/tasks.json
  - docs/evals/krn-benchmark-expanded-arena/cases.json
  - docs/evals/krn-benchmark-expanded-arena/fixtures/live-smoke-release-claim.md
  - packages/evals/src/validate-krn-benchmark-expanded-arena.ts
  - .krn/evals/krn-benchmark-expanded-arena/20260620T150429Z-3746653/report.json
  - .krn/benchmarks/krn-benchmark-expanded-arena/20260620T150429Z-3746653/report.json
  - .krn/eval/20260620T145930Z-3730966/report.json
  - docs/plans/canonical/SOURCES.md
---

# KRN Benchmark Expanded Arena Smoke Worker Ergonomics

## Conclusion

[FACT] `goal-034` repaired the expanded-arena `live-smoke` worker ergonomics by adding a bounded done-claim fixture, making the smoke task id and input ref registry-owned, giving baseline and assisted workers task source refs, syncing foreground repair files into detached worker worktrees, and refusing to resume failed or timeout captures as completed workers.

[FACT] The successful 2026-06-20 smoke run at `.krn/evals/krn-benchmark-expanded-arena/20260620T150429Z-3746653/report.json` passed 14/14 cases and 85/85 assertions. Its benchmark report completed 1/1 selected task with 0 failed workers, baseline score `0.9167`, assisted score `0.9167`, delta `0`, `lift_status: "no_lift_evidence"`, and `productivity_lift_claimed: false`.

[FACT] The aggregate eval report at `.krn/eval/20260620T145930Z-3730966/report.json` passed 20/20 modules, 101/101 cases, and 382/382 assertions after the bounded smoke-repair guard was added to validate mode.

[DECISION] This repairs useful smoke completion only. It does not prove full 20-task expanded execution, productivity lift, statistical validity, dashboard/API command readiness, ChatGPT connector behavior, or human review quality.

## Useful Pattern

Live worker smoke tasks need bounded input artifacts and registry-owned selection policy. Detached worker worktrees must see the current foreground repair state when the slice has not been committed yet, but default deterministic evals must stay fixture-only and no-lift.

## KRN Implication

The next benchmark slice can use the cleaned `live-smoke` as readiness evidence for either a carefully bounded `live-full` run or another runner-quality repair. It still must not add dashboard/API run controls or claim lift from the single smoke task.

## Failure Mode

Do not overcorrect by hardcoding every current goal path into every task. Keep durable goal/source refs at the registry level and include task-level refs only where workers actually need the file as task input.

## Review Trigger

Update this note when `live-full` runs the 20-task registry, when foreground-state syncing is replaced by a cleaner committed-state worker protocol, when concurrency expands beyond one worker, or when a future smoke/full run reports positive clean lift evidence.
