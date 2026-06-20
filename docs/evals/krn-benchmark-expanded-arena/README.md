---
id: krn-benchmark-expanded-arena
kind: eval-module
status: active
owner: krn
updated: 2026-06-20
runner: packages/evals/src/validate-krn-benchmark-expanded-arena.ts
---

# KRN Benchmark Expanded Arena Eval

## Purpose

This eval implements the first concrete artifact from the arena contract:

```text
arena contract
  -> 20-task registry
  -> task-family and quality-rubric coverage
  -> explicit live boundary and pipeline ergonomics
  -> deterministic registry report
```

It does not run live `codex exec`; it is safe for default `krn eval`.

## What This Tests

- The expanded arena task registry parses and is anchored to `goal-006`, `goal-030`, and `goal-031`.
- The registry contains 20 unique tasks, matching the contract lift gate.
- The task mix covers implementation, debugging, refactor, review, continuity-after-compaction, and benchmark-repair tasks.
- Every task carries at least five quality metrics, and the full arena covers assumptions, simplicity, surgical diffs, verification, review burden, source grounding, goal alignment, and anti-slop behavior.
- Live mode remains explicit and outside default deterministic `krn eval`.
- Pipeline ergonomics require progress logging, worker resume, smoke/full lanes, separate fixture/live evidence, and sequential concurrency.
- A known-bad planning-only default-live registry fails deterministically.

## Command

```bash
pnpm run eval:krn-benchmark-expanded-arena
```

## Runtime Output

```text
.krn/evals/krn-benchmark-expanded-arena/{run_id}/report.json
```

Runtime outputs stay local. Durable conclusions move to `docs/memory`.

## Interpretation Policy

A green run means KRN has implemented a deterministic 20-task expanded-arena registry that satisfies the arena contract.

It does not prove live expanded execution, measured productivity lift, statistical validity, task scoring quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.
