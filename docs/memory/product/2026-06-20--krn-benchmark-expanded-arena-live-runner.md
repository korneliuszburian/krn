---
title: KRN Benchmark Expanded Arena Live Runner
date: 2026-06-20
kind: product-memory
status: active
source_refs:
  - docs/goals/goal-033.md
  - docs/goals/goal-006.md
  - docs/evals/krn-benchmark-expanded-arena/README.md
  - docs/evals/krn-benchmark-expanded-arena/tasks.json
  - docs/evals/krn-benchmark-expanded-arena/cases.json
  - docs/evals/krn-benchmark-expanded-arena/codex-output.schema.json
  - packages/evals/src/validate-krn-benchmark-expanded-arena.ts
  - docs/plans/canonical/SOURCES.md
---

# KRN Benchmark Expanded Arena Live Runner

## Conclusion

[FACT] `krn-benchmark-expanded-arena` now has three explicit modes: deterministic `validate`, explicit `live-smoke`, and explicit `live-full`.

[FACT] The default `pnpm run eval:krn-benchmark-expanded-arena` remains fixture-only and does not run `codex exec`.

[FACT] `live-smoke` uses temporary detached Git worktrees, schema-constrained `codex exec`, worker stdout/stderr/final/status/patch captures, and a progress log under `.krn/benchmarks/krn-benchmark-expanded-arena/{run_id}/`.

[FACT] The 2026-06-20 smoke evidence at `.krn/evals/krn-benchmark-expanded-arena/20260620T141316Z-3622439/report.json` passed 12/12 cases and 73/73 assertions, but its live benchmark report completed 0/1 selected tasks because both workers timed out.

[DECISION] This is runner/evidence-path proof only. It is not quality proof, full 20-task proof, or productivity-lift proof.

## Useful Pattern

Keep live Codex execution out of aggregate deterministic evals. Use explicit smoke/full commands, isolated writable worktrees, schema-constrained final output, local evidence files, and no-lift benchmark reports until the clean lift gate is met.

## Implication

The next benchmark repair should target worker prompt/budget ergonomics before `live-full` is used as product evidence. Dashboard/API command surfaces still stay blocked until clean live runner evidence exists.

## Failure Mode

Do not treat a green live-smoke contract report as a useful assisted result when selected tasks fail or timeout. The report proves transport mechanics, not breakthrough behavior.

## Review Trigger

Update this note when `live-smoke` completes at least one expanded-arena task cleanly, when `live-full` runs all 20 tasks, or when the live execution policy changes.
