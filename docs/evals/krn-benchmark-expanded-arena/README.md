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
  -> deterministic fixture scoring
  -> fixture_contract KrnBenchmarkReport
  -> explicit isolated live smoke/full runner modes
  -> explicit live boundary and pipeline ergonomics
  -> deterministic registry report
```

Validate mode does not run live `codex exec`; it is safe for default `krn eval`.

Live modes are explicit because they call `codex exec` workers:

- `live-smoke` runs one registry task through isolated baseline and assisted worker worktrees.
- `live-full` uses the same runner path for all 20 registry tasks.

## What This Tests

- The expanded arena task registry parses and is anchored to `goal-006`, `goal-030`, and `goal-031`.
- The registry contains 20 unique tasks, matching the contract lift gate.
- The task mix covers implementation, debugging, refactor, review, continuity-after-compaction, and benchmark-repair tasks.
- Every task carries at least five quality metrics, and the full arena covers assumptions, simplicity, surgical diffs, verification, review burden, source grounding, goal alignment, and anti-slop behavior.
- Live mode remains explicit and outside default deterministic `krn eval`.
- Pipeline ergonomics require progress logging, worker resume, smoke/full lanes, separate fixture/live evidence, and sequential concurrency.
- A known-bad planning-only default-live registry fails deterministically.
- Baseline and assisted scoring fixtures cover all 20 task IDs, generate a parseable `KrnBenchmarkReport`, and keep `productivity_lift_claimed: false`.
- A known-bad scoring fixture that covers too few tasks, omits review-burden coverage, or claims lift fails deterministically.
- Explicit live runner modes are callable but not part of default aggregate `krn eval`.
- Live workers use temporary detached Git worktrees with `--sandbox workspace-write`, schema-constrained final output, patch/status capture, and a progress log.
- Live reports remain `productivity_lift_claimed: false` unless a future full clean 20-task run satisfies the benchmark lift gate.

## Command

```bash
pnpm run eval:krn-benchmark-expanded-arena
pnpm run eval:krn-benchmark-expanded-arena:live-smoke
pnpm run eval:krn-benchmark-expanded-arena:live-full
```

Only the first command belongs in default deterministic validation. The live commands are explicit worker runs.

## Runtime Output

```text
.krn/evals/krn-benchmark-expanded-arena/{run_id}/report.json
.krn/benchmarks/krn-benchmark-expanded-arena/{run_id}/report.json
.krn/benchmarks/krn-benchmark-expanded-arena/{run_id}/progress.jsonl
```

Runtime outputs stay local. Durable conclusions move to `docs/memory`.

## Interpretation Policy

A green run means KRN has implemented a deterministic 20-task expanded-arena registry that satisfies the arena contract.

It also proves deterministic fixture scoring and benchmark-report generation for that registry.

It does not prove live expanded execution, measured productivity lift, statistical validity, isolated coding-task runner safety, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

A green `live-smoke` run proves only that the isolated live runner path can execute and capture evidence for one selected task. It does not prove all 20 tasks ran or that KRN improves productivity.
