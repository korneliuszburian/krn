---
id: krn-benchmark-arena-contract
kind: eval-module
status: active
owner: krn
updated: 2026-06-20
runner: packages/evals/src/validate-krn-benchmark-arena-contract.ts
---

# KRN Benchmark Arena Contract Eval

## Purpose

This eval gates the next larger benchmark/autoresearch arena before any expensive live expansion:

```text
repeat-clean three-task live evidence
  -> arena contract with 20-task lift gate
  -> coding-quality rubric
  -> explicit live mode and resumable pipeline ergonomics
  -> known-bad overclaim fixture
```

It does not run live `codex exec`; it is safe for default `krn eval`.

## What This Tests

- The arena contract is anchored to `goal-006`, `goal-029`, repeat-clean stability evidence, and the coding-quality rubric.
- The next arena requires at least 20 live tasks before productivity lift can be considered.
- Live mode remains explicit and outside default deterministic `krn eval`.
- Progress logging, worker resume, smoke/full lanes, separate fixture/live evidence, and sequential concurrency are required before expansion.
- Coding-quality metrics cover assumptions, simplicity, surgical diffs, verification, review burden, source grounding, goal alignment, and anti-slop behavior.
- A known-bad small-suite overclaim fixture fails deterministically.

## Command

```bash
pnpm run eval:krn-benchmark-arena-contract
```

## Runtime Output

```text
.krn/evals/krn-benchmark-arena-contract/{run_id}/report.json
```

Runtime outputs stay local. Durable conclusions move to `docs/memory`.

## Interpretation Policy

A green run means KRN has a deterministic contract for implementing the expanded benchmark arena.

It does not prove measured productivity lift, suite expansion implementation, statistical validity, live `codex exec` quality, dashboard/API run controls, ChatGPT connector behavior, or human review quality.
