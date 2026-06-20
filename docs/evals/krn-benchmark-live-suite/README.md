---
id: krn-benchmark-live-suite
kind: eval-module
status: active
owner: krn
updated: 2026-06-20
runner: packages/evals/src/validate-krn-benchmark-live-suite.ts
---

# KRN Benchmark Live Suite Eval

## Purpose

This eval expands the first one-task live pilot into a typed benchmark suite harness and carries the first bounded no-lift repair attempt:

```text
task registry
  -> baseline fixture/live Codex run
  -> KRN-assisted fixture/live Codex run
  -> deterministic scorer
  -> KrnBenchmarkReport task_count >= 3
  -> before/after no-lift repair-attempt comparison
```

It does not claim measured productivity lift. Validate mode uses fixtures and may run in default `krn eval`; live mode is explicit because it calls `codex exec`.

## What This Tests

- `tasks.json` parses and defines at least three benchmark tasks.
- Validate mode scores baseline and assisted fixtures for every task.
- Known-bad output that claims productivity lift is penalized.
- Validate mode writes a parseable fixture-contract `KrnBenchmarkReport`.
- Live mode, when explicitly run, calls `codex exec --json --sandbox read-only` with schema-constrained final output and captured evidence refs.
- Three-task reports keep `productivity_lift_claimed: false` because the lift gate requires at least 20 tasks.
- The current repair attempt makes current-parent/latest-child routing data-driven and routes assisted guidance through `goal-021`/`KrnRepairRecord` before suite expansion.

## Commands

```bash
pnpm run eval:krn-benchmark-live-suite
pnpm run eval:krn-benchmark-live-suite:live
```

## Runtime Output

```text
.krn/benchmarks/krn-benchmark-live-suite/{run_id}/
  {task_id}.baseline.stdout.jsonl
  {task_id}.baseline.stderr.txt
  {task_id}.baseline.final.json
  {task_id}.assisted.stdout.jsonl
  {task_id}.assisted.stderr.txt
  {task_id}.assisted.final.json
  report.json

.krn/evals/krn-benchmark-live-suite/{run_id}/report.json
```

Validate mode writes fixture-backed benchmark reports without calling Codex. Runtime outputs stay local; durable conclusions move to `docs/memory`.

## Interpretation Policy

A green validate run means the suite registry, fixture scorer, known-bad guard, and `KrnBenchmarkReport` path work deterministically.

A green live run means KRN can execute and score multiple baseline-vs-assisted Codex worker tasks through the same report contract and compare one repair attempt against prior no-lift evidence. It still does not prove measured productivity lift, statistical benchmark validity, complete repair-loop quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

A green live shape report is not the same as a successful repair. The repair succeeds only if the after-run metric improves enough to justify keeping the change; otherwise the result becomes the next repair input.
